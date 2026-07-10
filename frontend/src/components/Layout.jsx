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
      <aside className="w-64 shrink-0 bg-ink text-paper flex flex-col">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-5 py-5 text-left hover:opacity-90 transition"
        >
          <BookOpen size={20} className="text-gold shrink-0" />
          <span className="font-display text-lg font-bold tracking-wide">LedgerSplit</span>
        </button>

        <div className="px-3 flex-1 overflow-y-auto">
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
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-md mb-1 text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-paper text-ink font-semibold shadow-card"
                    : "text-paper/70 hover:bg-white/5 hover:text-paper"
                }`}
              >
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

        <div className="px-5 py-4 border-t border-white/10 flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{user?.name}</div>
            <div className="text-xs text-paper/50 truncate">{user?.email}</div>
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
