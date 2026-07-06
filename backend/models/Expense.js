const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Members this expense is split among. Splitting logic (equal / percentage /
    // exact) resolves to a per-member "shares" map at write time so balance
    // calculations never need to know which split type was used.
    splitAmong: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    splitType: { type: String, enum: ["equal", "percentage", "exact"], default: "equal" },
    shares: {
      // map of userId -> amount owed by that user for this expense
      type: Map,
      of: Number,
      required: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
