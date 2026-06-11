import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import {
  categoryImage,
  Bar, SectionHeader, HeroCard, HelpBox,
  HomeIcon, BookIcon, MicIcon, UserIcon,
  LayoutProps, LearningCategory, LearningLesson, LearningModule, loadLearningProgress,
} from "./shared";
import { clearAuthSession, getStoredUser } from "../../../utils/session";

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
  categories: LearningCategory[];
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

const userInitials = (user?: ProfileUser | null) => {
  const name = userName(user);
  return (
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
};

// ─── Logo Component ───────────────────────────────────────────────────────────

function Logo() {
  return (
    <img
      src="/images/logo/connected_logo.png"
      alt="Connected Logo"
      className="dark:hidden transition-transform duration-300 group-hover:scale-105 w-[150px] h-[30px]"
      style={{ width: 150, height: 30, objectFit: "contain" }}
    />
  );
}

// ─── ProfileMenu (header avatar dropdown) ─────────────────────────────────────

function ProfileMenu({
  user,
  size,
  onEditProfile,
  onLogout,
}: {
  user: ProfileUser | null;
  size: number;
  onEditProfile: () => void;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open profile menu"
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          border: "2px solid #22c55e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: size > 34 ? 13 : 11,
          color: "white",
          background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(34,197,94,0.35)",
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
      >
        {userInitials(user)}
        <span
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: size > 34 ? 10 : 8,
            height: size > 34 ? 10 : 8,
            borderRadius: "50%",
            background: "#4ade80",
            border: "2px solid white",
            boxShadow: "0 0 0 1px rgba(34,197,94,0.3)",
          }}
        />
      </button>
      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 19 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: size + 12,
              zIndex: 20,
              width: 232,
              borderRadius: 18,
              background: "white",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 20px 48px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            {/* Header strip */}
            <div
              style={{
                background: "linear-gradient(135deg, #071224 0%, #0f2040 100%)",
                padding: "16px 16px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #16a34a, #22c55e)",
                  border: "2px solid rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 14,
                  color: "white",
                  flexShrink: 0,
                }}
              >
                {userInitials(user)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "white",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {userName(user)}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.5)",
                    marginTop: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.email || ""}
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div style={{ padding: 8 }}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onEditProfile();
                }}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#111827",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf4")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: "#f0fdf4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                Update profile
              </button>
              <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: "#fef2f2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </span>
                Log out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── ProfileView ──────────────────────────────────────────────────────────────

function ProfileView({
  user,
  loadingUser,
  onEditProfile,
  onLogout,
  isDesktop,
}: {
  user: ProfileUser | null;
  loadingUser: boolean;
  onEditProfile: () => void;
  onLogout: () => void;
  isDesktop: boolean;
}) {
  if (loadingUser) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 56,
          color: "#9ca3af",
          fontSize: 13,
          gap: 10,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ animation: "spin 1s linear infinite" }}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        Loading profile…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const roleName =
    user?.role_id === 1 ? "Admin" : user?.role_id === 2 ? "Instructor" : "Student";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxWidth: isDesktop ? 580 : undefined,
      }}
    >
      {/* Avatar + name card */}
      <div
        style={{
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* Dark header strip with gradient */}
        <div
          style={{
            background: "linear-gradient(135deg, #071224 0%, #0d1f3c 60%, #071224 100%)",
            padding: isDesktop ? "32px 28px 24px" : "24px 20px 18px",
            display: "flex",
            alignItems: "center",
            gap: 18,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "rgba(34,197,94,0.08)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -20,
              right: 60,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(34,197,94,0.05)",
            }}
          />

          <div
            style={{
              width: isDesktop ? 72 : 60,
              height: isDesktop ? 72 : 60,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: isDesktop ? 24 : 20,
              flexShrink: 0,
              border: "3px solid rgba(255,255,255,0.15)",
              boxShadow: "0 4px 16px rgba(34,197,94,0.4)",
              zIndex: 1,
            }}
          >
            {userInitials(user)}
          </div>
          <div style={{ minWidth: 0, zIndex: 1 }}>
            <div
              style={{
                fontSize: isDesktop ? 22 : 18,
                fontWeight: 900,
                color: "white",
                lineHeight: 1.15,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                letterSpacing: -0.5,
              }}
            >
              {userName(user)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#22c55e",
                  background: "rgba(34,197,94,0.15)",
                  border: "1px solid rgba(34,197,94,0.25)",
                  borderRadius: 20,
                  padding: "2px 10px",
                  letterSpacing: 0.3,
                }}
              >
                {roleName}
              </span>
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
              {user?.email || "No email found"}
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div
          style={{
            background: "white",
            padding: isDesktop ? "4px 28px 8px" : "4px 20px 8px",
          }}
        >
          {user?.account_expires_at && (
            <InfoRow
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              }
              label="Access expires"
              value={new Date(user.account_expires_at).toLocaleString()}
            />
          )}
          {user?.role_id !== undefined && (
            <InfoRow
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              }
              label="Role"
              value={roleName}
            />
          )}
          {user?.email && (
            <InfoRow
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              }
              label="Email"
              value={user.email}
              last
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          type="button"
          onClick={onEditProfile}
          style={{
            width: "100%",
            padding: "15px 0",
            borderRadius: 16,
            border: "none",
            background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
            color: "white",
            fontSize: 14,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(34,197,94,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(34,197,94,0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(34,197,94,0.35)";
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Update Profile
        </button>
        <button
          type="button"
          onClick={onLogout}
          style={{
            width: "100%",
            padding: "14px 0",
            borderRadius: 16,
            border: "1.5px solid #fecaca",
            background: "white",
            color: "#dc2626",
            fontSize: 14,
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "background 0.12s, border-color 0.12s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#fef2f2";
            e.currentTarget.style.borderColor = "#f87171";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
            e.currentTarget.style.borderColor = "#fecaca";
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Log Out
        </button>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  last,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "13px 0",
        borderBottom: last ? "none" : "1px solid #f1f5f9",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon && (
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: "#f0fdf4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </span>
        )}
        <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>{label}</span>
      </div>
      <span
        style={{
          fontSize: 12,
          color: "#111827",
          fontWeight: 700,
          textAlign: "right",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── ProfileEditModal ─────────────────────────────────────────────────────────

function ProfileEditModal({
  user,
  saving,
  error,
  onClose,
  onSave,
}: {
  user: ProfileUser | null;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSave: (payload: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => void;
}) {
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    password: "",
  });

  useEffect(() => {
    setForm({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      password: "",
    });
  }, [user]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(7,18,36,0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(form);
        }}
        style={{
          width: "100%",
          maxWidth: 440,
          borderRadius: 24,
          background: "white",
          boxShadow: "0 32px 72px rgba(0,0,0,0.28)",
          overflow: "hidden",
        }}
      >
        {/* Modal header */}
        <div
          style={{
            background: "linear-gradient(135deg, #071224 0%, #0d1f3c 100%)",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: "white", letterSpacing: -0.4 }}>
              Update Profile
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              Edit your personal information
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.08)",
              cursor: "pointer",
              color: "white",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              transition: "background 0.12s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
          >
            ×
          </button>
        </div>

        {/* Modal body */}
        <div style={{ padding: "20px 24px 24px" }}>
          {error && (
            <div
              style={{
                marginBottom: 16,
                borderRadius: 12,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                padding: "10px 14px",
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <ProfileInput
              label="First name"
              value={form.first_name}
              onChange={(first_name) => setForm((c) => ({ ...c, first_name }))}
              required
            />
            <ProfileInput
              label="Last name"
              value={form.last_name}
              onChange={(last_name) => setForm((c) => ({ ...c, last_name }))}
              required
            />
          </div>
          <ProfileInput
            label="Email address"
            type="email"
            value={form.email}
            onChange={(email) => setForm((c) => ({ ...c, email }))}
            required
          />
          <ProfileInput
            label="New password"
            type="password"
            value={form.password}
            onChange={(password) => setForm((c) => ({ ...c, password }))}
            placeholder="Leave blank to keep current"
          />

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                flex: 1,
                border: "1.5px solid #e5e7eb",
                borderRadius: 14,
                background: "white",
                padding: "13px 0",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                color: "#374151",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 2,
                border: "none",
                borderRadius: 14,
                background: saving
                  ? "#86efac"
                  : "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
                color: "white",
                padding: "13px 0",
                fontSize: 13,
                fontWeight: 900,
                cursor: saving ? "not-allowed" : "pointer",
                boxShadow: saving ? "none" : "0 4px 14px rgba(34,197,94,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "opacity 0.15s",
              }}
            >
              {saving ? (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ animation: "spin 1s linear infinite" }}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function ProfileInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <span
        style={{
          display: "block",
          marginBottom: 6,
          fontSize: 12,
          fontWeight: 700,
          color: focused ? "#16a34a" : "#374151",
          transition: "color 0.15s",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "#22c55e", marginLeft: 2 }}>*</span>
        )}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          border: focused ? "1.5px solid #22c55e" : "1.5px solid #e5e7eb",
          borderRadius: 12,
          padding: "11px 14px",
          fontSize: 13,
          outline: "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
          boxShadow: focused ? "0 0 0 3px rgba(34,197,94,0.12)" : "none",
          boxSizing: "border-box",
          background: focused ? "#fafffe" : "white",
        }}
      />
    </label>
  );
}

// ─── Mobile ───────────────────────────────────────────────────────────────────

function MobileHome({
  tab,
  setTab,
  onContinue,
  categories,
  loadingCategories,
  progressByCategory,
  continueByCategory,
  user,
  loadingUser,
  onEditProfile,
  onLogout,
}: HomeLayoutProps) {
  const isProfile = tab === "Profile";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        width: "100%",
        overflow: "hidden",
        background: "#f0fdf4",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: "12px 16px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Logo />
        <ProfileMenu
          user={user}
          size={34}
          onEditProfile={onEditProfile}
          onLogout={onLogout}
        />
      </div>

      {/* Greeting or profile header */}
      {!isProfile ? (
        <div style={{ padding: "12px 16px 14px", flexShrink: 0 }}>
          <div
            style={{
              fontWeight: 900,
              fontSize: 20,
              color: "#071224",
              letterSpacing: -0.5,
              lineHeight: 1.2,
              marginBottom: 4,
            }}
          >
           
            <span style={{ color: "#16a34a" }}>{userName(user)}</span> 👋
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
            Keep going! You're one step closer to your dream.
          </div>
        </div>
      ) : (
        <div style={{ padding: "10px 16px 14px", flexShrink: 0 }}>
          <div
            style={{
              fontWeight: 900,
              fontSize: 20,
              color: "#071224",
              letterSpacing: -0.5,
            }}
          >
            My Profile
          </div>
        </div>
      )}

      {/* White card */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          background: "white",
          borderRadius: "24px 24px 0 0",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            padding: "18px 16px 0",
            gap: 14,
          }}
          className="hs"
        >
          {isProfile ? (
            <div style={{ paddingBottom: 16 }}>
              <ProfileView
                user={user}
                loadingUser={loadingUser}
                onEditProfile={onEditProfile}
                onLogout={onLogout}
                isDesktop={false}
              />
            </div>
          ) : (
            <>
              <div style={{ flexShrink: 0 }}>
                <SectionHeader title="Continue Learning" />
                {loadingCategories ? (
                  <div
                    style={{
                      height: 475,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#9ca3af",
                      background: "#f9fafb",
                      borderRadius: 20,
                      gap: 8,
                      fontSize: 13,
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ animation: "spin 1s linear infinite" }}
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Loading…
                  </div>
                ) : categories[0] ? (
                  <HeroCard
                    height={475}
                    onContinue={() => onContinue(categories[0])}
                    category={categories[0]}
                    progress={progressByCategory[categories[0].id] || 0}
                    moduleNumber={continueByCategory[categories[0].id]?.moduleNumber}
                    moduleName={continueByCategory[categories[0].id]?.moduleName}
                  />
                ) : (
                  <div
                    style={{
                      padding: "20px 16px",
                      color: "#6b7280",
                      background: "#f9fafb",
                      borderRadius: 20,
                      fontSize: 13,
                      textAlign: "center",
                    }}
                  >
                    No learning category assigned yet.
                  </div>
                )}
              </div>
              <div style={{ flexShrink: 0, paddingBottom: 12 }}>
                <HelpBox desktop={false} />
              </div>
            </>
          )}
        </div>
      </div>

      
      {/* <nav
        style={{
          background: "white",
          flexShrink: 0,
          borderTop: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 -4px 16px rgba(0,0,0,0.06)",
          display: "flex",
          justifyContent: "space-around",
          padding: "8px 0 max(10px,env(safe-area-inset-bottom))",
        }}
      >
        {tabs.map(({ label, icon }) => {
          const active = tab === label;
          return (
            <button
              key={label}
              onClick={() => setTab(label)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                color: active ? "#16a34a" : "#9ca3af",
                padding: "0 10px",
                transition: "color 0.15s",
              }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: active ? "#f0fdf4" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.15s",
                }}
              >
                {icon(active)}
              </span>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: active ? 800 : 500,
                  lineHeight: 1,
                  transition: "font-weight 0.15s",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav> */}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Desktop ──────────────────────────────────────────────────────────────────

function DesktopHome({
  tab,
  setTab,
  onContinue,
  categories,
  loadingCategories,
  progressByCategory,
  continueByCategory,
  user,
  loadingUser,
  onEditProfile,
  onLogout,
}: HomeLayoutProps) {
  const isProfile = tab === "Profile";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        background: "#f0fdf4",
      }}
    >
      {/* Header */}
      <div style={{ padding: "28px 60px 52px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <Logo />

          <ProfileMenu
            user={user}
            size={40}
            onEditProfile={onEditProfile}
            onLogout={onLogout}
          />
        </div>

        {/* Page heading */}
        {isProfile ? (
          <div
            style={{
              fontWeight: 900,
              fontSize: 30,
              color: "#071224",
              letterSpacing: -0.8,
              lineHeight: 1.15,
            }}
          >
            My Profile
          </div>
        ) : (
          <div>
            <div
              style={{
                fontWeight: 900,
                fontSize: 34,
                color: "#071224",
                letterSpacing: -1,
                lineHeight: 1.15,
                marginBottom: 8,
              }}
            >
              
              <span style={{ color: "#16a34a" }}>{userName(user)}</span> 👋
            </div>
            <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
              Keep going! You're one step closer to your dream.
            </div>
          </div>
        )}
      </div>

      {/* White body */}
      <div
        style={{
          flex: 1,
          background: "white",
          borderRadius: "28px 28px 0 0",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            padding: "40px 60px 52px",
            display: "flex",
            flexDirection: "column",
            gap: 36,
          }}
        >
          {isProfile ? (
            <ProfileView
              user={user}
              loadingUser={loadingUser}
              onEditProfile={onEditProfile}
              onLogout={onLogout}
              isDesktop={true}
            />
          ) : (
            <>
              <div>
                <SectionHeader title="Continue Learning" />
                {loadingCategories ? (
                  <div
                    style={{
                      height: 280,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#9ca3af",
                      background: "#f9fafb",
                      borderRadius: 20,
                      gap: 10,
                      fontSize: 14,
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ animation: "spin 1s linear infinite" }}
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Loading…
                  </div>
                ) : categories[0] ? (
                  <HeroCard
                    height={280}
                    onContinue={() => onContinue(categories[0])}
                    category={categories[0]}
                    progress={progressByCategory[categories[0].id] || 0}
                    moduleNumber={continueByCategory[categories[0].id]?.moduleNumber}
                    moduleName={continueByCategory[categories[0].id]?.moduleName}
                  />
                ) : (
                  <div
                    style={{
                      padding: 20,
                      color: "#6b7280",
                      background: "#f9fafb",
                      borderRadius: 20,
                      textAlign: "center",
                      fontSize: 14,
                    }}
                  >
                    No learning category assigned yet.
                  </div>
                )}
              </div>
              <HelpBox desktop={true} />
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Exported Page ────────────────────────────────────────────────────────────

export default function HomePage({ tab, setTab, onContinue }: LayoutProps) {
  const navigate = useNavigate();

  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : false
  );
  const [categories, setCategories] = useState<LearningCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [progressByCategory, setProgressByCategory] = useState<
    Record<number, number>
  >({});
  const [continueByCategory, setContinueByCategory] = useState<
    Record<number, { moduleNumber: number; moduleName: string }>
  >({});
  const [user, setUser] = useState<ProfileUser | null>(
    () => getStoredUser() as ProfileUser | null
  );
  const [loadingUser, setLoadingUser] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Resize listener
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Fetch profile
  useEffect(() => {
    api
      .get("/profile")
      .then((res) => setUser(res.data?.user ?? res.data ?? null))
      .catch(() => setUser(getStoredUser() as ProfileUser | null))
      .finally(() => setLoadingUser(false));
  }, []);

  // Fetch categories
  useEffect(() => {
    api
      .get("/my-categories")
      .then((res) =>
        setCategories(Array.isArray(res.data) ? res.data : [])
      )
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));
  }, []);

  // Fetch per-category progress
  useEffect(() => {
    let cancelled = false;

    const loadHomeProgress = async () => {
      const results = await Promise.all(
        categories.map(async (category) => {
          try {
            const modulesRes = await api.get(
              `/categories/${category.id}/modules`
            );
            const modules: LearningModule[] = Array.isArray(modulesRes.data)
              ? modulesRes.data
              : [];
            const lessonGroups = await Promise.all(
              modules.map(async (module) => {
                try {
                  const lessonsRes = await api.get(
                    `/modules/${module.id}/lessons`
                  );
                  return Array.isArray(lessonsRes.data) ? lessonsRes.data : [];
                } catch {
                  return [];
                }
              })
            );
            const lessonIds = lessonGroups
              .flat()
              .map((lesson: LearningLesson) => lesson.id);
            const completedIds = await loadLearningProgress(category.id);
            const completedCount = lessonIds.filter((id) =>
              completedIds.includes(id)
            ).length;
            const progress =
              lessonIds.length > 0
                ? Math.round((completedCount / lessonIds.length) * 100)
                : 0;
            const continueIndex = modules.findIndex((_module, index) => {
              const lessons = lessonGroups[index] || [];
              return (
                lessons.length === 0 ||
                lessons.some(
                  (lesson: LearningLesson) =>
                    !completedIds.includes(lesson.id)
                )
              );
            });
            const moduleIndex = continueIndex >= 0 ? continueIndex : 0;
            const currentModule = modules[moduleIndex];
            return {
              categoryId: category.id,
              progress,
              continueModule: currentModule
                ? {
                    moduleNumber: moduleIndex + 1,
                    moduleName: currentModule.title,
                  }
                : undefined,
            };
          } catch {
            return {
              categoryId: category.id,
              progress: 0,
              continueModule: undefined,
            };
          }
        })
      );

      if (!cancelled) {
        setProgressByCategory(
          Object.fromEntries(results.map((r) => [r.categoryId, r.progress]))
        );
        setContinueByCategory(
          Object.fromEntries(
            results
              .filter((r) => r.continueModule)
              .map((r) => [r.categoryId, r.continueModule!])
          )
        );
      }
    };

    if (categories.length) {
      loadHomeProgress();
    } else {
      setProgressByCategory({});
      setContinueByCategory({});
    }

    return () => {
      cancelled = true;
    };
  }, [categories]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/signin");
  };

  const handleEditProfile = () => {
    setProfileError("");
    setEditingProfile(true);
  };

  const handleSaveProfile = async (payload: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => {
    setSavingProfile(true);
    setProfileError("");

    try {
      const body: Record<string, string> = {
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
      };
      if (payload.password.trim()) body.password = payload.password;

      const res = await api.put("/profile", body);
      const updated = res.data?.user ?? res.data;
      setUser(updated);
      sessionStorage.setItem("user", JSON.stringify(updated));
      setEditingProfile(false);
    } catch (error: any) {
      setProfileError(
        error?.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const sharedProps: HomeLayoutProps = {
    tab,
    setTab,
    onContinue,
    categories,
    loadingCategories,
    progressByCategory,
    continueByCategory,
    user,
    loadingUser,
    onEditProfile: handleEditProfile,
    onLogout: handleLogout,
  };

  return (
    <>
      {isDesktop ? (
        <DesktopHome {...sharedProps} />
      ) : (
        <MobileHome {...sharedProps} />
      )}
      {editingProfile && (
        <ProfileEditModal
          user={user}
          saving={savingProfile}
          error={profileError}
          onClose={() => setEditingProfile(false)}
          onSave={handleSaveProfile}
        />
      )}
    </>
  );
}