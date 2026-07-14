import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, X, BookOpen, TrendingUp, TrendingDown, Scale } from "lucide-react";
import api from "../api/client";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const ACCENT_PAIRS = [
  ["#C79A3A", "#93691A"], // gold
  ["#2A7A50", "#1B4E33"], // emerald
  ["#B8472E", "#82301C"], // rust
  ["#3E6FA8", "#294B76"], // steel blue
  ["#8A5AAE", "#5B3B76"], // plum
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
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  const totalOwed = groups.reduce((sum, g) => sum + Math.max(g.yourBalance || 0, 0), 0);
  const totalOwe = groups.reduce((sum, g) => sum + Math.max(-(g.yourBalance || 0), 0), 0);
  const net = totalOwed - totalOwe;

  return (
    <Layout onNewGroup={() => setShowCreate(true)}>
      <main
        className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-10 min-h-screen"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent, transparent 39px, rgba(28,43,34,0.035) 39px, rgba(28,43,34,0.035) 40px)",
        }}
      >
        <div className="mb-6 sm:mb-8 animate-fadeInUp">
          <div className="text-xs uppercase tracking-wider text-inksoft font-semibold mb-1">
            Ledger Book
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            {greeting()}, {user?.name?.split(" ")[0]}
          </h1>
        </div>

        {!loading && groups.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <StatCard
              icon={<TrendingUp size={16} />}
              label="You're owed"
              value={rupee(totalOwed)}
              tone="credit"
              delay={0}
            />
            <StatCard
              icon={<TrendingDown size={16} />}
              label="You owe"
              value={rupee(totalOwe)}
              tone="debt"
              delay={60}
            />
            <StatCard
              icon={<Scale size={16} />}
              label="Net position"
              value={(net >= 0 ? "+" : "-") + rupee(net)}
              tone={net >= 0 ? "credit" : "debt"}
              delay={120}
            />
          </div>
        )}

        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 animate-fadeInUp"
          style={{ animationDelay: "160ms" }}
        >
          <h2 className="font-display text-lg font-semibold text-inksoft">Your Ledgers</h2>
          <button
            onClick={() => setShowCreate(true)}
            style={{ backgroundImage: "linear-gradient(135deg, #C79A3A, #93691A)" }}
            className="flex items-center justify-center gap-2 text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <Plus size={16} /> New Group
          </button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-card/60 border border-line animate-pulse" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="border-2 border-dashed border-line rounded-xl p-8 sm:p-14 text-center animate-fadeIn bg-card/40">
            <div
              className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm"
              style={{ backgroundImage: "linear-gradient(135deg, #C79A3A, #93691A)" }}
            >
              <BookOpen size={24} className="text-white" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Start your first ledger</h3>
            <p className="text-inksoft text-sm mb-6 max-w-sm mx-auto">
              A ledger tracks shared costs for one group of people — pick whatever fits your life.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-7">
              {["Hostel room", "Trip with friends", "Flatmates", "Study group snacks"].map((ex) => (
                <span
                  key={ex}
                  className="text-xs font-medium text-inksoft bg-paper border border-line rounded-full px-3 py-1.5"
                >
                  {ex}
                </span>
              ))}
            </div>
            <button
              onClick={() => setShowCreate(true)}
              style={{ backgroundImage: "linear-gradient(135deg, #2A3A2C, #182419)" }}
              className="inline-flex items-center gap-2 text-paper px-5 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <Plus size={15} /> Create your first ledger
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g, i) => {
              const [c1, c2] = accentFor(g._id);
              const bal = g.yourBalance || 0;
              const isCredit = bal > 0.5;
              const isDebt = bal < -0.5;
              return (
                <button
                  key={g._id}
                  onClick={() => navigate(`/groups/${g._id}`)}
                  style={{ animationDelay: `${200 + i * 40}ms` }}
                  className="group text-left bg-card border border-line rounded-xl p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 animate-fadeInUp"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      style={{ backgroundImage: `linear-gradient(135deg, ${c1}, ${c2})` }}
                      className="w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
                    >
                      {g.name.charAt(0).toUpperCase()}
                    </div>
                    {(isCredit || isDebt) && (
                      <span
                        className={`text-xs font-mono font-semibold px-2 py-1 rounded-md ${
                          isCredit ? "bg-credit/10 text-credit" : "bg-debt/10 text-debt"
                        }`}
                      >
                        {isCredit ? "+" : "-"}
                        {rupee(bal)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-semibold text-base mb-1.5">{g.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-inksoft">
                    <Users size={13} /> {g.members.length} member{g.members.length !== 1 ? "s" : ""}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

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

function StatCard({ icon, label, value, tone, delay }) {
  const gradient =
    tone === "credit" ? "linear-gradient(135deg, #2A7A50, #1B4E33)" : "linear-gradient(135deg, #B8472E, #82301C)";
  const textTone = tone === "credit" ? "text-credit" : "text-debt";
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="relative bg-card border border-line rounded-xl p-5 shadow-card animate-fadeInUp overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundImage: gradient }} />
      <div
        style={{ backgroundImage: gradient }}
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 text-white shadow-sm"
      >
        {icon}
      </div>
      <div className="text-xs text-inksoft font-semibold mb-1">{label}</div>
      <div className={`font-mono text-2xl font-bold ${textTone}`}>{value}</div>
    </div>
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
        className="bg-card rounded-xl p-6 w-full max-w-sm shadow-modal animate-scaleIn"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display font-semibold text-lg">New Ledger</h3>
          <button onClick={onClose} aria-label="Close dialog" className="text-inksoft hover:text-ink transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-credit rounded">
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
            <label className="block text-xs font-semibold text-inksoft mb-1">Group name</label>
            <input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-credit focus:ring-2 focus:ring-credit/15 transition-shadow"
              placeholder="Hostel Room 204"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-inksoft mb-1">
              Invite by email (comma separated, must already have an account)
            </label>
            <input
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-credit focus:ring-2 focus:ring-credit/15 transition-shadow"
              placeholder="priya@mail.com, rohan@mail.com"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-ink text-paper py-2.5 rounded-md font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition"
          >
            {saving ? "Creating..." : "Create Ledger"}
          </button>
        </form>
      </div>
    </div>
  );
}