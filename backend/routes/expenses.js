const express = require("express");
const Group = require("../models/Group");
const Expense = require("../models/Expense");
const Activity = require("../models/Activity");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

/**
 * Resolves a split request into a per-member "shares" map.
 * - equal: divide amount evenly across splitAmong
 * - percentage: body.splitDetails = { userId: percentage }
 * - exact: body.splitDetails = { userId: exactAmount }
 * Always validated so shares sum to the total amount (within 1 rupee for rounding).
 */
function resolveShares({ amount, splitAmong, splitType, splitDetails }) {
  const shares = new Map();

  if (splitType === "percentage") {
    splitAmong.forEach((uid) => {
      const pct = splitDetails?.[uid] ?? 0;
      shares.set(uid, Math.round(((pct / 100) * amount) * 100) / 100);
    });
  } else if (splitType === "exact") {
    splitAmong.forEach((uid) => {
      shares.set(uid, Math.round((splitDetails?.[uid] ?? 0) * 100) / 100);
    });
  } else {
    // equal split
    const per = Math.round((amount / splitAmong.length) * 100) / 100;
    splitAmong.forEach((uid, idx) => {
      // give any rounding remainder to the last person so totals match exactly
      const isLast = idx === splitAmong.length - 1;
      const total = [...shares.values()].reduce((a, b) => a + b, 0);
      shares.set(uid, isLast ? Math.round((amount - total) * 100) / 100 : per);
    });
  }

  const total = [...shares.values()].reduce((a, b) => a + b, 0);
  if (Math.abs(total - amount) > 1) {
    throw new Error(`Split amounts (₹${total}) don't add up to the total (₹${amount})`);
  }

  return shares;
}

// POST /api/expenses - add an expense to a group
router.post("/", async (req, res) => {
  try {
    const { groupId, description, amount, paidBy, splitAmong, splitType = "equal", splitDetails, category } = req.body;

    if (!groupId || !description || !amount || !paidBy || !splitAmong?.length) {
      return res.status(400).json({ message: "Missing required expense fields" });
    }

    const group = await Group.findOne({ _id: groupId, members: req.user._id });
    if (!group) return res.status(404).json({ message: "Group not found" });

    const invalidMember = splitAmong.find((uid) => !group.members.map(String).includes(uid));
    if (invalidMember) {
      return res.status(400).json({ message: "All split members must belong to the group" });
    }

    const shares = resolveShares({ amount, splitAmong, splitType, splitDetails });

    const expense = await Expense.create({
      group: groupId,
      description,
      amount,
      paidBy,
      splitAmong,
      splitType,
      shares,
      category: category || "Other",
      createdBy: req.user._id,
    });

    // Create activity
    const isSettlement = description.toLowerCase().includes("settle");
    await Activity.create({
      user: req.user._id,
      group: groupId,
      action: isSettlement ? "settle_payment" : "add_expense",
      message: isSettlement
        ? `${req.user.name} logged a settlement payment: "${description}" of ₹${amount}.`
        : `${req.user.name} added the expense "${description}" of ₹${amount}.`,
    });

    const populated = await expense.populate("paidBy", "name email");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message || "Could not add expense" });
  }
});

// DELETE /api/expenses/:id
router.delete("/:id", async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) return res.status(404).json({ message: "Expense not found" });

  const group = await Group.findOne({ _id: expense.group, members: req.user._id });
  if (!group) return res.status(403).json({ message: "Not authorized to delete this expense" });

  // Log activity BEFORE deleting so we can access expense details
  await Activity.create({
    user: req.user._id,
    group: expense.group,
    action: "delete_expense",
    message: `${req.user.name} deleted the expense "${expense.description}" of ₹${expense.amount}.`,
  });

  await expense.deleteOne();
  res.json({ message: "Expense deleted" });
});

// PUT /api/expenses/:id - edit an expense
router.put("/:id", async (req, res) => {
  try {
    const { description, amount, paidBy, splitAmong, splitType = "equal", splitDetails, category } = req.body;
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const group = await Group.findOne({ _id: expense.group, members: req.user._id });
    if (!group) return res.status(403).json({ message: "Not authorized to modify this expense" });

    const oldDescription = expense.description;
    const oldAmount = expense.amount;

    expense.description = description || expense.description;
    expense.amount = amount !== undefined ? amount : expense.amount;
    expense.paidBy = paidBy || expense.paidBy;
    expense.splitAmong = splitAmong || expense.splitAmong;
    expense.splitType = splitType || expense.splitType;
    expense.category = category || expense.category;

    if (amount !== undefined || splitAmong || splitType || splitDetails) {
      const activeSplitAmong = splitAmong || expense.splitAmong;
      const activeSplitType = splitType || expense.splitType;
      const activeSplitDetails = splitDetails || expense.shares;
      expense.shares = resolveShares({
        amount: expense.amount,
        splitAmong: activeSplitAmong,
        splitType: activeSplitType,
        splitDetails: activeSplitDetails,
      });
    }

    await expense.save();
    const populated = await expense.populate("paidBy", "name email");

    // Log Activity
    await Activity.create({
      user: req.user._id,
      group: expense.group,
      action: "edit_expense",
      message: `${req.user.name} updated the expense from "${oldDescription}" to "${expense.description}" (₹${expense.amount}).`,
    });

    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message || "Could not update expense" });
  }
});

module.exports = router;
