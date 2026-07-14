import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Stamp, TrendingUp, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // login, forgot_password, verify_otp, reset_password, verify_email
  const [verifyEmailAddress, setVerifyEmailAddress] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle, verifyEmail } = useAuth();
  const navigate = useNavigate();

  // Initialize Google Login
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && window.google) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-btn"),
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
      setError(err.response?.data?.message || "Google Login failed");
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
      setError(err.response?.data?.message || "Google Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.data?.unverified) {
        setVerifyEmailAddress(email);
        setMode("verify_email");
        setError("Please enter the verification OTP sent to your email.");
      } else {
        setError(err.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPasswordSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: verifyEmailAddress });
      setMode("verify_otp");
    } catch (err) {
      setError(err.response?.data?.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTPSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/verify-reset-otp", { email: verifyEmailAddress, otp });
      setMode("reset_password");
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPasswordSubmit(e) {
    e.preventDefault();
    setError("");
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email: verifyEmailAddress, otp, password: newPassword });
      setMode("login");
      setError("Password reset successful. Please sign in now.");
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyEmailSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyEmail(verifyEmailAddress, otp);
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
      await api.post("/auth/resend-verification", { email: verifyEmailAddress });
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

          {mode === "login" && (
            <>
              <h1 className="font-display text-2xl font-bold mb-1">Welcome back</h1>
              <p className="text-sm text-inksoft mb-7">Sign in to pick up your ledgers where you left off.</p>

              {error && (
                <div className="mb-4 text-sm bg-red-50 dark:bg-red-950/20 border border-debt/30 text-debt rounded-md px-3 py-2.5 animate-fadeIn">
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
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition bg-card"
                    placeholder="you@mail.com"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-inksoft">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setVerifyEmailAddress(email);
                        setMode("forgot_password");
                        setError("");
                      }}
                      className="text-[11px] font-bold text-brand hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition bg-card"
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

              <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-line"></div>
                <span className="flex-shrink mx-4 text-inksoft text-[10px] uppercase font-bold tracking-wider">Or</span>
                <div className="flex-grow border-t border-line"></div>
              </div>

              {/* Google Sign In Button */}
              {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                <div id="google-signin-btn" className="flex justify-center"></div>
              ) : (
                <button
                  onClick={handleMockGoogleLogin}
                  disabled={loading}
                  className="w-full bg-card border border-line text-ink py-2.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 hover:bg-paper transition"
                >
                  <span className="font-extrabold text-brand">G</span> Continue with Google (Mock)
                </button>
              )}

              <p className="text-sm text-inksoft text-center mt-7">
                New here?{" "}
                <Link to="/register" className="text-brand font-semibold hover:underline">
                  Create an account
                </Link>
              </p>
            </>
          )}

          {mode === "forgot_password" && (
            <>
              <h1 className="font-display text-2xl font-bold mb-1">Reset Password</h1>
              <p className="text-sm text-inksoft mb-7">Enter your email and we'll send you a 6-digit OTP code.</p>

              {error && (
                <div className="mb-4 text-sm bg-red-50 dark:bg-red-950/20 border border-debt/30 text-debt rounded-md px-3 py-2.5 animate-fadeIn">
                  {error}
                </div>
              )}

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-inksoft mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={verifyEmailAddress}
                    onChange={(e) => setVerifyEmailAddress(e.target.value)}
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition bg-card"
                    placeholder="you@mail.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand text-white py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send OTP Code"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="w-full text-center text-xs font-bold text-inksoft hover:text-ink transition"
                >
                  Back to Sign In
                </button>
              </form>
            </>
          )}

          {mode === "verify_otp" && (
            <>
              <h1 className="font-display text-2xl font-bold mb-1">Verify OTP</h1>
              <p className="text-sm text-inksoft mb-7">Enter the 6-digit password reset code sent to your email.</p>

              {error && (
                <div className="mb-4 text-sm bg-red-50 dark:bg-red-950/20 border border-debt/30 text-debt rounded-md px-3 py-2.5 animate-fadeIn">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOTPSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-inksoft mb-1.5">Enter 6-digit OTP</label>
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
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("forgot_password")}
                  className="w-full text-center text-xs font-bold text-inksoft hover:text-ink transition"
                >
                  Back to Forgot Email
                </button>
              </form>
            </>
          )}

          {mode === "reset_password" && (
            <>
              <h1 className="font-display text-2xl font-bold mb-1">New Password</h1>
              <p className="text-sm text-inksoft mb-7">Create a strong, new password for your account.</p>

              {error && (
                <div className="mb-4 text-sm bg-red-50 dark:bg-red-950/20 border border-debt/30 text-debt rounded-md px-3 py-2.5 animate-fadeIn">
                  {error}
                </div>
              )}

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-inksoft mb-1.5">New Password</label>
                  <input
                    type="password"
                    required
                    minlength={6}
                    autoFocus
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-line rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition bg-card"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand text-white py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "Save Password"}
                </button>
              </form>
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
                  <button type="button" onClick={() => setMode("login")} className="hover:text-ink transition">
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
          <BookOpen size={22} className="text-brand-mint" />
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
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-brand-mint shrink-0">
        {icon}
      </div>
      <span>{text}</span>
    </div>
  );
}