import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import {
  ArrowLeft,
  CheckIcon,
  ChevRight,
  ClockIcon,
  LearningLesson,
  LearningModule,
  PlayIcon,
} from "./shared";

interface ModuleLessonsPageProps {
  onBack: () => void;
  onLessonClick: (lesson: LearningLesson) => void;
  isDesktop: boolean;
  module: LearningModule | null;
}

export default function ModuleLessonsPage({ onBack, onLessonClick, module }: ModuleLessonsPageProps) {
  const [lessons, setLessons] = useState<LearningLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!module) {
      setLessons([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    api.get(`/modules/${module.id}/lessons`)
      .then((res) => setLessons(Array.isArray(res.data) ? res.data : []))
      .catch(() => setLessons([]))
      .finally(() => setLoading(false));
  }, [module]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "#0d1f35", animation: "pageIn .35s cubic-bezier(.22,1,.36,1)", overflow: "hidden" }}>
      <div style={{ padding: "14px 18px 20px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button
            onClick={onBack}
            style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <ArrowLeft size={15} />
          </button>
          <span style={{ color: "rgba(255,255,255,.7)", fontSize: 13, fontWeight: 600 }}>{module?.title || "Module"}</span>
          <div style={{ width: 32 }} />
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#ff5a2c", letterSpacing: "0.08em", marginBottom: 4 }}>MODULE</div>
            <h1 style={{ fontWeight: 900, fontSize: 24, color: "white", letterSpacing: -0.8, marginBottom: 6, lineHeight: 1.15 }}>{module?.title || "Module"}</h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.5)", lineHeight: 1.5 }}>
              {module?.description || module?.subtitle || "Choose a lesson to continue."}
            </p>
          </div>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(34,197,94,.15)", border: "1px solid rgba(34,197,94,.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 22, color: "#22c55e" }}>{module?.icon_emoji || "?"}</span>
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)", fontWeight: 600 }}>{lessons.length} Lessons</span>
          <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 700 }}>Available</span>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, background: "white", borderRadius: "20px 20px 0 0", overflowY: "auto", padding: "6px 0 24px" }} className="hs">
        {loading ? (
          <div style={{ padding: 16, fontSize: 13, color: "#6b7280" }}>Loading lessons...</div>
        ) : lessons.length === 0 ? (
          <div style={{ padding: 16, fontSize: 13, color: "#6b7280" }}>No lessons have been added for this module yet.</div>
        ) : lessons.map((lesson, i) => (
          <div
            key={lesson.id}
            onClick={() => onLessonClick(lesson)}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 16px",
              background: i === 0 ? "#fff8f4" : "white",
              borderBottom: i < lessons.length - 1 ? "1px solid #f3f4f6" : "none",
              cursor: "pointer",
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: i === 0 ? "#ff5a2c" : "#22c55e" }}>
              {i === 0 ? <PlayIcon size={12} /> : <CheckIcon size={13} />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, color: i === 0 ? "#ff5a2c" : "#9ca3af", fontWeight: 600, marginBottom: 2 }}>Lesson {i + 1}</div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: "#111", marginBottom: 3 }}>{lesson.title}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <ClockIcon size={11} color={i === 0 ? "#ff5a2c" : "#9ca3af"} />
                <span style={{ fontSize: 11, color: i === 0 ? "#ff5a2c" : "#9ca3af" }}>{lesson.duration_mins} mins</span>
              </div>
            </div>

            {i === 0 ? (
              <button
                onClick={() => onLessonClick(lesson)}
                style={{ padding: "8px 16px", background: "#ff5a2c", color: "white", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
              >
                Continue
              </button>
            ) : (
              <ChevRight color="#d1d5db" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
