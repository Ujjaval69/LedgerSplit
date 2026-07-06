import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Plus, Users, LogOut, X } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/groups")
      .then((res) => setGroups(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-gold" />
            <span className="font-display text-lg font-bold">LedgerSplit</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-inksoft">{user?.name}</span>
            <button onClick={logout} className="text-inksoft hover:text-debt">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">Your Ledgers</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-gold text-white px-4 py-2 rounded-md font-semibold text-sm"
          >
            <Plus size={16} /> New Group
          </button>
        </div>

        {loading ? (
          <p className="text-inksoft text-sm">Loading your ledgers...</p>
        ) : groups.length === 0 ? (
          <div className="border border-dashed border-line rounded-lg p-12 text-center text-inksoft">
            No ledgers yet. Create one for your hostel room, a trip, or anything you split costs for.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g) => (
              <button
                key={g._id}
                onClick={() => navigate(`/groups/${g._id}`)}
                className="text-left bg-card border border-line rounded-lg p-5 hover:border-credit transition"
              >
                <h3 className="font-display font-semibold text-base mb-2">{g.name}</h3>
                <div className="flex items-center gap-1 text-xs text-inksoft">
                  <Users size={13} /> {g.members.length} members
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreated={(g) => {
            setGroups((prev) => [g, ...prev]);
            setShowCreate(false);
          }}
        />
      )}
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
      const res = await api.post("/groups", { name, memberEmails });
      onCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create group");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-lg p-6 w-full max-w-sm"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display font-semibold text-lg">New Ledger</h3>
          <button onClick={onClose}>
            <X size={18} className="text-inksoft" />
          </button>
        </div>

        {error && <div className="mb-4 text-sm bg-red-50 text-debt rounded-md px-3 py-2">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-inksoft mb-1">Group name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-credit"
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
              className="w-full border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-credit"
              placeholder="priya@mail.com, rohan@mail.com"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-ink text-paper py-2.5 rounded-md font-semibold text-sm disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Ledger"}
          </button>
        </form>
      </div>
    </div>
  );
}
