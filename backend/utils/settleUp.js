/**
 * Debt Simplification (a.k.a. "min cash flow" problem).
 *
 * Given a set of net balances in a group (positive = is owed money,
 * negative = owes money), compute the minimum number of transactions
 * required to settle every balance to zero.
 *
 * Naive approach: settle every pairwise IOU that was ever created ->
 * O(number of expenses * group size) transactions, lots of redundant
 * back-and-forth payments between the same people.
 *
 * This approach: greedily match the largest creditor with the largest
 * debtor, settle as much of that pair as possible, repeat. This is the
 * classic greedy strategy for this problem and produces a provably small
 * number of transactions (at most n-1 for n participants).
 *
 * Time complexity: O(n log n) for the sort + O(n) for the settlement pass.
 */

const EPSILON = 0.5; // ignore balances under 50 paise, avoids float noise

/**
 * @param {Object<string, number>} netBalances - userId -> net balance
 * @returns {Array<{from: string, to: string, amount: number}>}
 */
function simplifyDebts(netBalances) {
  const balances = Object.entries(netBalances)
    .map(([id, amt]) => ({ id, amt: Math.round(amt * 100) / 100 }))
    .filter((b) => Math.abs(b.amt) > EPSILON);

  const creditors = balances.filter((b) => b.amt > 0).sort((a, b) => b.amt - a.amt);
  const debtors = balances.filter((b) => b.amt < 0).sort((a, b) => a.amt - b.amt);

  const transactions = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];
    const amount = Math.min(creditor.amt, -debtor.amt);

    if (amount > EPSILON) {
      transactions.push({
        from: debtor.id,
        to: creditor.id,
        amount: Math.round(amount * 100) / 100,
      });
    }

    creditor.amt -= amount;
    debtor.amt += amount;

    if (Math.abs(creditor.amt) <= EPSILON) ci++;
    if (Math.abs(debtor.amt) <= EPSILON) di++;
  }

  return transactions;
}

/**
 * Computes each member's net balance across all expenses in a group.
 * net > 0  => this person is owed money overall
 * net < 0  => this person owes money overall
 *
 * @param {Array} expenses - array of Expense documents (with .shares Map and .paidBy)
 * @param {Array<string>} memberIds - all member ids in the group (ensures 0-balance members appear too)
 */
function computeNetBalances(expenses, memberIds) {
  const net = {};
  memberIds.forEach((id) => (net[id] = 0));

  expenses.forEach((exp) => {
    const paidById = (exp.paidBy._id || exp.paidBy).toString();
    net[paidById] = (net[paidById] || 0) + exp.amount;

    const shares = exp.shares instanceof Map ? exp.shares : new Map(Object.entries(exp.shares || {}));
    shares.forEach((share, userId) => {
      net[userId] = (net[userId] || 0) - share;
    });
  });

  return net;
}

module.exports = { simplifyDebts, computeNetBalances };
