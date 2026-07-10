import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Stamp, TrendingUp, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <HeroPanel />

      <div className="flex-1 flex items-center justify-center bg-paper px-4 py-12">
        <div className="w-full max-w-sm animate-fadeInUp">
          <div className="flex items-center gap-2 mb-2 lg:hidden justify-center">
            <BookOpen size={22} className="text-gold" />
            <span className="font-display text-xl font-bold text-ink">LedgerSplit</span>
          </div>

          <h1 className="font-display text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-sm text-inksoft mb-7">Sign in to pick up your ledgers where you left off.</p>

          {error && (
            <div className="mb-4 text-sm bg-red-50 border border-debt/30 text-debt rounded-md px-3 py-2.5 animate-fadeIn">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-inksoft mb-1.5">Email</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-line rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-credit focus:ring-2 focus:ring-credit/15 transition-shadow bg-card"
                placeholder="you@college.edu"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-inksoft mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-line rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-credit focus:ring-2 focus:ring-credit/15 transition-shadow bg-card"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-paper py-3 rounded-lg font-semibold text-sm hover:opacity-90 hover:-translate-y-0.5 shadow-card hover:shadow-card-hover transition-all duration-200 disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-sm text-inksoft text-center mt-7">
            New here?{" "}
            <Link to="/register" className="text-credit font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function HeroPanel() {
  return (
    <div className="hidden lg:flex w-[440px] shrink-0 bg-ink text-paper flex-col justify-between p-10 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 34px, #E9F0E4 34px, #E9F0E4 35px)",
        }}
      />

      <div className="relative">
        <div className="flex items-center gap-2 mb-16">
          <BookOpen size={22} className="text-gold" />
          <span className="font-display text-xl font-bold tracking-wide">LedgerSplit</span>
        </div>

        <h2 className="font-display text-3xl font-bold leading-tight mb-4">
          Split costs.
          <br />
          Settle in minutes,
          <br />
          not messages.
        </h2>
        <p className="text-paper/60 text-sm leading-relaxed max-w-xs">
          Track shared expenses with your hostel room or your trip crew, and let the algorithm
          work out who actually owes whom.
        </p>
      </div>

      <div className="relative space-y-4">
        <FeatureRow icon={<TrendingUp size={16} />} text="Minimum-transaction settlement algorithm" />
        <FeatureRow icon={<Users size={16} />} text="Equal, percentage, or exact splits" />
        <FeatureRow icon={<Stamp size={16} />} text="One tap to see who pays whom" />
      </div>
    </div>
  );
}

function FeatureRow({ icon, text }) {
  return (
    <div className="flex items-center gap-3 text-sm text-paper/80">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gold shrink-0">
        {icon}
      </div>
      <span>{text}</span>
    </div>
  );
}