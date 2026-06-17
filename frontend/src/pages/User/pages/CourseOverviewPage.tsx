import React, { useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";
import {
  ArrowLeft,
  ArrowRight,
  BookmarkIcon,
  categoryImage,
  CheckIcon,
  ChevRight,
  LearningCategory,
  LearningLesson,
  LearningModule,
  LockIcon,
  loadLearningProgress,
  PlayIcon,
} from "./shared";

interface CourseOverviewPageProps {
  onBack: () => void;
  onModuleClick: (module: LearningModule) => void;
  isDesktop: boolean;
  category: LearningCategory | null;
}

export default function CourseOverviewPage({
  onBack,
  onModuleClick,
  isDesktop,
  category,
}: CourseOverviewPageProps) {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [moduleLessons, setModuleLessons] = useState<Record<number, LearningLesson[]>>({});
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) {
      setModules([]);
      setModuleLessons({});
      setCompletedLessonIds([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .get(`/categories/${category.id}/modules`)
      .then(async (res) => {
        const rows: LearningModule[] = Array.isArray(res.data) ? res.data : [];
        setModules(rows);
        setCompletedLessonIds(await loadLearningProgress(category.id));

        const lessonPairs = await Promise.all(
          rows.map(async (m) => {
            try {
              const r = await api.get(`/modules/${m.id}/lessons`);
              return [m.id, Array.isArray(r.data) ? r.data : []] as const;
            } catch {
              return [m.id, []] as const;
            }
          })
        );
        setModuleLessons(Object.fromEntries(lessonPairs));
      })
      .catch(() => {
        setModules([]);
        setModuleLessons({});
      })
      .finally(() => setLoading(false));
  }, [category]);

  const image = useMemo(() => categoryImage(category, 900), [category]);

  const moduleStats = (m: LearningModule) => {
    const lessons = moduleLessons[m.id] || [];
    const total = lessons.length || m.lessons_count || m.all_lessons_count || 0;
    const completed = lessons.filter((l) => completedLessonIds.includes(l.id)).length;
    return { total, completed, lessons };
  };

  const lessonsCount = modules.reduce((s, m) => s + moduleStats(m).total, 0);
  const completedCount = modules.reduce((s, m) => s + moduleStats(m).completed, 0);
  const courseProgress = lessonsCount > 0 ? Math.round((completedCount / lessonsCount) * 100) : 0;
  const isCourseComplete = lessonsCount > 0 && completedCount >= lessonsCount;

  const isModuleComplete = (m: LearningModule) => {
    const s = moduleStats(m);
    return s.total > 0 && s.completed >= s.total;
  };

  const isModuleUnlocked = (i: number) =>
    i === 0 || modules.slice(0, i).every(isModuleComplete);

  const continueModule = isCourseComplete
    ? null
    : modules.find((m, i) => isModuleUnlocked(i) && !isModuleComplete(m)) || modules[0] || null;

  const currentLessonInfo = useMemo(() => {
    if (!continueModule) return null;
    const lessons = moduleLessons[continueModule.id] || [];
    const completed = lessons.filter((l) => completedLessonIds.includes(l.id)).length;
    return {
      module: continueModule,
      lessonIndex: lessons.length > 0 ? Math.min(completed + 1, lessons.length) : 1,
      totalLessons: lessons.length,
      completedLessons: completed,
    };
  }, [continueModule, moduleLessons, completedLessonIds]);

  const heroBg = category?.background_color || "#071224";
  const heroH = isDesktop ? 275 : 260;

  return (
    <>
      <style>{`
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .cop-root { animation: pageIn 0.4s cubic-bezier(0.22,1,0.36,1) both; }

        .cop-scroll::-webkit-scrollbar { width: 4px; }
        .cop-scroll::-webkit-scrollbar-track { background: transparent; }
        .cop-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }
        .cop-hs { -ms-overflow-style: none; scrollbar-width: none; }
        .cop-hs::-webkit-scrollbar { display: none; }

        .cop-icon-btn {
          transition: background 0.18s, transform 0.18s;
        }
        .cop-icon-btn:hover {
          background: rgba(255,255,255,0.32) !important;
          transform: scale(1.07);
        }

        .cop-cta {
          transition: filter 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .cop-cta:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-2px);
          box-shadow: 0 14px 36px rgba(255,90,44,0.45) !important;
        }
        .cop-cta:active:not(:disabled) { transform: translateY(0); }

        .cop-resume {
          transition: transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s;
        }
        .cop-resume:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.10) !important;
        }

        .cop-module {
          transition: background 0.15s, transform 0.15s;
        }
        .cop-module:hover {
          background: #fafaf8 !important;
          transform: translateX(4px);
        }

        .cop-skeleton {
          background: linear-gradient(90deg, #ebe9e4 25%, #f5f3ef 50%, #ebe9e4 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border-radius: 6px;
        }
      `}</style>

      <div
        className="cop-root"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          background: "#f5f5f3",
          overflow: "hidden",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        }}
      >
        {/* ── HERO ── */}
        <div
          style={{
            position: "relative",
            height: heroH,
            flexShrink: 0,
            background: heroBg,
            overflow: "hidden",
          }}
        >
          {image && (
            <img
              src={image}
              alt={category?.title || ""}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center 30%",
                filter: "brightness(0.75) saturate(1.15)",
              }}
            />
          )}

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.02) 38%, rgba(0,0,0,0.0) 55%, rgba(7,18,36,0.92) 100%)",
            }}
          />

          {/* Top bar */}
          <div
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: isDesktop ? "18px 32px" : "14px 20px",
              zIndex: 10,
            }}
          >
            <button
              onClick={onBack}
              className="cop-icon-btn"
              aria-label="Back"
              style={{
                width: 40, height: 40,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.28)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={17} color="white" />
            </button>

            <button
              className="cop-icon-btn"
              aria-label="Bookmark"
              style={{
                width: 40, height: 40,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.28)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <BookmarkIcon />
            </button>
          </div>

          {/* Hero content */}
          <div
            style={{
              position: "absolute",
              bottom: 0, left: 0, right: 0,
              padding: isDesktop ? "0 32px 24px" : "0 22px 20px",
            }}
          >
            {category?.flag_emoji && (
              <div style={{ fontSize: 30, marginBottom: 5, lineHeight: 1 }}>
                {category.flag_emoji}
              </div>
            )}

            <h1
              style={{
                fontWeight: 900,
                fontSize: isDesktop ? 28 : 23,
                color: "white",
                letterSpacing: -0.9,
                lineHeight: 1.06,
                margin: "0 0 8px 0",
              }}
            >
              {category?.title || "Learning Path"}
            </h1>

            {/* Meta row — v2 style with icons */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <span
                style={{
                  fontSize: 12.5,
                  color: "rgba(255,255,255,0.75)",
                  fontWeight: 500,
                  display: "flex", alignItems: "center", gap: 5,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                {lessonsCount} lessons
              </span>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.35)" }} />
              <span
                style={{
                  fontSize: 12.5,
                  color: "rgba(255,255,255,0.75)",
                  fontWeight: 500,
                  display: "flex", alignItems: "center", gap: 5,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
                {modules.length} modules
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: 0.2 }}>
                  Progress
                </span>
                <span style={{ fontSize: 12.5, color: "white", fontWeight: 700 }}>
                  {courseProgress}%
                </span>
              </div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.22)", borderRadius: 9999, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${courseProgress}%`,
                    height: "100%",
                    background: courseProgress === 100 ? "#4ade80" : "#ff5a2c",
                    borderRadius: 9999,
                    transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                  }}
                />
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                if (isCourseComplete) return;
                if (continueModule) onModuleClick(continueModule);
              }}
              disabled={loading || (!continueModule && !isCourseComplete)}
              className="cop-cta"
              style={{
                width: "100%",
                padding: "14px",
                background: isCourseComplete ? "#22c55e" : "#ff5a2c",
                color: "white",
                border: "none",
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: -0.2,
                cursor: !loading && (isCourseComplete || continueModule) ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                boxShadow: isCourseComplete
                  ? "0 6px 24px rgba(34,197,94,0.35)"
                  : "0 6px 24px rgba(255,90,44,0.4)",
                opacity: !loading && (isCourseComplete || continueModule) ? 1 : 0.65,
              }}
            >
              {isCourseComplete ? "Complete" : "Continue Learning"}
              {isCourseComplete ? <CheckIcon size={17} color="white" /> : <ArrowRight size={17} />}
            </button>
          </div>
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div
          className={isDesktop ? "cop-scroll" : "cop-hs"}
          style={{ flex: 1, overflowY: "auto", background: "#f5f5f3" }}
        >
          <div
            style={{
              maxWidth: isDesktop ? 720 : "100%",
              margin: isDesktop ? "0 auto" : undefined,
              padding: isDesktop ? "0 40px 48px" : "0 16px 40px",
            }}
          >
            {/* ── RESUME CARD ── */}
            {!loading && isCourseComplete && (
              <div style={{ padding: "16px 0 6px" }}>
                <div
                  style={{
                    background: "white",
                    borderRadius: 18,
                    border: "1px solid rgba(0,0,0,0.07)",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: "#dcfce7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      position: "relative",
                    }}
                  >
                    <CheckIcon size={22} color="#16a34a" />
                    <div
                      style={{
                        position: "absolute",
                        inset: -4,
                        borderRadius: 18,
                        border: "1.5px solid rgba(22,163,74,0.18)",
                      }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 10.5,
                        color: "#16a34a",
                        fontWeight: 800,
                        letterSpacing: 0.8,
                        textTransform: "uppercase",
                        marginBottom: 3,
                      }}
                    >
                      Completed
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#111",
                        lineHeight: 1.25,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      You’ve finished this course
                    </div>
                    <div style={{ fontSize: 12.5, color: "#999", marginTop: 2 }}>
                      {completedCount} of {lessonsCount} lessons completed
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!loading && !isCourseComplete && currentLessonInfo && (
              <div style={{ padding: "16px 0 6px" }}>
                <div
                  onClick={() => onModuleClick(currentLessonInfo.module)}
                  className="cop-resume"
                  style={{
                    background: "white",
                    borderRadius: 18,
                    border: "1px solid rgba(0,0,0,0.07)",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    cursor: "pointer",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* Play icon with pulse ring */}
                  <div
                    style={{
                      width: 48, height: 48,
                      borderRadius: 14,
                      background: "#fff1ec",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      position: "relative",
                    }}
                  >
                    <PlayIcon size={22} color="#ff5a2c" />
                    <div
                      style={{
                        position: "absolute",
                        inset: -4,
                        borderRadius: 18,
                        border: "1.5px solid rgba(255,90,44,0.2)",
                      }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10.5, color: "#f97316", fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 3 }}>
                      Up next
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#111",
                        lineHeight: 1.25,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {currentLessonInfo.module.title}
                    </div>
                    <div style={{ fontSize: 12.5, color: "#999", marginTop: 2 }}>
                      Lesson {currentLessonInfo.lessonIndex} of {currentLessonInfo.totalLessons}
                    </div>
                  </div>

                  <div
                    style={{
                      width: 32, height: 32,
                      borderRadius: "50%",
                      background: "#f5f5f3",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <ChevRight stroke="#999" />
                  </div>
                </div>
              </div>
            )}

            {/* ── LEARNING PATH ── */}
            <div style={{ padding: "14px 0 0" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#aaa",
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                Learning path
              </div>

              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "14px 16px",
                        background: "white",
                        borderRadius: 16,
                        border: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      <div className="cop-skeleton" style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div className="cop-skeleton" style={{ height: 10, width: "28%", marginBottom: 7 }} />
                        <div className="cop-skeleton" style={{ height: 13, width: `${42 + n * 7}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : modules.length === 0 ? (
                <p style={{ color: "#bbb", padding: "24px 0", textAlign: "center", fontSize: 14 }}>
                  No modules available yet.
                </p>
              ) : (
                /* Timeline list — v1 concept */
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {modules.map((module, i) => {
                    const complete = isModuleComplete(module);
                    const unlocked = isModuleUnlocked(i);
                    const current = unlocked && !complete;

                    return (
                      <div key={module.id} style={{ display: "flex", alignItems: "stretch", gap: 12 }}>

                        {/* Timeline spine */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 38, flexShrink: 0 }}>
                          <div
                            style={{
                              width: 38, height: 38,
                              borderRadius: "50%",
                              flexShrink: 0,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              background: complete ? "#dcfce7" : current ? "#fff1ec" : "#f3f2ef",
                            }}
                          >
                            {complete ? (
                              <CheckIcon size={16} color="#16a34a" />
                            ) : current ? (
                              <PlayIcon size={16} color="#ff5a2c" />
                            ) : (
                              <LockIcon size={15} color="#c4bfb8" />
                            )}
                          </div>
                          {i < modules.length - 1 && (
                            <div
                              style={{
                                width: 2,
                                flex: 1,
                                minHeight: 10,
                                background: complete ? "#86efac" : "#e5e7eb",
                                marginTop: 3,
                                marginBottom: 3,
                              }}
                            />
                          )}
                        </div>

                        {/* Module card */}
                        <div
                          onClick={() => unlocked && onModuleClick(module)}
                          className={unlocked ? "cop-module" : ""}
                          style={{
                            flex: 1,
                            padding: "11px 14px",
                            marginBottom: i < modules.length - 1 ? 6 : 0,
                            borderRadius: 14,
                            cursor: unlocked ? "pointer" : "default",
                            opacity: unlocked ? 1 : 0.45,
                            background: "white",
                            border: current
                              ? "1.5px solid rgba(255,90,44,0.22)"
                              : "1px solid rgba(0,0,0,0.06)",
                            boxShadow: current ? "0 2px 14px rgba(255,90,44,0.07)" : "none",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: current ? "#f97316" : complete ? "#16a34a" : "#bbb",
                                  letterSpacing: 0.5,
                                  textTransform: "uppercase",
                                  marginBottom: 3,
                                }}
                              >
                                Module {i + 1}{complete && " · Done"}{current && " · Active"}
                              </div>
                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: current ? 700 : complete ? 500 : 500,
                                  color: current ? "#111" : complete ? "#333" : "#666",
                                  lineHeight: 1.3,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {module.title}
                              </div>
                            </div>

                            {unlocked && (
                              <div style={{ flexShrink: 0, marginLeft: 8 }}>
                                <ChevRight stroke={complete ? "#86efac" : current ? "#ff5a2c" : "#ddd"} />
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}