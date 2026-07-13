import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, Users, LogOut, ChevronRight, Plus } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

/**
 * Shared shell: dark "book spine" sidebar (group switcher) + light paper
 * content area. Keeping this in one place means Dashboard and GroupDetail
 * always look consistent, and the sidebar's group list refreshes itself
 * independently of whatever page is active.
 */
export default function Layout({ children, onNewGroup }) {
  const [groups, setGroups] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id: activeGroupId } = useParams();

  useEffect(() => {
    api.get("/groups").then((res) => setGroups(res.data));
  }, [activeGroupId]);

  return (
    <div className="min-h-screen flex bg-paper">
      {/* Spine */}
      <aside className="w-64 shrink-0 bg-ink text-paper flex flex-col relative overflow-hidden">
        {/* subtle warm glow behind the logo for depth, not a flat dark panel */}
        <div
          className="absolute -top-16 -left-16 w-56 h-56 rounded-full opacity-20 pointer-events-none blur-3xl"
          style={{ backgroundImage: "radial-gradient(circle, #C79A3A, transparent 70%)" }}
        />

        <button
          onClick={() => navigate("/dashboard")}
          className="relative flex items-center gap-2.5 px-5 py-5 text-left hover:opacity-90 transition"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
            style={{ backgroundImage: "linear-gradient(135deg, #C79A3A, #93691A)" }}
          >
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="font-display text-lg font-bold tracking-wide">LedgerSplit</span>
        </button>

        <div className="relative px-3 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-3 pb-2">
            <span className="text-[11px] uppercase tracking-wider text-paper/50 font-semibold">
              Your Ledgers
            </span>
            {onNewGroup && (
              <button
                onClick={onNewGroup}
                className="text-paper/60 hover:text-gold transition"
                title="New group"
              >
                <Plus size={14} />
              </button>
            )}
          </div>

          {groups.map((g) => {
            const isActive = g._id === activeGroupId;
            return (
              <button
                key={g._id}
                onClick={() => navigate(`/groups/${g._id}`)}
                className={`relative w-full flex items-center justify-between gap-2 pl-3.5 pr-3 py-2.5 rounded-md mb-1 text-sm transition-all duration-150 overflow-hidden ${
                  isActive
                    ? "bg-paper text-ink font-semibold shadow-card"
                    : "text-paper/70 hover:bg-white/5 hover:text-paper"
                }`}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ backgroundImage: "linear-gradient(to bottom, #C79A3A, #93691A)" }}
                  />
                )}
                <span className="flex items-center gap-2 truncate">
                  <Users size={13} className="shrink-0" />
                  <span className="truncate">{g.name}</span>
                </span>
                {isActive && <ChevronRight size={13} className="shrink-0" />}
              </button>
            );
          })}

          {groups.length === 0 && (
            <p className="text-xs text-paper/40 px-3 py-2">No ledgers yet.</p>
          )}
        </div>

        <div className="relative px-5 py-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-sm"
              style={{ backgroundImage: "linear-gradient(135deg, #4A7FC0, #2A4E7A)" }}
            >
              {(user?.name || "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{user?.name}</div>
              <div className="text-xs text-paper/50 truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} className="text-paper/50 hover:text-debt transition shrink-0 ml-2" title="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}