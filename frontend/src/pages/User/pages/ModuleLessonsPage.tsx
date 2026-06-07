// src/pages/User/pages/ModuleLessonsPage.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Module detail page — dark header + white lesson list.
// Props: onBack → CourseOverviewPage, onLessonClick → LessonDetailPage, isDesktop
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import {
  moduleLessons,
  ArrowLeft, ChevRight,
  CheckIcon, LockIcon, PlayIcon, ClockIcon,
} from "./shared";

interface ModuleLessonsPageProps {
  onBack: () => void;
  onLessonClick: () => void;
  isDesktop: boolean;
}

export default function ModuleLessonsPage({ onBack, onLessonClick, isDesktop }: ModuleLessonsPageProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "#0d1f35", animation: "pageIn .35s cubic-bezier(.22,1,.36,1)", overflow: "hidden" }}>

      {/* ── Dark header ── */}
      <div style={{ padding: "14px 18px 20px", flexShrink: 0 }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button
            onClick={onBack}
            style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <ArrowLeft size={15} />
          </button>
          <span style={{ color: "rgba(255,255,255,.7)", fontSize: 13, fontWeight: 600 }}>Module 4</span>
          <div style={{ width: 32 }} />
        </div>

        {/* Module info */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#ff5a2c", letterSpacing: "0.08em", marginBottom: 4 }}>MODULE 4</div>
            <h1 style={{ fontWeight: 900, fontSize: 24, color: "white", letterSpacing: -0.8, marginBottom: 6, lineHeight: 1.15 }}>Financial Questions</h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.5)", lineHeight: 1.5 }}>
              Learn how to confidently answer questions about your finances and funding.
            </p>
          </div>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(34,197,94,.15)", border: "1px solid rgba(34,197,94,.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 22, color: "#22c55e" }}>£</span>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)", fontWeight: 600 }}>6 Lessons</span>
          <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 700 }}>In Progress</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,.12)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: "50%", height: "100%", background: "#22c55e", borderRadius: 4 }} />
          </div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)", fontWeight: 700, flexShrink: 0 }}>50%</span>
        </div>
      </div>

      {/* ── White lesson list ── */}
      <div style={{ flex: 1, minHeight: 0, background: "white", borderRadius: "20px 20px 0 0", overflowY: "auto", padding: "6px 0 24px" }} className="hs">
        {moduleLessons.map((lesson, i) => {
          const isDone   = lesson.status === "completed";
          const isActive = lesson.status === "inprogress";
          const isLocked = lesson.status === "locked";

          return (
            <div
              key={lesson.id}
              onClick={isActive ? onLessonClick : (isDone ? onLessonClick : undefined)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px",
                background: isActive ? "#fff8f4" : "white",
                borderBottom: i < moduleLessons.length - 1 ? "1px solid #f3f4f6" : "none",
                cursor: isLocked ? "default" : "pointer",
              }}
            >
              {/* Status circle */}
              <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isDone ? "#22c55e" : isActive ? "#ff5a2c" : "#f3f4f6", border: isLocked ? "1px solid #e5e7eb" : "none" }}>
                {isDone   && <CheckIcon size={13} />}
                {isActive && <PlayIcon  size={12} />}
                {isLocked && <span style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af" }}>{lesson.id}</span>}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10.5, color: isActive ? "#ff5a2c" : "#9ca3af", fontWeight: 600, marginBottom: 2 }}>Lesson {lesson.id}</div>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: isLocked ? "#9ca3af" : "#111", marginBottom: 3 }}>{lesson.title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <ClockIcon size={11} color={isActive ? "#ff5a2c" : "#9ca3af"} />
                  <span style={{ fontSize: 11, color: isActive ? "#ff5a2c" : "#9ca3af" }}>{lesson.mins} mins</span>
                </div>
              </div>

              {/* Action */}
              {isActive && (
                <button
                  onClick={onLessonClick}
                  style={{ padding: "8px 16px", background: "#ff5a2c", color: "white", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
                >
                  Continue
                </button>
              )}
              {isDone   && <ChevRight color="#d1d5db" />}
              {isLocked && <LockIcon size={15} color="#d1d5db" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}