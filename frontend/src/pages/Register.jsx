import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { HeroPanel } from "./Login";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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

          <h1 className="font-display text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-sm text-inksoft mb-7">Set up your first ledger in under a minute.</p>

          {error && (
            <div className="mb-4 text-sm bg-red-50 border border-debt/30 text-debt rounded-md px-3 py-2.5 animate-fadeIn">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-inksoft mb-1.5">Full name</label>
              <input
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-line rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-credit focus:ring-2 focus:ring-credit/15 transition-shadow bg-card"
                placeholder="Aarav Verma"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-inksoft mb-1.5">Email</label>
              <input
                type="email"
                required
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-line rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-credit focus:ring-2 focus:ring-credit/15 transition-shadow bg-card"
                placeholder="At least 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-paper py-3 rounded-lg font-semibold text-sm hover:opacity-90 hover:-translate-y-0.5 shadow-card hover:shadow-card-hover transition-all duration-200 disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-sm text-inksoft text-center mt-7">
            Already have an account?{" "}
            <Link to="/login" className="text-credit font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}