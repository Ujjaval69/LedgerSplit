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
  Users
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children, onNewGroup }) {
  const [groups, setGroups] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
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
    <div className="min-h-screen flex bg-paper text-ink transition-colors duration-200">
      
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-16 bg-card border-b border-line flex items-center justify-between px-4 transition-colors duration-200">
        <button
          onClick={() => goTo("/dashboard")}
          className="flex items-center gap-2.5"
          aria-label="Go to dashboard"
        >
          <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shrink-0 shadow-sm">
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="font-sans text-lg font-bold tracking-tight">LedgerSplit</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg text-inksoft hover:text-ink hover:bg-paper transition"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="p-2 rounded-lg text-inksoft hover:text-ink hover:bg-paper transition"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 animate-fadeIn backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`w-64 shrink-0 bg-card border-r border-line flex flex-col fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:h-screen lg:sticky lg:top-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Brand / Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-line">
          <button
            onClick={() => goTo("/dashboard")}
            className="flex items-center gap-3 text-left hover:opacity-85 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shrink-0 shadow-md shadow-brand/10">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="font-sans text-xl font-bold tracking-tight bg-gradient-to-r from-ink to-brand bg-clip-text text-transparent">
              LedgerSplit
            </span>
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="lg:hidden p-1.5 rounded-lg text-inksoft hover:text-ink hover:bg-paper transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Main Menu */}
          <nav className="space-y-1">
            <button
              onClick={() => goTo("/dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                location.pathname === "/dashboard"
                  ? "bg-brand-soft text-brand dark:bg-brand-soft/20 dark:text-brand-mint"
                  : "text-inksoft hover:bg-paper hover:text-ink"
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </button>
          </nav>

          {/* Ledgers List Section */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] uppercase tracking-wider text-inksoft font-bold">
                Your Ledgers
              </span>
              {onNewGroup && (
                <button
                  onClick={() => {
                    onNewGroup();
                    setMobileOpen(false);
                  }}
                  className="p-1 rounded-md text-inksoft hover:text-brand hover:bg-brand-soft/30 dark:hover:bg-brand-soft/10 transition"
                  title="Create new ledger"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>

            <div className="space-y-1">
              {groups.map((g) => {
                const isGroupActive = g._id === activeGroupId;
                return (
                  <button
                    key={g._id}
                    onClick={() => goTo(`/groups/${g._id}`)}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs font-medium transition-colors text-left ${
                      isGroupActive
                        ? "bg-brand-soft text-brand font-semibold dark:bg-brand-soft/20 dark:text-brand-mint"
                        : "text-inksoft hover:bg-paper hover:text-ink"
                    }`}
                  >
                    <span className="truncate flex items-center gap-2">
                      <Users size={12} className="shrink-0 text-inksoft" />
                      <span className="truncate">{g.name}</span>
                    </span>
                    {isGroupActive && <ChevronRight size={10} className="shrink-0" />}
                  </button>
                );
              })}
              {groups.length === 0 && (
                <p className="text-[11px] text-inksoft/60 px-3 py-1.5 italic">
                  No active ledgers yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer User Details */}
        <div className="p-4 border-t border-line flex flex-col gap-3 bg-paper/20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-brand-mint flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
              {(user?.name || "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-ink truncate">{user?.name}</div>
              <div className="text-[10px] text-inksoft truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/5 dark:hover:bg-red-500/10 transition border border-red-500/10"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="h-16 shrink-0 bg-card border-b border-line flex items-center justify-between px-6 lg:px-8 transition-colors duration-200 relative z-10">
          {/* Search bar */}
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-inksoft" size={16} />
            <input
              type="text"
              placeholder="Search groups, expenses..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-line bg-paper/30 outline-none text-sm transition focus:border-brand focus:ring-1 focus:ring-brand/10 dark:bg-paper/5"
            />
          </div>
          <div className="sm:hidden w-8" /> {/* spacing element */}

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl text-inksoft hover:text-ink hover:bg-paper transition"
              aria-label="Toggle theme"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                className="p-2 rounded-xl text-inksoft hover:text-ink hover:bg-paper transition"
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand"></span>
              </button>
            </div>

            {/* Divider */}
            <span className="h-5 w-px bg-line"></span>

            {/* User details */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-soft text-brand dark:bg-brand-soft/20 dark:text-brand-mint flex items-center justify-center font-bold text-xs">
                {(user?.name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold leading-tight">{user?.name}</div>
                <div className="text-[9px] text-inksoft leading-none">{user?.email}</div>
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
  );
}