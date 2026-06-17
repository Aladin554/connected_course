import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  clearAuthSession,
  getStoredUser,
  isAuthSessionExpired,
  isPanelActive,
  persistAuthSession,
} from "../../utils/session";

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

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const roleId = sessionStorage.getItem("role_id");

    if (token) {
      if (isAuthSessionExpired()) {
        clearAuthSession();
        setLoading(false);
        return;
      }
      const numericRoleId = roleId ? parseInt(roleId, 10) : null;

      if (numericRoleId === 3) {
        navigate("/introduction", { replace: true });
      } else if (numericRoleId === 1 || numericRoleId === 2) {
        const user = getStoredUser();
        navigate(isPanelActive(user) ? "/choose-dashboard" : "/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } else {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) return null;

  /* ── Animation helpers ────────────────────────────────────────────────── */

  // Mount sheet first (hidden at translateY 100%), then on the very next
  // two animation frames flip .open so the CSS transition actually fires.
  const handleGetStarted = () => {
    setView("login");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSliding(true);
      });
    });
  };

  // Slide back down first, then unmount after the transition ends.
  const handleBack = () => {
    setSliding(false);
    setTimeout(() => setView("splash"), 420);
  };

  /* ── Auth submit ──────────────────────────────────────────────────────── */

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
      } else if (user.role_id === 1 || user.role_id === 2) {
        navigate(isPanelActive(user) ? "/choose-dashboard" : "/dashboard", { replace: true });
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Inter';
        }

        body {
          background: #0a0e1a;
          min-height: 100dvh;
          overflow-x: hidden;
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
            rgba(10,14,26,0.0) 0%,
            rgba(10,14,26,0.0) 40%,
            rgba(10,14,26,0.75) 65%,
            rgba(10,14,26,0.97) 80%,
            rgba(10,14,26,1.0) 100%
          );
        }

        /* ── Splash ── */
        .splash-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          min-height: 100dvh;
          padding: 0 24px 44px;
        }

        .splash-headline {
          font-size: 40px;
          font-weight: 800;
          color: #fff;
          line-height: 1.05;
          letter-spacing: -1px;
          margin-bottom: 4px;
          text-align: center;
        }
        .splash-headline-orange {
          font-size: 35px;
          font-weight: 800;
          color: #f97316;
          line-height: 1.05;
          letter-spacing: -1px;
          margin-bottom: 14px;
          text-align: center;
          display: block;
        }
        .splash-body {
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          line-height: 1.55;
          margin-bottom: 32px;
          text-align: center;
        }
        .btn-start {
          width: 100%;
          padding: 18px;
          background: #f97316;
          color: #fff;
          border: none;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.1px;
          transition: background 0.2s, transform 0.1s;
        }
        .btn-start:hover { background: #ea6c0a; }
        .btn-start:active { transform: scale(0.99); }

        /* ── Mobile login sheet ── */
        .login-sheet-overlay {
          position: fixed;
          inset: 0;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        /* Dim backdrop — fades in alongside the slide */
        .login-sheet-bg {
          position: absolute;
          inset: 0;
          background: rgba(10,14,26,0.55);
          opacity: 0;
          transition: opacity 0.4s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .login-sheet-bg.visible {
          opacity: 1;
        }

        .login-sheet {
          position: relative;
          z-index: 1;
          background: #0d1220;
          border-radius: 28px 28px 0 0;
          padding: 52px 28px 48px;
          /* START hidden below the viewport */
          transform: translateY(100%);
          transition: transform 0.45s cubic-bezier(0.32, 0.72, 0, 1);
          max-height: 92dvh;
          overflow-y: auto;
          scrollbar-width: none;
          /* Drag handle visual hint */
          box-shadow: 0 -4px 40px rgba(0,0,0,0.4);
        }
        .login-sheet::-webkit-scrollbar { display: none; }

        /* .open triggers the upward slide */
        .login-sheet.open {
          transform: translateY(0);
        }

        /* Small pill handle at the top of the sheet */
        .sheet-handle {
          width: 40px;
          height: 4px;
          background: rgba(255,255,255,0.15);
          border-radius: 4px;
          margin: 0 auto 32px;
        }

        .mobile-back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: rgba(255,255,255,0.5);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          margin-bottom: 28px;
          transition: color 0.2s;
        }
        .mobile-back-btn:hover { color: #fff; }

        /* ══════════════════════════════════════════
           DESKTOP  (≥ 1024 px)
        ══════════════════════════════════════════ */
        .desktop-wrap {
          display: none;
          width: 100%;
          height: 100dvh;
          background: #0a0e1a;
          align-items: center;
          justify-content: center;
          padding: 24px;
          gap: 20px;
          overflow: hidden;
        }

        .desktop-left-card {
          flex: 1 1 0%;
          height: calc(100dvh - 48px);
          max-height: 860px;
          max-width: 860px;
          border-radius: 28px;
          overflow: hidden;
          position: relative;
          background: #000;
          border: 1.5px solid rgba(255,255,255,0.08);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.03), 0 24px 64px rgba(0,0,0,0.5);
        }

        .desktop-left-img {
          position: absolute;
          inset: 0;
          background-image: url('${DESKTOP_BG}');
          background-size: cover;
          background-position: center center;
          z-index: 0;
        }
        .desktop-left-img::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.0) 0%,
            rgba(0,0,0,0.0) 48%,
            rgba(0,0,0,0.55) 75%,
            rgba(0,0,0,0.85) 100%
          );
        }

        .desktop-brand-top {
          position: absolute;
          top: 32px;
          z-index: 2;
          display: flex;
          align-items: center;
        }

        .desktop-hero-bottom {
          position: absolute;
          bottom: 44px; left: 40px; right: 40px;
          z-index: 2;
        }
        .desktop-hero-headline {
          font-size: 48px;
          font-weight: 800;
          color: #fff;
          line-height: 1.05;
          letter-spacing: -1.5px;
          margin-bottom: 4px;
        }
        .desktop-hero-headline-orange {
          font-size: 48px;
          font-weight: 800;
          color: #f97316;
          line-height: 1.05;
          letter-spacing: -1.5px;
          margin-bottom: 16px;
          display: block;
        }
        .desktop-hero-body {
          font-size: 16px;
          color: rgba(255,255,255,0.6);
          line-height: 1.6;
          max-width: 460px;
        }

        .desktop-right-card {
          width: 460px;
          height: calc(100dvh - 48px);
          max-height: 860px;
          background: #0d1220;
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 28px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 48px;
          flex-shrink: 0;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.03), 0 24px 64px rgba(0,0,0,0.5);
        }

        @media (min-width: 1024px) {
          .mobile-wrap  { display: none; }
          .desktop-wrap { display: flex; }
        }

        /* ══════════════════════════════════════════
           SHARED FORM STYLES
        ══════════════════════════════════════════ */
        .form-title {
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.6px;
          margin-bottom: 8px;
          line-height: 1.1;
        }
        .form-title-dot { color: #f97316; }
        .form-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          line-height: 1.55;
          margin-bottom: 22px;
        }

        .field { margin-bottom: 22px; }
        .field label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.7);
          margin-bottom: 10px;
          letter-spacing: 0.1px;
        }
        .input-wrap { position: relative; display: flex; align-items: center; }
        .input-icon {
          position: absolute; left: 18px;
          color: rgba(255,255,255,0.2);
          pointer-events: none;
          display: flex; align-items: center;
        }
        .field input {
          width: 100%;
          padding: 0 18px 0 50px;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          font-size: 15px;
          color: #fff;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          height: 58px;
        }
        .field input::placeholder { color: rgba(255,255,255,0.2); }
        .field input:focus {
          border-color: rgba(249,115,22,0.5);
          background: rgba(249,115,22,0.03);
        }
        .eye-btn {
          position: absolute; right: 16px;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.22);
          display: flex; align-items: center; padding: 6px;
          transition: color 0.2s;
        }
        .eye-btn:hover { color: rgba(255,255,255,0.55); }

        .forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 14px;
          margin-bottom: 32px;
        }
        .forgot {
          font-size: 13px;
          color: #f97316;
          text-decoration: none;
          font-weight: 500;
        }
        .forgot:hover { text-decoration: underline; }

        .field input:-webkit-autofill,
        .field input:-webkit-autofill:hover,
        .field input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #0d1220 inset !important;
          -webkit-text-fill-color: #fff !important;
          border-color: rgba(255,255,255,0.08) !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        .btn-signin {
          width: 100%;
          height: 58px;
          background: #f97316;
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.2px;
          transition: background 0.2s, transform 0.1s;
        }
        .btn-signin:hover { background: #ea6c0a; }
        .btn-signin:active { transform: scale(0.99); }
        .btn-signin:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
      `}</style>

      {/* ── MOBILE ─────────────────────────────────── */}
      <div className="mobile-wrap">
        <div className="mobile-bg" />

        {/* Splash is always mounted so the bg image doesn't flash away */}
        <div className="splash-content" style={{ display: view === "login" ? "none" : "flex" }}>
          <img
            src="/images/logo/connected_logo_dark.png"
            alt="Connected"
            style={{
              width: "140px",
              objectFit: "contain",
              display: "block",
              margin: "0 auto 16px",
            }}
          />
          <h1 className="splash-headline">Your Future.</h1>
          <span className="splash-headline-orange">Any Destination.</span>
          <p className="splash-body">
            Your complete preparation platform for{" "}
            <strong style={{ fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
              studying abroad
            </strong>
            .
          </p>
          <button className="btn-start" onClick={handleGetStarted}>
            Get Started
          </button>
        </div>

        {/* Sheet is mounted as soon as view === "login" so the transition
            has a DOM node to work with before we add .open */}
        {view === "login" && (
          <div className="login-sheet-overlay">
            {/* Backdrop — fades in when sliding is true */}
            <div
              className={`login-sheet-bg ${sliding ? "visible" : ""}`}
              onClick={handleBack}
            />

            {/* Sheet — slides up when .open is added */}
            <div className={`login-sheet ${sliding ? "open" : ""}`} ref={formRef}>
              {/* Drag handle pill */}
              <div className="sheet-handle" />

              <button className="mobile-back-btn" onClick={handleBack}>
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <LoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                onSubmit={handleSignIn}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── DESKTOP ─────────────────────────────────── */}
      <div className="desktop-wrap">
        {/* Left: Image card */}
        <div className="desktop-left-card">
          <div className="desktop-left-img" />

          <div className="desktop-brand-top">
            <img
              src="/images/logo/connected_logo_dark.png"
              alt="Connected Logo Dark"
              style={{ width: "215px", height: "45px", objectFit: "contain" }}
            />
          </div>

          <div className="desktop-hero-bottom">
            <h2 className="desktop-hero-headline">Your Future.</h2>
            <span className="desktop-hero-headline-orange">Any Destination.</span>
            <p className="desktop-hero-body">
              Your complete preparation platform for{" "}
              <strong style={{ fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>
                studying abroad
              </strong>
              .
            </p>
          </div>
        </div>

        {/* Right: Form card */}
        <div className="desktop-right-card">
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onSubmit={handleSignIn}
          />
        </div>
      </div>
    </>
  );
}

/* ── Shared login form ─────────────────────────────────────────────────────── */
function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  onSubmit,
}: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}) {
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
      <h1 className="form-title">
        Welcome<span className="form-title-dot">.</span>
      </h1>
      <p className="form-sub">Sign in to get access to your training materials.</p>

      <div className="field">
        <label htmlFor="email">Email</label>
        <div className="input-wrap">
          <span className="input-icon">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </span>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
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
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
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
          <button
            type="button"
            className="eye-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="forgot-row">
        <a href="/forgot-password" className="forgot">
          Forgot password?
        </a>
      </div>

      <button type="submit" className="btn-signin" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
