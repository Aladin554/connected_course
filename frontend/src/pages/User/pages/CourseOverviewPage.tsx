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

  const isModuleComplete = (m: LearningModule) => {
    const s = moduleStats(m);
    return s.total > 0 && s.completed >= s.total;
  };

  const isModuleUnlocked = (i: number) =>
    i === 0 || modules.slice(0, i).every(isModuleComplete);

  const continueModule =
    modules.find((m, i) => isModuleUnlocked(i) && !isModuleComplete(m)) || modules[0];

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
  const heroH = isDesktop ? 255 : 250;

  return (
    <>
      <style>{`
        @keyframes pageIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

        .cop-hs::-webkit-scrollbar { display:none; }
        .cop-hs { -ms-overflow-style:none; scrollbar-width:none; }

        .cop-back:hover, .cop-bkmk:hover { 
          background:rgba(255,255,255,.35) !important; 
        }

        .cop-cta {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cop-cta:hover {
          filter: brightness(1.12);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255,90,44,0.45);
        }

        .cop-module {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cop-module:hover {
          background: #fafaf8 !important;
          transform: translateX(4px);
        }

        .cop-last:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(0,0,0,0.1);
        }
      `}</style>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          background: "#f5f5f3",
          animation: "pageIn 0.4s cubic-bezier(0.22,1,0.36,1)",
          overflow: "hidden",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        }}
      >
        {/* Compact Hero */}
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
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center 35%",
                filter: "brightness(0.85) saturate(1.1)",
              }}
            />
          )}

          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, rgba(7,18,36,0.35) 15%, rgba(7,18,36,0.93) 78%)",
            }}
          />

          {/* Top Bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 20px",
              zIndex: 10,
            }}
          >
            <button
              onClick={onBack}
              className="cop-back"
              aria-label="Back"
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={17} />
            </button>

            <button
              className="cop-bkmk"
              aria-label="Bookmark"
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <BookmarkIcon />
            </button>
          </div>

          {/* Hero Content */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 17px" }}>
            {category?.flag_emoji && (
              <div style={{ fontSize: 29, marginBottom: 4 }}>{category.flag_emoji}</div>
            )}

            <h1
              style={{
                fontWeight: 900,
                fontSize: isDesktop ? 27 : 23,
                color: "white",
                letterSpacing: -0.85,
                lineHeight: 1.05,
                margin: "0 0 6px 0",
              }}
            >
              {category?.title || "Learning Path"}
            </h1>

            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.82)", fontWeight: 600, marginBottom: 12 }}>
              {lessonsCount} Lessons • {modules.length} Modules
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.85)", fontWeight: 700, marginBottom: 5 }}>
                {courseProgress}% COMPLETE
              </div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.28)", borderRadius: 9999 }}>
                <div
                  style={{
                    width: `${courseProgress}%`,
                    height: "100%",
                    background: "#22c55e",
                    borderRadius: 9999,
                    transition: "width 0.7s ease-out",
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => continueModule && onModuleClick(continueModule)}
              disabled={!continueModule || loading}
              className="cop-cta"
              style={{
                width: "100%",
                padding: "14px",
                background: "#ff5a2c",
                color: "white",
                border: "none",
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 800,
                cursor: continueModule && !loading ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                boxShadow: "0 5px 22px rgba(255, 90, 44, 0.38)",
                opacity: continueModule && !loading ? 1 : 0.7,
              }}
            >
              Continue Learning <ArrowRight size={17} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="cop-hs" style={{ flex: 1, overflowY: "auto", background: "#f5f5f3" }}>
          <div
            style={{
              maxWidth: isDesktop ? 720 : "100%",
              margin: isDesktop ? "0 auto" : undefined,
              padding: isDesktop ? "0 40px" : "0 16px",
            }}
          >
            {/* Resume Card */}
            {!loading && currentLessonInfo && (
              <div style={{ padding: "14px 0 6px" }}>
                <div
                  onClick={() => onModuleClick(currentLessonInfo.module)}
                  className="cop-last"
                  style={{
                    background: "white",
                    borderRadius: 16,
                    border: "1px solid #f0f0f0",
                    padding: "13px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    cursor: "pointer",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "#fff4f0",
                      border: "2px solid rgba(255,90,44,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <PlayIcon size={22} color="#ff5a2c" />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: "#f97316", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
                      CONTINUE
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#111", margin: "3px 0 2px", lineHeight: 1.25 }}>
                      {currentLessonInfo.module.title}
                    </div>
                    <div style={{ fontSize: 12.5, color: "#666" }}>
                      Lesson {currentLessonInfo.lessonIndex} of {currentLessonInfo.totalLessons}
                    </div>
                  </div>

                  <ChevRight />
                </div>
              </div>
            )}

            {/* Learning Path */}
            <div style={{ padding: "8px 0 40px" }}>
              <div style={{ fontSize: 17.5, fontWeight: 900, color: "#111", marginBottom: 16 }}>
                Your Learning Path
              </div>

              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#e5e5e5" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 13, width: "58%", background: "#e5e5e5", borderRadius: 6, marginBottom: 5 }} />
                        <div style={{ height: 9, width: "38%", background: "#f0f0f0", borderRadius: 6 }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : modules.length === 0 ? (
                <p style={{ color: "#888", padding: "20px 0" }}>No modules available yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {modules.map((module, i) => {
                    const complete = isModuleComplete(module);
                    const unlocked = isModuleUnlocked(i);
                    const current = unlocked && !complete;

                    const statusLabel = complete ? "Completed" : current ? "In Progress" : null;
                    const statusColor = complete ? "#16a34a" : "#ff5a2c";

                    return (
                      <div key={module.id} style={{ display: "flex", alignItems: "stretch", gap: 13 }}>
                        {/* Timeline */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 30 }}>
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: "50%",
                              background: complete ? "#22c55e" : current ? "#ff5a2c" : "#e5e7eb",
                              border: complete || current ? "none" : "2.5px solid #d1d5db",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {complete ? (
                              <CheckIcon size={13} />
                            ) : current ? (
                              <PlayIcon size={13} color="white" />
                            ) : (
                              <LockIcon size={13} color="#9ca3af" />
                            )}
                          </div>
                          {i < modules.length - 1 && (
                            <div
                              style={{
                                width: 2,
                                flex: 1,
                                background: complete ? "#86efac" : "#e5e7eb",
                                marginTop: 3,
                              }}
                            />
                          )}
                        </div>

                        {/* Module Card */}
                        <div
                          onClick={() => unlocked && onModuleClick(module)}
                          className={unlocked ? "cop-module" : ""}
                          style={{
                            flex: 1,
                            padding: "11px 14px",
                            marginBottom: i < modules.length - 1 ? 6 : 0,
                            borderRadius: 14,
                            cursor: unlocked ? "pointer" : "default",
                            opacity: unlocked ? 1 : 0.55,
                            background: current ? "rgba(255,90,44,0.06)" : "white",
                            border: current ? "1px solid rgba(255,90,44,0.15)" : "1px solid #f0f0f0",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: current ? 800 : 700, color: current ? "#111" : "#222" }}>
                                Module {i + 1}
                              </div>
                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: current ? 700 : 600,
                                  color: current ? "#1f2937" : "#4b5563",
                                  marginTop: 1,
                                  lineHeight: 1.3,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {module.title}
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
                              {statusLabel && (
                                <span style={{ fontSize: 11.5, fontWeight: 700, color: statusColor }}>
                                  {statusLabel}
                                </span>
                              )}
                              {unlocked ? (
                                <ChevRight stroke={current ? "#ff5a2c" : complete ? "#22c55e" : "#9ca3af"} />
                              ) : (
                                <LockIcon size={15} color="#9ca3af" />
                              )}
                            </div>
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