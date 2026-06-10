// src/pages/User/pages/HomePage.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Home dashboard — mobile & desktop responsive.
// Props: tab, setTab, onContinue (navigate to WelcomePage)
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import {
  tabs, categoryImage,
  Bar, SectionHeader, HeroCard, HelpBox,
  BellIcon, ArrowRight,
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
          position: "relative", width: size, height: size, borderRadius: "50%",
          border: "1.5px solid rgba(255,255,255,.3)", display: "flex", alignItems: "center",
          justifyContent: "center", fontWeight: 800, fontSize: size > 34 ? 12 : 11,
          color: "white", background: "rgba(255,255,255,.1)", cursor: "pointer",
        }}
      >
        {userInitials(user)}
        <span style={{
          position: "absolute", bottom: 1, right: 1,
          width: size > 34 ? 9 : 7, height: size > 34 ? 9 : 7,
          borderRadius: "50%", background: "#22c55e", border: "2px solid #071224",
        }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", right: 0, top: size + 10, zIndex: 20, width: 220,
          borderRadius: 14, background: "white", border: "1px solid #e5e7eb",
          boxShadow: "0 14px 34px rgba(0,0,0,.22)", padding: 10,
        }}>
          <div style={{ padding: "8px 10px 10px", borderBottom: "1px solid #f1f5f9", marginBottom: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>{userName(user)}</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email || ""}</div>
          </div>
          <button type="button" onClick={() => { setOpen(false); onEditProfile(); }}
            style={{ width: "100%", border: "none", background: "transparent", textAlign: "left", padding: "10px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#111827" }}>
            Update profile
          </button>
          <button type="button" onClick={() => { setOpen(false); onLogout(); }}
            style={{ width: "100%", border: "none", background: "transparent", textAlign: "left", padding: "10px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#dc2626" }}>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

// ─── ProfileView (rendered when tab === "Profile") ────────────────────────────

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48, color: "#6b7280", fontSize: 13 }}>
        Loading profile…
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: isDesktop ? 560 : undefined }}>

      {/* Avatar + name card */}
      <div style={{
        borderRadius: 20, overflow: "hidden",
        boxShadow: "0 2px 16px rgba(0,0,0,.07)", border: "1px solid #edf2f7",
      }}>
        {/* Dark header strip */}
        <div style={{ background: "#071224", padding: isDesktop ? "28px 24px 20px" : "22px 18px 16px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: isDesktop ? 64 : 54, height: isDesktop ? 64 : 54, borderRadius: "50%",
            background: "#22c55e", color: "white", display: "flex", alignItems: "center",
            justifyContent: "center", fontWeight: 900, fontSize: isDesktop ? 22 : 18,
            flexShrink: 0, border: "2px solid rgba(255,255,255,.15)",
          }}>
            {userInitials(user)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: isDesktop ? 20 : 17, fontWeight: 900, color: "white", lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {userName(user)}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", marginTop: 4 }}>
              {user?.email || "No email found"}
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div style={{ background: "white", padding: isDesktop ? "16px 24px" : "12px 18px", display: "flex", flexDirection: "column", gap: 0 }}>
          {user?.account_expires_at && (
            <InfoRow label="Access expires" value={new Date(user.account_expires_at).toLocaleString()} />
          )}
          {user?.role_id !== undefined && (
            <InfoRow label="Role" value={user.role_id === 1 ? "Admin" : user.role_id === 2 ? "Instructor" : "Student"} />
          )}
          {user?.email && (
            <InfoRow label="Email" value={user.email} last />
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <ActionButton
          label="Update Profile"
          color="#22c55e"
          textColor="white"
          onClick={onEditProfile}
        />
        <ActionButton
          label="Log Out"
          color="white"
          textColor="#dc2626"
          border="1px solid #fecaca"
          onClick={onLogout}
        />
      </div>
    </div>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "11px 0", borderBottom: last ? "none" : "1px solid #f1f5f9", gap: 12,
    }}>
      <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12, color: "#111827", fontWeight: 700, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}

function ActionButton({ label, color, textColor, border, onClick }: {
  label: string; color: string; textColor: string; border?: string; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%", padding: "14px 0", borderRadius: 14, border: border || "none",
        background: color, color: textColor, fontSize: 14, fontWeight: 800, cursor: "pointer",
        boxShadow: color !== "white" ? "0 4px 14px rgba(34,197,94,.25)" : undefined,
      }}
    >
      {label}
    </button>
  );
}

// ─── Mobile ───────────────────────────────────────────────────────────────────

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
  onSave: (payload: { first_name: string; last_name: string; email: string; password: string }) => void;
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
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(7,18,36,.62)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(form);
        }}
        style={{ width: "100%", maxWidth: 430, borderRadius: 18, background: "white", boxShadow: "0 20px 60px rgba(0,0,0,.32)", padding: 20 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#111827" }}>Update Profile</div>
          <button type="button" onClick={onClose} style={{ border: "none", background: "#f3f4f6", borderRadius: 10, width: 32, height: 32, cursor: "pointer", fontWeight: 900 }}>x</button>
        </div>

        {error && <div style={{ marginBottom: 12, borderRadius: 12, background: "#fef2f2", color: "#b91c1c", padding: "10px 12px", fontSize: 12, fontWeight: 700 }}>{error}</div>}

        <ProfileInput label="First name" value={form.first_name} onChange={(first_name) => setForm((current) => ({ ...current, first_name }))} required />
        <ProfileInput label="Last name" value={form.last_name} onChange={(last_name) => setForm((current) => ({ ...current, last_name }))} required />
        <ProfileInput label="Email" type="email" value={form.email} onChange={(email) => setForm((current) => ({ ...current, email }))} required />
        <ProfileInput label="New password" type="password" value={form.password} onChange={(password) => setForm((current) => ({ ...current, password }))} placeholder="Leave blank to keep current password" />

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
          <button type="button" onClick={onClose} disabled={saving} style={{ border: "1px solid #e5e7eb", borderRadius: 12, background: "white", padding: "11px 15px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Cancel</button>
          <button type="submit" disabled={saving} style={{ border: "none", borderRadius: 12, background: "#22c55e", color: "white", padding: "12px 18px", fontSize: 13, fontWeight: 900, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving..." : "Save"}
          </button>
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
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <span style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 800, color: "#374151" }}>{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 12, padding: "11px 12px", fontSize: 14, outline: "none" }}
      />
    </label>
  );
}

function MobileHome({
  tab, setTab, onContinue,
  categories, loadingCategories, progressByCategory, continueByCategory,
  user, loadingUser, onEditProfile, onLogout,
}: HomeLayoutProps) {
  const isProfile = tab === "Profile";

  const modules = categories.map((category) => ({
    category,
    title: category.title,
    progress: progressByCategory[category.id] || 0,
    img: categoryImage(category, 300),
    background: category.background_color || "#071224",
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", width: "100%", overflow: "hidden", background: "#071224" }}>

      {/* Top bar */}
      <div style={{ padding: "10px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 17, color: "white", letterSpacing: -0.5 }}>
            Connected<span style={{ color: "#22c55e" }}>.</span>
          </div>
          <div style={{ color: "#22c55e", fontSize: 7.5, fontWeight: 700, letterSpacing: "0.22em", marginTop: 1 }}>EDUCATION</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", lineHeight: 0, padding: 0 }}><BellIcon /></button>
          <ProfileMenu user={user} size={32} onEditProfile={onEditProfile} onLogout={onLogout} />
        </div>
      </div>

      {/* Greeting — hidden on Profile tab */}
      {!isProfile && (
        <div style={{ padding: "8px 16px 10px", flexShrink: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: "white", letterSpacing: -0.4, lineHeight: 1.2, marginBottom: 3 }}>
            Good morning,<br />{userName(user)} 👋
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", lineHeight: 1.4 }}>
            Keep going! You're one step closer to your dream.
          </div>
        </div>
      )}

      {/* Profile tab header */}
      {isProfile && (
        <div style={{ padding: "10px 16px 12px", flexShrink: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: "white", letterSpacing: -0.4 }}>My Profile</div>
        </div>
      )}

      {/* White card */}
      <div style={{ flex: 1, minHeight: 0, background: "white", borderRadius: "20px 20px 0 0", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", padding: "16px 15px 0", gap: 11 }} className="hs">

          {isProfile ? (
            <div style={{ paddingBottom: 16 }}>
              <ProfileView user={user} loadingUser={loadingUser} onEditProfile={onEditProfile} onLogout={onLogout} isDesktop={false} />
            </div>
          ) : (
            <>
              <div style={{ flexShrink: 0 }}>
                <SectionHeader title="Continue Learning" />
                {loadingCategories ? (
                  <div style={{ height: 190, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", background: "#f9fafb", borderRadius: 16 }}>Loading...</div>
                ) : categories[0] ? (
                  <HeroCard
                    height={190}
                    onContinue={() => onContinue(categories[0])}
                    category={categories[0]}
                    progress={progressByCategory[categories[0].id] || 0}
                    moduleNumber={continueByCategory[categories[0].id]?.moduleNumber}
                    moduleName={continueByCategory[categories[0].id]?.moduleName}
                  />
                ) : (
                  <div style={{ padding: 16, color: "#6b7280", background: "#f9fafb", borderRadius: 16 }}>No learning category assigned yet.</div>
                )}
              </div>

              <div style={{ flexShrink: 0 }}>
                <SectionHeader title="Your Modules" action="View All" />
                <div className="hs" style={{ display: "flex", gap: 8, overflowX: "auto", marginLeft: -15, paddingLeft: 15, marginRight: -15, paddingRight: 10, paddingBottom: 2 }}>
                  {loadingCategories ? (
                    <div style={{ color: "#6b7280", fontSize: 12 }}>Loading modules...</div>
                  ) : modules.length === 0 ? (
                    <div style={{ color: "#6b7280", fontSize: 12 }}>No modules available.</div>
                  ) : modules.map((m, i) => (
                    <div key={i} onClick={() => onContinue(m.category)} style={{ flexShrink: 0, width: 118, borderRadius: 12, overflow: "hidden", background: "white", border: "1px solid #efefef", boxShadow: "0 2px 8px rgba(0,0,0,.07)", cursor: "pointer" }}>
                      <div style={{ height: 70, overflow: "hidden", background: m.background }}>
                        {m.img && <img src={m.img} alt={m.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      </div>
                      <div style={{ padding: "6px 8px 8px" }}>
                        <div style={{ fontWeight: 700, fontSize: 10, color: "#111", marginBottom: 5, lineHeight: 1.3 }}>{m.title}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Bar value={m.progress} />
                          <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700, flexShrink: 0 }}>{m.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ flexShrink: 0, paddingBottom: 12 }}>
                <HelpBox desktop={false} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <nav style={{ background: "white", flexShrink: 0, borderTop: "1px solid rgba(0,0,0,.07)", boxShadow: "0 -2px 12px rgba(0,0,0,.07)", display: "flex", justifyContent: "space-around", padding: "7px 0 max(8px,env(safe-area-inset-bottom))" }}>
        {tabs.map(({ label, icon }) => {
          const a = tab === label;
          return (
            <button key={label} onClick={() => setTab(label)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: a ? "#22c55e" : "#9ca3af", padding: "0 8px" }}>
              {icon(a)}
              <span style={{ fontSize: 9.5, fontWeight: a ? 700 : 500, lineHeight: 1 }}>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ─── Desktop ──────────────────────────────────────────────────────────────────

function DesktopHome({
  tab, setTab, onContinue,
  categories, loadingCategories, progressByCategory, continueByCategory,
  user, loadingUser, onEditProfile, onLogout,
}: HomeLayoutProps) {
  const isProfile = tab === "Profile";

  const modules = categories.map((category) => ({
    category,
    title: category.title,
    progress: progressByCategory[category.id] || 0,
    img: categoryImage(category, 300),
    background: category.background_color || "#071224",
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: "#071224" }}>

      {/* Header */}
      <div style={{ padding: "28px 56px 52px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 22, color: "white", letterSpacing: -0.6 }}>
              Connected<span style={{ color: "#22c55e" }}>.</span>
            </div>
            <div style={{ color: "#22c55e", fontSize: 8, fontWeight: 700, letterSpacing: "0.22em", marginTop: 2 }}>EDUCATION</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", lineHeight: 0, padding: 0 }}><BellIcon /></button>
            <ProfileMenu user={user} size={38} onEditProfile={onEditProfile} onLogout={onLogout} />
          </div>
        </div>

        {isProfile ? (
          <div style={{ fontWeight: 900, fontSize: 28, color: "white", letterSpacing: -0.8, lineHeight: 1.15 }}>
            My Profile
          </div>
        ) : (
          <div>
            <div style={{ fontWeight: 900, fontSize: 32, color: "white", letterSpacing: -1, lineHeight: 1.15, marginBottom: 8 }}>
              Good morning, {userName(user)} 👋
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.45)", lineHeight: 1.5 }}>
              Keep going! You're one step closer to your dream.
            </div>
          </div>
        )}
      </div>

      {/* White body */}
      <div style={{ flex: 1, background: "white", borderRadius: "24px 24px 0 0" }}>
        <div style={{ padding: "36px 56px 48px", display: "flex", flexDirection: "column", gap: 32 }}>

          {isProfile ? (
            <ProfileView user={user} loadingUser={loadingUser} onEditProfile={onEditProfile} onLogout={onLogout} isDesktop={true} />
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 28 }}>
                <div>
                  <SectionHeader title="Continue Learning" />
                  {loadingCategories ? (
                    <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", background: "#f9fafb", borderRadius: 16 }}>Loading...</div>
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
                    <div style={{ padding: 18, color: "#6b7280", background: "#f9fafb", borderRadius: 16 }}>No learning category assigned yet.</div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <SectionHeader title="Your Modules" action="View All" />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, flex: 1 }}>
                    {loadingCategories ? (
                      <div style={{ color: "#6b7280", fontSize: 13 }}>Loading modules...</div>
                    ) : modules.length === 0 ? (
                      <div style={{ color: "#6b7280", fontSize: 13 }}>No modules available.</div>
                    ) : modules.map((m, i) => (
                      <div key={i} onClick={() => onContinue(m.category)} style={{ background: "white", borderRadius: 14, overflow: "hidden", border: "1px solid #f0f0f0", boxShadow: "0 2px 10px rgba(0,0,0,.05)", display: "flex", alignItems: "center", cursor: "pointer" }}>
                        <div style={{ width: 82, height: 74, flexShrink: 0, overflow: "hidden", background: m.background }}>
                          {m.img && <img src={m.img} alt={m.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                        </div>
                        <div style={{ padding: "10px 14px", flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 11, color: "#111", marginBottom: 7, lineHeight: 1.35 }}>{m.title}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Bar value={m.progress} />
                            <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700, flexShrink: 0 }}>{m.progress}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <HelpBox desktop={true} />
            </>
          )}
        </div>
      </div>
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
  const [progressByCategory, setProgressByCategory] = useState<Record<number, number>>({});
  const [continueByCategory, setContinueByCategory] = useState<Record<number, { moduleNumber: number; moduleName: string }>>({});
  const [user, setUser] = useState<ProfileUser | null>(() => getStoredUser() as ProfileUser | null);
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
    api.get("/profile")
      .then((res) => setUser(res.data?.user ?? res.data ?? null))
      .catch(() => setUser(getStoredUser() as ProfileUser | null))
      .finally(() => setLoadingUser(false));
  }, []);

  // Fetch categories
  useEffect(() => {
    api.get("/my-categories")
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
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
            const modulesRes = await api.get(`/categories/${category.id}/modules`);
            const modules: LearningModule[] = Array.isArray(modulesRes.data) ? modulesRes.data : [];
            const lessonGroups = await Promise.all(
              modules.map(async (module) => {
                try {
                  const lessonsRes = await api.get(`/modules/${module.id}/lessons`);
                  return Array.isArray(lessonsRes.data) ? lessonsRes.data : [];
                } catch {
                  return [];
                }
              })
            );
            const lessonIds = lessonGroups.flat().map((lesson: LearningLesson) => lesson.id);
            const completedIds = await loadLearningProgress(category.id);
            const completedCount = lessonIds.filter((id) => completedIds.includes(id)).length;
            const progress = lessonIds.length > 0 ? Math.round((completedCount / lessonIds.length) * 100) : 0;
            const continueIndex = modules.findIndex((_module, index) => {
              const lessons = lessonGroups[index] || [];
              return lessons.length === 0 || lessons.some((lesson: LearningLesson) => !completedIds.includes(lesson.id));
            });
            const moduleIndex = continueIndex >= 0 ? continueIndex : 0;
            const currentModule = modules[moduleIndex];
            return {
              categoryId: category.id,
              progress,
              continueModule: currentModule
                ? { moduleNumber: moduleIndex + 1, moduleName: currentModule.title }
                : undefined,
            };
          } catch {
            return { categoryId: category.id, progress: 0, continueModule: undefined };
          }
        })
      );

      if (!cancelled) {
        setProgressByCategory(Object.fromEntries(results.map((r) => [r.categoryId, r.progress])));
        setContinueByCategory(
          Object.fromEntries(
            results.filter((r) => r.continueModule).map((r) => [r.categoryId, r.continueModule!])
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

    return () => { cancelled = true; };
  }, [categories]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/signin");
  };

  const handleEditProfile = () => {
    setProfileError("");
    setEditingProfile(true);
  };

  const handleSaveProfile = async (payload: { first_name: string; last_name: string; email: string; password: string }) => {
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
      setProfileError(error?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const sharedProps: HomeLayoutProps = {
    tab, setTab, onContinue,
    categories, loadingCategories,
    progressByCategory, continueByCategory,
    user, loadingUser,
    onEditProfile: handleEditProfile,
    onLogout: handleLogout,
  };

  return (
    <>
      {isDesktop ? <DesktopHome {...sharedProps} /> : <MobileHome  {...sharedProps} />}
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
