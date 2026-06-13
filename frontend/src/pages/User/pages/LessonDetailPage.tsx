import React, { useEffect, useState } from "react";
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
  parseLessonContentBlock,
  RichTextContent,
  WarningNotice,
  youtubeEmbedUrl,
} from "./shared";

interface LessonDetailPageProps {
  onBack: () => void;
  onNext: () => void;
  isDesktop: boolean;
  lesson: LearningLesson | null;
  lessonIndex: number;
  totalLessons: number;
}

export default function LessonDetailPage({ onBack, onNext, lesson, lessonIndex, totalLessons }: LessonDetailPageProps) {
  const [detail, setDetail] = useState<LearningLesson | null>(lesson);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string[]>([]);

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
    setExpanded([]);
  }, [detail?.id]);

  const toggleSection = (key: string) =>
    setExpanded((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);

  const durationLabel = formatLessonDuration(
    detail?.duration_mins || 0,
    detail?.duration_unit === "seconds" ? "seconds" : "minutes"
  );
  const embedUrl = youtubeEmbedUrl(detail?.video_value);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "#0d1f35", animation: "pageIn .35s cubic-bezier(.22,1,.36,1)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 10px", flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowLeft size={15} />
        </button>
        <span style={{ color: "rgba(255,255,255,.75)", fontSize: 13, fontWeight: 600 }}>
          Lesson {lessonIndex + 1} of {totalLessons}
        </span>
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
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>{durationLabel}</span>
        </div>
      </div>

      <div style={{ position: "relative", margin: "0 18px 0", borderRadius: 14, overflow: "hidden", flexShrink: 0, background: "#071224" }}>
        {embedUrl ? (
          <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", height: 0, background: "#000" }}>
            <iframe
              src={embedUrl}
              title={detail?.title || "Lesson video"}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <div
            style={{
              height: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,.6)",
              fontSize: 13,
              padding: 20,
              textAlign: "center",
            }}
          >
            No YouTube video configured for this lesson.
          </div>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0, background: "white", borderRadius: "20px 20px 0 0", marginTop: 14, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 0" }} className="hs">
          <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 14 }}>Expand the sections below to learn more.</p>

          {detail?.warning && (
            <div style={{ marginTop: 10 }}>
              <WarningNotice message={detail.warning} />
            </div>
          )}

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
                {isOpen && (
                  <>
                    <RichTextContent
                      html={block.description}
                      style={{ fontSize: 13, color: "#444", lineHeight: 1.75, margin: 0, paddingBottom: block.file_path ? 10 : 16 }}
                    />
                    {block.file_path && (
                      <a
                        href={block.file_path.startsWith("http") ? block.file_path : `/api/storage/${block.file_path}`}
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                        {block.file_name || "Download attachment"}
                      </a>
                    )}
                  </>
                )}
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
