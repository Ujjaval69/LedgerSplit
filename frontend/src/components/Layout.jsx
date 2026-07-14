import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, Users, LogOut, ChevronRight, Plus, Menu, X } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children, onNewGroup }) {
  const [groups, setGroups] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id: activeGroupId } = useParams();

  useEffect(() => {
    api.get("/groups").then((res) => setGroups(res.data));
  }, [activeGroupId]);

  useEffect(() => {
    setMobileOpen(false);
  }, [activeGroupId]);

  function goTo(path) {
    navigate(path);
    setMobileOpen(false);
  }

  return (
    <div className="min-h-screen flex bg-paper">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-ink text-paper flex items-center justify-between px-4">
        <button
          onClick={() => goTo("/dashboard")}
          className="flex items-center gap-2"
          aria-label="Go to dashboard"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundImage: "linear-gradient(135deg, #C79A3A, #93691A)" }}
          >
            <BookOpen size={14} className="text-white" />
          </div>
          <span className="font-display text-base font-bold">LedgerSplit</span>
        </button>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="p-1.5 rounded-md hover:bg-white/10 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
        >
          <Menu size={20} />
        </button>
      </div>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-fadeIn"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-64 shrink-0 bg-ink text-paper flex flex-col relative overflow-hidden
          fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-out
          lg:static lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div
          className="absolute -top-16 -left-16 w-56 h-56 rounded-full opacity-20 pointer-events-none blur-3xl"
          style={{ backgroundImage: "radial-gradient(circle, #C79A3A, transparent 70%)" }}
        />

        <div className="relative flex items-center justify-between px-5 py-5">
          <button
            onClick={() => goTo("/dashboard")}
            className="flex items-center gap-2.5 text-left hover:opacity-90 transition"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundImage: "linear-gradient(135deg, #C79A3A, #93691A)" }}
            >
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-wide">LedgerSplit</span>
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="lg:hidden p-1 text-paper/60 hover:text-paper transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold rounded"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative px-3 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-3 pb-2">
            <span className="text-[11px] uppercase tracking-wider text-paper/50 font-semibold">
              Your Ledgers
            </span>
            {onNewGroup && (
              <button
                onClick={() => {
                  onNewGroup();
                  setMobileOpen(false);
                }}
                className="text-paper/60 hover:text-gold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold rounded"
                aria-label="Create new group"
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
                onClick={() => goTo(`/groups/${g._id}`)}
                aria-current={isActive ? "page" : undefined}
                className={`relative w-full flex items-center justify-between gap-2 pl-3.5 pr-3 py-2.5 rounded-md mb-1 text-sm transition-all duration-150 overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
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
          <button
            onClick={logout}
            aria-label="Log out"
            className="text-paper/50 hover:text-debt transition shrink-0 ml-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold rounded"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 pt-14 lg:pt-0">{children}</div>
    </div>
  );
}