const express = require("express");
const Group = require("../models/Group");
const Expense = require("../models/Expense");
const User = require("../models/User");
const Activity = require("../models/Activity");
const { protect } = require("../middleware/auth");
const { simplifyDebts, computeNetBalances } = require("../utils/settleUp");

const router = express.Router();
router.use(protect);

// GET /api/groups - all groups the logged-in user belongs to, each annotated
// with the current user's own net balance in that group (used to power the
// dashboard's aggregate "you're owed / you owe" summary without the frontend
// having to fetch every group individually).
router.get("/", async (req, res) => {
  const groups = await Group.find({ members: req.user._id })
    .populate("members", "name email")
    .sort({ updatedAt: -1 });

  const withBalances = await Promise.all(
    groups.map(async (group) => {
      const expenses = await Expense.find({ group: group._id });
      const memberIds = group.members.map((m) => m._id.toString());
      const net = computeNetBalances(expenses, memberIds);
      const yourBalance = net[req.user._id.toString()] || 0;
      return { ...group.toObject(), yourBalance };
    })
  );

  res.json(withBalances);
});

// POST /api/groups - create a group. memberEmails: array of emails to invite
router.post("/", async (req, res) => {
  try {
    const { name, memberEmails = [] } = req.body;
    if (!name) return res.status(400).json({ message: "Group name is required" });

    const invited = await User.find({ email: { $in: memberEmails.map((e) => e.toLowerCase()) } });
    const memberIds = new Set(invited.map((u) => u._id.toString()));
    memberIds.add(req.user._id.toString());

    const group = await Group.create({
      name,
      createdBy: req.user._id,
      members: Array.from(memberIds),
    });

    // Create activity
    await Activity.create({
      user: req.user._id,
      group: group._id,
      action: "create_group",
      message: `${req.user.name} created the ledger "${group.name}".`,
    });

    const populated = await group.populate("members", "name email");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Could not create group", error: err.message });
  }
});

// GET /api/groups/:id - single group with balances + simplified settlement
router.get("/:id", async (req, res) => {
  const group = await Group.findOne({ _id: req.params.id, members: req.user._id })
    .populate("members", "name email")
    .populate("formerMembers", "name email");
  if (!group) return res.status(404).json({ message: "Group not found" });

  const expenses = await Expense.find({ group: group._id }).populate("paidBy", "name email").sort({ createdAt: -1 });

  const memberIds = group.members.map((m) => m._id.toString());
  const net = computeNetBalances(expenses, memberIds);
  const settlements = simplifyDebts(net);

  res.json({ group, expenses, balances: net, settlements });
});

// POST /api/groups/:id/members - add a member by email
router.post("/:id/members", async (req, res) => {
  const group = await Group.findOne({ _id: req.params.id, members: req.user._id });
  if (!group) return res.status(404).json({ message: "Group not found" });

  const user = await User.findOne({ email: (req.body.email || "").toLowerCase() });
  if (!user) return res.status(404).json({ message: "No user with that email has registered yet" });

  if (!group.members.includes(user._id)) {
    if (group.formerMembers) {
      group.formerMembers = group.formerMembers.filter((m) => m.toString() !== user._id.toString());
    }
    group.members.push(user._id);
    await group.save();
    
    // Create activity
    await Activity.create({
      user: req.user._id,
      group: group._id,
      action: "join_group",
      message: `${req.user.name} added ${user.name} to the group.`,
    });
  }
  const populated = await group.populate("members", "name email").then(g => g.populate("formerMembers", "name email"));
  res.json(populated);
});

// PATCH /api/groups/:id/archive - toggle archive status of a group
router.patch("/:id/archive", async (req, res) => {
  try {
    const group = await Group.findOne({ _id: req.params.id, members: req.user._id });
    if (!group) return res.status(404).json({ message: "Group not found or access denied" });
    
    group.isArchived = !group.isArchived;
    await group.save();
    
    // Create activity
    await Activity.create({
      user: req.user._id,
      group: group._id,
      action: "edit_expense",
      message: `${req.user.name} ${group.isArchived ? "archived" : "unarchived"} the ledger book "${group.name}".`,
    });

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: "Could not archive group", error: err.message });
  }
});

// DELETE /api/groups/:id - delete a group and all its expenses
router.delete("/:id", async (req, res) => {
  try {
    const group = await Group.findOne({ _id: req.params.id, members: req.user._id });
    if (!group) return res.status(404).json({ message: "Group not found or access denied" });

    // Delete all expenses in this group
    await Expense.deleteMany({ group: group._id });

    // Delete the group
    await group.deleteOne();

    res.json({ message: "Group and associated expenses deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Could not delete group", error: err.message });
  }
});

// DELETE /api/groups/:id/members/:memberId - remove a member from the group
router.delete("/:id/members/:memberId", async (req, res) => {
  try {
    const group = await Group.findOne({ _id: req.params.id, members: req.user._id });
    if (!group) return res.status(404).json({ message: "Group not found or access denied" });

    // Remove the member and move to formerMembers
    const memberId = req.params.memberId;
    if (group.members.map(String).includes(memberId)) {
      group.members = group.members.filter((m) => m.toString() !== memberId);
      if (!group.formerMembers) group.formerMembers = [];
      if (!group.formerMembers.map(String).includes(memberId)) {
        group.formerMembers.push(memberId);
      }
      await group.save();
    }

    const populated = await group.populate("members", "name email").then(g => g.populate("formerMembers", "name email"));
    
    // Recalculate settlements/balances (former members still belong to calculations of past expenses!)
    const expenses = await Expense.find({ group: group._id }).populate("paidBy", "name email").sort({ createdAt: -1 });
    const memberIds = [...group.members, ...group.formerMembers].map((m) => m._id.toString());
    const net = computeNetBalances(expenses, memberIds);
    const settlements = simplifyDebts(net);

    res.json({ group: populated, expenses, balances: net, settlements });
  } catch (err) {
    res.status(500).json({ message: "Could not remove member", error: err.message });
  }
});

module.exports = router;