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
  RichTextContent,
  WarningNotice,
  categoryImage,
} from "./shared";

interface ModuleLessonsPageProps {
  onBack: () => void;
  onLessonClick: (lesson: LearningLesson) => void;
  isDesktop: boolean;
  module: LearningModule | null;
  moduleNumber?: number | null;
  category: LearningCategory | null;
}

const moduleLabel = (moduleNumber?: number | null) =>
  moduleNumber ? `Module ${moduleNumber}` : "Module";

// ─── Duration formatter ───────────────────────────────────────────────────────
const formatDuration = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (!h) return `${m} min`;
  return `${h}h ${m}m`;
};

// ─── Lesson row (shared between mobile + desktop list) ────────────────────────

function LessonRow({
  lesson,
  index,
  completed,
  current,
  unlocked,
  isLast,
  isDesktop,
  onLessonClick,
}: {
  lesson: LearningLesson;
  index: number;
  completed: boolean;
  current: boolean;
  unlocked: boolean;
  isLast: boolean;
  isDesktop: boolean;
  onLessonClick: (lesson: LearningLesson) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => unlocked && onLessonClick(lesson)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: isDesktop ? 16 : 12,
        padding: isDesktop ? "0px 20px" : "0px 16px",
        background: "white",
        marginBottom: 10,
        borderRadius: 16,
        border: current
          ? "2px solid #ff5a2c"
          : "1px solid #eef2f7",
        boxShadow: hovered
          ? "0 6px 20px rgba(0,0,0,0.07)"
          : "0 3px 12px rgba(0,0,0,0.04)",
        cursor: unlocked ? "pointer" : "default",
        position: "relative",
        transition: "all 0.18s cubic-bezier(.22,1,.36,1)",
        transform: hovered ? "translateY(-1px)" : "none",
      }}
    >
      {/* Orange accent for current */}
      {current && (
        <div
          style={{
            position: "absolute",
            left: -2,
            top: "50%",
            transform: "translateY(-50%)",
            width: 4,
            height: "65%",
            borderRadius: "0 4px 4px 0",
            background: "#ff5a2c",
          }}
        />
      )}

      {/* ── Status orb ── */}
      <div
        style={{
          width: isDesktop ? 48 : 44,
          height: isDesktop ? 48 : 44,
          borderRadius: "50%",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: completed
            ? "#22c55e"
            : current
            ? "#ff5a2c"
            : "#f3f4f6",
          boxShadow: completed
            ? "0 3px 12px rgba(34,197,94,0.3)"
            : current
            ? "0 3px 12px rgba(255,90,44,0.3)"
            : "none",
          transition: "all 0.15s",
        }}
      >
        {completed ? (
          <CheckIcon size={isDesktop ? 20 : 18} />
        ) : current ? (
          <PlayIcon size={isDesktop ? 18 : 17} />
        ) : (
          <span
            style={{
              fontSize: isDesktop ? 15 : 14,
              fontWeight: 800,
              color: "#9ca3af",
            }}
          >
            {index + 1}
          </span>
        )}
      </div>

      {/* ── Text block ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Lesson badge */}
        <div
          style={{
            display: "inline-flex",
            padding: "0px 9px",
            borderRadius: 999,
            background: "#f8fafc",
            fontSize: 10,
            fontWeight: 700,
            color: "#6b7280",
            marginBottom: 5,
            letterSpacing: 0.4,
          }}
        >
          LESSON {index + 1}
        </div>

        {/* Title */}
        <div
          style={{
            fontWeight: 800,
            fontSize: isDesktop ? 16 : 14.5,
            color: unlocked ? "#111827" : "#9ca3af",
            marginBottom: 3,
            lineHeight: 1.3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {lesson.title}
        </div>

        {/* Duration */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <ClockIcon size={11} color={current ? "#ff5a2c" : "#9ca3af"} />
          <span
            style={{
              fontSize: 12,
              color: current ? "#ff5a2c" : "#6b7280",
              fontWeight: 600,
            }}
          >
            {formatDuration(lesson.duration_mins)}
          </span>
        </div>
      </div>

      {/* ── Right action ── */}
      {current ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLessonClick(lesson);
          }}
          style={{
            padding: isDesktop ? "8px 20px" : "7px 16px",
            background: "#ff5a2c",
            color: "white",
            border: "none",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0,
            boxShadow: "0 3px 12px rgba(255,90,44,0.35)",
            transition: "all 0.12s",
            letterSpacing: 0.2,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 5px 16px rgba(255,90,44,0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 3px 12px rgba(255,90,44,0.35)";
          }}
        >
          Continue
        </button>
      ) : completed ? (
        <ChevRight size={18} color="#111827" />
      ) : (
        <LockIcon size={16} color="#9ca3af" />
      )}
    </div>
  );
}

// ─── Lesson list ──────────────────────────────────────────────────────────────

function LessonList({
  lessons,
  loading,
  completedLessonIds,
  isLessonUnlocked,
  isDesktop,
  onLessonClick,
}: {
  lessons: LearningLesson[];
  loading: boolean;
  completedLessonIds: number[];
  isLessonUnlocked: (i: number) => boolean;
  isDesktop: boolean;
  onLessonClick: (lesson: LearningLesson) => void;
}) {
  if (loading) {
    return (
      <>
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: isDesktop ? "0px 20px" : "0px 16px",
              marginBottom: 10,
              borderRadius: 16,
              background: "white",
              border: "1px solid #eef2f7",
              boxShadow: "0 3px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                width: isDesktop ? 48 : 44,
                height: isDesktop ? 48 : 44,
                borderRadius: "50%",
                background:
                  "linear-gradient(90deg,#f3f4f6 25%,#e9eaec 50%,#f3f4f6 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.4s infinite",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: 9,
                  width: "30%",
                  borderRadius: 999,
                  background:
                    "linear-gradient(90deg,#f3f4f6 25%,#e9eaec 50%,#f3f4f6 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.4s infinite",
                  marginBottom: 7,
                }}
              />
              <div
                style={{
                  height: 14,
                  width: "65%",
                  borderRadius: 6,
                  background:
                    "linear-gradient(90deg,#f3f4f6 25%,#e9eaec 50%,#f3f4f6 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.4s infinite",
                  marginBottom: 5,
                }}
              />
              <div
                style={{
                  height: 9,
                  width: "22%",
                  borderRadius: 6,
                  background:
                    "linear-gradient(90deg,#f3f4f6 25%,#e9eaec 50%,#f3f4f6 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.4s infinite",
                }}
              />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (lessons.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
          gap: 12,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
          }}
        >
          📭
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>
          No lessons yet
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#9ca3af",
            lineHeight: 1.5,
            maxWidth: 220,
          }}
        >
          Lessons for this module haven't been added yet. Check back soon.
        </div>
      </div>
    );
  }

  return (
    <>
      {lessons.map((lesson, i) => {
        const completed = completedLessonIds.includes(lesson.id);
        const unlocked = isLessonUnlocked(i);
        const current = unlocked && !completed;

        return (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            index={i}
            completed={completed}
            current={current}
            unlocked={unlocked}
            isLast={i === lessons.length - 1}
            isDesktop={isDesktop}
            onLessonClick={onLessonClick}
          />
        );
      })}
    </>
  );
}

// ─── Module header remains unchanged ─────────────────────────────────────────
function ModuleHeader({
  module,
  moduleNumber,
  category,
  lessons,
  progressPct,
  statusLabel,
  isDesktop,
}: {
  module: LearningModule | null;
  moduleNumber?: number | null;
  category: LearningCategory | null;
  lessons: LearningLesson[];
  progressPct: number;
  statusLabel: string;
  isDesktop: boolean;
}) {
  const bgImage = categoryImage(category, 900);

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        minHeight: isDesktop ? 320 : 290,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 30%",
            filter: "brightness(0.9) saturate(1.1)",
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: bgImage
            ? "linear-gradient(to bottom, rgba(7,18,36,0.3) 0%, rgba(7,18,36,0.65) 45%, rgba(7,18,36,0.97) 100%)"
            : "#0d1f35",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: isDesktop ? "0 60px 36px" : "0 20px 36px",
        }}
      >
        <h1
          style={{
            fontWeight: 900,
            fontSize: isDesktop ? 32 : 24,
            color: "white",
            letterSpacing: -0.8,
            lineHeight: 1.1,
            margin: "0 0 8px 0",
          }}
        >
          {module?.title || "Module"}
        </h1>

        {module?.description ? (
          <RichTextContent
            html={module.description}
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.6,
              marginBottom: 18,
            }}
          />
        ) : (
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.6,
              margin: "0 0 18px 0",
            }}
          >
            Choose a lesson to continue.
          </p>
        )}

        {module?.warning && (
          <div style={{ marginBottom: 14 }}>
            <WarningNotice message={module.warning} />
          </div>
        )}

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 9,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              {lessons.length} Lesson{lessons.length !== 1 ? "s" : ""}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#22c55e",
              }}
            >
              {statusLabel}
            </span>
          </div>

          <div
            style={{
              height: 6,
              borderRadius: 99,
              background: "rgba(255,255,255,0.15)",
              overflow: "hidden",
              marginBottom: 7,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                borderRadius: 99,
                background: "linear-gradient(90deg, #16a34a, #22c55e)",
                transition: "width 0.6s cubic-bezier(.22,1,.36,1)",
              }}
            />
          </div>

          <div
            style={{
              textAlign: "right",
              fontSize: 13,
              fontWeight: 800,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            {progressPct}%
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile layout ────────────────────────────────────────────────────────────
function MobileLayout({
  module,
  moduleNumber,
  category,
  lessons,
  loading,
  completedLessonIds,
  progressPct,
  statusLabel,
  isLessonUnlocked,
  onBack,
  onLessonClick,
}: {
  module: LearningModule | null;
  moduleNumber?: number | null;
  category: LearningCategory | null;
  lessons: LearningLesson[];
  loading: boolean;
  completedLessonIds: number[];
  progressPct: number;
  statusLabel: string;
  isLessonUnlocked: (i: number) => boolean;
  onBack: () => void;
  onLessonClick: (lesson: LearningLesson) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "#0d1f35",
        overflow: "hidden",
        animation: "pageIn .3s cubic-bezier(.22,1,.36,1)",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.2)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "white",
            textShadow: "0 1px 4px rgba(0,0,0,0.5)",
          }}
        >
          {moduleLabel(moduleNumber)}
        </span>
        <div style={{ width: 36 }} />
      </div>

      <ModuleHeader
        module={module}
        moduleNumber={moduleNumber}
        category={category}
        lessons={lessons}
        progressPct={progressPct}
        statusLabel={statusLabel}
        isDesktop={false}
      />

      <div
        className="hs"
        style={{
          flex: 1,
          minHeight: 0,
          background: "white",
          borderRadius: "22px 22px 0 0",
          overflowY: "auto",
          padding: "0px 16px 40px",
          marginTop: -22,
          position: "relative",
          zIndex: 2,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 99,
              background: "#e5e7eb",
            }}
          />
        </div>

        <LessonList
          lessons={lessons}
          loading={loading}
          completedLessonIds={completedLessonIds}
          isLessonUnlocked={isLessonUnlocked}
          isDesktop={false}
          onLessonClick={onLessonClick}
        />
      </div>
    </div>
  );
}

// ─── Desktop layout ───────────────────────────────────────────────────────────
function DesktopLayout({
  module,
  moduleNumber,
  category,
  lessons,
  loading,
  completedLessonIds,
  progressPct,
  statusLabel,
  isLessonUnlocked,
  onBack,
  onLessonClick,
}: {
  module: LearningModule | null;
  moduleNumber?: number | null;
  category: LearningCategory | null;
  lessons: LearningLesson[];
  loading: boolean;
  completedLessonIds: number[];
  progressPct: number;
  statusLabel: string;
  isLessonUnlocked: (i: number) => boolean;
  onBack: () => void;
  onLessonClick: (lesson: LearningLesson) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        background: "#f0fdf4",
        animation: "pageIn .3s cubic-bezier(.22,1,.36,1)",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "24px 60px",
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.2)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.25)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
          }
        >
          <ArrowLeft size={16} />
        </button>
        <span
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.65)",
            fontWeight: 600,
            textShadow: "0 1px 4px rgba(0,0,0,0.4)",
          }}
        >
          {category?.title || "Course"}
          <span style={{ margin: "0 7px", opacity: 0.4 }}>›</span>
          {moduleLabel(moduleNumber)}
        </span>
      </div>

      <ModuleHeader
        module={module}
        moduleNumber={moduleNumber}
        category={category}
        lessons={lessons}
        progressPct={progressPct}
        statusLabel={statusLabel}
        isDesktop={true}
      />

      <div
        style={{
          flex: 1,
          background: "white",
          borderRadius: "28px 28px 0 0",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.07)",
          marginTop: -28,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "24px 0 60px",
          }}
        >
          <LessonList
            lessons={lessons}
            loading={loading}
            completedLessonIds={completedLessonIds}
            isLessonUnlocked={isLessonUnlocked}
            isDesktop={true}
            onLessonClick={onLessonClick}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ModuleLessonsPage({
  onBack,
  onLessonClick,
  module,
  moduleNumber,
  category,
  isDesktop,
}: ModuleLessonsPageProps) {
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
    api
      .get(`/modules/${module.id}/lessons`)
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

  const isLessonUnlocked = (index: number) =>
    index === 0 ||
    lessons.slice(0, index).every((l) => completedLessonIds.includes(l.id));

  const completedCount = completedLessonIds.filter((id) =>
    lessons.some((l) => l.id === id)
  ).length;
  const progressPct =
    lessons.length > 0
      ? Math.round((completedCount / lessons.length) * 100)
      : 0;
  const statusLabel =
    completedCount === 0
      ? "Not Started"
      : completedCount === lessons.length
      ? "Completed"
      : "In Progress";

  const shared = {
    module,
    moduleNumber,
    category,
    lessons,
    loading,
    completedLessonIds,
    progressPct,
    statusLabel,
    isLessonUnlocked,
    onBack,
    onLessonClick,
  };

  return (
    <>
      <style>{`
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .hs::-webkit-scrollbar { display: none; }
        .hs { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      {isDesktop ? <DesktopLayout {...shared} /> : <MobileLayout {...shared} />}
    </>
  );
}