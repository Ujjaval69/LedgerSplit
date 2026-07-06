import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm bg-card border border-line rounded-lg p-8">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <BookOpen size={22} className="text-gold" />
          <span className="font-display text-xl font-bold text-ink">LedgerSplit</span>
        </div>

        <h1 className="font-display text-lg font-semibold mb-6 text-center">Welcome back</h1>

        {error && (
          <div className="mb-4 text-sm bg-red-50 border border-debt/30 text-debt rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-inksoft mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-credit"
              placeholder="you@college.edu"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-inksoft mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-credit"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-paper py-2.5 rounded-md font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-inksoft text-center mt-6">
          New here?{" "}
          <Link to="/register" className="text-credit font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
