// src/pages/User/pages/CourseOverviewPage.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Course overview with hero banner and vertical learning-path timeline.
// Props: onBack → WelcomePage, onModuleClick → ModuleLessonsPage, isDesktop
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import {
  courseModules,
  ArrowLeft, ArrowRight, BookmarkIcon, ChevRight,
  CheckIcon, LockIcon, PlayIcon,
} from "./shared";

interface CourseOverviewPageProps {
  onBack: () => void;
  onModuleClick: () => void;
  isDesktop: boolean;
}

export default function CourseOverviewPage({ onBack, onModuleClick, isDesktop }: CourseOverviewPageProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "#fff", animation: "pageIn .35s cubic-bezier(.22,1,.36,1)", overflow: "hidden" }}>

      {/* ── Hero banner ── */}
      <div style={{ position: "relative", height: isDesktop ? 320 : 280, flexShrink: 0 }}>
        <img
          src="https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=900&q=80"
          alt="UK"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(4,12,28,.5) 0%,rgba(4,12,28,.85) 100%)" }} />

        {/* Header row */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px" }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.15)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ArrowLeft size={16} />
          </button>
          <button style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.15)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <BookmarkIcon />
          </button>
        </div>

        {/* Bottom info */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 20px 20px" }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>🇬🇧</div>
          <h1 style={{ fontWeight: 900, fontSize: isDesktop ? 30 : 26, color: "white", letterSpacing: -0.8, lineHeight: 1.1, marginBottom: 8 }}>
            UK Interview Training
          </h1>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.65)", marginBottom: 12 }}>43 Lessons • 7 Modules</div>

          {/* Progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.75)", flexShrink: 0 }}>72% Complete</div>
            <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,.2)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: "72%", height: "100%", background: "#22c55e", borderRadius: 4 }} />
            </div>
          </div>

          <button
            onClick={onModuleClick}
            style={{ width: "100%", padding: "14px", background: "#ff5a2c", color: "white", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px rgba(255,90,44,.4)" }}
          >
            Continue Learning <ArrowRight />
          </button>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", background: "white" }} className="hs">

        {/* Last Lesson shortcut */}
        <div style={{ margin: "16px 16px 0" }}>
          <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 8 }}>Last Lesson</div>
          <div
            onClick={onModuleClick}
            style={{ display: "flex", alignItems: "center", gap: 12, background: "#f9fafb", borderRadius: 14, padding: "12px 14px", cursor: "pointer", border: "1px solid #f0f0f0" }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#e8fdf1", border: "1px solid rgba(34,197,94,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: "#111", lineHeight: 1.3 }}>
                Module 4:<br />Financial Questions
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Lesson 3 of 6</div>
            </div>
            <ChevRight color="#9ca3af" />
          </div>
        </div>

        {/* Learning path */}
        <div style={{ margin: "20px 16px 0" }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#111", marginBottom: 14 }}>Your Learning Path</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {courseModules.map((m, i) => {
              const isDone   = m.status === "completed";
              const isActive = m.status === "inprogress";
              const isLocked = m.status === "locked";
              return (
                <div key={m.id} style={{ display: "flex", alignItems: "stretch", gap: 12 }}>
                  {/* Timeline dot + line */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 24 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: isLocked ? "#f3f4f6" : "#22c55e", border: isLocked ? "2px solid #e5e7eb" : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isLocked  ? <LockIcon size={12} color="#9ca3af" /> : isDone ? <CheckIcon size={10} /> : <PlayIcon size={8} />}
                    </div>
                    {i < courseModules.length - 1 && (
                      <div style={{ width: 2, flex: 1, minHeight: 12, background: isDone ? "#22c55e" : "#e5e7eb", marginTop: 2 }} />
                    )}
                  </div>

                  {/* Row content */}
                  <div
                    onClick={isLocked ? undefined : onModuleClick}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: i < courseModules.length - 1 ? 14 : 0, cursor: isLocked ? "default" : "pointer" }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: isLocked ? "#9ca3af" : "#111" }}>{m.title}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{m.subtitle}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {isDone   && <span style={{ fontSize: 11, fontWeight: 700, color: "#22c55e" }}>Completed</span>}
                      {isActive && <span style={{ fontSize: 11, fontWeight: 700, color: "#22c55e" }}>In Progress</span>}
                      {isLocked
                        ? <LockIcon size={14} color="#d1d5db" />
                        : <ChevRight color={isActive ? "#22c55e" : "#d1d5db"} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}