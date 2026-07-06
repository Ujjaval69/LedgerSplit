const express = require("express");
const Group = require("../models/Group");
const Expense = require("../models/Expense");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { simplifyDebts, computeNetBalances } = require("../utils/settleUp");

const router = express.Router();
router.use(protect);

// GET /api/groups - all groups the logged-in user belongs to
router.get("/", async (req, res) => {
  const groups = await Group.find({ members: req.user._id })
    .populate("members", "name email")
    .sort({ updatedAt: -1 });
  res.json(groups);
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

    const populated = await group.populate("members", "name email");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Could not create group", error: err.message });
  }
});

// GET /api/groups/:id - single group with balances + simplified settlement
router.get("/:id", async (req, res) => {
  const group = await Group.findOne({ _id: req.params.id, members: req.user._id }).populate(
    "members",
    "name email"
  );
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
    group.members.push(user._id);
    await group.save();
  }
  const populated = await group.populate("members", "name email");
  res.json(populated);
});

module.exports = router;
