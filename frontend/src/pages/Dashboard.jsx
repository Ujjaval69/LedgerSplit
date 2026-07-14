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
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  function refresh() {
    api
      .get("/groups")
      .then((res) => setGroups(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  const totalProjects = groups.length;
  const endedProjects = groups.filter((g) => Math.abs(g.yourBalance || 0) < 1).length;
  const runningProjects = groups.filter((g) => Math.abs(g.yourBalance || 0) >= 1).length;
  const pendingProjects = groups.filter((g) => (g.yourBalance || 0) < -1).length;

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
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-card border border-line animate-pulse" />
              ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-36 rounded-2xl bg-card border border-line animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            {/* Summary Statistics Cards (as per layout image) */}
            {groups.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Projects (Card 1: Forest Green) */}
                <div className="bg-brand text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between h-36 relative overflow-hidden transition-all hover:translate-y-[-2px]">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">Total Ledgers</span>
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white">
                      <span className="text-sm font-sans font-bold">↗</span>
                    </div>
                  </div>
                  <div className="text-4xl font-extrabold tracking-tight">{totalProjects}</div>
                  <span className="text-[10px] font-semibold text-white/70 block">Active split groups</span>
                </div>

                {/* Ended Projects (Card 2: White) */}
                <div className="bg-card border border-line text-ink rounded-2xl p-5 shadow-sm flex flex-col justify-between h-36 transition-all hover:translate-y-[-2px] hover:shadow-card-hover">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-inksoft">Ended Ledgers</span>
                    <div className="w-7 h-7 rounded-full bg-paper dark:bg-paper/10 flex items-center justify-center text-ink">
                      <span className="text-sm font-sans font-bold">↗</span>
                    </div>
                  </div>
                  <div className="text-4xl font-extrabold tracking-tight text-ink">{endedProjects}</div>
                  <span className="text-[10px] font-semibold text-brand block">All settled up</span>
                </div>

                {/* Running Projects (Card 3: White) */}
                <div className="bg-card border border-line text-ink rounded-2xl p-5 shadow-sm flex flex-col justify-between h-36 transition-all hover:translate-y-[-2px] hover:shadow-card-hover">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-inksoft">Running Ledgers</span>
                    <div className="w-7 h-7 rounded-full bg-paper dark:bg-paper/10 flex items-center justify-center text-ink">
                      <span className="text-sm font-sans font-bold">↗</span>
                    </div>
                  </div>
                  <div className="text-4xl font-extrabold tracking-tight text-ink">{runningProjects}</div>
                  <span className="text-[10px] font-semibold text-brand block">Active calculations</span>
                </div>

                {/* Pending Projects (Card 4: White) */}
                <div className="bg-card border border-line text-ink rounded-2xl p-5 shadow-sm flex flex-col justify-between h-36 transition-all hover:translate-y-[-2px] hover:shadow-card-hover">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-inksoft">Pending Ledgers</span>
                    <div className="w-7 h-7 rounded-full bg-paper dark:bg-paper/10 flex items-center justify-center text-ink">
                      <span className="text-sm font-sans font-bold">↗</span>
                    </div>
                  </div>
                  <div className="text-4xl font-extrabold tracking-tight text-ink">{pendingProjects}</div>
                  <span className="text-[10px] font-semibold text-red-500 block">Balances to settle</span>
                </div>
              </div>
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
      await api.post("/groups", { name, memberEmails });
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
              className="w-full border border-line bg-paper/20 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition dark:bg-paper/5"
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
              className="w-full border border-line bg-paper/20 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition dark:bg-paper/5"
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