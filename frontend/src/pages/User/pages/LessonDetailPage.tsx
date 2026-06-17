import React, { useEffect, useState, useRef } from "react";
import api from "../../../api/axios";
import {
  ArrowLeft,
  ArrowRight,
  BookmarkIcon,
  ChevDown,
  ChevUp,
  ClockIcon,
  LearningLesson,
  formatLessonDuration,
  hasLessonDuration,
  parseLessonContentBlock,
  RichTextContent,
  WarningNotice,
  youtubeEmbedUrl,
  type LessonNextAction,
} from "./shared";

interface LessonDetailPageProps {
  onBack: () => void;
  onNext: () => void;
  isDesktop: boolean;
  lesson: LearningLesson | null;
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
          Back to Home 🎉
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
  onNext,
  lesson,
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

  useEffect(() => {
    setExpanded([]);
  }, [detail?.id]);

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

  // Handle next / complete
  const handleNext = () => {
    if (nextAction === "complete-course") {
      setShowComplete(true);
    } else {
      onNext();
    }
  };

  const handleContinueAfterComplete = () => {
    setShowComplete(false);
    onNext();
  };

  return (
    <>
      {/* Confetti fires while modal is open */}
      <ConfettiOverlay active={showComplete} />

      {/* Course complete modal */}
      <CourseCompleteModal
        visible={showComplete}
        onContinue={handleContinueAfterComplete}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          background: "#0d1f35",
          animation: "pageIn .35s cubic-bezier(.22,1,.36,1)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px 10px",
            flexShrink: 0,
          }}
        >
          <button
            onClick={onBack}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(255,255,255,.1)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={15} />
          </button>
          <span style={{ color: "rgba(255,255,255,.75)", fontSize: 13, fontWeight: 600 }}>
            Lesson {lessonIndex + 1} of {totalLessons}
          </span>
          <button
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(255,255,255,.1)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <BookmarkIcon />
          </button>
        </div>

        {/* Title + duration */}
        <div style={{ padding: "0 18px 10px", flexShrink: 0 }}>
          <h1
            style={{
              fontWeight: 900,
              fontSize: 22,
              color: "white",
              letterSpacing: -0.6,
              marginBottom: durationLabel ? 6 : 0,
              lineHeight: 1.15,
            }}
          >
            {loading ? "Loading..." : detail?.title || "Lesson"}
          </h1>
          {durationLabel && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <ClockIcon size={13} color="rgba(255,255,255,.5)" />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>
                {durationLabel}
              </span>
            </div>
          )}
        </div>

        {/* Video */}
        {embedUrl && (
          <div
            style={{
              position: "relative",
              margin: "0 18px 0",
              borderRadius: 14,
              overflow: "hidden",
              flexShrink: 0,
              background: "#071224",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                paddingBottom: "56.25%",
                height: 0,
                background: "#000",
              }}
            >
              <iframe
                src={embedUrl}
                title={detail?.title || "Lesson video"}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  border: 0,
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* White content panel */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            background: "white",
            borderRadius: "20px 20px 0 0",
            marginTop: embedUrl ? 14 : 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{ flex: 1, overflowY: "auto", padding: "16px 18px 0" }}
            className="hs"
          >
            <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 14 }}>
              Expand the sections below to learn more.
            </p>

            {detail?.warning && (
              <div style={{ marginTop: 10 }}>
                <WarningNotice message={detail.warning} />
              </div>
            )}

            {contentBlocks.length === 0 ? (
              <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                No content added yet.
              </p>
            ) : (
              contentBlocks.map((block, index) => {
                const key = String(block.id);
                const isOpen = expanded.includes(key);

                return (
                  <div key={block.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <button
                      onClick={() => toggleSection(key)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 0",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ fontWeight: 800, fontSize: 14, color: "#111" }}>
                        {block.title || `Section ${index + 1}`}
                      </span>
                      {isOpen ? <ChevUp /> : <ChevDown />}
                    </button>
                    {isOpen && (
                      <>
                        <RichTextContent
                          html={block.description}
                          style={{
                            fontSize: 13,
                            color: "#444",
                            lineHeight: 1.75,
                            margin: 0,
                            paddingBottom: block.file_path ? 10 : 16,
                          }}
                        />
                        {block.file_path && (
                          <a
                            href={
                              block.file_path.startsWith("http")
                                ? block.file_path
                                : `/api/storage/${block.file_path}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 16,
                              padding: "10px 14px",
                              borderRadius: 12,
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              color: "#15803d",
                              fontSize: 13,
                              fontWeight: 700,
                              textDecoration: "none",
                            }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                            </svg>
                            {block.file_name || "Download attachment"}
                          </a>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}
            <div style={{ height: 16 }} />
          </div>

          {/* CTA button */}
          <div
            style={{
              padding: "12px 18px 20px",
              background: "white",
              borderTop: "1px solid #f5f5f5",
              flexShrink: 0,
            }}
          >
            <button
              onClick={handleNext}
              disabled={advancing}
              style={{
                width: "100%",
                padding: "15px",
                background: advancing ? "#ffb89c" : "#ff5a2c",
                color: "white",
                border: "none",
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 800,
                cursor: advancing ? "default" : "pointer",
                boxShadow: advancing ? "none" : "0 6px 20px rgba(255,90,44,.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: advancing ? 0.85 : 1,
                transition: "background .2s",
              }}
            >
              {advancing ? "Saving..." : nextButtonLabel[nextAction]}{" "}
              {!advancing && <ArrowRight />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}