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
  CheckCircle2, 
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
  Moon,
  Sliders,
  ShieldCheck,
  Check
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function rupee(n) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export default function Landing() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Interactive Sandbox Demo State
  const [demoAmount, setDemoAmount] = useState(6000);
  const [demoPayer, setDemoPayer] = useState("Aarav");
  
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

  const sharePerPerson = Math.round(demoAmount / 3);
  const demoMembers = [
    { name: "Aarav", role: demoPayer === "Aarav" ? "Payer" : "Member", x: 140, y: 36 },
    { name: "Rohan", role: demoPayer === "Rohan" ? "Payer" : "Member", x: 50, y: 180 },
    { name: "Priya", role: demoPayer === "Priya" ? "Payer" : "Member", x: 230, y: 180 },
  ];

  const faqs = [
    {
      q: "How does the Min-Cash-Flow graph algorithm work?",
      a: "Our algorithm calculates net balances for all members (total credit minus total debit). It then pairs the largest net debtor with the largest net creditor in a greedy matching cycle. For example, if Priya owes Rohan ₹500, and Rohan owes Aarav ₹500, the system collapses the cycle into 1 direct payment from Priya to Aarav, bypassing intermediary transfers entirely."
    },
    {
      q: "Can I batch import historical expenses from spreadsheets?",
      a: "Yes. Our client-side CSV parser lets you drop standard transaction exports from Google Sheets or Excel directly into any ledger. It automatically validates columns for description, amount, category, date, and member names to create verified ledger entries in seconds."
    },
    {
      q: "How does offline detection safeguard my calculations?",
      a: "LedgerSplit includes native browser connectivity listeners. If your mobile network drops in an underground cafe or flight, a sticky notification informs you immediately, queuing client operations until your connection is restored."
    },
    {
      q: "Is financial and ledger data kept private?",
      a: "All network traffic is encrypted via 256-bit TLS/SSL. Authentication uses signed JWT tokens with automated response interceptors that invalidate client state immediately upon expiration, preventing unauthorized session persistence."
    }
  ];

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-brand-soft selection:text-brand transition-colors duration-200">
      
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[520px] bg-gradient-to-b from-brand/10 via-transparent to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Floating Glass Pill Navigation Bar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl z-50 bg-card/85 backdrop-blur-xl border border-line rounded-full px-5 py-2.5 shadow-glass flex items-center justify-between transition-all duration-200">
        
        {/* Brand Monogram & Name */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
            <BookOpen size={14} className="text-white" />
          </div>
          <span className="font-sans font-extrabold text-sm tracking-tight text-ink">
            Ledger<span className="text-brand">Split</span>
          </span>
        </Link>

        {/* Desktop Anchor Navigation */}
        <div className="hidden md:flex items-center gap-7">
          <a href="#demo" className="text-xs font-semibold text-inksoft hover:text-ink transition-colors">Interactive Demo</a>
          <a href="#features" className="text-xs font-semibold text-inksoft hover:text-ink transition-colors">Capabilities</a>
          <a href="#simplification" className="text-xs font-semibold text-inksoft hover:text-ink transition-colors">Algorithm</a>
          <a href="#faq" className="text-xs font-semibold text-inksoft hover:text-ink transition-colors">FAQ</a>
        </div>

        {/* Action Buttons & Theme Switcher */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full text-inksoft hover:text-ink hover:bg-paper transition duration-150"
            aria-label="Toggle Theme"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
          </button>
          
          {user ? (
            <div className="flex items-center gap-2">
              <Link 
                to="/dashboard" 
                className="inline-flex items-center justify-center bg-brand text-white px-4 py-1.5 rounded-full font-bold text-xs shadow-sm hover:opacity-90 active:scale-95 transition-all"
              >
                Dashboard
              </Link>
              <button 
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="text-xs font-semibold text-inksoft hover:text-ink px-3 py-1.5 rounded-full border border-line hover:bg-paper transition"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/login" 
                className="text-xs font-semibold text-inksoft hover:text-ink px-3 py-1.5 transition"
              >
                Sign in
              </Link>
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center bg-brand text-white px-4 py-1.5 rounded-full font-bold text-xs shadow-sm hover:opacity-90 active:scale-95 transition-all"
              >
                Open Ledger
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-inksoft hover:text-ink p-1.5 rounded-full transition"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

      </nav>

      {/* Mobile Drawer Slide-Down */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-20 left-4 right-4 z-50 bg-card/95 backdrop-blur-2xl border border-line rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleIn">
          <div className="flex flex-col gap-3">
            <a 
              href="#demo" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-inksoft hover:text-ink"
            >
              Interactive Demo
            </a>
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-inksoft hover:text-ink"
            >
              Capabilities
            </a>
            <a 
              href="#simplification" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-inksoft hover:text-ink"
            >
              Algorithm
            </a>
            <a 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-inksoft hover:text-ink"
            >
              FAQ
            </a>
          </div>
          
          <div className="flex items-center justify-between border-t border-line pt-4">
            <span className="text-xs font-bold text-inksoft">Theme Mode</span>
            <button
              onClick={() => setIsDark(!isDark)}
              className="px-3 py-1.5 rounded-xl border border-line bg-paper text-inksoft hover:text-ink transition flex items-center gap-1.5"
            >
              {isDark ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} />}
              <span className="text-[10px] font-mono font-bold uppercase">{isDark ? "Light" : "Dark"}</span>
            </button>
          </div>
          
          <div className="border-t border-line pt-4 flex flex-col gap-2.5">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-brand text-white py-2.5 rounded-xl font-bold text-xs text-center shadow-sm"
                >
                  Go to Dashboard
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate("/");
                  }}
                  className="w-full border border-line bg-paper text-inksoft py-2.5 rounded-xl font-bold text-xs text-center"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full border border-line bg-paper text-ink py-2.5 rounded-xl font-bold text-xs text-center"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-brand text-white py-2.5 rounded-xl font-bold text-xs text-center shadow-sm"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <header className="max-w-6xl mx-auto px-6 pt-32 pb-20 sm:pt-40 sm:pb-24 text-center space-y-8">
        
        {/* Editorial Subtitle Pill */}
        <div className="inline-flex items-center gap-2 bg-brand-soft text-brand dark:bg-brand-soft dark:text-brand text-[10px] font-mono font-bold px-3.5 py-1 rounded-full border border-brand/20 animate-fadeInUp">
          <Sparkles size={11} />
          <span className="tracking-widest uppercase">FINANCIAL SIMPLIFICATION ENGINE</span>
        </div>

        {/* High-Impact Hero Typography */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="font-sans text-4xl sm:text-6xl font-extrabold tracking-tight text-ink leading-[1.08] animate-fadeInUp">
            Mathematically optimal <br className="hidden sm:inline" />
            <span className="text-brand">group settlements.</span>
          </h1>
          <p className="text-sm sm:text-base text-inksoft font-medium leading-relaxed max-w-xl mx-auto animate-fadeInUp" style={{ animationDelay: "100ms" }}>
            Split bills, not friendships. LedgerSplit reduces complex multi-party debt webs into direct, minimum-transaction settlement payments.
          </p>
        </div>

        {/* Hero CTA Controls */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 max-w-md mx-auto animate-fadeInUp" style={{ animationDelay: "150ms" }}>
          {user ? (
            <Link 
              to="/dashboard" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand text-white px-7 py-3 rounded-full font-bold text-xs shadow-sm hover:opacity-95 active:scale-98 transition-all"
            >
              Enter Dashboard <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link 
                to="/register" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand text-white px-7 py-3 rounded-full font-bold text-xs shadow-sm hover:opacity-95 active:scale-98 transition-all"
              >
                Open Free Ledger <ArrowRight size={14} />
              </Link>
              <Link 
                to="/login" 
                className="w-full sm:w-auto inline-flex items-center justify-center border border-line bg-card hover:bg-paper text-ink px-7 py-3 rounded-full font-bold text-xs transition"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Interactive Splitting Demonstration Sandbox (The Live Micro-Sandbox) */}
        <div id="demo" className="max-w-4xl mx-auto pt-10 animate-fadeInUp" style={{ animationDelay: "200ms" }}>
          <div className="bg-card border border-line rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden text-left">
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-line">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-brand font-bold">INTERACTIVE PROOF SANDBOX</span>
                <h3 className="text-lg sm:text-xl font-bold text-ink mt-0.5">Test the Simplification Engine in Real Time</h3>
                <p className="text-xs text-inksoft mt-1">
                  Adjust the bill amount and choose who paid to watch cyclic debts collapse instantly.
                </p>
              </div>

              {/* Payer Selector Segmented Tabs */}
              <div className="flex items-center gap-1 bg-paper border border-line rounded-xl p-1 shrink-0">
                {["Aarav", "Rohan", "Priya"].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setDemoPayer(name)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      demoPayer === name
                        ? "bg-brand text-white shadow-sm"
                        : "text-inksoft hover:text-ink"
                    }`}
                  >
                    {name} Paid
                  </button>
                ))}
              </div>
            </div>

            {/* Slider & Graph Canvas */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-6">
              
              {/* Left Controls & Metrics */}
              <div className="md:col-span-6 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-inksoft uppercase tracking-wider">
                      Shared Bill Amount
                    </label>
                    <span className="font-mono text-xl font-extrabold text-brand ls-mono">
                      {rupee(demoAmount)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1500"
                    max="15000"
                    step="1500"
                    value={demoAmount}
                    onChange={(e) => setDemoAmount(parseInt(e.target.value))}
                    className="w-full h-2 bg-paper rounded-lg appearance-none cursor-pointer accent-brand border border-line"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-inksoft/60 mt-1">
                    <span>₹1,500</span>
                    <span>₹7,500</span>
                    <span>₹15,000</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="border border-line rounded-2xl p-3.5 bg-paper/40">
                    <span className="text-[10px] uppercase font-mono font-bold text-inksoft">Per Person Share</span>
                    <div className="font-mono text-base font-extrabold text-ink mt-0.5 ls-mono">
                      {rupee(sharePerPerson)}
                    </div>
                    <span className="text-[9px] text-inksoft/80 font-medium">Split evenly across 3</span>
                  </div>

                  <div className="border border-brand/20 rounded-2xl p-3.5 bg-brand-soft">
                    <span className="text-[10px] uppercase font-mono font-bold text-brand">Direct Transfers</span>
                    <div className="font-mono text-base font-extrabold text-brand mt-0.5 ls-mono">
                      2 Transfers
                    </div>
                    <span className="text-[9px] text-brand/80 font-medium">6 redundant loops saved</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-line pt-4 text-xs">
                  <div className="flex items-center gap-2 text-ink">
                    <CheckCircle2 size={14} className="text-brand shrink-0" />
                    <span><strong>{demoPayer}</strong> is credited {rupee(demoAmount - sharePerPerson)}.</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink">
                    <CheckCircle2 size={14} className="text-brand shrink-0" />
                    <span>Remaining 2 members each pay only {rupee(sharePerPerson)} directly.</span>
                  </div>
                </div>
              </div>

              {/* Right Visual Flowchart SVG */}
              <div className="md:col-span-6 flex items-center justify-center">
                <div className="w-full max-w-xs h-64 border border-line rounded-2xl bg-paper/30 flex items-center justify-center relative overflow-hidden">
                  <svg width="280" height="240" className="overflow-visible">
                    {/* Circle guide outline */}
                    <circle cx="140" cy="120" r="75" fill="none" stroke="var(--color-line)" strokeWidth="1" strokeDasharray="3 3" />

                    {/* Dynamic Bezier Transfer Lines pointing toward the payer */}
                    {demoMembers.filter(m => m.name !== demoPayer).map((m, idx) => {
                      const payerObj = demoMembers.find(p => p.name === demoPayer);
                      return (
                        <g key={idx}>
                          <path
                            d={`M ${m.x} ${m.y} Q 140 120 ${payerObj.x} ${payerObj.y}`}
                            fill="none"
                            stroke="var(--color-brand)"
                            strokeWidth="2.5"
                            strokeDasharray="4 4"
                            className="animate-pulse"
                          />
                        </g>
                      );
                    })}

                    {/* Member Nodes */}
                    {demoMembers.map((m, idx) => {
                      const isPayer = m.name === demoPayer;
                      return (
                        <g key={idx}>
                          <circle
                            cx={m.x}
                            cy={m.y}
                            r="22"
                            fill={isPayer ? "var(--color-brand)" : "var(--color-card)"}
                            stroke={isPayer ? "var(--color-brand)" : "var(--color-line)"}
                            strokeWidth="2"
                            className="transition-all duration-300"
                          />
                          <text
                            x={m.x}
                            y={m.y + 4}
                            textAnchor="middle"
                            fill={isPayer ? "#FFFFFF" : "var(--color-ink)"}
                            className="text-[10px] font-bold select-none pointer-events-none"
                          >
                            {m.name.charAt(0)}
                          </text>
                          <text
                            x={m.x}
                            y={m.y + 34}
                            textAnchor="middle"
                            fill="var(--color-inksoft)"
                            className="text-[9px] font-mono font-semibold select-none"
                          >
                            {m.name}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  <div className="absolute bottom-2.5 bg-card/90 backdrop-blur-md border border-line px-3 py-1 rounded-full text-[9px] font-mono font-bold text-inksoft uppercase tracking-wider shadow-sm">
                    {demoPayer} receives direct net transfers
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </header>

      {/* Bento-Grid Capabilities Showcase Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 border-t border-line space-y-12">
        
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-brand font-bold">ARCHITECTURAL TOOLKIT</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Everything required for effortless group accounting.</h2>
          <p className="text-xs sm:text-sm text-inksoft">
            Engineered with high performance, precision math, and zero clutter.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Bento Card 1 (Span 2): Min Cash Flow Algorithm */}
          <div className="md:col-span-2 bg-card border border-line rounded-3xl p-6 sm:p-8 shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all duration-200">
            <div className="space-y-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-brand-soft text-brand flex items-center justify-center mb-4">
                <Zap size={16} />
              </div>
              <h3 className="text-base font-bold text-ink">Greedy Min-Cash-Flow Optimization</h3>
              <p className="text-xs text-inksoft leading-relaxed max-w-md">
                Solves cyclic bilateral debts with a graph-based reduction algorithm, minimizing the number of distinct transactions required to square away group balances.
              </p>
            </div>

            {/* Visual Artifact: Interactive Path Mini-Chart */}
            <div className="border border-line rounded-2xl p-4 bg-paper/40 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-ink font-semibold">Trips & Shared Flats</span>
              </div>
              <span className="text-brand font-bold">O(N) Complexity</span>
            </div>
          </div>

          {/* Bento Card 2 (Span 1): CSV Ingestion Engine */}
          <div className="bg-card border border-line rounded-3xl p-6 sm:p-8 shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all duration-200">
            <div className="space-y-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-brand-soft text-brand flex items-center justify-center mb-4">
                <FileSpreadsheet size={16} />
              </div>
              <h3 className="text-base font-bold text-ink">In-Browser CSV Parser</h3>
              <p className="text-xs text-inksoft leading-relaxed">
                Drop standard transaction exports directly into any ledger to batch-import dozens of records asynchronously.
              </p>
            </div>

            {/* Visual Artifact: Mock Spreadsheet Row */}
            <div className="border border-line rounded-xl p-3 bg-paper/40 space-y-1.5 text-[10px] font-mono">
              <div className="flex justify-between text-inksoft">
                <span>DINNER_EXP.CSV</span>
                <span className="text-brand font-bold">PARSED ✓</span>
              </div>
              <div className="w-full bg-line h-1 rounded-full overflow-hidden">
                <div className="bg-brand h-full w-full" />
              </div>
            </div>
          </div>

          {/* Bento Card 3 (Span 1): Receipt Inspection */}
          <div className="bg-card border border-line rounded-3xl p-6 sm:p-8 shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all duration-200">
            <div className="space-y-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-brand-soft text-brand flex items-center justify-center mb-4">
                <Paperclip size={16} />
              </div>
              <h3 className="text-base font-bold text-ink">Invoice & Receipt Lightbox</h3>
              <p className="text-xs text-inksoft leading-relaxed">
                Attach digital bill proofs to expenses and inspect invoices within a responsive fullscreen modal preview.
              </p>
            </div>

            {/* Visual Artifact: Receipt Pill */}
            <div className="border border-line rounded-xl p-2.5 bg-paper/40 flex items-center justify-between text-[11px] font-semibold text-ink">
              <span>Tax_Invoice_#412.pdf</span>
              <span className="text-[9px] font-mono font-bold text-brand bg-brand-soft px-1.5 py-0.5 rounded">VIEW</span>
            </div>
          </div>

          {/* Bento Card 4 (Span 2): Audit Activity Timeline */}
          <div className="md:col-span-2 bg-card border border-line rounded-3xl p-6 sm:p-8 shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all duration-200">
            <div className="space-y-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-brand-soft text-brand flex items-center justify-center mb-4">
                <BookOpen size={16} />
              </div>
              <h3 className="text-base font-bold text-ink">Paginated Audit Timeline</h3>
              <p className="text-xs text-inksoft leading-relaxed max-w-md">
                Audit historical modifications with server-side skip/limit pagination, member filtering, and date-sorted transaction transparency.
              </p>
            </div>

            {/* Visual Artifact: Mini Activity Rows */}
            <div className="space-y-2 text-xs font-medium">
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-line bg-paper/40">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center text-[9px] font-bold">R</div>
                  <span className="text-ink">Rohan settled with Aarav</span>
                </div>
                <span className="font-mono text-emerald-600 font-bold ls-mono">₹2,000</span>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* Simplification Math Explanation Section */}
      <section id="simplification" className="max-w-6xl mx-auto px-6 py-24 border-t border-line flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-5 text-left">
          <span className="text-[10px] font-mono uppercase tracking-widest text-brand font-bold">THE SETTLEMENT ALGORITHM</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">How we collapse debt cycles.</h2>
          <p className="text-xs sm:text-sm text-inksoft leading-relaxed">
            Conventional split trackers track each bill as an isolated bilateral transaction. When 5 friends split 15 group meals, dozens of small, overlapping payments are created.
          </p>
          <p className="text-xs sm:text-sm text-inksoft leading-relaxed">
            LedgerSplit resolves this mathematically by netting all member balances into a clean directed cash-flow graph, solving for the absolute minimum number of settlement steps.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="border border-line rounded-2xl p-4 bg-card shadow-sm">
              <h4 className="text-xl font-extrabold text-brand font-mono ls-mono">₹0.00</h4>
              <p className="text-[10px] font-mono uppercase tracking-wider text-inksoft mt-1">Discrepancy Variance</p>
            </div>
            <div className="border border-line rounded-2xl p-4 bg-card shadow-sm">
              <h4 className="text-xl font-extrabold text-brand font-mono ls-mono">1 Click</h4>
              <p className="text-[10px] font-mono uppercase tracking-wider text-inksoft mt-1">To Square Balances</p>
            </div>
          </div>
        </div>

        {/* Visual Graph Wheel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-sm border border-line rounded-3xl p-6 bg-card shadow-card text-center space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-line">
              <span className="text-[9px] font-mono uppercase tracking-widest text-inksoft font-bold">SIMPLIFIED TOPOLOGY</span>
              <span className="text-[9px] font-mono font-bold text-brand bg-brand-soft px-2 py-0.5 rounded-full">ACTIVE</span>
            </div>
            
            <div className="h-56 flex items-center justify-center relative">
              <svg width="220" height="220" className="overflow-visible">
                <circle cx="110" cy="110" r="65" fill="none" stroke="var(--color-line)" strokeWidth="1" strokeDasharray="3 3" />

                {/* Path */}
                <path d="M 110 30 Q 110 110 110 190" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
                <path d="M 35 150 Q 110 110 185 150" fill="none" stroke="var(--color-line)" strokeWidth="1.5" />

                {/* Nodes */}
                <circle cx="110" cy="30" r="16" fill="var(--color-brand)" />
                <text x="110" y="34" textAnchor="middle" className="text-[9px] font-bold fill-white">A</text>

                <circle cx="35" cy="150" r="16" fill="var(--color-brand-soft)" stroke="var(--color-brand)" strokeWidth="1.5" />
                <text x="35" y="154" textAnchor="middle" className="text-[9px] font-bold fill-brand">B</text>

                <circle cx="185" cy="150" r="16" fill="var(--color-brand-soft)" stroke="var(--color-brand)" strokeWidth="1.5" />
                <text x="185" y="154" textAnchor="middle" className="text-[9px] font-bold fill-brand">C</text>

                <circle cx="110" cy="190" r="16" fill="var(--color-card)" stroke="var(--color-line)" strokeWidth="1.5" />
                <text x="110" y="194" textAnchor="middle" className="text-[9px] font-bold fill-inksoft">D</text>
              </svg>
            </div>
            
            <p className="text-[11px] text-inksoft leading-relaxed">
              Curved Bezier connectors bend dynamically to eliminate path overlaps and maintain legibility.
            </p>
          </div>
        </div>
      </section>

      {/* Security Architecture Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="border border-line bg-card rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-card relative overflow-hidden">
          <span className="text-[10px] font-mono uppercase tracking-widest text-brand font-bold bg-brand-soft px-3 py-1 rounded-full border border-brand/20">
            SECURITY INFRASTRUCTURE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Your financial records remain strictly private.</h2>
          <p className="text-xs sm:text-sm text-inksoft leading-relaxed max-w-lg mx-auto">
            LedgerSplit enforces server-side split share mathematical validations, guards sessions with signed JWT tokens, and isolates ledger namespaces.
          </p>

          <div className="grid grid-cols-3 max-w-lg mx-auto gap-4 pt-4 border-t border-line">
            <div className="text-center">
              <div className="text-base font-mono font-bold text-ink">256-bit</div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-inksoft mt-0.5">TLS Encryption</div>
            </div>
            <div className="text-center">
              <div className="text-base font-mono font-bold text-ink">JWT</div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-inksoft mt-0.5">Session Interceptor</div>
            </div>
            <div className="text-center">
              <div className="text-base font-mono font-bold text-ink">Mongoose</div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-inksoft mt-0.5">Schema Validation</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-20 border-t border-line space-y-10">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-brand font-bold">FREQUENTLY ASKED QUESTIONS</span>
          <h2 className="text-2xl font-extrabold text-ink tracking-tight">Clear answers for every calculation.</h2>
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
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-xs font-bold text-ink hover:bg-paper transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown 
                    size={15} 
                    className={`text-inksoft transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-inksoft leading-relaxed border-t border-line animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* Luxury Editorial Footer */}
      <footer className="border-t border-line bg-card py-10 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Logo & copyright */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white shadow-sm">
              <BookOpen size={14} />
            </div>
            <div className="text-left">
              <span className="font-sans font-extrabold text-sm tracking-tight text-ink">
                LedgerSplit
              </span>
              <p className="text-[10px] font-mono text-inksoft">© 2026 LedgerSplit. All rights reserved.</p>
            </div>
          </div>

          {/* Status & Github Links */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 text-[10px] font-mono text-inksoft">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Systems operational</span>
            </div>
            <a 
              href="https://github.com/Ujjaval69/LedgerSplit" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-inksoft hover:text-ink transition-colors p-1"
              aria-label="GitHub Repository"
            >
              <Github size={17} />
            </a>
          </div>

        </div>
      </footer>

    </div>
  );
}
