import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Plus, Stamp, X, ArrowRight, Receipt, Trash2, UserPlus } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

function rupee(n) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function initialsOf(name = "?") {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function GroupDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  const load = useCallback(() => {
    api.get(`/groups/${id}`).then((res) => setData(res.data));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function deleteExpense(expenseId) {
    if (!window.confirm("Delete this expense? This can't be undone.")) return;
    try {
      await api.delete(`/expenses/${expenseId}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete expense");
    }
  }

  if (!data) {
    return (
      <Layout>
        <div className="p-10 text-inksoft text-sm animate-fadeIn">Loading ledger...</div>
      </Layout>
    );
  }

  const { group, expenses, balances, settlements } = data;
  const nameOf = (uid) => group.members.find((m) => m._id === uid)?.name || "Unknown";

  return (
    <Layout>
      <main className="max-w-4xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8 animate-fadeInUp">
          <div>
            <div className="text-xs uppercase tracking-wider text-inksoft font-semibold mb-1">
              Ledger Book
            </div>
            <h1 className="font-display text-3xl font-bold">{group.name}</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-2 border border-line bg-card text-inksoft px-4 py-2.5 rounded-lg font-semibold text-sm hover:border-ink/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              <UserPlus size={15} /> Add Member
            </button>
            <button
              onClick={() => setShowSettle(true)}
              className="flex items-center gap-2 bg-credit text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
            >
              <Stamp size={15} /> Simplify &amp; Settle
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-gold text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus size={15} /> Add Expense
            </button>
          </div>
        </div>

        {/* Balance cards */}
        <div
          className="grid gap-3 mb-8"
          style={{ gridTemplateColumns: `repeat(${Math.min(group.members.length, 4)}, minmax(0,1fr))` }}
        >
          {group.members.map((m, i) => {
            const bal = balances[m._id] || 0;
            const isCredit = bal > 0.5;
            const isDebt = bal < -0.5;
            const ringColor = isCredit ? "#2F6B45" : isDebt ? "#A8402A" : "#C7D4C0";
            return (
              <div
                key={m._id}
                style={{ animationDelay: `${i * 50}ms` }}
                className="bg-card border border-line rounded-xl p-4 shadow-card hover:shadow-card-hover transition-shadow duration-200 animate-fadeInUp"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                    style={{ backgroundColor: ringColor }}
                  >
                    {initialsOf(m.name)}
                  </div>
                  <span className="text-sm font-semibold truncate">{m.name}</span>
                </div>
                <div
                  className={`font-mono text-xl font-semibold ${
                    isCredit ? "text-credit" : isDebt ? "text-debt" : "text-inksoft"
                  }`}
                >
                  {isCredit ? "+" : ""}
                  {rupee(bal)}
                </div>
                <div className="text-xs text-inksoft mt-1">
                  {isCredit ? "is owed" : isDebt ? "owes the group" : "settled up"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Expense ledger table */}
        <div className="bg-card border border-line rounded-xl overflow-hidden shadow-card animate-fadeInUp">
          <div className="grid grid-cols-[90px_1fr_130px_110px_36px] px-5 py-3 border-b border-line text-[11px] uppercase tracking-wider text-inksoft font-semibold bg-paper/40">
            <span>Date</span>
            <span>Particulars</span>
            <span>Paid By</span>
            <span className="text-right">Amount</span>
            <span></span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {expenses.length === 0 && (
              <div className="p-10 text-center text-inksoft text-sm">
                <Receipt size={22} className="mx-auto mb-2 text-inksoft/40" />
                No expenses logged yet. Add the first one for this group.
              </div>
            )}
            {expenses.map((exp) => (
              <div
                key={exp._id}
                className="group grid grid-cols-[90px_1fr_130px_110px_36px] px-5 py-3.5 border-b border-line/60 text-sm items-center hover:bg-paper/40 transition-colors duration-150"
              >
                <span className="text-inksoft">
                  {new Date(exp.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
                <span>
                  {exp.description}
                  <div className="text-xs text-inksoft/70 mt-0.5">split {exp.splitAmong.length} ways</div>
                </span>
                <span className="truncate">{exp.paidBy.name}</span>
                <span className="font-mono text-right font-semibold">{rupee(exp.amount)}</span>
                <button
                  onClick={() => deleteExpense(exp._id)}
                  className="justify-self-end text-inksoft/30 hover:text-debt opacity-0 group-hover:opacity-100 transition-all duration-150"
                  title="Delete expense"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 text-xs text-inksoft flex items-center gap-2 animate-fadeIn">
          <Receipt size={13} />
          {settlements.length === 0
            ? "Everyone is settled up."
            : `Simplification reduced this to ${settlements.length} transaction${settlements.length !== 1 ? "s" : ""}.`}
        </div>
      </main>

      {showAdd && (
        <AddExpenseModal
          group={group}
          currentUserId={user._id}
          onClose={() => setShowAdd(false)}
          onAdded={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}

      {showSettle && (
        <SettleModal settlements={settlements} nameOf={nameOf} onClose={() => setShowSettle(false)} />
      )}

      {showAddMember && (
        <AddMemberModal
          groupId={group._id}
          onClose={() => setShowAddMember(false)}
          onAdded={() => {
            setShowAddMember(false);
            load();
          }}
        />
      )}
    </Layout>
  );
}

function AddExpenseModal({ group, currentUserId, onClose, onAdded }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(currentUserId);
  const [splitAmong, setSplitAmong] = useState(group.members.map((m) => m._id));
  const [splitType, setSplitType] = useState("equal"); // "equal" | "percentage" | "exact"
  const [splitDetails, setSplitDetails] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleMember(id) {
    setSplitAmong((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  }

  function updateDetail(id, value) {
    setSplitDetails((prev) => ({ ...prev, [id]: value }));
  }

  const detailTotal = splitAmong.reduce((sum, id) => sum + (parseFloat(splitDetails[id]) || 0), 0);
  const numericAmount = parseFloat(amount) || 0;
  const detailMismatch =
    splitType !== "equal" &&
    numericAmount > 0 &&
    Math.abs(splitType === "percentage" ? detailTotal - 100 : detailTotal - numericAmount) > 0.5;

  async function handleSubmit(e) {
    e.preventDefault();
    if (detailMismatch) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        groupId: group._id,
        description,
        amount: numericAmount,
        paidBy,
        splitAmong,
        splitType,
      };
      if (splitType !== "equal") {
        payload.splitDetails = Object.fromEntries(
          splitAmong.map((id) => [id, parseFloat(splitDetails[id]) || 0])
        );
      }
      await api.post("/expenses", payload);
      onAdded();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add expense");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-xl p-6 w-full max-w-sm shadow-modal animate-scaleIn max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display font-semibold text-lg">Add an Expense</h3>
          <button onClick={onClose} className="text-inksoft hover:text-ink transition">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 text-sm bg-red-50 border border-debt/30 text-debt rounded-md px-3 py-2 animate-fadeIn">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-inksoft mb-1">What was it for?</label>
            <input
              required
              autoFocus
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-credit focus:ring-2 focus:ring-credit/15 transition-shadow"
              placeholder="e.g. Dominos order"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-inksoft mb-1">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-credit focus:ring-2 focus:ring-credit/15 transition-shadow"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-inksoft mb-1">Paid by</label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-credit focus:ring-2 focus:ring-credit/15 transition-shadow"
            >
              {group.members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-inksoft mb-1">Split among</label>
            <div className="flex flex-wrap gap-2">
              {group.members.map((m) => {
                const checked = splitAmong.includes(m._id);
                return (
                  <button
                    type="button"
                    key={m._id}
                    onClick={() => toggleMember(m._id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                      checked
                        ? "bg-credit/10 border-credit text-credit"
                        : "border-line text-inksoft hover:border-ink/30"
                    }`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-inksoft mb-1">Split type</label>
            <div className="flex gap-2">
              {[
                { value: "equal", label: "Equal" },
                { value: "percentage", label: "Percentage" },
                { value: "exact", label: "Exact amount" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setSplitType(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                    splitType === opt.value
                      ? "bg-gold/10 border-gold text-gold"
                      : "border-line text-inksoft hover:border-ink/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {splitType !== "equal" && (
            <div className="space-y-2 border border-line rounded-lg p-3 bg-paper/50 animate-fadeIn">
              {splitAmong.length === 0 && (
                <p className="text-xs text-inksoft">Select at least one member above first.</p>
              )}
              {splitAmong.map((id) => {
                const m = group.members.find((mem) => mem._id === id);
                return (
                  <div key={id} className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium">{m?.name}</span>
                    <div className="flex items-center gap-1">
                      {splitType === "exact" && <span className="text-xs text-inksoft">₹</span>}
                      <input
                        type="number"
                        step="0.01"
                        value={splitDetails[id] || ""}
                        onChange={(e) => updateDetail(id, e.target.value)}
                        className="w-20 border border-line rounded-md px-2 py-1 text-xs outline-none focus:border-credit transition-shadow"
                        placeholder="0"
                      />
                      {splitType === "percentage" && <span className="text-xs text-inksoft">%</span>}
                    </div>
                  </div>
                );
              })}
              <div className={`text-xs pt-1 transition-colors ${detailMismatch ? "text-debt" : "text-inksoft"}`}>
                Total: {splitType === "percentage" ? `${detailTotal}%` : rupee(detailTotal)}
                {splitType === "percentage" ? " / 100%" : ` / ${rupee(numericAmount)}`}
                {detailMismatch && " — doesn't add up yet"}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || detailMismatch || splitAmong.length === 0}
            className="w-full bg-ink text-paper py-2.5 rounded-md font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition"
          >
            {saving ? "Adding..." : "Add to Ledger"}
          </button>
        </form>
      </div>
    </div>
  );
}

function SettleModal({ settlements, nameOf, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-xl p-6 w-full max-w-sm shadow-modal animate-scaleIn"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display font-semibold text-lg">Simplified Settlement</h3>
          <button onClick={onClose} className="text-inksoft hover:text-ink transition">
            <X size={18} />
          </button>
        </div>

        {settlements.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-block border-2 border-gold text-gold font-display font-bold text-sm tracking-wider px-5 py-2 rounded-md -rotate-3 animate-stampIn">
              ALL SETTLED
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {settlements.map((t, i) => (
              <div
                key={i}
                style={{ animationDelay: `${i * 60}ms` }}
                className="flex items-center justify-between border border-line rounded-lg px-4 py-3 bg-paper/60 animate-fadeInUp"
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span>{nameOf(t.from)}</span>
                  <ArrowRight size={14} className="text-inksoft" />
                  <span>{nameOf(t.to)}</span>
                </div>
                <span className="font-mono font-bold text-debt">{rupee(t.amount)}</span>
              </div>
            ))}
            <div className="flex justify-center pt-2">
              <div className="inline-block border-2 border-gold text-gold font-display font-bold text-xs tracking-wider px-4 py-1.5 rounded-md -rotate-3 animate-stampIn">
                MIN. TRANSACTIONS
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AddMemberModal({ groupId, onClose, onAdded }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post(`/groups/${groupId}/members`, { email });
      onAdded();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add member");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-xl p-6 w-full max-w-sm shadow-modal animate-scaleIn"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display font-semibold text-lg">Add a Member</h3>
          <button onClick={onClose} className="text-inksoft hover:text-ink transition">
            <X size={18} />
          </button>
        </div>
        {error && (
          <div className="mb-4 text-sm bg-red-50 border border-debt/30 text-debt rounded-md px-3 py-2 animate-fadeIn">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-inksoft mb-1">
              Their email (must already have a LedgerSplit account)
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-credit focus:ring-2 focus:ring-credit/15 transition-shadow"
              placeholder="friend@test.com"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-ink text-paper py-2.5 rounded-md font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition"
          >
            {saving ? "Adding..." : "Add to Ledger"}
          </button>
        </form>
      </div>
    </div>
  );
}
