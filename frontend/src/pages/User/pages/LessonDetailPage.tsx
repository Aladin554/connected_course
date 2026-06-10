import React, { useEffect, useRef, useState } from "react";
import api from "../../../api/axios";
import {
  ArrowLeft,
  ArrowRight,
  BookmarkIcon,
  ChevDown,
  ChevUp,
  ClockIcon,
  FullscreenIcon,
  LearningLesson,
  parseLessonContentBlock,
  PlayIcon,
} from "./shared";

interface LessonDetailPageProps {
  onBack: () => void;
  onNext: () => void;
  isDesktop: boolean;
  lesson: LearningLesson | null;
}

export default function LessonDetailPage({ onBack, onNext, lesson }: LessonDetailPageProps) {
  const [detail, setDetail] = useState<LearningLesson | null>(lesson);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!lesson) {
      setDetail(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    api.get(`/lessons/${lesson.id}`)
      .then((res) => setDetail(res.data))
      .catch(() => setDetail(lesson))
      .finally(() => setLoading(false));
  }, [lesson]);

  const contentBlocks = (detail?.strategies || []).map(parseLessonContentBlock);

  useEffect(() => {
    setExpanded(contentBlocks.map((block) => String(block.id)));
  }, [detail?.id, contentBlocks.length]);

  const togglePlay = () => {
    if (playing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPlaying(false);
      return;
    }

    setPlaying(true);
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setPlaying(false);
          return 100;
        }
        return p + 0.4;
      });
    }, 100);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const toggleSection = (key: string) =>
    setExpanded((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);

  const totalSecs = Math.max(1, (detail?.duration_mins || 1) * 60);
  const currentSecs = Math.floor((progress / 100) * totalSecs);
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const thumb = detail?.video_thumbnail || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "#0d1f35", animation: "pageIn .35s cubic-bezier(.22,1,.36,1)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 10px", flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowLeft size={15} />
        </button>
        <span style={{ color: "rgba(255,255,255,.75)", fontSize: 13, fontWeight: 600 }}>Lesson</span>
        <button style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <BookmarkIcon />
        </button>
      </div>

      <div style={{ padding: "0 18px 10px", flexShrink: 0 }}>
        <h1 style={{ fontWeight: 900, fontSize: 22, color: "white", letterSpacing: -0.6, marginBottom: 6, lineHeight: 1.15 }}>
          {loading ? "Loading..." : detail?.title || "Lesson"}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <ClockIcon size={13} color="rgba(255,255,255,.5)" />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>{detail?.duration_mins || 0} mins</span>
        </div>
      </div>

      <div style={{ position: "relative", margin: "0 18px 0", borderRadius: 14, overflow: "hidden", flexShrink: 0, background: "#071224" }}>
        <img src={thumb} alt="lesson" style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.3)" }} />

        <button
          onClick={togglePlay}
          style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-60%)", width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,.3)" }}
        >
          {playing ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#111" stroke="none">
              <rect x="6" y="4" width="4" height="16"/>
              <rect x="14" y="4" width="4" height="16"/>
            </svg>
          ) : (
            <PlayIcon size={18} color="#111" />
          )}
        </button>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 12px", background: "linear-gradient(to top,rgba(0,0,0,.7),transparent)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "white", fontWeight: 600, flexShrink: 0 }}>{fmt(currentSecs)}</span>
            <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,.3)", borderRadius: 2, overflow: "hidden", cursor: "pointer" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "#ff5a2c", borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.7)", flexShrink: 0 }}>{fmt(totalSecs)}</span>
            <button style={{ background: "none", border: "none", cursor: "pointer", lineHeight: 0, padding: 0 }}>
              <FullscreenIcon />
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, background: "white", borderRadius: "20px 20px 0 0", marginTop: 14, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 0" }} className="hs">
          <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 14 }}>Expand the sections below to learn more.</p>

          {contentBlocks.length === 0 ? (
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>No content added yet.</p>
          ) : contentBlocks.map((block, index) => {
            const key = String(block.id);
            const isOpen = expanded.includes(key);

            return (
              <div key={block.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <button
                  onClick={() => toggleSection(key)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                >
                  <span style={{ fontWeight: 800, fontSize: 14, color: "#111" }}>{block.title || `Section ${index + 1}`}</span>
                  {isOpen ? <ChevUp /> : <ChevDown />}
                </button>
                {isOpen && <p style={{ fontSize: 13, color: "#444", lineHeight: 1.75, margin: 0, paddingBottom: 16 }}>{block.description}</p>}
              </div>
            );
          })}
          <div style={{ height: 16 }} />
        </div>

        <div style={{ padding: "12px 18px 20px", background: "white", borderTop: "1px solid #f5f5f5", flexShrink: 0 }}>
          <button onClick={onNext} style={{ width: "100%", padding: "15px", background: "#ff5a2c", color: "white", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 20px rgba(255,90,44,.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            Next Question <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
