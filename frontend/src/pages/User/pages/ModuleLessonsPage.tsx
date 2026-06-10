import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import {
  ArrowLeft,
  CheckIcon,
  ChevRight,
  ClockIcon,
  LearningCategory,
  LearningLesson,
  LearningModule,
  LockIcon,
  loadLearningProgress,
  PlayIcon,
} from "./shared";

interface ModuleLessonsPageProps {
  onBack: () => void;
  onLessonClick: (lesson: LearningLesson) => void;
  isDesktop: boolean;
  module: LearningModule | null;
  category: LearningCategory | null;
}

export default function ModuleLessonsPage({ onBack, onLessonClick, module, category }: ModuleLessonsPageProps) {
  const [lessons, setLessons] = useState<LearningLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);

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

  useEffect(() => {
    let cancelled = false;

    loadLearningProgress(category?.id).then((ids) => {
      if (!cancelled) setCompletedLessonIds(ids);
    });

    return () => {
      cancelled = true;
    };
  }, [category, lessons]);

  const isLessonUnlocked = (index: number) => index === 0 || lessons.slice(0, index).every((lesson) => completedLessonIds.includes(lesson.id));

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
          <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 700 }}>{completedLessonIds.filter((id) => lessons.some((lesson) => lesson.id === id)).length}/{lessons.length} Complete</span>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, background: "white", borderRadius: "20px 20px 0 0", overflowY: "auto", padding: "6px 0 24px" }} className="hs">
        {loading ? (
          <div style={{ padding: 16, fontSize: 13, color: "#6b7280" }}>Loading lessons...</div>
        ) : lessons.length === 0 ? (
          <div style={{ padding: 16, fontSize: 13, color: "#6b7280" }}>No lessons have been added for this module yet.</div>
        ) : lessons.map((lesson, i) => {
          const completed = completedLessonIds.includes(lesson.id);
          const unlocked = isLessonUnlocked(i);
          const current = unlocked && !completed;

          return (
          <div
            key={lesson.id}
            onClick={() => unlocked && onLessonClick(lesson)}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 16px",
              background: current ? "#fff8f4" : "white",
              borderBottom: i < lessons.length - 1 ? "1px solid #f3f4f6" : "none",
              cursor: unlocked ? "pointer" : "default",
              opacity: unlocked ? 1 : 0.58,
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: completed ? "#22c55e" : current ? "#ff5a2c" : "#eef2f7" }}>
              {completed ? <CheckIcon size={13} /> : current ? <PlayIcon size={12} /> : <LockIcon size={14} color="#9ca3af" />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, color: current ? "#ff5a2c" : "#9ca3af", fontWeight: 600, marginBottom: 2 }}>Lesson {i + 1}</div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: "#111", marginBottom: 3 }}>{lesson.title}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <ClockIcon size={11} color={current ? "#ff5a2c" : "#9ca3af"} />
                <span style={{ fontSize: 11, color: current ? "#ff5a2c" : "#9ca3af" }}>{lesson.duration_mins} mins</span>
              </div>
            </div>

            {current ? (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onLessonClick(lesson);
                }}
                style={{ padding: "8px 16px", background: "#ff5a2c", color: "white", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
              >
                Continue
              </button>
            ) : !unlocked ? (
              <LockIcon />
            ) : (
              <ChevRight color="#d1d5db" />
            )}
          </div>
        )})}
      </div>
    </div>
  );
}
