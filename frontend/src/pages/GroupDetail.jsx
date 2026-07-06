import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Stamp, X, ArrowRight, Receipt } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

function rupee(n) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  if (!data) return <div className="p-8 text-inksoft">Loading ledger...</div>;

  const { group, expenses, balances, settlements } = data;
  const nameOf = (uid) => group.members.find((m) => m._id === uid)?.name || "Unknown";

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="text-inksoft hover:text-ink">
            <ArrowLeft size={18} />
          </button>
          <span className="font-display font-bold text-lg">{group.name}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-xl font-semibold">Ledger</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-2 border border-line text-inksoft px-4 py-2 rounded-md font-semibold text-sm"
            >
              + Add Member
            </button>
            <button
              onClick={() => setShowSettle(true)}
              className="flex items-center gap-2 bg-credit text-white px-4 py-2 rounded-md font-semibold text-sm"
            >
              <Stamp size={15} /> Simplify &amp; Settle
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-gold text-white px-4 py-2 rounded-md font-semibold text-sm"
            >
              <Plus size={15} /> Add Expense
            </button>
          </div>
        </div>

        {/* Balance cards */}
        <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: `repeat(${group.members.length}, minmax(0,1fr))` }}>
          {group.members.map((m) => {
            const bal = balances[m._id] || 0;
            const isCredit = bal > 0.5;
            const isDebt = bal < -0.5;
            return (
              <div key={m._id} className="bg-card border border-line rounded-lg p-4">
                <div className="text-sm font-semibold mb-2 truncate">{m.name}</div>
                <div
                  className={`font-mono text-lg font-semibold ${
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
        <div className="bg-card border border-line rounded-lg overflow-hidden">
          <div className="grid grid-cols-[100px_1fr_140px_120px] px-5 py-3 border-b border-line text-xs uppercase tracking-wide text-inksoft font-semibold">
            <span>Date</span>
            <span>Particulars</span>
            <span>Paid By</span>
            <span className="text-right">Amount</span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {expenses.length === 0 && (
              <div className="p-8 text-center text-inksoft text-sm">
                No expenses logged yet. Add the first one for this group.
              </div>
            )}
            {expenses.map((exp) => (
              <div
                key={exp._id}
                className="grid grid-cols-[100px_1fr_140px_120px] px-5 py-3 border-b border-line/60 text-sm items-center"
              >
                <span className="text-inksoft">{new Date(exp.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                <span>
                  {exp.description}
                  <div className="text-xs text-inksoft/70 mt-0.5">split {exp.splitAmong.length} ways</div>
                </span>
                <span>{exp.paidBy.name}</span>
                <span className="font-mono text-right font-semibold">{rupee(exp.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 text-xs text-inksoft flex items-center gap-2">
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
    </div>
  );
}

function AddExpenseModal({ group, currentUserId, onClose, onAdded }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(currentUserId);
  const [splitAmong, setSplitAmong] = useState(group.members.map((m) => m._id));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleMember(id) {
    setSplitAmong((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/expenses", {
        groupId: group._id,
        description,
        amount: parseFloat(amount),
        paidBy,
        splitAmong,
        splitType: "equal",
      });
      onAdded();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add expense");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-lg p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display font-semibold text-lg">Add an Expense</h3>
          <button onClick={onClose}>
            <X size={18} className="text-inksoft" />
          </button>
        </div>

        {error && <div className="mb-4 text-sm bg-red-50 text-debt rounded-md px-3 py-2">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-inksoft mb-1">What was it for?</label>
            <input
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-credit"
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
              className="w-full border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-credit"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-inksoft mb-1">Paid by</label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-credit"
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
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                      checked ? "bg-credit/10 border-credit text-credit" : "border-line text-inksoft"
                    }`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-ink text-paper py-2.5 rounded-md font-semibold text-sm disabled:opacity-50"
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
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-lg p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display font-semibold text-lg">Simplified Settlement</h3>
          <button onClick={onClose}>
            <X size={18} className="text-inksoft" />
          </button>
        </div>

        {settlements.length === 0 ? (
          <p className="text-center text-inksoft text-sm py-6">Everyone in this ledger is already settled up.</p>
        ) : (
          <div className="space-y-2">
            {settlements.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between border border-line rounded-md px-4 py-3 bg-paper/60"
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span>{nameOf(t.from)}</span>
                  <ArrowRight size={14} className="text-inksoft" />
                  <span>{nameOf(t.to)}</span>
                </div>
                <span className="font-mono font-bold text-debt">{rupee(t.amount)}</span>
              </div>
            ))}
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
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-lg p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display font-semibold text-lg">Add a Member</h3>
          <button onClick={onClose}>
            <X size={18} className="text-inksoft" />
          </button>
        </div>
        {error && <div className="mb-4 text-sm bg-red-50 text-debt rounded-md px-3 py-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-inksoft mb-1">
              Their email (must already have a LedgerSplit account)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-credit"
              placeholder="friend@test.com"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-ink text-paper py-2.5 rounded-md font-semibold text-sm disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add to Ledger"}
          </button>
        </form>
      </div>
    </div>
  );
}
