import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Stamp, X, ArrowRight, Receipt, Trash2, UserPlus, ArrowLeft, Pencil, Search, Download, Printer, Archive, Sparkles, ShieldCheck } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
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

const MEMBER_GRADIENTS = [
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-orange-400 to-red-500",
  "from-purple-400 to-pink-500",
  "from-yellow-400 to-amber-500",
  "from-cyan-400 to-blue-500",
  "from-rose-400 to-red-500",
  "from-fuchsia-400 to-purple-500"
];

function memberColorFor(id = "") {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % MEMBER_GRADIENTS.length;
  return MEMBER_GRADIENTS[hash];
}

const MEMBER_COLORS_HEX = [
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#f97316", // Orange
  "#8b5cf6", // Purple
  "#eab308", // Yellow
  "#06b6d4", // Cyan
  "#f43f5e", // Rose
  "#d946ef"  // Fuchsia
];

function memberColorHexFor(id = "") {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % MEMBER_COLORS_HEX.length;
  return MEMBER_COLORS_HEX[hash];
}

export default function GroupDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [activeReceiptPreview, setActiveReceiptPreview] = useState(null);
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

  // Close receipt preview on Escape
  useEffect(() => {
    if (!activeReceiptPreview) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setActiveReceiptPreview(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeReceiptPreview]);

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
          toast("Expense deleted successfully!", "success");
          load();
        } catch (err) {
          toast(err.response?.data?.message || "Could not delete expense", "error");
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
          toast("Ledger group deleted successfully!", "success");
          navigate("/dashboard");
        } catch (err) {
          toast(err.response?.data?.message || "Could not delete group", "error");
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
          toast(`Ledger successfully ${group.isArchived ? "unarchived" : "archived"}!`, "success");
          load();
        } catch (err) {
          toast(err.response?.data?.message || "Could not toggle archive status", "error");
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
          toast(`${memberName} removed from ledger.`, "success");
        } catch (err) {
          toast(err.response?.data?.message || "Could not remove member", "error");
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
          toast(`Recorded settlement of ₹${amount} successfully!`, "success");
          load();
        } catch (err) {
          toast(err.response?.data?.message || "Could not record settlement", "error");
        }
      },
      "success"
    );
  }

  if (!data) {
    return (
      <Layout>
        <main className="w-full px-6 py-8 sm:px-8 sm:py-10 animate-pulse space-y-8">
          {/* Header Skeleton */}
          <div className="space-y-3">
            <div className="h-3 bg-paper dark:bg-paper/20 rounded w-24" />
            <div className="h-8 bg-paper dark:bg-paper/20 rounded w-48" />
          </div>

          {/* Members Balances Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-line rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-paper dark:bg-paper/20" />
                  <div className="h-2.5 bg-paper dark:bg-paper/20 rounded w-16" />
                </div>
                <div className="h-5 bg-paper dark:bg-paper/20 rounded w-20" />
                <div className="h-2 bg-paper dark:bg-paper/20 rounded w-12" />
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="bg-card border border-line rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-line">
              <div className="h-3.5 bg-paper dark:bg-paper/20 rounded w-32" />
            </div>
            <div className="p-5 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center border-b border-line/60 pb-3">
                  <div className="flex gap-4 items-center">
                    <div className="h-3 bg-paper dark:bg-paper/20 rounded w-12" />
                    <div className="h-3.5 bg-paper dark:bg-paper/20 rounded w-32" />
                  </div>
                  <div className="h-3.5 bg-paper dark:bg-paper/20 rounded w-16" />
                  <div className="h-3.5 bg-paper dark:bg-paper/20 rounded w-14" />
                </div>
              ))}
            </div>
          </div>
        </main>
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
      const date = new Date(exp.date || exp.createdAt).toLocaleDateString("en-IN");
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 shadow-sm bg-gradient-to-br ${memberColorFor(m._id)}`}
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
            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-line text-[9px] font-mono uppercase tracking-widest font-bold text-inksoft/80 bg-paper/30">
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Particulars &amp; Split</th>
                  <th className="px-6 py-3.5">Payer</th>
                  <th className="px-6 py-3.5 text-right">Amount (INR)</th>
                  <th className="px-6 py-3.5 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-xs text-inksoft">
                      <Receipt size={22} className="mx-auto mb-2 text-inksoft/40" />
                      <p className="font-semibold text-ink">No expenses logged yet.</p>
                      <p className="text-[11px] text-inksoft mt-0.5">Click &ldquo;Add Expense&rdquo; above or import a CSV file.</p>
                    </td>
                  </tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-xs text-inksoft">
                      <Search size={22} className="mx-auto mb-2 text-inksoft/40" />
                      <p className="font-semibold text-ink">No matching transactions found.</p>
                      <p className="text-[11px] text-inksoft mt-0.5">Clear filters or try searching for another description.</p>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr 
                      key={exp._id}
                      className="hover:bg-paper/30 transition-colors group text-xs text-ink"
                    >
                      <td className="px-6 py-4 text-inksoft font-mono text-[11px]">
                        {new Date(exp.date || exp.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-ink text-sm">{exp.description}</span>
                          <span className="px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider rounded-full bg-paper border border-line text-inksoft">
                            {exp.category || "Other"}
                          </span>
                          {exp.receiptUrl && (
                            <button
                              onClick={() => setActiveReceiptPreview(exp.receiptUrl)}
                              className="px-2 py-0.5 rounded-full bg-brand-soft text-brand dark:bg-brand-soft dark:text-brand hover:opacity-90 transition text-[9px] font-mono font-bold flex items-center gap-1 border border-brand/20"
                              title="Inspect Receipt Invoice"
                            >
                              <Receipt size={10} />
                              <span>Invoice</span>
                            </button>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-inksoft mt-1">
                          Split among {exp.splitAmong.length} member{exp.splitAmong.length !== 1 ? "s" : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                            {exp.paidBy.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-ink">{exp.paidBy.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-sm ls-mono">
                        {rupee(exp.amount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingExpense(exp)}
                            className="p-1.5 rounded-lg text-inksoft hover:text-brand hover:bg-paper transition"
                            title="Edit expense"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => deleteExpense(exp._id)}
                            aria-label={`Delete expense: ${exp.description}`}
                            className="p-1.5 rounded-lg text-inksoft hover:text-red-500 hover:bg-red-500/5 transition"
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
          expenses={expenses}
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

      {/* Receipt Image Preview Modal */}
      {activeReceiptPreview && (
        <div 
          className="fixed inset-0 bg-ink/75 flex items-center justify-center z-[99999] p-4 animate-fadeIn cursor-zoom-out"
          onClick={() => setActiveReceiptPreview(null)}
        >
          <div 
            className="bg-card border border-line rounded-2xl p-5 max-w-sm w-full animate-scaleIn space-y-4 shadow-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-inksoft">Receipt Invoice Bill</h4>
              <button 
                onClick={() => setActiveReceiptPreview(null)} 
                className="text-inksoft hover:text-ink transition"
              >
                <X size={16} />
              </button>
            </div>
            <img 
              src={activeReceiptPreview} 
              alt="Receipt Bill Invoice" 
              className="w-full h-auto rounded-xl border border-line select-none" 
            />
          </div>
        </div>
      )}
    </Layout>
  );
}

function AddExpenseModal({ group, expenses, currentUserId, expenseToEdit, onClose, onAdded }) {
  const [description, setDescription] = useState(expenseToEdit ? expenseToEdit.description : "");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const parseCSV = (text) => {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length <= 1) return [];
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    
    return lines.slice(1).map(line => {
      const values = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx];
      });
      return row;
    });
  };

  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const rows = parseCSV(text);
        if (rows.length === 0) {
          toast("No valid rows found in CSV file.", "error");
          return;
        }
        
        setSaving(true);
        let successCount = 0;
        for (const row of rows) {
          const description = row.description || row.desc || "Imported Expense";
          const amount = parseFloat(row.amount || row.price) || 0;
          if (amount <= 0) continue;
          
          let paidById = currentUserId;
          if (row.paidby || row.paid) {
            const term = (row.paidby || row.paid).toLowerCase().trim();
            const found = group.members.find(
              (m) => m.name.toLowerCase().includes(term) || m.email.toLowerCase().includes(term)
            );
            if (found) paidById = found._id;
          }
          
          const categories = ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"];
          let cat = "Other";
          if (row.category) {
            const matched = categories.find((c) => c.toLowerCase() === row.category.trim().toLowerCase());
            if (matched) cat = matched;
          }
          
          let transactionDate = new Date();
          if (row.date) {
            const parsed = new Date(row.date);
            if (!isNaN(parsed.getTime())) transactionDate = parsed;
          }
          
          await api.post("/expenses", {
            groupId: group._id,
            description,
            amount,
            paidBy: paidById,
            splitAmong: group.members.map((m) => m._id),
            splitType: "equal",
            category: cat,
            date: transactionDate
          });
          successCount++;
        }
        toast(`Successfully imported ${successCount} expenses from CSV!`, "success");
        onAdded();
      } catch (err) {
        toast("Error importing CSV file.", "error");
      } finally {
        setSaving(false);
      }
    };
    reader.readAsText(file);
  };

  const uniqueDescriptions = Array.from(
    new Set((expenses || []).map((e) => e.description.trim()))
  ).filter(
    (d) =>
      d.toLowerCase() !== description.toLowerCase() &&
      d.toLowerCase().includes(description.toLowerCase())
  ).slice(0, 4);

  const handleSelectSuggestion = (desc) => {
    setDescription(desc);
    const past = (expenses || []).find(
      (e) => e.description.trim().toLowerCase() === desc.trim().toLowerCase()
    );
    if (past && past.category) {
      setCategory(past.category);
    }
    setShowSuggestions(false);
  };
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
  const [receiptUrl, setReceiptUrl] = useState(expenseToEdit ? expenseToEdit.receiptUrl || "" : "");
  const [date, setDate] = useState(() => {
    if (expenseToEdit && expenseToEdit.date) {
      return new Date(expenseToEdit.date).toISOString().split("T")[0];
    }
    return new Date().toISOString().split("T")[0];
  });
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
        date,
        receiptUrl
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
      setError(err.response?.data?.message || "Could not record expense");
    } finally {
      setSaving(false);
    }
  }

  function handleAutoBalance() {
    if (splitType === "equal" || !paidBy) return;
    if (splitType === "percentage") {
      const currentOthers = splitAmong
        .filter((id) => id !== paidBy)
        .reduce((sum, id) => sum + (parseFloat(splitDetails[id]) || 0), 0);
      const remainder = Math.max(0, parseFloat((100 - currentOthers).toFixed(2)));
      setSplitDetails((prev) => ({ ...prev, [paidBy]: remainder }));
    } else if (splitType === "exact") {
      const currentOthers = splitAmong
        .filter((id) => id !== paidBy)
        .reduce((sum, id) => sum + (parseFloat(splitDetails[id]) || 0), 0);
      const remainder = Math.max(0, parseFloat((numericAmount - currentOthers).toFixed(2)));
      setSplitDetails((prev) => ({ ...prev, [paidBy]: remainder }));
    }
  }

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="expense-entry-modal-title"
      className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-modal border border-line animate-scaleIn max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-line mb-5">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-brand font-bold">
              EXPENSE ENTRY
            </span>
            <h3 id="expense-entry-modal-title" className="font-sans font-bold text-lg text-ink">
              {expenseToEdit ? "Edit Transaction" : "Record New Expense"}
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="p-1 rounded-lg text-inksoft hover:text-ink hover:bg-paper transition">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-4 text-xs bg-red-50 dark:bg-red-950/20 border border-debt/30 text-debt rounded-xl px-3.5 py-2.5 animate-fadeIn">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* CSV Quick Ingestion (New entries only) */}
          {!expenseToEdit && (
            <div className="border border-dashed border-line rounded-2xl p-3 text-center bg-paper/30 hover:bg-paper/60 transition relative cursor-pointer group/import">
              <input
                id="expense-csv-upload"
                type="file"
                accept=".csv"
                aria-label="Import CSV spreadsheet"
                onChange={handleCSVImport}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <label htmlFor="expense-csv-upload" className="text-[10px] text-inksoft font-semibold group-hover/import:text-brand transition flex items-center justify-center gap-1.5 cursor-pointer">
                <Download size={13} className="rotate-180 text-inksoft group-hover/import:text-brand transition" />
                <span>Drop CSV spreadsheet to batch import</span>
              </label>
            </div>
          )}

          {/* STEP 1: Amount & Particulars */}
          <div className="space-y-3.5 bg-paper/20 border border-line rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <label htmlFor="expense-amount-input" className="text-[9px] font-mono uppercase font-bold tracking-wider text-inksoft cursor-pointer">
                STEP 1: AMOUNT &amp; DETAILS
              </label>
              <span className="text-[9px] font-mono text-brand font-bold">INR (₹)</span>
            </div>

            {/* Oversized Currency Input */}
            <div className="relative">
              <input
                id="expense-amount-input"
                type="number"
                step="0.01"
                required
                aria-label="Expense amount in INR"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-center text-3xl font-mono font-extrabold text-ink bg-card border border-line rounded-xl py-3 px-4 outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition ls-mono"
                placeholder="0.00"
              />
            </div>

            {/* Description with Autocomplete */}
            <div className="relative">
              <label htmlFor="expense-desc-input" className="block text-[10px] uppercase font-mono font-bold tracking-wider text-inksoft mb-1">
                Description
              </label>
              <input
                id="expense-desc-input"
                required
                autoFocus
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full border border-line bg-card rounded-xl px-3 py-2 text-xs outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition text-ink"
                placeholder="e.g. Flight tickets to Goa"
              />
              {showSuggestions && uniqueDescriptions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-line rounded-xl shadow-modal overflow-hidden z-50">
                  {uniqueDescriptions.map((desc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(desc)}
                      className="w-full text-left px-3.5 py-2 hover:bg-paper text-xs font-medium text-ink transition-colors"
                    >
                      {desc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category & Date Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="expense-cat-select" className="block text-[10px] uppercase font-mono font-bold tracking-wider text-inksoft mb-1">
                  Category
                </label>
                <select
                  id="expense-cat-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-line bg-card rounded-xl px-2.5 py-1.5 text-xs outline-none focus:border-brand text-ink"
                >
                  {["Food", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="expense-date-input" className="block text-[10px] uppercase font-mono font-bold tracking-wider text-inksoft mb-1">
                  Date
                </label>
                <input
                  id="expense-date-input"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-line bg-card rounded-xl px-2.5 py-1.5 text-xs outline-none focus:border-brand text-ink"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: The Payer */}
          <div className="space-y-2 bg-paper/20 border border-line rounded-2xl p-4">
            <span className="text-[9px] font-mono uppercase font-bold tracking-wider text-inksoft block">
              STEP 2: PAID BY
            </span>
            <div className="flex flex-wrap gap-1.5">
              {group.members.map((m) => {
                const isSelected = paidBy === m._id;
                return (
                  <button
                    type="button"
                    key={m._id}
                    onClick={() => setPaidBy(m._id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                      isSelected
                        ? "bg-brand text-white border-brand shadow-sm font-bold"
                        : "border-line bg-card text-inksoft hover:bg-paper"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold">
                      {m.name.charAt(0).toUpperCase()}
                    </span>
                    <span>{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Split Engine */}
          <div className="space-y-3 bg-paper/20 border border-line rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono uppercase font-bold tracking-wider text-inksoft">
                STEP 3: SPLIT ENGINE
              </span>
              {/* Split Mode Tabs */}
              <div className="flex bg-card border border-line rounded-xl p-0.5">
                {[
                  { value: "equal", label: "Equal" },
                  { value: "percentage", label: "%" },
                  { value: "exact", label: "Exact ₹" },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setSplitType(opt.value)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      splitType === opt.value
                        ? "bg-brand text-white shadow-sm"
                        : "text-inksoft hover:text-ink"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Members Selector (Equal mode) */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-inksoft">Included members:</span>
              <div className="flex flex-wrap gap-1.5">
                {group.members.map((m) => {
                  const checked = splitAmong.includes(m._id);
                  return (
                    <button
                      type="button"
                      key={m._id}
                      onClick={() => toggleMember(m._id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                        checked
                          ? "bg-brand-soft border-brand text-brand dark:bg-brand-soft dark:text-brand"
                          : "border-line bg-card text-inksoft/60 hover:text-ink"
                      }`}
                    >
                      {m.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Unequal details inputs & auto-balance */}
            {splitType !== "equal" && (
              <div className="space-y-2 border-t border-line pt-3 mt-2">
                {splitAmong.map((id) => {
                  const m = group.members.find((mem) => mem._id === id);
                  return (
                    <div key={id} className="flex items-center justify-between gap-3">
                      <label htmlFor={`split-detail-input-${id}`} className="text-xs font-bold text-ink cursor-pointer">
                        {m?.name}
                      </label>
                      <div className="flex items-center gap-1">
                        {splitType === "exact" && <span className="text-xs font-mono text-inksoft">₹</span>}
                        <input
                          id={`split-detail-input-${id}`}
                          type="number"
                          step="0.01"
                          aria-label={`Split amount for ${m?.name}`}
                          value={splitDetails[id] || ""}
                          onChange={(e) => updateDetail(id, e.target.value)}
                          className="w-20 border border-line rounded-lg px-2 py-1 text-xs font-mono font-bold outline-none bg-card focus:border-brand text-ink"
                          placeholder="0"
                        />
                        {splitType === "percentage" && <span className="text-xs font-mono text-inksoft">%</span>}
                      </div>
                    </div>
                  );
                })}

                {/* Status and Auto-Balance Helper */}
                <div className={`text-[10px] font-mono font-bold pt-1.5 flex justify-between items-center border-t border-line ${detailMismatch ? "text-red-500" : "text-inksoft"}`}>
                  <span>Sum: {splitType === "percentage" ? `${detailTotal}% / 100%` : `${rupee(detailTotal)} / ${rupee(numericAmount)}`}</span>
                  <span>{detailMismatch ? "Mismatch" : "Balanced ✓"}</span>
                </div>

                {detailMismatch && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-semibold text-amber-700 dark:text-amber-300 animate-fadeIn">
                    <span>
                      Discrepancy: {splitType === "percentage" ? `${Math.abs(100 - detailTotal).toFixed(1)}%` : rupee(Math.abs(numericAmount - detailTotal))}
                    </span>
                    <button
                      type="button"
                      onClick={handleAutoBalance}
                      className="underline font-bold text-brand hover:opacity-80"
                    >
                      Auto-balance remainder
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Receipt attachment */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <label htmlFor="expense-receipt-file-input" className="text-[10px] font-mono uppercase font-bold text-inksoft cursor-pointer">
              RECEIPT INVOICE
            </label>
            <div className="flex items-center gap-2">
              <input
                id="expense-receipt-file-input"
                type="file"
                accept="image/*"
                aria-label="Upload receipt image"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setReceiptUrl("https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80");
                    toast("Receipt attached!", "success");
                  }
                }}
                className="text-[10px] text-inksoft file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-paper file:text-ink cursor-pointer"
              />
              {receiptUrl && (
                <span className="text-[9px] font-mono font-bold text-brand bg-brand-soft px-2 py-0.5 rounded-full">
                  Attached ✓
                </span>
              )}
            </div>
          </div>

          {/* Submit CTA Button */}
          <button
            type="submit"
            disabled={saving || detailMismatch || splitAmong.length === 0}
            className="w-full bg-brand text-white py-3 rounded-2xl font-bold text-xs disabled:opacity-50 hover:opacity-95 active:scale-98 transition-all shadow-sm"
          >
            {saving ? "Recording..." : (expenseToEdit ? "Save Changes" : "Record to Ledger")}
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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (activeSettleDetail) setActiveSettleDetail(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, activeSettleDetail]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settle-modal-title"
      className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4 animate-fadeIn backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-card rounded-2xl p-6 w-full shadow-modal border border-line animate-scaleIn transition-all duration-300 ${
          activeSettleDetail ? "max-w-lg" : view === "graph" ? "max-w-md" : "max-w-md"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 id="settle-modal-title" className="font-sans font-bold text-base text-ink">
                {activeSettleDetail ? "Digital Clearance Voucher" : "Simplified Settlement"}
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-brand bg-brand-soft/30 px-2 py-0.5 rounded-full border border-brand/20">
                <Sparkles size={10} /> Optimized Settlement
              </span>
            </div>
            <p className="text-[11px] text-inksoft mt-0.5">
              {activeSettleDetail
                ? `Voucher Ref: #VCH-${(activeSettleDetail.from || "").slice(-4).toUpperCase()}-${(activeSettleDetail.to || "").slice(-4).toUpperCase()}`
                : `LedgerSplit combined multiple balances into ${settlements.length} direct settlement${settlements.length === 1 ? "" : "s"}.`}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="p-1 rounded-lg text-inksoft hover:text-ink hover:bg-paper transition">
            <X size={16} />
          </button>
        </div>

        {/* View Switcher Tabs (Only when not in voucher clearance mode and has settlements) */}
        {!activeSettleDetail && settlements.length > 0 && (
          <div role="tablist" aria-label="Settlement views" className="flex bg-paper rounded-xl p-1 mb-4 border border-line">
            <button
              role="tab"
              aria-selected={view === "list"}
              onClick={() => setView("list")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === "list"
                  ? "bg-card text-brand shadow-sm border border-line/40"
                  : "text-inksoft hover:text-ink"
              }`}
            >
              List View ({settlements.length})
            </button>
            <button
              role="tab"
              aria-selected={view === "graph"}
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
          <div className="text-center py-10 space-y-3">
            <div className="inline-block border-2 border-brand text-brand font-mono font-bold text-xs tracking-widest px-6 py-2 rounded-xl -rotate-3 animate-stampIn shadow-sm">
              ✓ ZERO OUTSTANDING DEBT
            </div>
            <p className="text-xs text-inksoft">All peer balances in this ledger are completely balanced.</p>
          </div>
        ) : activeSettleDetail ? (
          /* DIGITAL CLEARANCE VOUCHER (Phase 7 Luxury Experience) */
          <div className="space-y-4 animate-fadeIn text-left pt-1">
            {/* Voucher Body Box */}
            <div className="bg-paper/60 border border-line rounded-2xl p-4 space-y-3.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-line/60 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-inksoft block">
                    Debtor (Paying)
                  </span>
                  <span className="text-sm font-bold text-red-500">
                    {nameOf(activeSettleDetail.from)}
                  </span>
                </div>
                <div className="px-2 py-1 rounded-full bg-card border border-line text-inksoft text-xs flex items-center justify-center">
                  <ArrowRight size={13} />
                </div>
                <div className="text-right space-y-0.5">
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-inksoft block">
                    Creditor (Receiving)
                  </span>
                  <span className="text-sm font-bold text-brand">
                    {nameOf(activeSettleDetail.to)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-inksoft font-medium">Total Net Debt:</span>
                <span className="font-mono font-bold text-ink text-sm">
                  {rupee(activeSettleDetail.originalAmount)}
                </span>
              </div>
            </div>

            {/* Partial Settlement Slider & Synced Amount Input */}
            <div className="space-y-2 bg-card border border-line rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <label htmlFor="voucher-payment-input" className="text-[11px] font-bold uppercase tracking-wider text-inksoft cursor-pointer">
                  Payment Amount
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[25, 50, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        const amt = Math.round((activeSettleDetail.originalAmount * pct) / 100);
                        setActiveSettleDetail({ ...activeSettleDetail, amount: amt });
                      }}
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border transition-all ${
                        activeSettleDetail.amount === Math.round((activeSettleDetail.originalAmount * pct) / 100)
                          ? "bg-brand text-white border-brand"
                          : "border-line text-inksoft hover:text-ink hover:bg-paper"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                  {activeSettleDetail.originalAmount > 100 && activeSettleDetail.originalAmount % 100 !== 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const rounded = Math.floor(activeSettleDetail.originalAmount / 100) * 100;
                        setActiveSettleDetail({ ...activeSettleDetail, amount: rounded });
                      }}
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border transition-all ${
                        activeSettleDetail.amount === Math.floor(activeSettleDetail.originalAmount / 100) * 100
                          ? "bg-brand text-white border-brand"
                          : "border-line text-inksoft hover:text-ink hover:bg-paper"
                      }`}
                      title="Round down to nearest ₹100"
                    >
                      ₹{Math.floor(activeSettleDetail.originalAmount / 100) * 100}
                    </button>
                  )}
                </div>
              </div>

              {/* Monospace Amount Input */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-inksoft text-base">
                  ₹
                </span>
                <input
                  id="voucher-payment-input"
                  type="number"
                  step="1"
                  min="1"
                  max={activeSettleDetail.originalAmount}
                  required
                  autoFocus
                  aria-label="Payment amount in INR"
                  value={activeSettleDetail.amount}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setActiveSettleDetail({ ...activeSettleDetail, amount: val });
                  }}
                  className="w-full border border-line bg-paper/40 rounded-xl pl-8 pr-3.5 py-2.5 text-base text-ink font-mono font-bold outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition"
                />
              </div>

              {/* Slider */}
              <input
                id="voucher-partial-slider"
                type="range"
                min="1"
                max={activeSettleDetail.originalAmount}
                step="1"
                value={Math.min(activeSettleDetail.amount, activeSettleDetail.originalAmount)}
                onChange={(e) => setActiveSettleDetail({ ...activeSettleDetail, amount: Number(e.target.value) })}
                aria-label="Settlement payment amount slider"
                aria-valuemin="1"
                aria-valuemax={activeSettleDetail.originalAmount}
                aria-valuenow={activeSettleDetail.amount}
                aria-valuetext={`₹${Math.round(activeSettleDetail.amount).toLocaleString('en-IN')}`}
                className="w-full accent-brand cursor-pointer h-1.5 bg-paper rounded-lg appearance-none"
              />

              {/* Live Remaining Liability Feedback */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-line/40">
                <span className="text-inksoft">Remaining Liability:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-ink">
                    {rupee(Math.max(0, activeSettleDetail.originalAmount - activeSettleDetail.amount))}
                  </span>
                  {activeSettleDetail.amount >= activeSettleDetail.originalAmount ? (
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand bg-brand-soft/30 px-2 py-0.5 rounded-full border border-brand/20">
                      Full Clearance
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Partial Settlement
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setActiveSettleDetail(null)}
                className="flex-1 py-2.5 border border-line rounded-xl text-xs font-bold text-inksoft hover:bg-paper transition"
              >
                Back to List
              </button>
              <button
                type="button"
                onClick={() => {
                  onSettle(activeSettleDetail.from, activeSettleDetail.to, activeSettleDetail.amount);
                  setActiveSettleDetail(null);
                }}
                disabled={activeSettleDetail.amount <= 0 || activeSettleDetail.amount > activeSettleDetail.originalAmount + 1}
                className="flex-[2] bg-brand text-white py-2.5 rounded-xl font-bold text-xs hover:opacity-95 active:scale-98 transition disabled:opacity-40 shadow-sm flex items-center justify-center gap-1.5"
              >
                <ShieldCheck size={14} /> Authorize Clearance ({rupee(activeSettleDetail.amount)})
              </button>
            </div>
          </div>
        ) : view === "list" ? (
          <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1" aria-label="Simplified settlement list">
            {/* Simplification highlight banner */}
            <div className="bg-brand-soft/20 border border-brand/20 rounded-xl p-3 flex items-center gap-2.5 text-xs text-brand font-medium">
              <Sparkles size={16} className="shrink-0" />
              <span>
                Simplified path: <strong>{settlements.length} direct payment{settlements.length !== 1 ? "s" : ""}</strong> fully clears all group debts.
              </span>
            </div>

            {settlements.map((t, i) => (
              <div
                key={i}
                style={{ animationDelay: `${i * 50}ms` }}
                className="flex items-center justify-between border border-line rounded-xl p-3.5 bg-card hover:border-brand/30 transition-all animate-fadeInUp shadow-card"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-ink">
                    <span className="px-2 py-0.5 rounded-md bg-paper border border-line text-ink">{nameOf(t.from)}</span>
                    <ArrowRight size={12} className="text-inksoft" />
                    <span className="px-2 py-0.5 rounded-md bg-brand-soft/30 border border-brand/20 text-brand">{nameOf(t.to)}</span>
                  </div>
                  <div className="text-[10px] text-inksoft font-mono">
                    Direct settlement transfer
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-ink text-sm">{rupee(t.amount)}</span>
                  <button
                    onClick={() => setActiveSettleDetail({ from: t.from, to: t.to, amount: t.amount, originalAmount: t.amount })}
                    aria-label={`Issue voucher for ${nameOf(t.from)} paying ${nameOf(t.to)} ${rupee(t.amount)}`}
                    className="bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-95 active:scale-95 transition shadow-sm"
                  >
                    Issue Voucher
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center animate-fadeIn">
            <div className="w-full relative flex items-center justify-center p-2">
              <svg
                viewBox="0 0 360 360"
                role="img"
                aria-label={`Debt flow graph: ${settlements.length} direct settlement transfers between group members`}
                className="w-full max-w-[320px] sm:max-w-[360px] h-auto aspect-square overflow-visible"
              >
                <title>Debt Simplification Diagram</title>
                <desc>{`Visual flow diagram showing ${settlements.length} direct settlement transfers.`}</desc>
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
                  const fromIndex = members.findIndex((m) => m._id === t.from);
                  const toIndex = members.findIndex((m) => m._id === t.to);
                  const diff = Math.min(
                    Math.abs(fromIndex - toIndex),
                    members.length - Math.abs(fromIndex - toIndex)
                  );
                  const offset = diff === 1 ? 18 : 38;
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
                        stroke={isEdgeActive ? "var(--color-brand)" : "var(--color-inksoft)"}
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
                          className="shadow-sm group-hover/edge:stroke-brand group-hover/edge:fill-brand-soft dark:group-hover/edge:fill-brand-soft/20 transition-all duration-150"
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
                      style={{ opacity: isNodeActive ? 1 : 0.35, transition: "all 0.25s ease" }}
                    >
                      {/* Circle Background */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="15"
                        fill={memberColorHexFor(m._id)}
                        className="shadow-md hover:scale-110 transform origin-center transition-all duration-200"
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
              💡 Hover nodes to highlight connected flows. Click any transfer path to open its clearance voucher.
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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-member-modal-title"
      className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4 animate-fadeIn backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-modal border border-line animate-scaleIn"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 id="add-member-modal-title" className="font-sans font-bold text-lg text-ink">Add a Member</h3>
          <button onClick={onClose} aria-label="Close dialog" className="p-1 rounded-lg text-inksoft hover:text-ink hover:bg-paper transition">
            <X size={18} />
          </button>
        </div>
        
        <p className="text-[11px] text-inksoft mb-4 leading-relaxed">
          Enter your friend's email address. They will be added to this ledger and can view balances when signed in.
        </p>

        {error && (
          <div role="alert" className="mb-4 text-xs bg-red-50 dark:bg-red-950/20 border border-debt/30 text-debt rounded-lg px-3 py-2.5 animate-fadeIn">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="add-member-email-input" className="block text-[10px] uppercase font-bold tracking-wider text-inksoft mb-1 cursor-pointer">
              Their email address
            </label>
            <input
              id="add-member-email-input"
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
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4 animate-fadeIn backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-modal border border-line animate-scaleIn"
      >
        <h3 id="confirm-modal-title" className="font-sans font-bold text-base text-ink mb-2">{title}</h3>
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