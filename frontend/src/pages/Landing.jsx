import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Plus, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  ArrowRight, 
  CheckCircle, 
  Lock, 
  Zap, 
  FileSpreadsheet, 
  Paperclip, 
  Globe, 
  ChevronDown, 
  Github, 
  Menu, 
  X,
  Sparkles,
  Sun,
  Moon
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("ledgersplit_theme");
    return saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("ledgersplit_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("ledgersplit_theme", "light");
    }
  }, [isDark]);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "How does the bill simplification algorithm work?",
      a: "Our algorithm automatically analyzes the balances within a group (who paid what and who owes what) and calculates the minimum possible transactions needed to settle everyone up. For example, if Priya owes Rohan ₹500, and Rohan owes Amit ₹500, we simplify this so Priya pays Amit ₹500 directly, bypassing Rohan completely."
    },
    {
      q: "Can I upload my transactions from split sheets?",
      a: "Yes! Our premium CSV Expense Import lets you drop standard transaction spreadsheets directly into any ledger. It automatically parses columns for description, amount, category, date, and members to create bulk logs instantly."
    },
    {
      q: "Is my ledger data safe and private?",
      a: "Absolutely. We protect all ledger traffic with end-to-end SSL encryption. Session states are guarded using secure HTTP-only cookies and automatic JWT expiry handlers to ensure you are never exposed."
    },
    {
      q: "Does the application support offline usage?",
      a: "Yes, LedgerSplit includes built-in offline status detection. If your internet connection drops while you are calculating shares, a sticky alert notifies you immediately so no actions are lost."
    }
  ];

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-brand/10 selection:text-brand transition-colors duration-200">
      
      {/* Dynamic Hero Glow Layer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-brand/5 via-transparent to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-paper/85 backdrop-blur-md border-b border-line transition-all duration-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
              <Scale size={18} className="rotate-12 group-hover:rotate-0 transition-transform duration-200" />
            </div>
            <span className="font-sans font-extrabold text-lg tracking-tight text-ink">
              Ledger<span className="text-brand-mint">Split</span>
            </span>
          </Link>

          {/* Nav Anchor Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs font-bold text-inksoft hover:text-ink transition-colors">Features</a>
            <a href="#simplification" className="text-xs font-bold text-inksoft hover:text-ink transition-colors">Simplifier</a>
            <a href="#security" className="text-xs font-bold text-inksoft hover:text-ink transition-colors">Security</a>
            <a href="#faq" className="text-xs font-bold text-inksoft hover:text-ink transition-colors">FAQs</a>
          </div>

          {/* Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 rounded-xl text-inksoft hover:text-ink hover:bg-paper/40 transition duration-200"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="inline-flex items-center justify-center bg-brand text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm hover:opacity-90 active:scale-95 transition-all"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="inline-flex items-center justify-center border border-line bg-card hover:bg-paper text-inksoft hover:text-ink px-4 py-2 rounded-xl font-bold text-xs transition"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-xs font-bold text-inksoft hover:text-ink px-3 py-2 transition"
                >
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  className="inline-flex items-center justify-center bg-brand text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm hover:opacity-90 active:scale-95 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-inksoft hover:text-ink p-1 rounded-lg transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-card border-b border-line px-6 py-5 space-y-4 animate-fadeIn">
            <div className="flex flex-col gap-3.5">
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-inksoft hover:text-ink"
              >
                Features
              </a>
              <a 
                href="#simplification" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-inksoft hover:text-ink"
              >
                Simplifier
              </a>
              <a 
                href="#security" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-inksoft hover:text-ink"
              >
                Security
              </a>
              <a 
                href="#faq" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-inksoft hover:text-ink"
              >
                FAQs
              </a>
            </div>
            
            <div className="flex items-center justify-between border-t border-line/60 pt-4 px-1">
              <span className="text-xs font-bold text-inksoft">Theme mode</span>
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2.5 rounded-xl border border-line bg-paper text-inksoft hover:text-ink transition flex items-center gap-1.5"
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
                <span className="text-[10px] font-bold uppercase tracking-wider">{isDark ? "Light" : "Dark"}</span>
              </button>
            </div>
            
            <div className="border-t border-line/60 pt-4 flex flex-col gap-3">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full bg-brand text-white py-2.5 rounded-xl font-bold text-xs text-center shadow-sm"
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate("/");
                    }}
                    className="w-full border border-line bg-paper text-inksoft py-2.5 rounded-xl font-bold text-xs text-center"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full border border-line bg-paper text-ink py-2.5 rounded-xl font-bold text-xs text-center"
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full bg-brand text-white py-2.5 rounded-xl font-bold text-xs text-center shadow-sm"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center space-y-8">
        
        {/* Banner Pill */}
        <div className="inline-flex items-center gap-1.5 bg-brand-soft dark:bg-brand-soft/20 text-brand dark:text-brand-mint text-[11px] font-bold px-3 py-1.5 rounded-full border border-brand/10 dark:border-brand-mint/20 animate-fadeInUp">
          <Sparkles size={12} />
          <span>Automated expense tracking with visual simplify charts</span>
        </div>

        {/* Hero Typography */}
        <div className="max-w-3xl mx-auto space-y-5">
          <h1 className="font-sans text-4xl sm:text-6xl font-extrabold tracking-tight text-ink leading-[1.1] animate-fadeInUp">
            Split bills, <span className="text-brand">not friendships.</span>
          </h1>
          <p className="text-sm sm:text-base text-inksoft font-medium leading-relaxed max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: "100ms" }}>
            LedgerSplit simplifies group expenses, records split shares in real-time, and reduces transaction webs to simplified settlement payment paths.
          </p>
        </div>

        {/* Hero CTA Controls */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 max-w-md mx-auto animate-fadeInUp" style={{ animationDelay: "150ms" }}>
          {user ? (
            <Link 
              to="/dashboard" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:opacity-95 active:scale-98 transition-all"
            >
              Go to Dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link 
                to="/register" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:opacity-95 active:scale-98 transition-all"
              >
                Sign Up for Free <ArrowRight size={16} />
              </Link>
              <Link 
                to="/login" 
                className="w-full sm:w-auto inline-flex items-center justify-center border border-line bg-card hover:bg-paper text-ink px-6 py-3 rounded-xl font-bold text-sm transition"
              >
                Log In
              </Link>
            </>
          )}
        </div>

        {/* Visual Interactive IOU Showcase */}
        <div className="max-w-4xl mx-auto pt-8 animate-fadeInUp" style={{ animationDelay: "200ms" }}>
          <div className="bg-card border border-line rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
            
            {/* Left Side: Mock simplified ledger info */}
            <div className="flex-1 text-left space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand">Real-Time simplification</span>
              <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">Reduce 3 transactions to just 1 direct payment.</h2>
              <p className="text-xs text-inksoft leading-relaxed">
                Our visual flowchart mapping reduces transaction overlapping webs to save everyone transfer fees and time.
              </p>
              
              <div className="space-y-2 border-t border-line/60 pt-4">
                <div className="flex items-center gap-2 text-xs text-ink">
                  <CheckCircle size={14} className="text-brand-mint shrink-0" />
                  <span>Simplify active balances instantly.</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-ink">
                  <CheckCircle size={14} className="text-brand-mint shrink-0" />
                  <span>Interactive node colors generated dynamically.</span>
                </div>
              </div>
            </div>

            {/* Right Side: Graph SVG Showcase */}
            <div className="w-full md:w-80 h-72 border border-line rounded-2xl bg-paper/50 flex items-center justify-center overflow-hidden shrink-0 relative">
              <svg width="280" height="280" className="overflow-visible">
                {/* Curve Connectors */}
                <path 
                  d="M 140 40 Q 75 140 140 240" 
                  fill="none" 
                  stroke="var(--color-brand)" 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
                  className="animate-pulse"
                />
                <path 
                  d="M 140 240 Q 205 140 140 40" 
                  fill="none" 
                  stroke="var(--color-line)" 
                  strokeWidth="1.5" 
                />

                {/* Nodes */}
                {/* Node 1: Amit */}
                <circle cx="140" cy="40" r="22" fill="var(--color-brand-soft)" stroke="var(--color-brand)" strokeWidth="2" />
                <text x="140" y="44" textAnchor="middle" fill="var(--color-brand)" className="text-[10px] font-bold">Amit</text>

                {/* Node 2: Rohan */}
                <circle cx="60" cy="180" r="22" fill="var(--color-brand-soft)" stroke="var(--color-line)" strokeWidth="1.5" />
                <text x="60" y="184" textAnchor="middle" fill="var(--color-inksoft)" className="text-[10px] font-bold">Rohan</text>

                {/* Node 3: Priya */}
                <circle cx="220" cy="180" r="22" fill="var(--color-brand-soft)" stroke="var(--color-line)" strokeWidth="1.5" />
                <text x="220" y="184" textAnchor="middle" fill="var(--color-inksoft)" className="text-[10px] font-bold">Priya</text>

                {/* Arrow Labels */}
                <g transform="translate(70, 130)">
                  <rect x="-24" y="-8" width="48" height="16" rx="4" fill="var(--color-card)" stroke="var(--color-line)" strokeWidth="1" />
                  <text textAnchor="middle" y="3" className="text-[8px] font-bold fill-red-500">-₹500</text>
                </g>
                <g transform="translate(210, 130)">
                  <rect x="-24" y="-8" width="48" height="16" rx="4" fill="var(--color-card)" stroke="var(--color-line)" strokeWidth="1" />
                  <text textAnchor="middle" y="3" className="text-[8px] font-bold fill-brand">+₹500</text>
                </g>
              </svg>
              
              <div className="absolute bottom-3 left-3 right-3 bg-card border border-line px-3 py-1.5 rounded-xl shadow-sm text-center text-[9px] font-bold text-inksoft uppercase tracking-wider">
                Simplified settlement flow view
              </div>
            </div>

          </div>
        </div>

      </header>

      {/* Features Grid Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-line/60 space-y-12">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand">Premium Toolkit</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">Everything you need to stay settled up.</h2>
          <p className="text-xs sm:text-sm text-inksoft">
            Designed to save time and secure transaction clarity.
          </p>
        </div>

        {/* Grid List */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-card border border-line rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-card-hover transition-all duration-200">
            <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand flex items-center justify-center">
              <Zap size={18} />
            </div>
            <h3 className="text-sm font-bold text-ink">Bill Simplification Algorithm</h3>
            <p className="text-xs text-inksoft leading-relaxed">
              Calculates shortest transfer paths across multiple group users to settle active balances directly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-card border border-line rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-card-hover transition-all duration-200">
            <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand flex items-center justify-center">
              <FileSpreadsheet size={18} />
            </div>
            <h3 className="text-sm font-bold text-ink">Spreadsheet CSV Imports</h3>
            <p className="text-xs text-inksoft leading-relaxed">
              Upload split sheet files directly into active ledgers to batch import expense records instantly.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-card border border-line rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-card-hover transition-all duration-200">
            <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand flex items-center justify-center">
              <Paperclip size={18} />
            </div>
            <h3 className="text-sm font-bold text-ink">Receipt Attachments</h3>
            <p className="text-xs text-inksoft leading-relaxed">
              Attach bill invoice images to verify transactions and preview them inside a fullscreen preview modal.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-card border border-line rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-card-hover transition-all duration-200">
            <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <h3 className="text-sm font-bold text-ink">Paginated Activity Logs</h3>
            <p className="text-xs text-inksoft leading-relaxed">
              Track who added, modified, or deleted entries with support for pagination and member filters.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-card border border-line rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-card-hover transition-all duration-200">
            <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand flex items-center justify-center">
              <Globe size={18} />
            </div>
            <h3 className="text-sm font-bold text-ink">Offline Status Banner</h3>
            <p className="text-xs text-inksoft leading-relaxed">
              Auto-detects when you lose internet connection and displays a warning banner to safeguard input details.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-card border border-line rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-card-hover transition-all duration-200">
            <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand flex items-center justify-center">
              <Lock size={18} />
            </div>
            <h3 className="text-sm font-bold text-ink">Secure Session Tokens</h3>
            <p className="text-xs text-inksoft leading-relaxed">
              Monitors authentication sessions using token response interceptors to log you out safely on JWT expiration.
            </p>
          </div>

        </div>

      </section>

      {/* Simplification Explanation Section */}
      <section id="simplification" className="max-w-7xl mx-auto px-6 py-20 border-t border-line/60 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-5 text-left">
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand">Algorithm details</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">How we simplify debts.</h2>
          <p className="text-xs sm:text-sm text-inksoft leading-relaxed">
            Standard debt tracking splits each card payment into separate peer-to-peer transfers, creating a complex web of transactions. 
          </p>
          <p className="text-xs sm:text-sm text-inksoft leading-relaxed">
            LedgerSplit resolves this by netting positive and negative balances within the ledger group, and then pairing the largest debtors with the largest creditors to resolve everyone in a minimum number of steps.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="border border-line rounded-xl p-4 bg-card shadow-sm">
              <h4 className="text-lg font-extrabold text-brand font-mono">₹0</h4>
              <p className="text-[10px] font-bold text-inksoft uppercase tracking-wider mt-1">Rounding margins</p>
            </div>
            <div className="border border-line rounded-xl p-4 bg-card shadow-sm">
              <h4 className="text-lg font-extrabold text-brand font-mono">1 Tap</h4>
              <p className="text-[10px] font-bold text-inksoft uppercase tracking-wider mt-1">To settle balances</p>
            </div>
          </div>
        </div>

        {/* Visual Graph Wheel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <div className="w-full max-w-md border border-line rounded-3xl p-6 bg-card shadow-lg text-center space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-line/60">
              <span className="text-[10px] font-bold text-inksoft uppercase tracking-wider">Visual simplify flowchart</span>
              <span className="text-[10px] font-bold text-brand bg-brand-soft px-2 py-0.5 rounded-lg">Active</span>
            </div>
            
            <div className="h-64 flex items-center justify-center relative">
              <svg width="240" height="240" className="overflow-visible">
                {/* Circle base */}
                <circle cx="120" cy="120" r="70" fill="none" stroke="var(--color-line)" strokeWidth="1" strokeDasharray="2 2" />

                {/* Node paths */}
                <path d="M 120 30 Q 120 120 120 210" fill="none" stroke="var(--color-brand)" strokeWidth="2.5" markerEnd="url(#arrow-head-active)" className="animate-pulse" />
                <path d="M 40 160 Q 120 120 200 160" fill="none" stroke="var(--color-line)" strokeWidth="1.5" />

                {/* Nodes */}
                <circle cx="120" cy="30" r="16" fill="#14532D" />
                <text x="120" y="33" textAnchor="middle" className="text-[9px] font-bold fill-white">A</text>

                <circle cx="40" cy="160" r="16" fill="#166534" />
                <text x="40" y="163" textAnchor="middle" className="text-[9px] font-bold fill-white">B</text>

                <circle cx="200" cy="160" r="16" fill="#166534" />
                <text x="200" y="163" textAnchor="middle" className="text-[9px] font-bold fill-white">C</text>

                <circle cx="120" cy="210" r="16" fill="#C62828" />
                <text x="120" y="213" textAnchor="middle" className="text-[9px] font-bold fill-white">D</text>
              </svg>
            </div>
            
            <p className="text-[11px] text-inksoft leading-relaxed">
              Curved Bezier lines bend dynamically dynamically depending on nodes position to avoid overlaps and preserve clean readability.
            </p>
          </div>
        </div>
      </section>

      {/* Security Block Section */}
      <section id="security" className="max-w-7xl mx-auto px-6 py-20 border-t border-line/60 bg-brand-dark rounded-3xl text-white relative overflow-hidden my-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(22,163,74,0.15),transparent)] pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-mint bg-brand-mint/15 px-3 py-1.5 rounded-full border border-brand-mint/20">
            Secure Infrastructure
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Your ledger data is protected.</h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-lg mx-auto">
            LedgerSplit monitors calculations with secure session tokens, enforces backend sum validation constraints on split shares, and clears cookies on token expiration redirects.
          </p>

          <div className="flex flex-wrap justify-center gap-6 pt-4 border-t border-white/10">
            <div className="text-center">
              <div className="text-sm font-bold">256-bit</div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-1">SSL Encryption</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold">JWT</div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-1">Token Protection</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold">SHA-256</div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-1">Pass Hash</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-20 border-t border-line/60 space-y-12">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand">Questions</span>
          <h2 className="text-2xl font-bold text-ink tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs text-inksoft">Find answers to queries about the LedgerSplit features.</p>
        </div>

        {/* FAQ Accordions */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="border border-line rounded-2xl bg-card overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-xs font-bold text-ink hover:bg-paper/30 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown 
                    size={16} 
                    className={`text-inksoft transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-inksoft leading-relaxed border-t border-line/45 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-card py-10 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Logo & copyright */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white">
              <Scale size={14} className="rotate-12" />
            </div>
            <div className="text-left">
              <span className="font-sans font-extrabold text-sm tracking-tight text-ink">
                Ledger<span className="text-brand-mint">Split</span>
              </span>
              <p className="text-[9px] text-inksoft font-semibold">© 2026 LedgerSplit Inc. All rights reserved.</p>
            </div>
          </div>

          {/* Social Icons & links */}
          <div className="flex items-center gap-5">
            <a 
              href="https://github.com/Ujjaval69/LedgerSplit" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-inksoft hover:text-ink transition-colors p-1"
              aria-label="GitHub Profile"
            >
              <Github size={18} />
            </a>
          </div>

        </div>
      </footer>

    </div>
  );
}
