import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Plus,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  Search,
  Users,
  Archive,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children, onNewGroup }) {
  const [groups, setGroups] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("ledgersplit_theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: activeGroupId } = useParams();

  // Apply dark class to root document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("ledgersplit_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("ledgersplit_theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const fetchGroups = () => {
      api.get("/groups").then((res) => setGroups(res.data)).catch(() => {});
    };
    fetchGroups();
    
    window.addEventListener("groupCreated", fetchGroups);
    return () => {
      window.removeEventListener("groupCreated", fetchGroups);
    };
  }, [activeGroupId]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  function goTo(path) {
    navigate(path);
    setMobileOpen(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink transition-colors duration-200">
      {isOffline && (
        <div className="bg-red-500 text-white text-[10px] font-bold py-1.5 px-4 text-center tracking-wider uppercase animate-fadeIn shrink-0 flex items-center justify-center gap-1.5 z-[9999] shadow-md">
          <span>⚠️ You are offline. Changes will sync when connection returns.</span>
        </div>
      )}
      <div className="flex flex-1 relative w-full overflow-hidden">
      
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-16 bg-card/85 backdrop-blur-xl border-b border-line flex items-center justify-between px-4 transition-colors duration-200">
        <button
          onClick={() => goTo("/dashboard")}
          className="flex items-center gap-2.5"
          aria-label="Go to dashboard"
        >
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shrink-0 shadow-sm">
            <BookOpen size={15} className="text-white" />
          </div>
          <span className="font-sans text-base font-extrabold tracking-tight text-ink">LedgerSplit</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl text-inksoft hover:text-ink hover:bg-paper transition duration-150"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={17} className="text-amber-400 transition-transform duration-200" /> : <Moon size={17} className="transition-transform duration-200" />}
          </button>
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="p-2 rounded-xl text-inksoft hover:text-ink hover:bg-paper transition"
          >
            <Menu size={19} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-ink/50 z-40 animate-fadeIn backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`w-64 shrink-0 bg-card border-r border-line flex flex-col fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:h-screen lg:sticky lg:top-0
          ${mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}
      >
        {/* Brand / Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-line">
          <button
            onClick={() => goTo("/dashboard")}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
              <BookOpen size={16} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-base font-extrabold tracking-tight text-ink leading-none">
                LedgerSplit
              </span>
              <span className="text-[9px] font-mono tracking-widest uppercase text-brand mt-0.5 font-bold">
                Private Ledger
              </span>
            </div>
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="lg:hidden p-1.5 rounded-lg text-inksoft hover:text-ink hover:bg-paper transition"
          >
            <X size={17} />
          </button>
        </div>

        {/* Sidebar Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Main Menu */}
          <nav className="space-y-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-inksoft/70 font-bold px-3 mb-1.5 block">
              WORKSPACE
            </span>
            <button
              onClick={() => goTo("/dashboard")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                location.pathname === "/dashboard"
                  ? "bg-brand-soft text-brand dark:bg-brand-soft dark:text-brand shadow-sm font-bold"
                  : "text-inksoft hover:bg-paper hover:text-ink"
              }`}
            >
              <LayoutDashboard size={15} />
              <span>Dashboard</span>
            </button>
          </nav>

          {/* Ledgers List Section */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-inksoft/70 font-bold">
                YOUR LEDGERS
              </span>
              {onNewGroup && (
                <button
                  onClick={() => {
                    onNewGroup();
                    setMobileOpen(false);
                  }}
                  className="p-1 rounded-md text-inksoft hover:text-brand hover:bg-brand-soft/50 dark:hover:bg-brand-soft/20 transition"
                  title="Create new ledger"
                >
                  <Plus size={13} />
                </button>
              )}
            </div>

            <div className="space-y-1 mb-4">
              {groups.filter(g => !g.isArchived).map((g) => {
                const isGroupActive = g._id === activeGroupId;
                return (
                  <button
                    key={g._id}
                    onClick={() => goTo(`/groups/${g._id}`)}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs font-medium transition-all text-left ${
                      isGroupActive
                        ? "bg-brand-soft text-brand font-bold shadow-sm dark:bg-brand-soft dark:text-brand"
                        : "text-inksoft hover:bg-paper hover:text-ink"
                    }`}
                  >
                    <span className="truncate flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isGroupActive ? "bg-brand" : "bg-line"}`} />
                      <span className="truncate">{g.name}</span>
                    </span>
                    {isGroupActive && <ChevronRight size={12} className="shrink-0 text-brand" />}
                  </button>
                );
              })}
              {groups.filter(g => !g.isArchived).length === 0 && (
                <p className="text-[11px] text-inksoft/60 px-3 py-1.5 italic">
                  No active ledgers yet.
                </p>
              )}
            </div>

            {/* Collapsible Archived Ledgers */}
            {groups.filter(g => g.isArchived).length > 0 && (
              <div className="mt-5 border-t border-line pt-3">
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className="w-full flex items-center justify-between px-3 text-[9px] font-mono uppercase tracking-widest text-inksoft font-bold hover:text-ink transition"
                >
                  <span>Archived ({groups.filter(g => g.isArchived).length})</span>
                  {showArchived ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {showArchived && (
                  <div className="space-y-1 mt-2 animate-fadeIn pl-1">
                    {groups.filter(g => g.isArchived).map((g) => {
                      const isGroupActive = g._id === activeGroupId;
                      return (
                        <button
                          key={g._id}
                          onClick={() => goTo(`/groups/${g._id}`)}
                          className={`w-full flex items-center justify-between py-1.5 px-3 rounded-xl text-xs font-medium transition-colors text-left opacity-60 hover:opacity-100 ${
                            isGroupActive
                              ? "bg-brand-soft text-brand font-semibold dark:bg-brand-soft dark:text-brand"
                              : "text-inksoft hover:bg-paper hover:text-ink"
                          }`}
                        >
                          <span className="truncate flex items-center gap-2">
                            <Archive size={12} className="shrink-0 text-inksoft" />
                            <span className="truncate">{g.name}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer User Details */}
        <div className="p-4 border-t border-line flex flex-col gap-3 bg-paper/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
              {(user?.name || "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-ink truncate">{user?.name}</div>
              <div className="text-[10px] font-mono text-inksoft truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold text-inksoft hover:text-red-600 hover:bg-red-500/5 transition border border-line"
          >
            <LogOut size={12} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        
        {/* Header (Desktop Floating Glass Bar) */}
        <header className="h-16 shrink-0 bg-card/85 backdrop-blur-xl border-b border-line flex items-center justify-between px-6 lg:px-8 transition-colors duration-200 relative z-10">
          {/* Search bar */}
          <div className="relative w-full max-w-sm hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-inksoft" size={14} />
            <input
              type="text"
              placeholder="Quick search ledgers & expenses..."
              className="w-full pl-9 pr-12 py-1.5 rounded-xl border border-line bg-paper/40 outline-none text-xs text-ink transition focus:border-brand focus:ring-1 focus:ring-brand/10 dark:bg-paper/10"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono border border-line px-1.5 py-0.5 rounded bg-card text-inksoft pointer-events-none">
              ⌘K
            </kbd>
          </div>
          <div className="sm:hidden w-8" /> {/* spacing element */}

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl text-inksoft hover:text-ink hover:bg-paper transition border border-transparent hover:border-line"
              aria-label="Toggle theme"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun size={16} className="text-amber-400 hover:rotate-45 transition-transform duration-200" />
              ) : (
                <Moon size={16} className="hover:-rotate-12 transition-transform duration-200" />
              )}
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                className="p-2 rounded-xl text-inksoft hover:text-ink hover:bg-paper transition border border-transparent hover:border-line"
                aria-label="Notifications"
              >
                <Bell size={16} />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-brand"></span>
              </button>
            </div>

            {/* Divider */}
            <span className="h-4 w-px bg-line"></span>

            {/* User details pill */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center font-bold text-[11px] shadow-sm">
                {(user?.name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold leading-tight text-ink">{user?.name}</div>
                <div className="text-[9px] font-mono text-inksoft leading-none">{user?.email}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
          {children}
        </div>
        </div>
      </div>
    </div>
  );
}