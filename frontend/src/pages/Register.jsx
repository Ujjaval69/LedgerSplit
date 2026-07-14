import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { HeroPanel } from "./Login";
import api from "../api/client";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("register"); // register, verify_email
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, loginWithGoogle, verifyEmail } = useAuth();
  const navigate = useNavigate();

  // Initialize Google Signup
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && window.google) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("google-signup-btn"),
        { theme: "outline", size: "large", width: 384 }
      );
    }
  }, [mode]);

  async function handleGoogleCredentialResponse(response) {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle(response.credential);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Google Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleMockGoogleLogin() {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle("mock-google-developer");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Google Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, password);
      if (res.unverified) {
        setMode("verify_email");
        setError("Please enter the verification OTP sent to your email.");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyEmailSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyEmail(email, otp);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    setError("");
    try {
      await api.post("/auth/resend-verification", { email });
      alert("Verification OTP resent successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend OTP");
    }
  }

  return (
    <div className="min-h-screen flex">
      <HeroPanel />

      <div className="flex-1 flex items-center justify-center bg-paper px-4 py-12">
        <div className="w-full max-w-sm animate-fadeInUp">
          <div className="flex items-center gap-2 mb-2 lg:hidden justify-center">
            <BookOpen size={22} className="text-brand" />
            <span className="font-display text-xl font-bold text-ink">LedgerSplit</span>
          </div>

          {mode === "register" && (
            <>
              <h1 className="font-display text-2xl font-bold mb-1">Create your account</h1>
              <p className="text-sm text-inksoft mb-7">Set up your first ledger in under a minute.</p>

              {error && (
                <div className="mb-4 text-sm bg-red-50 dark:bg-red-950/20 border border-debt/30 text-debt rounded-md px-3 py-2.5 animate-fadeIn">
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
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition bg-card"
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
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition bg-card"
                    placeholder="you@mail.com"
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
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition bg-card"
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

              <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-line"></div>
                <span className="flex-shrink mx-4 text-inksoft text-[10px] uppercase font-bold tracking-wider">Or</span>
                <div className="flex-grow border-t border-line"></div>
              </div>

              {/* Google Sign In Button */}
              {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                <div id="google-signup-btn" className="flex justify-center"></div>
              ) : (
                <button
                  onClick={handleMockGoogleLogin}
                  disabled={loading}
                  className="w-full bg-card border border-line text-ink py-2.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 hover:bg-paper transition"
                >
                  <span className="font-extrabold text-brand">G</span> Sign up with Google (Mock)
                </button>
              )}

              <p className="text-sm text-inksoft text-center mt-7">
                Already have an account?{" "}
                <Link to="/login" className="text-brand font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}

          {mode === "verify_email" && (
            <>
              <h1 className="font-display text-2xl font-bold mb-1">Verify Email</h1>
              <p className="text-sm text-inksoft mb-7">Please enter the 6-digit OTP code sent to verify your registration.</p>

              {error && (
                <div className="mb-4 text-sm bg-red-50 dark:bg-red-950/20 border border-debt/30 text-debt rounded-md px-3 py-2.5 animate-fadeIn">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-inksoft mb-1.5">Verification Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition bg-card text-center font-mono text-lg tracking-widest"
                    placeholder="000000"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand text-white py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify and Login"}
                </button>
                <div className="flex flex-col gap-2 pt-2 text-center text-xs font-bold text-inksoft">
                  <button type="button" onClick={handleResendVerification} className="hover:text-brand transition">
                    Resend verification code
                  </button>
                  <button type="button" onClick={() => setMode("register")} className="hover:text-ink transition">
                    Cancel verification
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}