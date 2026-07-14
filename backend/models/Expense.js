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
      validate: {
        validator: function (v) {
          const total = [...v.values()].reduce((a, b) => a + b, 0);
          return Math.abs(total - this.amount) <= 0.05;
        },
        message: "The sum of split shares must equal the total expense amount."
      }
    },
    category: {
      type: String,
      enum: ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"],
      default: "Other",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
