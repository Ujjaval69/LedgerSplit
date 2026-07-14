const express = require("express");
const Group = require("../models/Group");
const Expense = require("../models/Expense");
const { protect } = require("../middleware/auth");
const { computeNetBalances } = require("../utils/settleUp");

const router = express.Router();
router.use(protect);

router.get("/", async (req, res) => {
  try {
    const userIdStr = req.user._id.toString();

    // 1. Get all groups this user belongs to
    const groups = await Group.find({ members: req.user._id }).populate("members", "name email");
    const groupIds = groups.map((g) => g._id);

    // If the user belongs to no groups, return empty stats
    if (groupIds.length === 0) {
      return res.json({
        totalExpenses: 0,
        totalGroups: 0,
        totalMembers: 0,
        youOwe: 0,
        youAreOwed: 0,
        netBalance: 0,
        monthlyExpenses: [],
        categoryBreakdown: {
          Food: 0,
          Travel: 0,
          Shopping: 0,
          Bills: 0,
          Entertainment: 0,
          Health: 0,
          Education: 0,
          Other: 0
        },
        recentExpenses: []
      });
    }

    // 2. Compute You Owe / You Are Owed / Net Balance across groups
    let youOwe = 0;
    let youAreOwed = 0;
    const memberIdsSet = new Set();

    const groupBalances = await Promise.all(
      groups.map(async (group) => {
        const expenses = await Expense.find({ group: group._id });
        const memberIds = group.members.map((m) => {
          if (m._id.toString() !== userIdStr) {
            memberIdsSet.add(m._id.toString());
          }
          return m._id.toString();
        });
        const netBalances = computeNetBalances(expenses, memberIds);
        const yourBalance = netBalances[userIdStr] || 0;
        return yourBalance;
      })
    );

    groupBalances.forEach((bal) => {
      if (bal > 0) youAreOwed += bal;
      if (bal < 0) youOwe += Math.abs(bal);
    });

    const netBalance = youAreOwed - youOwe;
    const totalGroups = groups.length;
    const totalMembers = memberIdsSet.size;

    // 3. Aggregate Total Expenses (user's personal shares) using MongoDB Aggregation
    const totalExpensesAgg = await Expense.aggregate([
      {
        $match: {
          group: { $in: groupIds },
          splitAmong: req.user._id
        }
      },
      {
        $project: {
          sharesArray: { $objectToArray: "$shares" }
        }
      },
      {
        $unwind: "$sharesArray"
      },
      {
        $match: {
          "sharesArray.k": userIdStr
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$sharesArray.v" }
        }
      }
    ]);
    const totalExpenses = totalExpensesAgg[0]?.total || 0;

    // 4. Monthly Spending Timeline (user's share grouped by year-month)
    const monthlyExpensesAgg = await Expense.aggregate([
      {
        $match: {
          group: { $in: groupIds },
          splitAmong: req.user._id
        }
      },
      {
        $project: {
          month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          sharesArray: { $objectToArray: "$shares" }
        }
      },
      {
        $unwind: "$sharesArray"
      },
      {
        $match: {
          "sharesArray.k": userIdStr
        }
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sharesArray.v" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const monthlyExpenses = monthlyExpensesAgg.map((item) => ({
      month: item._id,
      amount: Math.round(item.total * 100) / 100
    }));

    // 5. Category Breakdown (user's share grouped by category)
    const categoryBreakdownAgg = await Expense.aggregate([
      {
        $match: {
          group: { $in: groupIds },
          splitAmong: req.user._id
        }
      },
      {
        $project: {
          category: { $ifNull: ["$category", "Other"] },
          sharesArray: { $objectToArray: "$shares" }
        }
      },
      {
        $unwind: "$sharesArray"
      },
      {
        $match: {
          "sharesArray.k": userIdStr
        }
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$sharesArray.v" }
        }
      }
    ]);

    const categoryBreakdown = {};
    const categories = ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"];
    categories.forEach((cat) => {
      categoryBreakdown[cat] = 0;
    });
    categoryBreakdownAgg.forEach((item) => {
      categoryBreakdown[item._id] = Math.round(item.total * 100) / 100;
    });

    // 6. Recent Expenses
    const recentExpenses = await Expense.find({ group: { $in: groupIds } })
      .populate("paidBy", "name email")
      .populate("group", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      totalGroups,
      totalMembers,
      youOwe: Math.round(youOwe * 100) / 100,
      youAreOwed: Math.round(youAreOwed * 100) / 100,
      netBalance: Math.round(netBalance * 100) / 100,
      monthlyExpenses,
      categoryBreakdown,
      recentExpenses
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching dashboard metrics", error: err.message });
  }
});

module.exports = router;
