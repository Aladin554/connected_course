import React, { useEffect, useState, useRef } from "react";
import api from "../../../api/axios";
import {
  ArrowLeft,
  ArrowRight,
  ChevDown,
  ClockIcon,
  LearningLesson,
  formatLessonDuration,
  hasLessonDuration,
  parseLessonContentBlock,
  RichTextContent,
  WarningNotice,
  youtubeEmbedUrl,
  type LessonNextAction,
  NavHomeIcon,
  PlayIcon,
} from "./shared";

interface LessonDetailPageProps {
  onBack: () => void;
  onHome: () => void;           // ← Added
  onNext: () => void | Promise<void>;
  onFinishCourse?: () => void;
  isDesktop: boolean;
  lesson: LearningLesson | null;
  moduleTitle?: string | null;
  moduleNumber?: number | null;
  lessonIndex: number;
  totalLessons: number;
  nextAction?: LessonNextAction;
  advancing?: boolean;
}

const nextButtonLabel: Record<LessonNextAction, string> = {
  "next-lesson": "Next Lesson",
  "next-module": "Next Module",
  "complete-course": "Complete Course",
};

// ── Confetti particle type ────────────────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: "rect" | "circle" | "star";
  opacity: number;
}

const CONFETTI_COLORS = [
  "#ff5a2c", "#ffd700", "#00c6ff", "#ff6eb4",
  "#7c3aed", "#10b981", "#f97316", "#06b6d4",
];

function createParticle(id: number): Particle {
  return {
    id,
    x: Math.random() * window.innerWidth,
    y: -20,
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 3 + 2,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: Math.random() * 10 + 6,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 8,
    shape: (["rect", "circle", "star"] as const)[Math.floor(Math.random() * 3)],
    opacity: 1,
  };
}

// ── Confetti Canvas overlay ───────────────────────────────────────────────────
function ConfettiOverlay({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);
  const spawnRef = useRef<number>(0);
  const counterRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particlesRef.current = [];
    counterRef.current = 0;

    const drawStar = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn burst
      spawnRef.current++;
      if (spawnRef.current < 80 && counterRef.current < 180) {
        const burst = spawnRef.current < 20 ? 8 : spawnRef.current < 50 ? 4 : 2;
        for (let i = 0; i < burst; i++) {
          particlesRef.current.push(createParticle(counterRef.current++));
        }
      }

      particlesRef.current = particlesRef.current.filter((p) => p.opacity > 0.05 && p.y < canvas.height + 40);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.vy += 0.07; // gravity
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        if (p.y > canvas.height * 0.6) p.opacity -= 0.018;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          drawStar(0, 0, p.size / 2);
          ctx.fill();
        }

        ctx.restore();
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
      }}
    />
  );
}

// ── Completion Modal ──────────────────────────────────────────────────────────
function CourseCompleteModal({
  visible,
  onContinue,
}: {
  visible: boolean;
  onContinue: () => void;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setShow(true), 80);
      return () => clearTimeout(t);
    } else {
      setShow(false);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 28,
          padding: "40px 32px 32px",
          maxWidth: 360,
          width: "100%",
          textAlign: "center",
          transform: show ? "scale(1) translateY(0)" : "scale(0.88) translateY(20px)",
          opacity: show ? 1 : 0,
          transition: "transform .45s cubic-bezier(.22,1,.36,1), opacity .35s ease",
          boxShadow: "0 32px 80px rgba(0,0,0,.22)",
          pointerEvents: "auto",
        }}
      >
        {/* Trophy icon */}
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 44,
            boxShadow: "0 0 0 12px #fff7ed, 0 0 0 16px #fed7aa",
            animation: show ? "trophyBounce .6s .25s cubic-bezier(.22,1,.36,1) both" : "none",
          }}
        >
          🏆
        </div>

        <h2
          style={{
            fontSize: 26,
            fontWeight: 900,
            color: "#0d1f35",
            letterSpacing: -0.6,
            margin: "0 0 8px",
            lineHeight: 1.15,
          }}
        >
          Course Complete!
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "#6b7280",
            margin: "0 0 28px",
            lineHeight: 1.6,
          }}
        >
          You've finished all the lessons. Great work — keep the momentum going!
        </p>

        {/* Stars row */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            marginBottom: 28,
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                fontSize: 30,
                display: "inline-block",
                animation: show
                  ? `starPop .5s ${0.35 + i * 0.12}s cubic-bezier(.22,1,.36,1) both`
                  : "none",
              }}
            >
              ⭐
            </span>
          ))}
        </div>

        <button
          onClick={onContinue}
          style={{
            width: "100%",
            padding: "15px",
            background: "#ff5a2c",
            color: "white",
            border: "none",
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(255,90,44,.35)",
            letterSpacing: -0.2,
          }}
        >
          Continue
        </button>
      </div>

      <style>{`
        @keyframes trophyBounce {
          0%   { transform: scale(0.5) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(4deg); opacity: 1; }
          80%  { transform: scale(0.95) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes starPop {
          0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
          65%  { transform: scale(1.25) rotate(8deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LessonDetailPage({
  onBack,
  onHome,                    // ← Added
  onNext,
  onFinishCourse,
  isDesktop,
  lesson,
  moduleTitle,
  moduleNumber,
  lessonIndex,
  totalLessons,
  nextAction = "next-lesson",
  advancing = false,
}: LessonDetailPageProps) {
  const [detail, setDetail] = useState<LearningLesson | null>(lesson);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    if (!lesson) {
      setDetail(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get(`/lessons/${lesson.id}`)
      .then((res) => setDetail(res.data))
      .catch(() => setDetail(lesson))
      .finally(() => setLoading(false));
  }, [lesson]);

  const contentBlocks = (detail?.strategies || []).map(parseLessonContentBlock);

  // Open the first section so the lesson never looks empty.
  const firstBlockId = contentBlocks[0]?.id;
  useEffect(() => {
    setExpanded(firstBlockId ? [String(firstBlockId)] : []);
  }, [detail?.id, firstBlockId]);

  const toggleSection = (key: string) =>
    setExpanded((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    );

  const durationLabel = hasLessonDuration(detail?.duration_mins)
    ? formatLessonDuration(
        detail?.duration_mins || 0,
        detail?.duration_unit === "seconds" ? "seconds" : "minutes"
      )
    : null;
  const embedUrl = youtubeEmbedUrl(detail?.video_value);

  const handleNext = async () => {
    if (nextAction === "complete-course") {
      await onNext();
      setShowComplete(true);
      return;
    }
    onNext();
  };

  const handleContinueAfterComplete = () => {
    setShowComplete(false);
    if (onFinishCourse) {
      onFinishCourse();
    }
  };

  const sectionCount = contentBlocks.length;
  const progressPct = totalLessons > 0 ? Math.min(100, ((lessonIndex + 1) / totalLessons) * 100) : 0;
  const gutter = isDesktop ? 32 : 18;
  // Desktop column follows the video's width so title, video, guide and button share one edge.
  const columnWidth = `min(960px, max(484px, calc((100dvh - 340px) * 16 / 9 + ${gutter * 2}px)))`;
  const moduleLabel = [moduleNumber ? `Module ${moduleNumber}` : null, moduleTitle || null]
    .filter(Boolean)
    .join(" · ");

  const iconButton = (onClick: () => void, label: string, icon: React.ReactNode) => (
    <button onClick={onClick} aria-label={label} className="ld-icon-btn" style={iconButtonStyle}>
      {icon}
    </button>
  );

  const progress = (
    <div style={{ display: "flex", gap: 4, width: "100%" }} aria-hidden="true">
      {totalLessons > 0 && totalLessons <= 12 ? (
        Array.from({ length: totalLessons }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 4,
              background: i <= lessonIndex ? "linear-gradient(90deg,#ff7a45,#ff5a2c)" : "rgba(255,255,255,.14)",
              boxShadow: i === lessonIndex ? "0 0 12px rgba(255,90,44,.6)" : "none",
            }}
          />
        ))
      ) : (
        <div style={{ flex: 1, height: 4, borderRadius: 4, background: "rgba(255,255,255,.14)", overflow: "hidden" }}>
          <div style={{ width: `${progressPct}%`, height: "100%", background: "linear-gradient(90deg,#ff7a45,#ff5a2c)" }} />
        </div>
      )}
    </div>
  );

  const metaPill = (icon: React.ReactNode, text: string) => (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        borderRadius: 999,
        background: "rgba(255,255,255,.07)",
        border: "1px solid rgba(255,255,255,.1)",
        color: "rgba(255,255,255,.72)",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {icon}
      {text}
    </span>
  );

  const titleBlock = (
    <div style={{ flexShrink: 0 }}>
      {moduleLabel && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
            color: "#ff8a5c",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.1,
            textTransform: "uppercase",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff5a2c", boxShadow: "0 0 10px #ff5a2c" }} />
          {moduleLabel}
        </div>
      )}
      <h1
        style={{
          fontWeight: 900,
          fontSize: isDesktop ? 32 : 24,
          color: "white",
          letterSpacing: isDesktop ? -0.9 : -0.6,
          lineHeight: 1.12,
          marginBottom: 12,
        }}
      >
        {loading ? "Loading..." : detail?.title || "Lesson"}
      </h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {durationLabel && metaPill(<ClockIcon size={13} color="rgba(255,255,255,.6)" />, durationLabel)}
        {embedUrl && metaPill(<PlayIcon size={11} color="rgba(255,255,255,.6)" />, "Video lesson")}
        {sectionCount > 0 && metaPill(<ListIcon />, `${sectionCount} ${sectionCount === 1 ? "section" : "sections"}`)}
      </div>
    </div>
  );

  const video = embedUrl && (
    <div
      style={{
        position: "relative",
        // The column is sized so the whole video (and its controls) stays above the pinned "Next" bar.
        width: "100%",
        margin: isDesktop ? "22px auto 0" : "16px auto 0",
        borderRadius: isDesktop ? 18 : 16,
        overflow: "hidden",
        flexShrink: 0,
        background: "#000",
        boxShadow: "0 30px 70px -24px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.08)",
      }}
    >
      <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", height: 0 }}>
        <iframe
          src={embedUrl}
          title={detail?.title || "Lesson video"}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        {/* Swallows clicks on YouTube's title/channel bar so learners don't leave for youtube.com. */}
        <div
          aria-hidden="true"
          onContextMenu={(e) => e.preventDefault()}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "min(72px, 24%)",
            zIndex: 1,
            background: "transparent",
            cursor: "default",
          }}
        />
      </div>
    </div>
  );

  const ctaButton = (
    <button
      onClick={handleNext}
      disabled={advancing}
      className="ld-cta"
      style={{
        width: "100%",
        height: 52,
        background: advancing ? "#ffb89c" : "linear-gradient(135deg,#ff7a45 0%,#ff5a2c 55%,#f0461a 100%)",
        color: "white",
        border: "none",
        borderRadius: 14,
        fontSize: 15,
        fontWeight: 800,
        letterSpacing: -0.1,
        cursor: advancing ? "default" : "pointer",
        boxShadow: advancing ? "none" : "0 10px 24px -8px rgba(255,90,44,.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        opacity: advancing ? 0.85 : 1,
        transition: "transform .15s, box-shadow .2s",
      }}
    >
      {advancing ? "Saving..." : nextButtonLabel[nextAction]} {!advancing && <ArrowRight />}
    </button>
  );

  const guide = (
    <div
      style={{
        flex: 1,
        background: "white",
        borderRadius: isDesktop ? 22 : "24px 24px 0 0",
        marginTop: isDesktop ? 26 : 18,
        display: "flex",
        flexDirection: "column",
        boxShadow: isDesktop ? "0 30px 80px -28px rgba(0,0,0,.6)" : "none",
        // Sit above the video so its drop shadow does not tint the panel.
        position: "relative",
        zIndex: 2,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: isDesktop ? "18px 22px 14px" : "18px 18px 12px",
          borderBottom: "1px solid #f1f2f5",
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", letterSpacing: -0.2 }}>Lesson guide</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            {sectionCount > 0 ? "Work through each section, then continue." : "Watch the lesson, then continue."}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: isDesktop ? "16px 22px 12px" : "14px 18px 8px" }}>
        {detail?.warning && <WarningNotice message={detail.warning} />}

        {contentBlocks.length === 0 ? (
          <div style={{ padding: "28px 8px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
            {loading ? "Loading lesson..." : "No content added yet."}
          </div>
        ) : (
          contentBlocks.map((block, index) => {
            const key = String(block.id);
            const isOpen = expanded.includes(key);

            return (
              <div
                key={block.id}
                style={{
                  border: `1px solid ${isOpen ? "#ffd9cb" : "#eef0f4"}`,
                  background: isOpen ? "#fffaf7" : "#fff",
                  borderRadius: 14,
                  marginBottom: 10,
                  transition: "background .2s, border-color .2s",
                }}
              >
                <button
                  data-section-toggle
                  onClick={() => toggleSection(key)}
                  aria-expanded={isOpen}
                  className="ld-section-btn"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "13px 14px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      flexShrink: 0,
                      borderRadius: 9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 800,
                      background: isOpen ? "linear-gradient(135deg,#ff7a45,#ff5a2c)" : "#fff1eb",
                      color: isOpen ? "white" : "#ff5a2c",
                      transition: "background .2s, color .2s",
                    }}
                  >
                    {index + 1}
                  </span>
                  <span style={{ flex: 1, fontWeight: 800, fontSize: 14.5, color: "#0f172a", letterSpacing: -0.1 }}>
                    {block.title || `Section ${index + 1}`}
                  </span>
                  <span
                    className="ld-chev"
                    style={{
                      width: 28,
                      height: 28,
                      flexShrink: 0,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f4f5f8",
                      transform: isOpen ? "rotate(180deg)" : "none",
                      transition: "transform .25s, background .2s",
                    }}
                  >
                    <ChevDown color={isOpen ? "#ff5a2c" : "#475569"} />
                  </span>
                </button>
                {isOpen && (
                  <div style={{ padding: isDesktop ? "0 18px 16px 54px" : "0 16px 16px 54px", animation: "ldFade .25s ease" }}>
                    <RichTextContent html={block.description} style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.75 }} />
                    {block.file_path && (
                      <a
                        href={block.file_path.startsWith("http") ? block.file_path : `/api/storage/${block.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          marginTop: 12,
                          padding: "9px 14px",
                          borderRadius: 12,
                          background: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                          color: "#15803d",
                          fontSize: 13,
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                        {block.file_name || "Download attachment"}
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );

  return (
    <>
      {/* Confetti fires while modal is open */}
      <ConfettiOverlay active={showComplete} />

      {/* Course complete modal */}
      <CourseCompleteModal visible={showComplete} onContinue={handleContinueAfterComplete} />

      <style>{`
        .ld-icon-btn:hover{background:rgba(255,255,255,.16)!important;}
        .ld-cta:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 16px 32px -10px rgba(255,90,44,.7)!important;}
        .ld-cta:active:not(:disabled){transform:translateY(0);}
        .ld-section-btn:hover .ld-chev{background:#eceef3!important;}
        @keyframes ldFade{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
      `}</style>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          background:
            "radial-gradient(1000px 520px at 10% -10%, rgba(255,90,44,.14), transparent 60%), radial-gradient(900px 520px at 100% 0%, rgba(56,132,255,.13), transparent 55%), #0b1a2e",
          animation: "pageIn .35s cubic-bezier(.22,1,.36,1)",
          // Very short screens (landscape phones) scroll the whole page once the guide hits its min height.
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        {/* Top bar + progress */}
        <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: `14px ${gutter}px 0`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {iconButton(onBack, "Back", <ArrowLeft size={16} />)}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
              <span style={{ color: "rgba(255,255,255,.8)", fontSize: 12.5, fontWeight: 700, letterSpacing: 0.2 }}>
                Lesson {lessonIndex + 1} of {totalLessons || 1}
              </span>
              <div style={{ width: "100%", maxWidth: isDesktop ? 360 : "none" }}>{progress}</div>
            </div>
            {iconButton(onHome, "Home", <NavHomeIcon size={17} color="white" />)}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            width: "100%",
            maxWidth: isDesktop ? columnWidth : "none",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            padding: isDesktop ? `24px ${gutter}px 6px` : `18px 0 0`,
          }}
        >
          <div style={{ padding: isDesktop ? 0 : `0 ${gutter}px`, flexShrink: 0 }}>
            {titleBlock}
            {video}
          </div>
          {guide}
        </div>

        {/* Always-visible next step, pinned to the bottom of the screen while the page scrolls. */}
        <div
          style={{
            position: "sticky",
            bottom: 0,
            zIndex: 5,
            flexShrink: 0,
            padding: isDesktop ? `26px ${gutter}px 22px` : "12px 18px 20px",
            background: isDesktop
              ? "linear-gradient(180deg, rgba(11,26,46,0) 0%, rgba(11,26,46,.92) 40%, #0b1a2e 100%)"
              : "white",
            borderTop: isDesktop ? "none" : "1px solid #f1f2f5",
          }}
        >
          <div style={{ maxWidth: isDesktop ? `calc(${columnWidth} - ${gutter * 2}px)` : "none", margin: "0 auto" }}>{ctaButton}</div>
        </div>
      </div>
    </>
  );
}

const iconButtonStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  flexShrink: 0,
  borderRadius: "50%",
  background: "rgba(255,255,255,.08)",
  border: "1px solid rgba(255,255,255,.12)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "background .2s",
};

const ListIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
