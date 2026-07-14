import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, X, TrendingUp, TrendingDown, Scale, BookOpen } from "lucide-react";
import api from "../api/client";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const ACCENT_PAIRS = [
  ["from-emerald-400 to-teal-600", "text-emerald-500"],
  ["from-blue-400 to-indigo-600", "text-blue-500"],
  ["from-orange-400 to-red-600", "text-red-500"],
  ["from-purple-400 to-pink-600", "text-purple-500"],
  ["from-yellow-400 to-amber-600", "text-amber-500"],
];
function accentFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % ACCENT_PAIRS.length;
  return ACCENT_PAIRS[hash];
}

function rupee(n) {
  return "₹" + Math.round(Math.abs(n)).toLocaleString("en-IN");
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  function refresh() {
    setLoading(true);
    Promise.all([
      api.get("/groups"),
      api.get("/dashboard"),
      api.get("/activity")
    ])
      .then(([groupsRes, dashRes, actRes]) => {
        setGroups(groupsRes.data);
        setAnalytics(dashRes.data);
        setActivities(actRes.data);
      })
      .catch((err) => {
        console.error("Dashboard loading error:", err);
      })
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  return (
    <Layout onNewGroup={() => setShowCreate(true)}>
      <main className="w-full px-6 py-8 sm:px-8 sm:py-10 min-h-[calc(100vh-4rem)]">
        
        {/* Welcome header & Add button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-inksoft">Ledger Book</span>
            <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-0.5 animate-fadeIn">
              {greeting()}, {user?.name?.split(" ")[0]}
            </h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center justify-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus size={16} /> New Group
          </button>
        </div>

        {loading ? (
          <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-card border border-line" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-56 rounded-2xl bg-card border border-line" />
              <div className="h-56 rounded-2xl bg-card border border-line" />
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            {analytics && (
              <>
                {/* Balance Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Net Balance Card */}
                  <div className="bg-card border border-line rounded-2xl p-5 shadow-sm hover:shadow-card-hover hover:translate-y-[-1px] transition-all duration-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-inksoft">Net Position</span>
                      <span className={`text-[10px] font-extrabold ${analytics.netBalance >= 0 ? "text-brand" : "text-red-500"}`}>
                        {analytics.netBalance >= 0 ? "SURPLUS" : "DEFICIT"}
                      </span>
                    </div>
                    <div className={`text-2xl font-extrabold font-mono tracking-tight ls-mono ${analytics.netBalance >= 0 ? "text-brand" : "text-red-500"}`}>
                      {analytics.netBalance >= 0 ? "+" : "-"} {rupee(analytics.netBalance)}
                    </div>
                    <span className="text-[10px] text-inksoft font-medium">Your net balance across all ledgers</span>
                  </div>

                  {/* You Are Owed Card */}
                  <div className="bg-card border border-line rounded-2xl p-5 shadow-sm hover:shadow-card-hover hover:translate-y-[-1px] transition-all duration-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-inksoft">You are owed</span>
                      <span className="text-brand font-extrabold">↗</span>
                    </div>
                    <div className="text-2xl font-extrabold font-mono text-brand tracking-tight ls-mono">
                      {rupee(analytics.youAreOwed)}
                    </div>
                    <span className="text-[10px] text-inksoft font-medium">Outstanding collections</span>
                  </div>

                  {/* You Owe Card */}
                  <div className="bg-card border border-line rounded-2xl p-5 shadow-sm hover:shadow-card-hover hover:translate-y-[-1px] transition-all duration-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-inksoft">You owe</span>
                      <span className="text-red-500 font-extrabold">↘</span>
                    </div>
                    <div className="text-2xl font-extrabold font-mono text-red-500 tracking-tight ls-mono">
                      {rupee(analytics.youOwe)}
                    </div>
                    <span className="text-[10px] text-inksoft font-medium">Pending repayments</span>
                  </div>
                </div>

                {/* Statistics Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Total Spending (Forest Green Card) */}
                  <div className="bg-brand text-white rounded-2xl p-5 shadow-sm hover:translate-y-[-1px] transition-all duration-200 flex flex-col justify-between h-28 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Total Spending</span>
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-[10px]">
                        ₹
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold tracking-tight font-mono">{rupee(analytics.totalExpenses)}</div>
                    <span className="text-[9px] text-white/70 font-medium">Your personal share of group bills</span>
                  </div>

                  {/* Total Groups (White Card) */}
                  <div className="bg-card border border-line rounded-2xl p-5 shadow-sm hover:shadow-card-hover hover:translate-y-[-1px] transition-all duration-200 flex flex-col justify-between h-28">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-inksoft">Total Ledgers</span>
                      <div className="w-6 h-6 rounded-full bg-paper dark:bg-paper/10 flex items-center justify-center text-inksoft">
                        <BookOpen size={12} />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold tracking-tight text-ink font-mono">{analytics.totalGroups}</div>
                    <span className="text-[9px] text-inksoft font-medium">Active group ledgers joined</span>
                  </div>

                  {/* Total Members (White Card) */}
                  <div className="bg-card border border-line rounded-2xl p-5 shadow-sm hover:shadow-card-hover hover:translate-y-[-1px] transition-all duration-200 flex flex-col justify-between h-28">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-inksoft">Total Friends</span>
                      <div className="w-6 h-6 rounded-full bg-paper dark:bg-paper/10 flex items-center justify-center text-inksoft">
                        <Users size={12} />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold tracking-tight text-ink font-mono">{analytics.totalMembers}</div>
                    <span className="text-[9px] text-inksoft font-medium">Unique friends split with</span>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Monthly Spending SVG Bar Chart */}
                  <div className="bg-card border border-line rounded-2xl p-5 shadow-sm hover:shadow-card-hover transition-all">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-inksoft mb-4">Monthly Spending</h3>
                    {analytics.monthlyExpenses.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-48 text-center text-xs text-inksoft">
                        No monthly activity logged yet.
                      </div>
                    ) : (
                      <div className="flex items-end justify-between gap-3 h-48 pt-4 pb-2 px-2">
                        {(() => {
                          const maxAmount = Math.max(...analytics.monthlyExpenses.map((m) => m.amount), 1);
                          return analytics.monthlyExpenses.slice(-6).map((m) => {
                            const pct = (m.amount / maxAmount) * 100;
                            return (
                              <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group relative">
                                <div className="absolute bottom-full mb-1 bg-ink text-paper text-[10px] font-bold py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition shadow-sm pointer-events-none whitespace-nowrap z-10">
                                  {rupee(m.amount)}
                                </div>
                                <div className="w-full bg-paper dark:bg-paper/10 rounded-lg h-32 flex items-end overflow-hidden">
                                  <div 
                                    style={{ height: `${pct}%` }} 
                                    className="w-full bg-brand group-hover:opacity-85 transition-all duration-300 rounded-t-sm"
                                  />
                                </div>
                                <span className="text-[10px] font-bold text-inksoft uppercase tracking-wider">
                                  {new Date(m.month + "-02").toLocaleDateString("en-US", { month: "short" })}
                                </span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Category Progress List */}
                  <div className="bg-card border border-line rounded-2xl p-5 shadow-sm hover:shadow-card-hover transition-all">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-inksoft mb-4">Category Breakdown</h3>
                    {(() => {
                      const totalCatSpending = Object.values(analytics.categoryBreakdown).reduce((sum, v) => sum + v, 0) || 1;
                      const activeCats = Object.entries(analytics.categoryBreakdown).filter(([_, amt]) => amt > 0);
                      
                      if (activeCats.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center h-48 text-center text-xs text-inksoft">
                            No categorized spending logged yet.
                          </div>
                        );
                      }
                      
                      return (
                        <div className="space-y-3.5 max-h-[192px] overflow-y-auto pr-1">
                          {activeCats
                            .sort((a, b) => b[1] - a[1])
                            .map(([cat, amt]) => {
                              const pct = (amt / totalCatSpending) * 100;
                              return (
                                <div key={cat} className="space-y-1">
                                  <div className="flex justify-between text-xs font-bold text-ink">
                                    <span>{cat}</span>
                                    <span className="font-mono text-inksoft">{rupee(amt)} ({Math.round(pct)}%)</span>
                                  </div>
                                  <div className="w-full h-2 bg-paper dark:bg-paper/10 rounded-full overflow-hidden">
                                    <div 
                                      style={{ width: `${pct}%` }} 
                                      className="h-full bg-brand rounded-full transition-all duration-500"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Recent Expenses and Activity Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Expenses Table */}
                  <div className="bg-card border border-line rounded-2xl overflow-hidden shadow-sm hover:shadow-card-hover transition-all lg:col-span-2">
                    <div className="px-5 py-4 border-b border-line bg-paper/10">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-inksoft">Recent Group Expenses</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                          <tr className="border-b border-line text-[10px] uppercase font-bold text-inksoft bg-paper/20">
                            <th className="px-5 py-3">Date</th>
                            <th className="px-5 py-3">Description</th>
                            <th className="px-5 py-3">Ledger</th>
                            <th className="px-5 py-3">Paid By</th>
                            <th className="px-5 py-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line/60 text-xs text-ink">
                          {analytics.recentExpenses.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="px-5 py-8 text-center text-inksoft">
                                No recent group expenses found.
                              </td>
                            </tr>
                          ) : (
                            analytics.recentExpenses.map((exp) => (
                              <tr key={exp._id} className="hover:bg-paper/10 transition-colors">
                                <td className="px-5 py-3.5 text-inksoft">
                                  {new Date(exp.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold">{exp.description}</span>
                                    <span className="px-1.5 py-0.5 text-[8px] font-extrabold rounded-full bg-paper dark:bg-paper/10 text-brand-mint/90 border border-line uppercase">
                                      {exp.category || "Other"}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 font-semibold text-inksoft">{exp.group?.name || "Deleted Ledger"}</td>
                                <td className="px-5 py-3.5 font-medium">{exp.paidBy?.name || "Unknown"}</td>
                                <td className="px-5 py-3.5 text-right font-mono font-bold">{rupee(exp.amount)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recent Activity Panel */}
                  <div className="bg-card border border-line rounded-2xl p-5 shadow-sm hover:shadow-card-hover transition-all flex flex-col h-[400px]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-inksoft mb-4">Recent Activity</h3>
                    <div className="space-y-4 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                      {activities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-xs text-inksoft">
                          No recent activity logs.
                        </div>
                      ) : (
                        activities.map((act) => (
                          <div key={act._id} className="flex gap-2.5 text-[11px] leading-relaxed">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 shrink-0" />
                            <div className="space-y-0.5">
                              <p className="text-ink font-bold">{act.message}</p>
                              <div className="text-[9px] text-inksoft font-semibold uppercase tracking-wider">
                                {new Date(act.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Groups Grid List */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-inksoft mb-4">Your Ledgers</h2>
              
              {groups.length === 0 ? (
                <div className="border border-dashed border-line rounded-2xl p-8 sm:p-14 text-center bg-card/50">
                  <div className="w-12 h-12 rounded-2xl bg-brand-soft text-brand dark:bg-brand-soft/20 dark:text-brand-mint mx-auto mb-4 flex items-center justify-center shadow-sm">
                    <BookOpen size={20} />
                  </div>
                  <h3 className="font-sans font-bold text-base text-ink mb-1.5">Start your first ledger</h3>
                  <p className="text-inksoft text-xs mb-6 max-w-xs mx-auto leading-relaxed">
                    A ledger tracks shared costs for one group of people — pick whatever fits your life.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {["Hostel room", "Trip with friends", "Flatmates", "Team snacks"].map((ex) => (
                      <span
                        key={ex}
                        className="text-[10px] font-bold text-inksoft bg-card border border-line rounded-full px-3 py-1"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:opacity-90 active:scale-95 transition"
                  >
                    <Plus size={14} /> Create a Ledger
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groups.map((g) => {
                    const [gradient, textClass] = accentFor(g._id);
                    const bal = g.yourBalance || 0;
                    const isCredit = bal > 0.5;
                    const isDebt = bal < -0.5;
                    
                    return (
                      <button
                        key={g._id}
                        onClick={() => navigate(`/groups/${g._id}`)}
                        className="group text-left bg-card border border-line rounded-2xl p-5 shadow-sm hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center font-sans font-bold text-white shadow-sm shrink-0`}>
                            {g.name.charAt(0).toUpperCase()}
                          </div>
                          {(isCredit || isDebt) ? (
                            <span
                              className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg ls-mono ${
                                isCredit 
                                  ? "bg-brand-soft text-brand dark:bg-brand-soft/20 dark:text-brand-mint" 
                                  : "bg-red-500/10 text-red-500"
                              }`}
                            >
                              {isCredit ? "+" : "-"}
                              {rupee(bal)}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-inksoft bg-paper dark:bg-paper/10 px-2 py-0.5 rounded-lg">
                              Settled up
                            </span>
                          )}
                        </div>
                        <h3 className="font-sans font-bold text-sm text-ink truncate mb-1 group-hover:text-brand transition">{g.name}</h3>
                        <div className="flex items-center gap-1 text-[10px] text-inksoft font-medium">
                          <Users size={12} className="text-inksoft" />
                          <span>{g.members.length} member{g.members.length !== 1 ? "s" : ""}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal for Group Creation */}
      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            refresh();
          }}
        />
      )}
    </Layout>
  );
}

function CreateGroupModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [emails, setEmails] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const memberEmails = emails
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = memberEmails.filter(email => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        setError(`Invalid email format: ${invalidEmails.join(", ")}`);
        setSaving(false);
        return;
      }

      await api.post("/groups", { name, memberEmails });
      window.dispatchEvent(new Event("groupCreated"));
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create group");
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
          <h3 className="font-sans font-bold text-lg text-ink">New Ledger</h3>
          <button onClick={onClose} aria-label="Close dialog" className="text-inksoft hover:text-ink transition rounded">
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
            <label className="block text-[10px] uppercase font-bold tracking-wider text-inksoft mb-1">Group name</label>
            <input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-line bg-card rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition text-ink"
              placeholder="e.g. Trip to Manali"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-inksoft mb-1">
              Invite by email (comma separated)
            </label>
            <input
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="w-full border border-line bg-card rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition text-ink"
              placeholder="priya@mail.com, rohan@mail.com"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            {saving ? "Creating..." : "Create Ledger"}
          </button>
        </form>
      </div>
    </div>
  );
}