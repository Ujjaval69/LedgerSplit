import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Stamp, X, ArrowRight, Receipt, Trash2, UserPlus, ArrowLeft, Pencil, Search, Download, Printer, Archive } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filterPaidByMe, setFilterPaidByMe] = useState(false);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger"
  });

  function showConfirm(title, message, onConfirmAction, type = "danger") {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirmAction();
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      },
      type
    });
  }

  const load = useCallback(() => {
    api.get(`/groups/${id}`).then((res) => setData(res.data)).catch(() => {});
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function deleteExpense(expenseId) {
    showConfirm(
      "Delete Expense",
      "Are you sure you want to delete this expense? This action cannot be undone.",
      async () => {
        try {
          await api.delete(`/expenses/${expenseId}`);
          load();
        } catch (err) {
          alert(err.response?.data?.message || "Could not delete expense");
        }
      }
    );
  }

  async function deleteGroup() {
    showConfirm(
      "Delete Ledger Book",
      `Are you sure you want to delete the ledger group "${group?.name}"? This will delete all expenses in this group and cannot be undone.`,
      async () => {
        try {
          await api.delete(`/groups/${id}`);
          window.dispatchEvent(new Event("groupCreated"));
          navigate("/dashboard");
        } catch (err) {
          alert(err.response?.data?.message || "Could not delete group");
        }
      }
    );
  }

  async function toggleArchive() {
    const actionText = group.isArchived ? "unarchive" : "archive";
    showConfirm(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Ledger`,
      `Are you sure you want to ${actionText} this ledger group? ${
        group.isArchived 
          ? "It will show up in active ledgers again." 
          : "It will be hidden from your active dashboard list."
      }`,
      async () => {
        try {
          await api.patch(`/groups/${id}/archive`);
          window.dispatchEvent(new Event("groupCreated")); // reload sidebar!
          load();
        } catch (err) {
          alert(err.response?.data?.message || "Could not toggle archive status");
        }
      },
      "success"
    );
  }

  async function removeMember(memberId, memberName) {
    showConfirm(
      "Remove Member",
      `Are you sure you want to remove ${memberName} from this ledger group?`,
      async () => {
        try {
          const res = await api.delete(`/groups/${id}/members/${memberId}`);
          setData(res.data);
        } catch (err) {
          alert(err.response?.data?.message || "Could not remove member");
        }
      }
    );
  }

  async function recordSettlement(fromId, toId, amount) {
    const fromName = nameOf(fromId);
    const toName = nameOf(toId);
    showConfirm(
      "Record Settlement",
      `Do you want to record a settlement payment of ₹${amount} from ${fromName} to ${toName}? This will reset their mutual balance.`,
      async () => {
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
      },
      "success"
    );
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
  const nameOf = (uid) =>
    group.members.find((m) => m._id === uid)?.name ||
    (group.formerMembers || []).find((m) => m._id === uid)?.name ||
    "Former Member";

  const filteredExpenses = expenses.filter((exp) => {
    const matchSearch =
      exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.paidBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.category && exp.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCategory = selectedCategory === "All" || exp.category === selectedCategory;
    const matchPaidByMe = !filterPaidByMe || exp.paidBy._id === user._id;

    return matchSearch && matchCategory && matchPaidByMe;
  });

  function exportToCSV() {
    const csvHeaders = ["Date", "Description", "Category", "Paid By", "Amount", "Split Ways", "Split Members"];
    const csvRows = expenses.map((exp) => {
      const date = new Date(exp.createdAt).toLocaleDateString("en-IN");
      const desc = `"${exp.description.replace(/"/g, '""')}"`;
      const cat = exp.category || "Other";
      const paid = exp.paidBy.name;
      const amt = exp.amount;
      const ways = exp.splitAmong.length;
      const members = `"${exp.splitAmong.map((id) => nameOf(id)).join("; ")}"`;
      return [date, desc, cat, paid, amt, ways, members].join(",");
    });

    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${group.name.replace(/\s+/g, "_")}_ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportToPDF() {
    window.print();
  }

  return (
    <Layout>
      <main className="w-full px-6 py-8 sm:px-8 sm:py-10">
        
        {/* Back navigation & Header */}
        <div className="mb-6">
          <button 
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-inksoft hover:text-brand transition mb-4 print-hide"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-inksoft">Ledger Book</span>
              <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-0.5">{group.name}</h1>
            </div>
            
            <div className="flex flex-wrap gap-2.5 print-hide">
              <button
                onClick={exportToCSV}
                className="flex items-center justify-center gap-2 border border-line bg-card text-ink px-4 py-2.5 rounded-xl font-semibold text-xs hover:bg-paper transition"
                title="Export ledger as CSV file"
              >
                <Download size={14} /> Export CSV
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center justify-center gap-2 border border-line bg-card text-ink px-4 py-2.5 rounded-xl font-semibold text-xs hover:bg-paper transition"
                title="Save ledger as PDF / Print"
              >
                <Printer size={14} /> Print PDF
              </button>
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
                onClick={toggleArchive}
                className="flex items-center justify-center gap-2 border border-line bg-card text-ink px-4 py-2.5 rounded-xl font-semibold text-xs hover:bg-paper transition"
                title={group.isArchived ? "Unarchive ledger" : "Archive ledger"}
              >
                <Archive size={14} /> {group.isArchived ? "Unarchive" : "Archive"}
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
          <div className="px-5 py-4 border-b border-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-paper/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-inksoft">Expenses Ledger</h3>
            <div className="flex flex-wrap items-center gap-2">
              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search description, payer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-40 sm:w-48 border border-line bg-card rounded-xl pl-8 pr-8 py-1.5 text-[11px] outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition text-ink"
                />
                <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-inksoft" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-inksoft hover:text-red-500 font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Category selector */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-line bg-card rounded-xl px-2.5 py-1.5 text-[11px] outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition text-ink"
              >
                <option value="All">All Categories</option>
                {["Food", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Toggle Paid by Me */}
              <button
                type="button"
                onClick={() => setFilterPaidByMe(!filterPaidByMe)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition ${
                  filterPaidByMe
                    ? "bg-brand text-white border-brand shadow-sm"
                    : "border-line text-inksoft hover:bg-paper bg-card"
                }`}
              >
                Paid by me
              </button>

              {/* Reset button */}
              {(searchQuery || selectedCategory !== "All" || filterPaidByMe) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setFilterPaidByMe(false);
                  }}
                  className="text-[11px] font-bold text-red-500 hover:underline px-1"
                >
                  Reset
                </button>
              )}
            </div>
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
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-xs text-inksoft">
                      <Search size={24} className="mx-auto mb-2 text-inksoft/40 animate-pulse" />
                      No expenses match your filters. Click "Reset" to clear search!
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
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
          members={[...group.members, ...(group.formerMembers || [])]}
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
      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
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

function SettleModal({ settlements, members, nameOf, onSettle, onClose }) {
  const [view, setView] = useState("list");
  const [hoveredNode, setHoveredNode] = useState(null);
  const [activeSettleDetail, setActiveSettleDetail] = useState(null);

  // Position math
  const N = members.length;
  const positions = {};
  members.forEach((m, idx) => {
    const angle = (idx * 2 * Math.PI) / N - Math.PI / 2;
    positions[m._id] = {
      x: 180 + 100 * Math.cos(angle),
      y: 180 + 100 * Math.sin(angle),
      angle
    };
  });

  return (
    <div
      className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-card rounded-2xl p-6 w-full shadow-modal border border-line animate-scaleIn transition-all duration-300 ${
          view === "graph" || activeSettleDetail ? "max-w-md" : "max-w-sm"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-sans font-bold text-lg text-ink font-sans">Simplified Settlement</h3>
          <button onClick={onClose} className="text-inksoft hover:text-ink transition">
            <X size={18} />
          </button>
        </div>

        {/* View Switcher Tabs */}
        {!activeSettleDetail && settlements.length > 0 && (
          <div className="flex bg-paper rounded-xl p-1 mb-5 border border-line">
            <button
              onClick={() => setView("list")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === "list"
                  ? "bg-card text-brand shadow-sm border border-line/40"
                  : "text-inksoft hover:text-ink"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView("graph")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === "graph"
                  ? "bg-card text-brand shadow-sm border border-line/40"
                  : "text-inksoft hover:text-ink"
              }`}
            >
              Visual Flow
            </button>
          </div>
        )}

        {settlements.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-block border-2 border-brand text-brand font-sans font-bold text-xs tracking-wider px-5 py-2 rounded-xl -rotate-3 animate-stampIn">
              ALL SETTLED
            </div>
          </div>
        ) : activeSettleDetail ? (
          /* Custom Settlement Amount Form overlay (supports partial settlements) */
          <div className="space-y-4 animate-fadeIn text-left pt-2">
            <div className="bg-paper/50 border border-line rounded-xl p-4 space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-inksoft">Record Settlement Payment</h4>
              <div className="flex items-center justify-between text-xs text-ink font-semibold">
                <span>Paying from:</span>
                <span className="font-bold text-red-500">{nameOf(activeSettleDetail.from)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-ink font-semibold">
                <span>Receiving to:</span>
                <span className="font-bold text-brand">{nameOf(activeSettleDetail.to)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-inksoft font-semibold border-t border-line/60 pt-2.5">
                <span>Original Debt:</span>
                <span className="font-mono font-bold text-ink">{rupee(activeSettleDetail.originalAmount)}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-inksoft">
                Payment Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                required
                autoFocus
                value={activeSettleDetail.amount}
                onChange={(e) => setActiveSettleDetail({ ...activeSettleDetail, amount: parseFloat(e.target.value) || 0 })}
                className="w-full border border-line bg-card rounded-xl px-3.5 py-2.5 text-sm text-ink font-mono font-bold outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveSettleDetail(null)}
                className="flex-1 py-3 border border-line rounded-xl text-xs font-bold text-inksoft hover:bg-paper transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onSettle(activeSettleDetail.from, activeSettleDetail.to, activeSettleDetail.amount);
                  setActiveSettleDetail(null);
                }}
                disabled={activeSettleDetail.amount <= 0 || activeSettleDetail.amount > activeSettleDetail.originalAmount + 1}
                className="flex-1 bg-brand text-white py-3 rounded-xl font-bold text-xs hover:opacity-90 active:scale-95 transition disabled:opacity-40"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        ) : view === "list" ? (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
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
                    onClick={() => setActiveSettleDetail({ from: t.from, to: t.to, amount: t.amount, originalAmount: t.amount })}
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
        ) : (
          <div className="flex flex-col items-center justify-center animate-fadeIn">
            <div className="w-full relative flex items-center justify-center">
              <svg width="360" height="360" className="overflow-visible">
                <defs>
                  <marker
                    id="arrow-head"
                    viewBox="0 0 10 10"
                    refX="17"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--color-brand-mint)" />
                  </marker>
                  <marker
                    id="arrow-head-active"
                    viewBox="0 0 10 10"
                    refX="17"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--color-brand)" />
                  </marker>
                </defs>

                {/* Render edges/arrows */}
                {settlements.map((t, idx) => {
                  const fromPos = positions[t.from];
                  const toPos = positions[t.to];
                  if (!fromPos || !toPos) return null;

                  const isEdgeActive =
                    !hoveredNode || hoveredNode === t.from || hoveredNode === t.to;

                  // Curve calculation
                  const x1 = fromPos.x;
                  const y1 = fromPos.y;
                  const x2 = toPos.x;
                  const y2 = toPos.y;

                  const dx = x2 - x1;
                  const dy = y2 - y1;
                  const len = Math.sqrt(dx * dx + dy * dy);
                  const px = -dy / len;
                  const py = dx / len;

                  const mx = (x1 + x2) / 2;
                  const my = (y1 + y2) / 2;
                  const offset = 22; // bend factor
                  const cx = mx + px * offset;
                  const cy = my + py * offset;

                  // Midpoint of Bezier curve (t=0.5)
                  const labelX = 0.25 * x1 + 0.5 * cx + 0.25 * x2;
                  const labelY = 0.25 * y1 + 0.5 * cy + 0.25 * y2;

                  return (
                    <g
                      key={idx}
                      className="cursor-pointer group/edge"
                      onClick={() => setActiveSettleDetail({ from: t.from, to: t.to, amount: t.amount, originalAmount: t.amount })}
                      style={{ opacity: isEdgeActive ? 1 : 0.15, transition: "all 0.25s ease" }}
                    >
                      {/* Interactive thick hover helper path */}
                      <path
                        d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                        fill="none"
                        stroke="transparent"
                        strokeWidth="15"
                      />
                      {/* Actual visual path */}
                      <path
                        d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                        fill="none"
                        stroke={isEdgeActive ? "var(--color-brand-mint)" : "var(--color-inksoft)"}
                        strokeWidth={hoveredNode === t.from || hoveredNode === t.to ? 3 : 2}
                        markerEnd={`url(#${
                          hoveredNode === t.from || hoveredNode === t.to
                            ? "arrow-head-active"
                            : "arrow-head"
                        })`}
                        className="transition-all duration-200 group-hover/edge:stroke-brand group-hover/edge:stroke-[3px]"
                      />
                      {/* Amount tag bubble */}
                      <g transform={`translate(${labelX}, ${labelY})`}>
                        <rect
                          x="-28"
                          y="-9"
                          width="56"
                          height="18"
                          rx="9"
                          fill="var(--color-card)"
                          stroke="var(--color-line)"
                          strokeWidth="1"
                          className="shadow-sm group-hover/edge:stroke-brand group-hover/edge:fill-brand-soft dark:group-hover/edge:fill-brand-soft/20 transition-all duration-155"
                        />
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="font-mono text-[9px] font-bold text-ink fill-current group-hover/edge:text-brand"
                        >
                          {rupee(t.amount)}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Render nodes/members */}
                {members.map((m) => {
                  const pos = positions[m._id];
                  if (!pos) return null;

                  const isNodeActive = !hoveredNode || hoveredNode === m._id;
                  const labelDistance = 22;
                  const lx = pos.x + labelDistance * Math.cos(pos.angle);
                  const ly = pos.y + labelDistance * Math.sin(pos.angle) + 2;

                  let anchor = "middle";
                  if (Math.cos(pos.angle) > 0.3) anchor = "start";
                  else if (Math.cos(pos.angle) < -0.3) anchor = "end";

                  return (
                    <g
                      key={m._id}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredNode(m._id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{ opacity: isNodeActive ? 1 : 0.4, transition: "all 0.25s ease" }}
                    >
                      {/* Circle Background */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="15"
                        fill="var(--color-brand)"
                        className="shadow-md hover:scale-110 transform origin-center transition-all duration-200 hover:fill-brand-mint"
                      />
                      {/* Member Initials */}
                      <text
                        x={pos.x}
                        y={pos.y + 1}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-[9px] font-extrabold text-white fill-current pointer-events-none"
                      >
                        {initialsOf(m.name)}
                      </text>
                      {/* Name Label */}
                      <text
                        x={lx}
                        y={ly}
                        textAnchor={anchor}
                        className="text-[9px] font-bold text-ink fill-current pointer-events-none"
                      >
                        {m.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="text-[10px] text-inksoft text-center mt-3 leading-relaxed">
              💡 Hover nodes to highlight balances. <br />
              Click any green payment path to settle that specific balance transaction.
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

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, type }) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4 animate-fadeIn"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-modal border border-line animate-scaleIn"
      >
        <h3 className="font-sans font-bold text-base text-ink mb-2">{title}</h3>
        <p className="text-xs text-inksoft mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-line rounded-xl text-xs font-bold text-inksoft hover:bg-paper transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-xl text-xs font-bold hover:opacity-90 active:scale-95 transition ${
              type === "success" ? "bg-brand" : "bg-red-500"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}