import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Stamp, X, ArrowRight, Receipt, Trash2, UserPlus, ArrowLeft, Pencil } from "lucide-react";
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
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const load = useCallback(() => {
    api.get(`/groups/${id}`).then((res) => setData(res.data)).catch(() => {});
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

  async function deleteGroup() {
    if (!window.confirm(`Delete the ledger group "${group?.name}"? This will delete all expenses in this group and cannot be undone.`)) return;
    try {
      await api.delete(`/groups/${id}`);
      window.dispatchEvent(new Event("groupCreated"));
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete group");
    }
  }

  async function removeMember(memberId, memberName) {
    if (!window.confirm(`Remove ${memberName} from this ledger group?`)) return;
    try {
      const res = await api.delete(`/groups/${id}/members/${memberId}`);
      setData(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Could not remove member");
    }
  }

  async function recordSettlement(fromId, toId, amount) {
    const fromName = nameOf(fromId);
    const toName = nameOf(toId);
    if (!window.confirm(`Record settlement payment: ₹${amount} from ${fromName} to ${toName}?`)) return;
    try {
      await api.post("/expenses", {
        groupId: id,
        description: `Settlement: ${fromName} to ${toName}`,
        amount,
        paidBy: fromId,
        splitAmong: [toId],
        splitType: "equal",
        category: "Other"
      });
      setShowSettle(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Could not record settlement");
    }
  }

  if (!data) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fadeIn">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-xs font-semibold text-inksoft">Loading ledger details...</p>
        </div>
      </Layout>
    );
  }

  const { group, expenses, balances, settlements } = data;
  const nameOf = (uid) => group.members.find((m) => m._id === uid)?.name || "Unknown";

  return (
    <Layout>
      <main className="w-full px-6 py-8 sm:px-8 sm:py-10">
        
        {/* Back navigation & Header */}
        <div className="mb-6">
          <button 
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-inksoft hover:text-brand transition mb-4"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-inksoft">Ledger Book</span>
              <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-0.5">{group.name}</h1>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => setShowAddMember(true)}
                className="flex items-center justify-center gap-2 border border-line bg-card text-ink px-4 py-2.5 rounded-xl font-semibold text-xs hover:bg-paper transition"
              >
                <UserPlus size={14} /> Add Member
              </button>
              <button
                onClick={() => setShowSettle(true)}
                className="flex items-center justify-center gap-2 border border-brand/20 bg-brand-soft text-brand dark:bg-brand-soft/20 dark:text-brand-mint px-4 py-2.5 rounded-xl font-semibold text-xs hover:opacity-95 transition"
              >
                <Stamp size={14} /> Simplify &amp; Settle
              </button>
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center justify-center gap-2 bg-brand text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-sm hover:opacity-90 active:scale-95 transition"
              >
                <Plus size={14} /> Add Expense
              </button>
              <button
                onClick={deleteGroup}
                className="flex items-center justify-center gap-2 border border-red-500/20 bg-red-500/5 text-red-500 px-4 py-2.5 rounded-xl font-semibold text-xs hover:bg-red-500/10 active:scale-95 transition"
                title="Delete group ledger"
              >
                <Trash2 size={14} /> Delete Ledger
              </button>
            </div>
          </div>
        </div>

        {/* Members balances grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {group.members.map((m) => {
            const bal = balances[m._id] || 0;
            const isCredit = bal > 0.5;
            const isDebt = bal < -0.5;
            const isCurrentUser = m._id === user._id;
            
            return (
              <div
                key={m._id}
                className="bg-card border border-line rounded-2xl p-4 shadow-sm hover:shadow-card-hover transition-all duration-200 relative group/member"
              >
                {!isCurrentUser && (
                  <button
                    onClick={() => removeMember(m._id, m.name)}
                    className="absolute top-3.5 right-3.5 p-1 rounded-lg text-inksoft hover:text-red-500 hover:bg-red-500/5 transition opacity-0 group-hover/member:opacity-100"
                    title={`Remove ${m.name}`}
                  >
                    <X size={12} />
                  </button>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm ${
                      isCredit 
                        ? "bg-brand" 
                        : isDebt 
                          ? "bg-red-500" 
                          : "bg-inksoft/30 dark:bg-inksoft/10 text-ink"
                    }`}
                  >
                    {initialsOf(m.name)}
                  </div>
                  <span className="text-xs font-bold text-ink truncate pr-4">{m.name}</span>
                </div>
                <div
                  className={`font-mono text-lg font-bold tracking-tight ls-mono ${
                    isCredit ? "text-brand" : isDebt ? "text-red-500" : "text-inksoft"
                  }`}
                >
                  {isCredit ? "+" : ""}
                  {rupee(bal)}
                </div>
                <div className="text-[10px] text-inksoft font-medium mt-0.5">
                  {isCredit ? "is owed" : isDebt ? "owes the group" : "settled up"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Expenses List Panel */}
        <div className="bg-card border border-line rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-line">
            <h3 className="text-xs font-bold uppercase tracking-wider text-inksoft">Expenses Ledger</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-line text-[10px] uppercase font-bold text-inksoft bg-paper/30">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Particulars</th>
                  <th className="px-6 py-3">Paid By</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-xs text-inksoft">
                      <Receipt size={24} className="mx-auto mb-2 text-inksoft/40 animate-pulse" />
                      No expenses logged yet. Click "Add Expense" to start!
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr 
                      key={exp._id}
                      className="hover:bg-paper/20 transition-colors group text-xs text-ink"
                    >
                      <td className="px-6 py-4 text-inksoft font-medium">
                        {new Date(exp.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-ink">{exp.description}</span>
                          <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-paper dark:bg-paper/10 text-brand-mint/90 border border-line uppercase tracking-wider">
                            {exp.category || "Other"}
                          </span>
                        </div>
                        <div className="text-[10px] text-inksoft mt-0.5">split {exp.splitAmong.length} ways</div>
                      </td>
                      <td className="px-6 py-4 font-medium">{exp.paidBy.name}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold ls-mono">{rupee(exp.amount)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setEditingExpense(exp)}
                            className="p-1 rounded-md text-inksoft hover:text-brand hover:bg-brand/5 transition opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                            title="Edit expense"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => deleteExpense(exp._id)}
                            aria-label={`Delete expense: ${exp.description}`}
                            className="p-1 rounded-md text-inksoft hover:text-red-500 hover:bg-red-500/5 transition opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                            title="Delete expense"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-[11px] text-inksoft flex items-center gap-2 font-medium">
          <Receipt size={14} className="text-brand" />
          {settlements.length === 0
            ? "Everyone is settled up."
            : `Simplification algorithm reduced this to ${settlements.length} active transaction${settlements.length !== 1 ? "s" : ""}.`}
        </div>
      </main>

      {/* Modal: Add Expense */}
      {(showAdd || editingExpense) && (
        <AddExpenseModal
          group={group}
          currentUserId={user._id}
          expenseToEdit={editingExpense}
          onClose={() => {
            setShowAdd(false);
            setEditingExpense(null);
          }}
          onAdded={() => {
            setShowAdd(false);
            setEditingExpense(null);
            load();
          }}
        />
      )}

      {/* Modal: Settle Settlements */}
      {showSettle && (
        <SettleModal
          settlements={settlements}
          nameOf={nameOf}
          onSettle={recordSettlement}
          onClose={() => setShowSettle(false)}
        />
      )}

      {/* Modal: Add Member */}
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

function AddExpenseModal({ group, currentUserId, expenseToEdit, onClose, onAdded }) {
  const [description, setDescription] = useState(expenseToEdit ? expenseToEdit.description : "");
  const [amount, setAmount] = useState(expenseToEdit ? expenseToEdit.amount : "");
  const [paidBy, setPaidBy] = useState(expenseToEdit ? (expenseToEdit.paidBy._id || expenseToEdit.paidBy) : currentUserId);
  const [splitAmong, setSplitAmong] = useState(expenseToEdit ? expenseToEdit.splitAmong : group.members.map((m) => m._id));
  const [splitType, setSplitType] = useState(expenseToEdit ? expenseToEdit.splitType : "equal");
  const [splitDetails, setSplitDetails] = useState(() => {
    if (expenseToEdit && expenseToEdit.shares) {
      return expenseToEdit.shares;
    }
    return {};
  });
  const [category, setCategory] = useState(expenseToEdit ? expenseToEdit.category || "Other" : "Other");
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
        category,
      };
      if (splitType !== "equal") {
        payload.splitDetails = Object.fromEntries(
          splitAmong.map((id) => [id, parseFloat(splitDetails[id]) || 0])
        );
      }
      if (expenseToEdit) {
        await api.put(`/expenses/${expenseToEdit._id}`, payload);
      } else {
        await api.post("/expenses", payload);
      }
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
        className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-modal border border-line animate-scaleIn max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-sans font-bold text-lg text-ink">{expenseToEdit ? "Edit Expense" : "Add an Expense"}</h3>
          <button onClick={onClose} className="text-inksoft hover:text-ink transition">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 text-xs bg-red-50 dark:bg-red-950/20 border border-debt/30 text-debt rounded-lg px-3 py-2.5 animate-fadeIn">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-inksoft mb-1">What was it for?</label>
            <input
              required
              autoFocus
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-line bg-card rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition text-ink"
              placeholder="e.g. Pizza dinner"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-inksoft mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-line bg-card rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition text-ink"
            >
              {["Food", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-inksoft mb-1">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-line bg-card rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition text-ink"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-inksoft mb-1">Paid by</label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full border border-line bg-card rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition text-ink"
            >
              {group.members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-inksoft mb-1.5">Split among</label>
            <div className="flex flex-wrap gap-1.5">
              {group.members.map((m) => {
                const checked = splitAmong.includes(m._id);
                return (
                  <button
                    type="button"
                    key={m._id}
                    onClick={() => toggleMember(m._id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                      checked
                        ? "bg-brand-soft border-brand text-brand dark:bg-brand-soft/20 dark:text-brand-mint"
                        : "border-line text-inksoft hover:bg-paper"
                    }`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-inksoft mb-1.5">Split type</label>
            <div className="flex gap-1.5">
              {[
                { value: "equal", label: "Equal" },
                { value: "percentage", label: "Percentage" },
                { value: "exact", label: "Exact" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setSplitType(opt.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                    splitType === opt.value
                      ? "bg-brand text-white border-brand"
                      : "border-line text-inksoft hover:bg-paper"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {splitType !== "equal" && (
            <div className="space-y-2 border border-line rounded-xl p-3.5 bg-paper/30 animate-fadeIn">
              {splitAmong.length === 0 && (
                <p className="text-xs text-inksoft">Select members from above to split.</p>
              )}
              {splitAmong.map((id) => {
                const m = group.members.find((mem) => mem._id === id);
                return (
                  <div key={id} className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-ink">{m?.name}</span>
                    <div className="flex items-center gap-1">
                      {splitType === "exact" && <span className="text-xs text-inksoft">₹</span>}
                      <input
                        type="number"
                        step="0.01"
                        value={splitDetails[id] || ""}
                        onChange={(e) => updateDetail(id, e.target.value)}
                        className="w-20 border border-line rounded-lg px-2 py-1 text-xs outline-none bg-card focus:border-brand focus:ring-1 focus:ring-brand/10 transition text-ink"
                        placeholder="0"
                      />
                      {splitType === "percentage" && <span className="text-xs text-inksoft">%</span>}
                    </div>
                  </div>
                );
              })}
              <div className={`text-[10px] font-bold pt-1.5 transition-colors border-t border-line mt-2 ${detailMismatch ? "text-red-500" : "text-inksoft"}`}>
                Total: {splitType === "percentage" ? `${detailTotal}%` : rupee(detailTotal)}
                {splitType === "percentage" ? " / 100%" : ` / ${rupee(numericAmount)}`}
                {detailMismatch && " — doesn't add up"}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || detailMismatch || splitAmong.length === 0}
            className="w-full bg-brand text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            {saving ? (expenseToEdit ? "Saving..." : "Adding...") : (expenseToEdit ? "Save Changes" : "Add to Ledger")}
          </button>
        </form>
      </div>
    </div>
  );
}

function SettleModal({ settlements, nameOf, onSettle, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-modal border border-line animate-scaleIn"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-sans font-bold text-lg text-ink">Simplified Settlement</h3>
          <button onClick={onClose} className="text-inksoft hover:text-ink transition">
            <X size={18} />
          </button>
        </div>

        {settlements.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-block border-2 border-brand text-brand font-sans font-bold text-xs tracking-wider px-5 py-2 rounded-xl -rotate-3 animate-stampIn">
              ALL SETTLED
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {settlements.map((t, i) => (
              <div
                key={i}
                style={{ animationDelay: `${i * 60}ms` }}
                className="flex items-center justify-between border border-line rounded-xl px-4 py-3 bg-paper/20 animate-fadeInUp"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                    <span>{nameOf(t.from)}</span>
                    <ArrowRight size={12} className="text-inksoft" />
                    <span>{nameOf(t.to)}</span>
                  </div>
                  <div className="text-[10px] text-inksoft font-medium">Simplified IOU</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-red-500">{rupee(t.amount)}</span>
                  <button
                    onClick={() => onSettle(t.from, t.to, t.amount)}
                    className="bg-brand text-white text-[10px] font-bold px-2.5 py-1 rounded-lg hover:opacity-90 active:scale-95 transition"
                  >
                    Settle
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-center pt-3">
              <div className="inline-block border-2 border-brand text-brand font-sans font-bold text-[10px] tracking-wider px-4 py-1.5 rounded-xl -rotate-3 animate-stampIn">
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
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      setSaving(false);
      return;
    }

    try {
      await api.post(`/groups/${groupId}/members`, { email: email.trim() });
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
        className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-modal border border-line animate-scaleIn"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-sans font-bold text-lg text-ink">Add a Member</h3>
          <button onClick={onClose} className="text-inksoft hover:text-ink transition">
            <X size={18} />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 text-xs bg-red-50 dark:bg-red-950/20 border border-debt/30 text-debt rounded-lg px-3 py-2.5 animate-fadeIn">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-inksoft mb-1">
              Their email address
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-line bg-card rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition text-ink"
              placeholder="friend@test.com"
            />
          </div>
          
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50 hover:opacity-90 active:scale-95 transition shadow-sm"
          >
            {saving ? "Adding..." : "Add to Ledger"}
          </button>
        </form>
      </div>
    </div>
  );
}