import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { clearAuthSession, isAuthSessionExpired, persistAuthSession } from "../../utils/session";

const MOBILE_BG = "/images/bg-mobile.jpeg";
const DESKTOP_BG = "/images/bg-desktop.jpeg";

export default function SignInPage() {
  const [view, setView] = useState("splash");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sliding, setSliding] = useState(false);
  const [loading, setLoading] = useState(true);
  const formRef = useRef(null);
  const navigate = useNavigate();

  /* ── Auth guard: redirect if already logged in ── */
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const roleId = sessionStorage.getItem("role_id");

    if (token) {
      if (isAuthSessionExpired()) {
        clearAuthSession();
        setLoading(false);
        return;
      }
      if (roleId && parseInt(roleId, 10) === 3) {
        navigate("/introduction", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } else {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) return null;

  const handleGetStarted = () => {
    setSliding(true);
    setTimeout(() => setView("login"), 20);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      const res = await axios.post("/api/login", { email, password });
      const { access_token, user } = res.data;

      persistAuthSession(access_token, user);

      if (user.role_id === 3) {
        navigate("/introduction", { replace: true });
      } else if (user.role_id === 2) {
        navigate(user.panel_status ? "/choose-dashboard" : "/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = err.response?.data?.message;

        if (status === 401) toast.error("Invalid email or password");
        else if (status === 403 && message) toast.error(message);
        else if (status === 404) toast.error("User not found");
        else toast.error("Something went wrong. Please try again!");
      } else {
        toast.error("Unexpected error occurred!");
      }
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', sans-serif;
          background: #0a0e1a;
          min-height: 100dvh;
        }

        /* ══════════════════════════════════════════
           MOBILE  (< 1024 px)
        ══════════════════════════════════════════ */
        .mobile-wrap {
          display: flex;
          flex-direction: column;
          width: 100%;
          min-height: 100dvh;
          position: relative;
          overflow: hidden;
        }

        .mobile-bg {
          position: fixed;
          inset: 0;
          background-image: url('${MOBILE_BG}');
          background-size: cover;
          background-position: center top;
          z-index: 0;
        }
        .mobile-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(10,14,26,0.15) 0%,
            rgba(10,14,26,0.25) 45%,
            rgba(10,14,26,0.82) 75%,
            rgba(10,14,26,0.97) 100%
          );
        }

        /* ── Splash screen ── */
        .splash-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          min-height: 100dvh;
          padding: 0 28px 48px;
        }

        .brand-badge {
          position: absolute;
          top: 56px; left: 28px;
          display: flex; align-items: center; gap: 8px;
        }
        .brand-icon {
          width: 36px; height: 36px;
          background: rgba(255,255,255,0.12);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.15);
        }
        .brand-name { font-size: 18px; font-weight: 600; color: #fff; letter-spacing: -0.3px; }
        .brand-name span { color: #f97316; }
        .brand-sub {
          font-size: 9px; font-weight: 500;
          color: rgba(255,255,255,0.45);
          letter-spacing: 2.5px; text-transform: uppercase; margin-top: 1px;
        }

        .splash-headline {
          font-size: 36px; font-weight: 700; color: #fff;
          line-height: 1.15; letter-spacing: -0.8px; margin-bottom: 12px;
        }
        .splash-headline em { font-style: normal; color: #f97316; }
        .splash-body {
          font-size: 14px; color: rgba(255,255,255,0.55);
          line-height: 1.6; margin-bottom: 36px; max-width: 280px;
        }

        .dots { display: flex; gap: 7px; margin-bottom: 28px; }
        .dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.3); }
        .dot.active { background: #f97316; width: 20px; border-radius: 4px; }

        .btn-start {
          width: 100%; padding: 16px;
          background: #f97316; color: #fff; border: none;
          border-radius: 14px; font-size: 15px; font-weight: 600;
          cursor: pointer; letter-spacing: 0.1px; transition: background 0.2s;
          font-family: inherit;
        }
        .btn-start:hover { background: #ea6c0a; }

        /* ── Mobile login: full-screen panel ── */
        .login-sheet-overlay {
          position: fixed; inset: 0; z-index: 10;
          display: flex; flex-direction: column; justify-content: flex-end;
        }
        .login-sheet-bg {
          position: absolute; inset: 0;
          background: rgba(10,14,26,0.5);
        }
        .login-sheet {
          position: relative; z-index: 1;
          background: #0d1220;
          border-radius: 0;
          padding: 52px 28px 48px;
          transform: translateY(100%);
          transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
          min-height: 100dvh;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .login-sheet::-webkit-scrollbar { display: none; }
        .login-sheet.open { transform: translateY(0); }

        .mobile-back-btn {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none;
          color: rgba(255,255,255,0.5);
          font-size: 13px; font-weight: 500; font-family: inherit;
          cursor: pointer; padding: 0; margin-bottom: 36px;
          transition: color 0.2s;
        }
        .mobile-back-btn:hover { color: #fff; }

        /* ══════════════════════════════════════════
           DESKTOP  (≥ 1024 px)
        ══════════════════════════════════════════ */
        .desktop-wrap {
          display: none;
          width: 100%;
          min-height: 100dvh;
          position: relative;
        }

        .desktop-left {
          position: fixed; inset: 0;
          background-image: url('${DESKTOP_BG}');
          background-size: cover;
          background-position: center center;
          z-index: 0;
        }
        .desktop-left::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(
            135deg,
            rgba(10,14,26,0.5) 0%,
            rgba(10,14,26,0.15) 50%,
            rgba(10,14,26,0.55) 100%
          );
        }

        .desktop-brand {
          position: absolute; top: 40px; left: 44px; z-index: 2;
          display: flex; align-items: center; gap: 10px;
        }
        .desktop-brand-icon {
          width: 40px; height: 40px;
          background: rgba(255,255,255,0.1);
          border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.18);
          flex-shrink: 0;
        }
        .desktop-brand-name {
          font-size: 20px; font-weight: 700; color: #fff;
          letter-spacing: -0.4px; line-height: 1.1;
        }
        .desktop-brand-name span { color: #f97316; }
        .desktop-brand-sub {
          font-size: 8.5px; font-weight: 500;
          color: rgba(255,255,255,0.4);
          letter-spacing: 3px; text-transform: uppercase; margin-top: 2px;
        }

        .desktop-hero-text {
          position: absolute; bottom: 64px; left: 44px; right: 500px; z-index: 2;
        }
        .desktop-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 10px; font-weight: 600; color: #f97316;
          letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 16px;
        }
        .desktop-hero-eyebrow::before {
          content: ''; display: block; width: 24px; height: 2px;
          background: #f97316; border-radius: 1px;
        }
        .desktop-hero-headline {
          font-size: clamp(32px, 3.2vw, 48px); font-weight: 700; color: #fff;
          line-height: 1.12; letter-spacing: -1px; margin-bottom: 16px; max-width: 520px;
        }
        .desktop-hero-headline em { font-style: normal; color: #f97316; }
        .desktop-hero-body {
          font-size: 14px; color: rgba(255,255,255,0.5);
          line-height: 1.65; max-width: 400px;
        }

        .desktop-right {
          position: fixed;
          top: 20px; right: 20px; bottom: 20px;
          width: 440px;
          background: #0d1220;
          border: 1.5px solid rgba(255,255,255,0.14);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 0 40px;
          overflow-y: auto;
          z-index: 2;
          scrollbar-width: none;
        }
        .desktop-right::-webkit-scrollbar { display: none; }
        .desktop-right::before,
        .desktop-right::after { content: ''; flex: 1; min-height: 40px; }
        .desktop-right-inner { width: 100%; flex-shrink: 0; }

        @media (min-width: 1024px) {
          .mobile-wrap { display: none; }
          .desktop-wrap { display: block; }
        }

        /* ══════════════════════════════════════════
           SHARED FORM STYLES
        ══════════════════════════════════════════ */
        .form-title {
          font-size: 28px; font-weight: 700; color: #fff;
          letter-spacing: -0.6px; margin-bottom: 8px; line-height: 1.2;
        }
        .form-sub {
          font-size: 14px; color: rgba(255,255,255,0.4);
          line-height: 1.55; margin-bottom: 36px;
        }

        .field { margin-bottom: 20px; }
        .field label {
          display: block; font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.6); margin-bottom: 8px;
        }
        .input-wrap { position: relative; display: flex; align-items: center; }
        .input-icon {
          position: absolute; left: 15px;
          color: rgba(255,255,255,0.22);
          pointer-events: none; display: flex; align-items: center;
        }
        .field input {
          width: 100%;
          padding: 0 15px 0 44px;
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          font-size: 14px; color: #fff;
          outline: none; font-family: inherit;
          transition: border-color 0.2s, background 0.2s;
          height: 52px;
        }
        .field input::placeholder { color: rgba(255,255,255,0.18); }
        .field input:focus {
          border-color: rgba(249,115,22,0.55);
          background: rgba(249,115,22,0.04);
        }
        .eye-btn {
          position: absolute; right: 14px;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.22);
          display: flex; align-items: center; padding: 4px;
          transition: color 0.2s;
        }
        .eye-btn:hover { color: rgba(255,255,255,0.55); }

        .forgot-row {
          display: flex; justify-content: flex-end;
          margin-top: 10px; margin-bottom: 28px;
        }
        .forgot { font-size: 13px; color: #f97316; text-decoration: none; font-weight: 500; }
        .forgot:hover { text-decoration: underline; }

        .btn-signin {
          width: 100%; height: 52px;
          background: #f97316; color: #fff; border: none;
          border-radius: 12px; font-size: 15px; font-weight: 600;
          cursor: pointer; font-family: inherit; letter-spacing: 0.2px;
          transition: background 0.2s, transform 0.1s;
        }
        .btn-signin:hover { background: #ea6c0a; }
        .btn-signin:active { transform: scale(0.99); }
        .btn-signin:disabled {
          opacity: 0.6; cursor: not-allowed; transform: none;
        }
      `}</style>

      {/* ── MOBILE ─────────────────────────────────── */}
      <div className="mobile-wrap">
        <div className="mobile-bg" />

        {view === "splash" && (
          <div className="splash-content">
            <div className="brand-badge">
              <div className="brand-icon">
                <svg width="18" height="18" fill="none" stroke="#f97316" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422A12.083 12.083 0 0112 21a12.083 12.083 0 01-6.16-10.422L12 14z"/>
                </svg>
              </div>
              <div>
                <div className="brand-name">Con<span>nected</span></div>
                <div className="brand-sub">Study Abroad</div>
              </div>
            </div>

            <h1 className="splash-headline">
              Your journey,<br />any <em>destination.</em>
            </h1>
            <p className="splash-body">
              We prepare you for student interviews across the world with expert strategies and model answers.
            </p>

            <div className="dots">
              <div className="dot active" />
              <div className="dot" />
              <div className="dot" />
            </div>

            <button className="btn-start" onClick={handleGetStarted}>
              Get Started
            </button>
          </div>
        )}

        {view === "login" && (
          <div className="login-sheet-overlay">
            <div className="login-sheet-bg" onClick={() => setView("splash")} />
            <div className={`login-sheet ${sliding ? "open" : ""}`} ref={formRef}>
              <button className="mobile-back-btn" onClick={() => setView("splash")}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
              <LoginForm
                email={email} setEmail={setEmail}
                password={password} setPassword={setPassword}
                showPassword={showPassword} setShowPassword={setShowPassword}
                onSubmit={handleSignIn}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── DESKTOP ─────────────────────────────────── */}
      <div className="desktop-wrap">
        <div className="desktop-left">
          <div className="desktop-brand">
            <div className="desktop-brand-icon">
              <svg width="20" height="20" fill="none" stroke="#f97316" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422A12.083 12.083 0 0112 21a12.083 12.083 0 01-6.16-10.422L12 14z"/>
              </svg>
            </div>
            <div>
              <div className="desktop-brand-name">Con<span>nected</span></div>
              <div className="desktop-brand-sub">Study Abroad</div>
            </div>
          </div>

          <div className="desktop-hero-text">
            <div className="desktop-hero-eyebrow">Your global future starts here</div>
            <h2 className="desktop-hero-headline">
              Your journey,<br />any <em>destination.</em>
            </h2>
            <p className="desktop-hero-body">
              We prepare students for university interviews across the world — with expert strategies, mock sessions, and model answers tailored to every destination.
            </p>
          </div>
        </div>

        <div className="desktop-right">
          <div className="desktop-right-inner">
            <LoginForm
              email={email} setEmail={setEmail}
              password={password} setPassword={setPassword}
              showPassword={showPassword} setShowPassword={setShowPassword}
              onSubmit={handleSignIn}
            />
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Shared login form ─────────────────────────────────────────────────────── */
function LoginForm({ email, setEmail, password, setPassword, showPassword, setShowPassword, onSubmit }) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    setSubmitting(true);
    try {
      await onSubmit(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="form-title">Welcome back</h1>
      <p className="form-sub">Sign in to continue your preparation journey.</p>

      <div className="field">
        <label htmlFor="email">Email</label>
        <div className="input-wrap">
          <span className="input-icon">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
            </svg>
          </span>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <div className="input-wrap">
          <span className="input-icon">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
            </svg>
          </span>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
              </svg>
            ) : (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="forgot-row">
        <a href="/forgot-password" className="forgot">Forgot password?</a>
      </div>

      <button type="submit" className="btn-signin" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}