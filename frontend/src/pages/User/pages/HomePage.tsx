import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import {
  LayoutProps, LearningCategory, LearningLesson, LearningModule, loadLearningProgress,
  HelpBox,
  LightHeaderBar, GreetingHeader, PlainSectionTitle,
  TrainingCarousel, ResourceGrid,
  HomeIcon, BookIcon, MicIcon, UserIcon,
} from "./shared";
import { clearAuthSession, getStoredUser } from "../../../utils/session";

// ─── Design tokens ────────────────────────────────────────────────────────────

const tokens = {
  brand:        "#ff5a2c",
  brandLight:   "rgba(255,90,44,0.10)",
  brandMid:     "rgba(255,90,44,0.22)",
  dark:         "#071224",
  darkMid:      "#0d1f3c",
  danger:       "#dc2626",
  dangerLight:  "#fef2f2",
  dangerBorder: "#fecaca",
  surface:      "#ffffff",
  bg:           "#f1f3f6",
  border:       "rgba(0,0,0,0.07)",
  text:         "#111827",
  textMuted:    "#6b7280",
  textSubtle:   "#9ca3af",
  shadow:       "0 2px 12px rgba(0,0,0,0.07)",
  shadowMd:     "0 8px 32px rgba(0,0,0,0.10)",
  shadowLg:     "0 24px 64px rgba(0,0,0,0.16)",
  radius:       "20px",
  radiusSm:     "12px",
  radiusXs:     "8px",
};

const globalStyles = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  * { box-sizing: border-box; }
  html, body, #root { height: 100%; margin: 0; }
  .hp-btn-primary:hover  { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(255,90,44,0.42) !important; }
  .hp-btn-primary:active { transform: translateY(0); }
  .hp-btn-ghost:hover    { background: #f9fafb !important; }
  .hp-avatar-btn:hover   { transform: scale(1.06); box-shadow: 0 6px 20px rgba(255,90,44,0.45) !important; }
  .hp-menu-item:hover         { background: #fff5f0 !important; }
  .hp-menu-item-danger:hover  { background: #fef2f2 !important; }
  .hp-input:focus {
    border-color: #ff5a2c !important;
    box-shadow: 0 0 0 3px rgba(255,90,44,0.13) !important;
    background: #fffaf8 !important;
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileUser {
  id?: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role_id?: number;
  account_expires_at?: string | null;
}

interface HomeLayoutProps extends LayoutProps {
  trainingCategories: LearningCategory[];
  resourceCategories: LearningCategory[];
  loadingCategories: boolean;
  progressByCategory: Record<number, number>;
  continueByCategory: Record<number, { moduleNumber: number; moduleName: string }>;
  user: ProfileUser | null;
  loadingUser: boolean;
  onEditProfile: () => void;
  onLogout: () => void;
}

// ─── Local tabs ───────────────────────────────────────────────────────────────

const tabs: { label: string; icon: (a: boolean) => React.ReactElement }[] = [
  { label: "Home",           icon: (a) => <HomeIcon active={a} /> },
  { label: "Modules",        icon: (a) => <BookIcon active={a} /> },
  { label: "Mock Interview", icon: (a) => <MicIcon  active={a} /> },
  { label: "Profile",        icon: (a) => <UserIcon active={a} /> },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const userName = (user?: ProfileUser | null) => {
  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
  return fullName || user?.name || "Student";
};
const userFirstName = (user?: ProfileUser | null) => {
  if (user?.first_name) return user.first_name;
  const full = userName(user);
  return full.split(/\s+/)[0] || full;
};
const userInitials = (user?: ProfileUser | null) => {
  const name = userName(user);
  return name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "U";
};

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ size = 18, color = tokens.brand }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: "spin 0.9s linear infinite", flexShrink: 0 }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ user, size, fontSize }: { user: ProfileUser | null; size: number; fontSize: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "#000000",
      color: "white", display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 900, fontSize, flexShrink: 0, letterSpacing: -0.5, userSelect: "none",
    }}>
      {userInitials(user)}
    </div>
  );
}

// ─── RoleBadge ────────────────────────────────────────────────────────────────

function RoleBadge({ roleId }: { roleId?: number }) {
  const label = roleId === 1 ? "Admin" : roleId === 2 ? "Instructor" : "Student";
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, color: tokens.brand,
      background: tokens.brandLight, border: `1px solid ${tokens.brandMid}`,
      borderRadius: 20, padding: "2px 10px", letterSpacing: 0.5, textTransform: "uppercase",
    }}>
      {label}
    </span>
  );
}

// ─── MenuIcon ─────────────────────────────────────────────────────────────────

function MenuIcon({ type }: { type: "profile" | "logout" }) {
  const isProfile = type === "profile";
  return (
    <span style={{
      width: 30, height: 30, borderRadius: tokens.radiusXs,
      background: isProfile ? tokens.brandLight : tokens.dangerLight,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      {isProfile ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tokens.brand} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tokens.danger} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      )}
    </span>
  );
}

// ─── ProfileMenu ──────────────────────────────────────────────────────────────

function ProfileMenu({ user, size, onEditProfile, onLogout }: {
  user: ProfileUser | null; size: number;
  onEditProfile: () => void; onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen((v) => !v)}
        aria-label="Open profile menu" aria-expanded={open}
        className="hp-avatar-btn"
        style={{
          width: size, height: size, borderRadius: "50%",
          border: `2.5px solid ${open ? tokens.brand : "rgba(255,255,255,0.25)"}`,
          padding: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "transparent", cursor: "pointer",
          boxShadow: "0 4px 14px rgba(255,90,44,0.30)",
          transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s", outline: "none",
        }}>
        <Avatar user={user} size={size - 6} fontSize={size > 36 ? 14 : 12} />
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 19 }} onClick={() => setOpen(false)} aria-hidden="true" />
          <div style={{
            position: "absolute", right: 0, top: size + 10, zIndex: 20, width: 240,
            borderRadius: tokens.radius, background: tokens.surface,
            border: `1px solid ${tokens.border}`, boxShadow: tokens.shadowLg,
            overflow: "hidden", animation: "fadeIn 0.15s ease",
          }}>
            <div style={{
              background: `linear-gradient(135deg, ${tokens.dark} 0%, ${tokens.darkMid} 100%)`,
              padding: "16px 16px 14px", display: "flex", alignItems: "center", gap: 12,
            }}>
              <Avatar user={user} size={42} fontSize={14} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {userName(user)}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.email || ""}
                </div>
              </div>
            </div>
            <div style={{ padding: "6px 6px 8px" }}>
              <button type="button" className="hp-menu-item"
                onClick={() => { setOpen(false); onEditProfile(); }}
                style={{
                  width: "100%", border: "none", background: "transparent", textAlign: "left",
                  padding: "10px 12px", borderRadius: tokens.radiusSm, cursor: "pointer",
                  fontSize: 13, fontWeight: 700, color: tokens.text,
                  display: "flex", alignItems: "center", gap: 10, transition: "background 0.12s",
                }}>
                <MenuIcon type="profile" />Update profile
              </button>
              <div style={{ height: 1, background: "#f1f5f9", margin: "4px 6px" }} />
              <button type="button" className="hp-menu-item-danger"
                onClick={() => { setOpen(false); onLogout(); }}
                style={{
                  width: "100%", border: "none", background: "transparent", textAlign: "left",
                  padding: "10px 12px", borderRadius: tokens.radiusSm, cursor: "pointer",
                  fontSize: 13, fontWeight: 700, color: tokens.danger,
                  display: "flex", alignItems: "center", gap: 10, transition: "background 0.12s",
                }}>
                <MenuIcon type="logout" />Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── InfoRow ──────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value, last }: {
  icon?: React.ReactNode; label: string; value: string; last?: boolean;
}) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "13px 0", borderBottom: last ? "none" : "1px solid #f1f5f9", gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
        {icon && (
          <span style={{
            width: 28, height: 28, borderRadius: tokens.radiusXs,
            background: tokens.brandLight, display: "flex", alignItems: "center", justifyContent: "center",
          }}>{icon}</span>
        )}
        <span style={{ fontSize: 12, color: tokens.textMuted, fontWeight: 600 }}>{label}</span>
      </div>
      <span style={{
        fontSize: 12, color: tokens.text, fontWeight: 700,
        textAlign: "right", overflow: "hidden", textOverflow: "ellipsis",
        whiteSpace: "nowrap", maxWidth: "60%",
      }}>{value}</span>
    </div>
  );
}

// ─── Icon helpers ─────────────────────────────────────────────────────────────

const ip = { width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: tokens.brand, strokeWidth: "2", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const CalendarIcon = () => <svg {...ip}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const TeamIcon     = () => <svg {...ip}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const EmailIcon    = () => <svg {...ip}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;

// ─── ProfileView ──────────────────────────────────────────────────────────────

function ProfileView({ user, loadingUser, onEditProfile, onLogout, isDesktop }: {
  user: ProfileUser | null; loadingUser: boolean;
  onEditProfile: () => void; onLogout: () => void; isDesktop: boolean;
}) {
  if (loadingUser) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 64, color: tokens.textMuted, fontSize: 13, gap: 10, fontWeight: 600 }}>
        <Spinner />Loading profile…
      </div>
    );
  }

  const avatarSize = isDesktop ? 76 : 60;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: isDesktop ? 540 : undefined, animation: "fadeIn 0.2s ease" }}>
      <div style={{ borderRadius: tokens.radius, overflow: "hidden", boxShadow: tokens.shadowMd, border: `1px solid ${tokens.border}` }}>
        <div style={{
          background: `linear-gradient(135deg, ${tokens.dark} 0%, ${tokens.darkMid} 60%, #0a1a35 100%)`,
          padding: isDesktop ? "32px 28px 24px" : "22px 20px 18px",
          display: "flex", alignItems: "center", gap: 18,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,90,44,0.07)" }} />
          <div style={{ position: "absolute", bottom: -20, right: 80, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,90,44,0.05)" }} />
          <div style={{ border: "3px solid rgba(255,255,255,0.15)", borderRadius: "50%", padding: 2, zIndex: 1, flexShrink: 0, boxShadow: "0 4px 20px rgba(255,90,44,0.35)" }}>
            <Avatar user={user} size={avatarSize} fontSize={isDesktop ? 24 : 20} />
          </div>
          <div style={{ minWidth: 0, zIndex: 1 }}>
            <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 900, color: "white", lineHeight: 1.15, letterSpacing: -0.6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userName(user)}
            </div>
            <div style={{ marginTop: 7 }}><RoleBadge roleId={user?.role_id} /></div>
            {user?.email && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 6 }}>{user.email}</div>}
          </div>
        </div>
        <div style={{ background: tokens.surface, padding: isDesktop ? "4px 28px 6px" : "4px 20px 6px" }}>
          {user?.account_expires_at && (
            <InfoRow icon={<CalendarIcon />} label="Access expires"
              value={new Date(user.account_expires_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} />
          )}
          {user?.role_id !== undefined && (
            <InfoRow icon={<TeamIcon />} label="Role"
              value={user?.role_id === 1 ? "Administrator" : user?.role_id === 2 ? "Instructor" : "Student"} />
          )}
          {user?.email && <InfoRow icon={<EmailIcon />} label="Email" value={user.email} last />}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" onClick={onEditProfile} className="hp-btn-primary"
          style={{
            flex: 1, padding: "14px 0", borderRadius: 16, border: "none",
            background: `linear-gradient(135deg, ${tokens.brand} 0%, #ff7a50 100%)`,
            color: "white", fontSize: 13, fontWeight: 800, cursor: "pointer",
            boxShadow: "0 4px 16px rgba(255,90,44,0.32)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "transform 0.15s, box-shadow 0.15s",
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit Profile
        </button>
        <button type="button" onClick={onLogout} className="hp-btn-ghost"
          style={{
            flex: 1, padding: "13px 0", borderRadius: 16,
            border: `1.5px solid ${tokens.dangerBorder}`, background: tokens.surface,
            color: tokens.danger, fontSize: 13, fontWeight: 800, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "background 0.12s",
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tokens.danger} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── ProfileInput ─────────────────────────────────────────────────────────────

function ProfileInput({ label, value, onChange, type = "text", required = false, placeholder }: {
  label: string; value: string; onChange: (value: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ display: "block", marginBottom: 7, fontSize: 12, fontWeight: 700, color: focused ? tokens.brand : "#374151", transition: "color 0.15s" }}>
        {label}{required && <span style={{ color: tokens.brand, marginLeft: 3 }}>*</span>}
      </span>
      <input type={type} required={required} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="hp-input"
        style={{
          width: "100%", border: `1.5px solid ${focused ? tokens.brand : "#e5e7eb"}`,
          borderRadius: tokens.radiusSm, padding: "11px 14px", fontSize: 13, outline: "none",
          transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
          boxShadow: focused ? "0 0 0 3px rgba(255,90,44,0.12)" : "none",
          background: focused ? "#fffaf8" : tokens.surface,
          fontFamily: "inherit", color: tokens.text,
        }}
      />
    </label>
  );
}

// ─── ProfileEditModal ─────────────────────────────────────────────────────────

function ProfileEditModal({ user, saving, error, onClose, onSave }: {
  user: ProfileUser | null; saving: boolean; error: string;
  onClose: () => void;
  onSave: (payload: { first_name: string; last_name: string; email: string; password: string }) => void;
}) {
  const [form, setForm] = useState({
    first_name: user?.first_name || "", last_name: user?.last_name || "",
    email: user?.email || "", password: "",
  });

  useEffect(() => {
    setForm({ first_name: user?.first_name || "", last_name: user?.last_name || "", email: user?.email || "", password: "" });
  }, [user]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 60, background: "rgba(7,18,36,0.65)",
      backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
      justifyContent: "center", padding: 16, animation: "fadeIn 0.15s ease",
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}
        style={{ width: "100%", maxWidth: 460, borderRadius: tokens.radius, background: tokens.surface, boxShadow: "0 32px 80px rgba(0,0,0,0.30)", overflow: "hidden" }}>
        <div style={{ background: `linear-gradient(135deg, ${tokens.dark} 0%, ${tokens.darkMid} 100%)`, padding: "22px 24px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: "white", letterSpacing: -0.5 }}>Edit Profile</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 3 }}>Update your personal information</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close"
            style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.07)", cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.12s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px 26px" }}>
          {error && (
            <div style={{ marginBottom: 18, borderRadius: tokens.radiusSm, background: tokens.dangerLight, border: `1px solid ${tokens.dangerBorder}`, color: "#b91c1c", padding: "11px 14px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <ProfileInput label="First name" value={form.first_name} onChange={(v) => setForm((c) => ({ ...c, first_name: v }))} required />
            <ProfileInput label="Last name"  value={form.last_name}  onChange={(v) => setForm((c) => ({ ...c, last_name: v  }))} required />
          </div>
          <ProfileInput label="Email address"  type="email"    value={form.email}    onChange={(v) => setForm((c) => ({ ...c, email: v }))} required />
          <ProfileInput label="New password"   type="password" value={form.password} onChange={(v) => setForm((c) => ({ ...c, password: v }))} placeholder="Leave blank to keep current" />
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <button type="button" onClick={onClose} disabled={saving} className="hp-btn-ghost"
              style={{ flex: 1, border: "1.5px solid #e5e7eb", borderRadius: 14, background: tokens.surface, padding: "13px 0", fontSize: 13, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", color: "#374151", transition: "background 0.12s", opacity: saving ? 0.6 : 1 }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              style={{ flex: 2, border: "none", borderRadius: 14, background: saving ? "#ffb89c" : `linear-gradient(135deg, ${tokens.brand} 0%, #ff7a50 100%)`, color: "white", padding: "13px 0", fontSize: 13, fontWeight: 900, cursor: saving ? "not-allowed" : "pointer", boxShadow: saving ? "none" : "0 4px 14px rgba(255,90,44,0.32)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "opacity 0.15s" }}>
              {saving ? <><Spinner size={14} color="white" /> Saving…</> : <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Save Changes
              </>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── Page title ───────────────────────────────────────────────────────────────

function PageTitle({ label, isDesktop }: { label: string; isDesktop: boolean }) {
  return (
    <div style={{ fontWeight: 900, fontSize: isDesktop ? 30 : 24, color: tokens.text, letterSpacing: isDesktop ? -0.8 : -0.6, marginBottom: isDesktop ? 20 : 16, lineHeight: 1.1 }}>
      {label}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ children, mb = 14 }: { children: React.ReactNode; mb?: number }) {
  return <div style={{ marginBottom: mb }}>{children}</div>;
}

// ─── Mobile Layout ─────────────────────────────────────────────────────────────

function MobileHome({
  tab, setTab, onContinue,
  trainingCategories, resourceCategories, loadingCategories,
  progressByCategory, continueByCategory,
  user, loadingUser, onEditProfile, onLogout,
}: HomeLayoutProps) {
  const isProfile = tab === "Profile";
  const cardW = Math.min((typeof window !== "undefined" ? window.innerWidth : 375) - 40, 290);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", width: "100%", overflow: "hidden", background: tokens.bg }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", padding: "12px 18px 20px", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>

        {/* Header */}
        <LightHeaderBar>
          <ProfileMenu user={user} size={36} onEditProfile={onEditProfile} onLogout={onLogout} />
        </LightHeaderBar>

        {isProfile ? (
          <div style={{ paddingTop: 16, animation: "fadeIn 0.2s ease" }}>
            <PageTitle label="My Profile" isDesktop={false} />
            <ProfileView user={user} loadingUser={loadingUser} onEditProfile={onEditProfile} onLogout={onLogout} isDesktop={false} />
          </div>
        ) : (
          <div style={{ animation: "fadeIn 0.2s ease" }}>
            <GreetingHeader name={userFirstName(user)} />

            <Section mb={14}>
              <PlainSectionTitle title="Training" />
              <TrainingCarousel
                variant="mobile"
                categories={trainingCategories} loading={loadingCategories}
                progressByCategory={progressByCategory} continueByCategory={continueByCategory}
                onContinue={onContinue} emptyText="No training courses assigned yet."
                cardWidth={cardW} cardHeight={390}
              />
            </Section>

            <Section mb={12}>
              <PlainSectionTitle title="Resources" />
              <ResourceGrid categories={resourceCategories} loading={loadingCategories} onContinue={onContinue} emptyText="No resource courses assigned yet." />
            </Section>

            <HelpBox desktop={false} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Desktop Layout ───────────────────────────────────────────────────────────

function DesktopHome({
  tab, setTab, onContinue,
  trainingCategories, resourceCategories, loadingCategories,
  progressByCategory, continueByCategory,
  user, loadingUser, onEditProfile, onLogout,
}: HomeLayoutProps) {
  const isProfile = tab === "Profile";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden", background: tokens.bg }}>
      <div style={{ padding: "20px 48px 0", flexShrink: 0 }}>
        <LightHeaderBar>
          <ProfileMenu user={user} size={44} onEditProfile={onEditProfile} onLogout={onLogout} />
        </LightHeaderBar>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", padding: "0 48px 40px" }}>
        {isProfile ? (
          <div style={{ paddingTop: 30, animation: "fadeIn 0.2s ease" }}>
            <PageTitle label="My Profile" isDesktop={true} />
            <ProfileView user={user} loadingUser={loadingUser} onEditProfile={onEditProfile} onLogout={onLogout} isDesktop={true} />
          </div>
        ) : (
          <div style={{ animation: "fadeIn 0.2s ease" }}>
            <GreetingHeader name={userFirstName(user)} />
            <Section mb={20}>
              <PlainSectionTitle title="Training" />
              <TrainingCarousel
                variant="desktop"
                categories={trainingCategories} loading={loadingCategories}
                progressByCategory={progressByCategory} continueByCategory={continueByCategory}
                onContinue={onContinue} emptyText="No training courses assigned yet."
                cardWidth={380} cardHeight={260}
              />
            </Section>
            <Section mb={16}>
              <PlainSectionTitle title="Resources" />
              <ResourceGrid categories={resourceCategories} loading={loadingCategories} onContinue={onContinue} emptyText="No resource courses assigned yet." />
            </Section>
            <HelpBox desktop={true} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tablet Layout (640–1023px) ───────────────────────────────────────────────

function TabletHome({
  tab, setTab, onContinue,
  trainingCategories, resourceCategories, loadingCategories,
  progressByCategory, continueByCategory,
  user, loadingUser, onEditProfile, onLogout,
}: HomeLayoutProps) {
  const isProfile = tab === "Profile";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden", background: tokens.bg }}>
      <div style={{ padding: "16px 28px 0", flexShrink: 0 }}>
        <LightHeaderBar>
          <ProfileMenu user={user} size={40} onEditProfile={onEditProfile} onLogout={onLogout} />
        </LightHeaderBar>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", padding: "0 28px 28px", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
        {isProfile ? (
          <div style={{ paddingTop: 20, animation: "fadeIn 0.2s ease" }}>
            <PageTitle label="My Profile" isDesktop={false} />
            <ProfileView user={user} loadingUser={loadingUser} onEditProfile={onEditProfile} onLogout={onLogout} isDesktop={false} />
          </div>
        ) : (
          <div style={{ animation: "fadeIn 0.2s ease" }}>
            <GreetingHeader name={userFirstName(user)} />
            <Section mb={16}>
              <PlainSectionTitle title="Training" />
              <TrainingCarousel
                variant="tablet"
                categories={trainingCategories} loading={loadingCategories}
                progressByCategory={progressByCategory} continueByCategory={continueByCategory}
                onContinue={onContinue} emptyText="No training courses assigned yet."
                cardWidth={300} cardHeight={240}
              />
            </Section>
            <Section mb={14}>
              <PlainSectionTitle title="Resources" />
              <ResourceGrid categories={resourceCategories} loading={loadingCategories} onContinue={onContinue} emptyText="No resource courses assigned yet." />
            </Section>
            <HelpBox desktop={false} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Exported Page ────────────────────────────────────────────────────────────

export default function HomePage({ tab, setTab, onContinue }: LayoutProps) {
  const navigate = useNavigate();

  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 768
  );

  const isMobile  = viewportWidth < 640;
  const isTablet  = viewportWidth >= 640 && viewportWidth < 1024;
  const isDesktop = viewportWidth >= 1024;

  const [categories,         setCategories]         = useState<LearningCategory[]>([]);
  const [loadingCategories,  setLoadingCategories]  = useState(true);
  const [progressByCategory, setProgressByCategory] = useState<Record<number, number>>({});
  const [continueByCategory, setContinueByCategory] = useState<Record<number, { moduleNumber: number; moduleName: string }>>({});
  const [user,               setUser]               = useState<ProfileUser | null>(() => getStoredUser() as ProfileUser | null);
  const [loadingUser,        setLoadingUser]        = useState(true);
  const [editingProfile,     setEditingProfile]     = useState(false);
  const [savingProfile,      setSavingProfile]      = useState(false);
  const [profileError,       setProfileError]       = useState("");

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    api.get("/profile")
      .then((res) => setUser(res.data?.user ?? res.data ?? null))
      .catch(() => setUser(getStoredUser() as ProfileUser | null))
      .finally(() => setLoadingUser(false));
  }, []);

  useEffect(() => {
    api.get("/my-categories")
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadHomeProgress = async () => {
      const results = await Promise.all(
        categories.map(async (category) => {
          try {
            const modulesRes = await api.get(`/categories/${category.id}/modules`);
            const modules: LearningModule[] = Array.isArray(modulesRes.data) ? modulesRes.data : [];
            const lessonGroups = await Promise.all(
              modules.map(async (module) => {
                try {
                  const lessonsRes = await api.get(`/modules/${module.id}/lessons`);
                  return Array.isArray(lessonsRes.data) ? lessonsRes.data : [];
                } catch { return []; }
              })
            );
            const lessonIds    = lessonGroups.flat().map((l: LearningLesson) => l.id);
            const completedIds = await loadLearningProgress(category.id);
            const completedCount = lessonIds.filter((id) => completedIds.includes(id)).length;
            const progress = lessonIds.length > 0 ? Math.round((completedCount / lessonIds.length) * 100) : 0;
            const continueIndex = modules.findIndex((_m, index) => {
              const lessons = lessonGroups[index] || [];
              return lessons.length === 0 || lessons.some((l: LearningLesson) => !completedIds.includes(l.id));
            });
            const moduleIndex   = continueIndex >= 0 ? continueIndex : 0;
            const currentModule = modules[moduleIndex];
            return {
              categoryId: category.id, progress,
              continueModule: currentModule ? { moduleNumber: moduleIndex + 1, moduleName: currentModule.title } : undefined,
            };
          } catch {
            return { categoryId: category.id, progress: 0, continueModule: undefined };
          }
        })
      );
      if (!cancelled) {
        setProgressByCategory(Object.fromEntries(results.map((r) => [r.categoryId, r.progress])));
        setContinueByCategory(Object.fromEntries(results.filter((r) => r.continueModule).map((r) => [r.categoryId, r.continueModule!])));
      }
    };

    if (categories.length) { loadHomeProgress(); }
    else { setProgressByCategory({}); setContinueByCategory({}); }
    return () => { cancelled = true; };
  }, [categories]);

  const handleLogout = () => { clearAuthSession(); navigate("/signin"); };
  const handleEditProfile = () => { setProfileError(""); setEditingProfile(true); };

  const handleSaveProfile = async (payload: { first_name: string; last_name: string; email: string; password: string }) => {
    setSavingProfile(true); setProfileError("");
    try {
      const body: Record<string, string> = { first_name: payload.first_name, last_name: payload.last_name, email: payload.email };
      if (payload.password.trim()) body.password = payload.password;
      const res = await api.put("/profile", body);
      const updated = res.data?.user ?? res.data;
      setUser(updated);
      sessionStorage.setItem("user", JSON.stringify(updated));
      setEditingProfile(false);
    } catch (error: any) {
      setProfileError(error?.response?.data?.message || "Failed to update profile.");
    } finally { setSavingProfile(false); }
  };

  const trainingCategories = useMemo(() => categories.filter((c) => (c.type || "training") !== "resource"), [categories]);
  const resourceCategories = useMemo(() => categories.filter((c) => c.type === "resource"), [categories]);

  const sharedProps: HomeLayoutProps = {
    tab, setTab, onContinue,
    trainingCategories, resourceCategories, loadingCategories,
    progressByCategory, continueByCategory,
    user, loadingUser,
    onEditProfile: handleEditProfile, onLogout: handleLogout,
  };

  return (
    <>
      <style>{globalStyles}</style>

      {isMobile  ? <MobileHome  {...sharedProps} /> :
       isTablet  ? <TabletHome  {...sharedProps} /> :
                   <DesktopHome {...sharedProps} />}

      {editingProfile && (
        <ProfileEditModal
          user={user} saving={savingProfile} error={profileError}
          onClose={() => setEditingProfile(false)} onSave={handleSaveProfile}
        />
      )}
    </>
  );
}