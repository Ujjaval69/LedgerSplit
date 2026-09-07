import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, X, TrendingUp, TrendingDown, Scale, BookOpen } from "lucide-react";
import api from "../api/client";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

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
  const [activityUserFilter, setActivityUserFilter] = useState("All");
  const [hasMoreActivities, setHasMoreActivities] = useState(false);
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  async function handleSeedDemo() {
    setSeeding(true);
    try {
      await api.post("/groups/seed-demo");
      window.dispatchEvent(new Event("groupCreated")); // trigger sidebar reload
      toast("Demo Goa Trip seeded successfully!", "success");
      refresh();
    } catch (err) {
      toast(err.response?.data?.message || "Could not seed demo data", "error");
    } finally {
      setSeeding(false);
    }
  }

  function refresh() {
    setLoading(true);
    Promise.all([
      api.get("/groups"),
      api.get("/dashboard"),
      api.get("/activity?page=1&limit=10")
    ])
      .then(([groupsRes, dashRes, actRes]) => {
        setGroups(groupsRes.data);
        setAnalytics(dashRes.data);
        setActivities(actRes.data.activities || actRes.data);
        setHasMoreActivities(actRes.data.hasMore || false);
        setActivitiesPage(1);
      })
      .catch((err) => {
        console.error("Dashboard loading error:", err);
      })
      .finally(() => setLoading(false));
  }

  async function loadMoreActivities() {
    const nextPage = activitiesPage + 1;
    try {
      const res = await api.get(`/activity?page=${nextPage}&limit=10`);
      const newActs = res.data.activities || [];
      setActivities((prev) => [...prev, ...newActs]);
      setHasMoreActivities(res.data.hasMore || false);
      setActivitiesPage(nextPage);
    } catch (err) {
      console.error("Could not load more activities:", err);
    }
  }

  useEffect(refresh, []);

  const uniqueActivityUsers = Array.from(
    new Map((activities || []).map((act) => [act.user?._id, act.user])).values()
  ).filter(Boolean);

  const filteredActivities = (activities || []).filter((act) => {
    if (activityUserFilter === "All") return true;
    return act.user?._id === activityUserFilter;
  });

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
            {/* Pulsating Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-line rounded-2xl p-5 space-y-3">
                  <div className="h-2.5 bg-paper dark:bg-paper/20 rounded w-1/3" />
                  <div className="h-6 bg-paper dark:bg-paper/20 rounded w-1/2" />
                  <div className="h-2.5 bg-paper dark:bg-paper/20 rounded w-2/3" />
                </div>
              ))}
            </div>
            {/* Pulsating Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-line rounded-2xl p-5 space-y-4">
                <div className="h-3 bg-paper dark:bg-paper/20 rounded w-1/4" />
                <div className="flex items-end justify-between gap-3 h-32 pt-4">
                  {[45, 80, 55, 90, 30, 65].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-paper dark:bg-paper/10 rounded-t h-24 flex items-end">
                        <div style={{ height: `${val}%` }} className="w-full bg-paper dark:bg-paper/20 rounded-t" />
                      </div>
                      <div className="h-2 bg-paper dark:bg-paper/20 rounded w-8" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card border border-line rounded-2xl p-5 space-y-4">
                <div className="h-3 bg-paper dark:bg-paper/20 rounded w-1/4" />
                <div className="space-y-3 pt-2">
                  {[1, 2, 3, 4].map((idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-2.5 bg-paper dark:bg-paper/20 rounded w-1/5" />
                        <div className="h-2.5 bg-paper dark:bg-paper/20 rounded w-1/6" />
                      </div>
                      <div className="h-1.5 bg-paper dark:bg-paper/10 rounded w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            {analytics && (
              <>
                {/* Unified Executive Liquidity Barometer */}
                <div className="bg-card border border-line rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-inksoft font-bold">
                          TOTAL NET POSITION
                        </span>
                        <span className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full ${
                          analytics.netBalance > 0.5 
                            ? "bg-brand-soft text-brand dark:bg-brand-soft dark:text-brand" 
                            : analytics.netBalance < -0.5 
                            ? "bg-red-500/10 text-red-600" 
                            : "bg-paper text-inksoft"
                        }`}>
                          {analytics.netBalance > 0.5 ? "SURPLUS POSITION" : analytics.netBalance < -0.5 ? "LIABILITY DEFICIT" : "FULLY BALANCED"}
                        </span>
                      </div>
                      <div className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight mt-1 ls-mono ${
                        analytics.netBalance > 0.5 ? "text-brand" : analytics.netBalance < -0.5 ? "text-red-600" : "text-ink"
                      }`}>
                        {analytics.netBalance >= 0 ? "+" : "-"} {rupee(analytics.netBalance)}
                      </div>
                    </div>

                    {/* Fast Quick Action Buttons */}
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center justify-center gap-2 bg-brand text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm hover:opacity-95 active:scale-95 transition"
                      >
                        <Plus size={14} /> New Ledger
                      </button>
                      <button
                        onClick={handleSeedDemo}
                        disabled={seeding}
                        className="inline-flex items-center justify-center gap-1.5 border border-line bg-paper/60 hover:bg-paper text-ink px-3.5 py-2 rounded-xl font-semibold text-xs transition disabled:opacity-50"
                        title="Seed sample Goa trip ledger"
                      >
                        {seeding ? "Seeding..." : "⚡ Seed Demo"}
                      </button>
                    </div>
                  </div>

                  {/* Liquidity Sub-Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* You Are Owed */}
                    <div className="border border-line rounded-2xl p-4 bg-paper/40 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-inksoft mb-1">
                        <span className="text-[10px] font-mono uppercase font-bold tracking-wider">YOU ARE OWED</span>
                        <span className="text-brand font-extrabold text-xs">↗</span>
                      </div>
                      <div className="text-xl font-extrabold font-mono text-brand ls-mono">
                        {rupee(analytics.youAreOwed)}
                      </div>
                      <span className="text-[9px] text-inksoft mt-1">Incoming group assets</span>
                    </div>

                    {/* You Owe */}
                    <div className="border border-line rounded-2xl p-4 bg-paper/40 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-inksoft mb-1">
                        <span className="text-[10px] font-mono uppercase font-bold tracking-wider">YOU OWE</span>
                        <span className="text-red-600 font-extrabold text-xs">↘</span>
                      </div>
                      <div className="text-xl font-extrabold font-mono text-red-600 ls-mono">
                        {rupee(analytics.youOwe)}
                      </div>
                      <span className="text-[9px] text-inksoft mt-1">Pending debt resolutions</span>
                    </div>

                    {/* Personal Total Spend */}
                    <div className="border border-line rounded-2xl p-4 bg-paper/40 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-inksoft mb-1">
                        <span className="text-[10px] font-mono uppercase font-bold tracking-wider">YOUR SPEND SHARE</span>
                        <span className="text-ink font-mono font-bold text-xs">₹</span>
                      </div>
                      <div className="text-xl font-extrabold font-mono text-ink ls-mono">
                        {rupee(analytics.totalExpenses)}
                      </div>
                      <span className="text-[9px] text-inksoft mt-1">Lifetime personal expenditure</span>
                    </div>
                  </div>

                  {/* Settlement Ratio Progress Bar */}
                  {(() => {
                    const totalLiabilities = (analytics.youAreOwed || 0) + (analytics.youOwe || 0);
                    const totalActivity = (analytics.totalExpenses || 0) + totalLiabilities;
                    const settlementPct = totalLiabilities === 0 ? 100 : Math.max(12, Math.min(94, Math.round(((analytics.totalExpenses || 1) / (totalActivity || 1)) * 100)));

                    return (
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-inksoft mb-1.5">
                          <span className="font-bold">GROUP SETTLEMENT HEALTH</span>
                          <span className="font-extrabold text-ink">{settlementPct}% RESOLVED</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-paper border border-line overflow-hidden">
                          <div 
                            style={{ width: `${settlementPct}%` }}
                            className="h-full bg-brand rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Secondary Metrics (Ledgers & Friends Count) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card border border-line rounded-2xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-inksoft font-bold">ACTIVE LEDGERS</span>
                      <div className="text-2xl font-extrabold font-mono text-ink mt-0.5">{analytics.totalGroups}</div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-paper flex items-center justify-center text-inksoft border border-line">
                      <BookOpen size={15} />
                    </div>
                  </div>

                  <div className="bg-card border border-line rounded-2xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-inksoft font-bold">GROUP CONNECTIONS</span>
                      <div className="text-2xl font-extrabold font-mono text-ink mt-0.5">{analytics.totalMembers}</div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-paper flex items-center justify-center text-inksoft border border-line">
                      <Users size={15} />
                    </div>
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
                    <div className="flex justify-between items-center mb-4 shrink-0">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-inksoft">Recent Activity</h3>
                      <select
                        value={activityUserFilter}
                        onChange={(e) => setActivityUserFilter(e.target.value)}
                        className="border border-line bg-card rounded-lg px-2 py-1 text-[10px] font-bold text-ink outline-none cursor-pointer"
                      >
                        <option value="All">All Members</option>
                        {uniqueActivityUsers.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-4 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                      {filteredActivities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-xs text-inksoft">
                          No matching activity logs.
                        </div>
                      ) : (
                        filteredActivities.map((act) => (
                          <div key={act._id} className="flex gap-2.5 text-[11px] leading-relaxed animate-fadeInUp">
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
                      {hasMoreActivities && (
                        <button
                          onClick={loadMoreActivities}
                          className="w-full py-2.5 mt-2 bg-paper hover:bg-paper/85 text-[10px] uppercase tracking-wider font-extrabold text-brand dark:text-brand-mint rounded-xl transition border border-line/45 text-center"
                        >
                          Load More Activities
                        </button>
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
                  {/* Visual Vector Illustration */}
                  <div className="w-48 h-32 mx-auto mb-6 flex items-center justify-center opacity-85">
                    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      {/* Grid background lines */}
                      <path d="M 20 80 L 100 80" stroke="var(--color-line)" strokeWidth="1" strokeDasharray="3 3"/>
                      <path d="M 20 50 L 100 50" stroke="var(--color-line)" strokeWidth="1" strokeDasharray="3 3"/>
                      
                      {/* Ledger Cards */}
                      <rect x="25" y="30" width="40" height="50" rx="8" fill="var(--color-brand-soft)" opacity="0.4" stroke="var(--color-brand)" strokeWidth="1.5"/>
                      <rect x="45" y="20" width="40" height="50" rx="8" fill="var(--color-card)" stroke="var(--color-line)" strokeWidth="1.5" className="shadow-md"/>
                      
                      {/* Notebook Binder rings */}
                      <circle cx="25" cy="40" r="2.5" fill="var(--color-inksoft)"/>
                      <circle cx="25" cy="55" r="2.5" fill="var(--color-inksoft)"/>
                      <circle cx="25" cy="70" r="2.5" fill="var(--color-inksoft)"/>
                      
                      {/* Inner card content lines */}
                      <rect x="53" y="32" width="24" height="3" rx="1.5" fill="var(--color-inksoft)" opacity="0.3"/>
                      <rect x="53" y="42" width="16" height="3" rx="1.5" fill="var(--color-inksoft)" opacity="0.3"/>
                      <rect x="53" y="52" width="20" height="3" rx="1.5" fill="var(--color-inksoft)" opacity="0.3"/>
                      
                      {/* Flying coins */}
                      <circle cx="85" cy="35" r="5" fill="var(--color-brand)" className="animate-bounce" style={{ animationDuration: '3s' }}/>
                      <circle cx="95" cy="55" r="3.5" fill="var(--color-brand-mint)"/>
                    </svg>
                  </div>
                  <h3 className="font-sans font-bold text-base text-ink mb-1.5">Start your first ledger</h3>
                  <p className="text-inksoft text-xs mb-6 max-w-xs mx-auto leading-relaxed">
                    A ledger tracks shared costs for one group of people — pick whatever fits your life.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                    <button
                      onClick={() => setShowCreate(true)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:opacity-90 active:scale-95 transition"
                    >
                      <Plus size={14} /> Create a Ledger
                    </button>
                    <button
                      onClick={handleSeedDemo}
                      disabled={seeding}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-brand/20 bg-brand-soft text-brand dark:bg-brand-soft/10 dark:text-brand-mint px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:opacity-90 active:scale-95 transition disabled:opacity-50"
                    >
                      {seeding ? "Seeding Demo..." : "💡 Seed Goa Trip Demo"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {groups.map((g) => {
                    const [gradient] = accentFor(g._id);
                    const bal = g.yourBalance || 0;
                    const isCredit = bal > 0.5;
                    const isDebt = bal < -0.5;
                    
                    return (
                      <button
                        key={g._id}
                        onClick={() => navigate(`/groups/${g._id}`)}
                        className="group text-left bg-card border border-line rounded-3xl p-5 sm:p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
                      >
                        {/* Top Monogram & Balance Status */}
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-brand text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform duration-200">
                              {g.name.charAt(0).toUpperCase()}
                            </div>
                            {(isCredit || isDebt) ? (
                              <span
                                className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-full ls-mono ${
                                  isCredit 
                                    ? "bg-brand-soft text-brand dark:bg-brand-soft dark:text-brand" 
                                    : "bg-red-500/10 text-red-600"
                                }`}
                              >
                                {isCredit ? "+" : "-"}
                                {rupee(bal)}
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono font-bold text-inksoft bg-paper px-2.5 py-1 rounded-full border border-line">
                                SETTLED UP
                              </span>
                            )}
                          </div>

                          {/* Ledger Name */}
                          <h3 className="font-sans font-bold text-base text-ink truncate mb-1 group-hover:text-brand transition">
                            {g.name}
                          </h3>
                          <span className="text-[10px] font-mono text-inksoft uppercase tracking-wider block">
                            PASSBOOK LEDGER
                          </span>
                        </div>

                        {/* Bottom Avatar Stack & Resolution Link */}
                        <div className="mt-5 pt-4 border-t border-line flex items-center justify-between">
                          {/* Avatar Stack */}
                          <div className="flex items-center -space-x-1.5 overflow-hidden">
                            {g.members.slice(0, 3).map((m, idx) => (
                              <div
                                key={idx}
                                className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-card shadow-sm"
                                title={typeof m === "object" ? m.name : m}
                              >
                                {typeof m === "object" && m.name ? m.name.charAt(0).toUpperCase() : "M"}
                              </div>
                            ))}
                            {g.members.length > 3 && (
                              <div className="w-6 h-6 rounded-full bg-paper text-inksoft flex items-center justify-center text-[9px] font-mono font-bold ring-2 ring-card border border-line">
                                +{g.members.length - 3}
                              </div>
                            )}
                          </div>

                          <span className="text-[11px] font-bold text-brand group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            <span>Open</span>
                            <span className="text-xs">→</span>
                          </span>
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
      aria-labelledby="create-ledger-title"
      className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4 animate-fadeIn backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-modal border border-line animate-scaleIn"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 id="create-ledger-title" className="font-sans font-bold text-lg text-ink">New Ledger</h3>
          <button onClick={onClose} aria-label="Close dialog" className="p-1 rounded-lg text-inksoft hover:text-ink hover:bg-paper transition">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-4 text-xs bg-red-50 dark:bg-red-950/20 border border-debt/30 text-debt rounded-lg px-3 py-2.5 animate-fadeIn">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-group-name" className="block text-[10px] uppercase font-bold tracking-wider text-inksoft mb-1">
              Group name
            </label>
            <input
              id="new-group-name"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-line bg-card rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition text-ink"
              placeholder="e.g. Trip to Manali"
            />
          </div>
          <div>
            <label htmlFor="new-group-emails" className="block text-[10px] uppercase font-bold tracking-wider text-inksoft mb-1">
              Invite by email (comma separated)
            </label>
            <input
              id="new-group-emails"
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