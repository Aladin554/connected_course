// src/pages/User/pages/shared.tsx
import React from "react";
import parse from "html-react-parser";
import api from "../../../api/axios";

/* ── Types ── */
export type Page = "home" | "welcome" | "course" | "module" | "lesson";
export type LessonNextAction = "next-lesson" | "next-module" | "complete-course";
export interface LearningCategory {
  id: number;
  title: string;
  type?: "training" | "resource" | null;
  flag_emoji?: string | null;
  description?: string | null;
  thumbnail_image?: string | null;
  background_color?: string | null;
}
export interface LearningModule {
  id: number;
  category_id: number;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  warning?: string | null;
  icon_emoji?: string | null;
  sort_order: number;
  is_active: boolean;
  lessons_count?: number;
  all_lessons_count?: number;
}
export interface LearningLesson {
  id: number;
  module_id: number;
  title: string;
  warning?: string | null;
  duration_mins?: number | null;
  duration_unit?: "minutes" | "seconds";
  video_type?: "upload" | "youtube" | "vimeo" | "bunny" | null;
  video_value?: string | null;
  video_thumbnail?: string | null;
  sort_order: number;
  is_active: boolean;
  strategies?: { id: number; step_number: number; content: string; file_path?: string | null; file_name?: string | null }[];
  lesson_model_answer?: { id: number; content: string } | null;
  common_mistakes?: { id: number; content: string; sort_order: number }[];
}
export interface LessonContentBlock {
  id: number;
  title: string;
  description: string;
  file_path?: string | null;
  file_name?: string | null;
}
export interface IconProps  { active: boolean }
export interface BarProps   { value: number; light?: boolean }
export interface SectionHeaderProps { title: string; action?: string }
export interface HeroCardProps {
  height?: number;
  onContinue: () => void;
  category?: LearningCategory | null;
  progress?: number;
  moduleNumber?: number | null;
  moduleName?: string | null;
  variant?: "mobile" | "tablet" | "desktop";
}
export interface HelpBoxProps  { desktop: boolean }
export interface LayoutProps   { tab: string; setTab: (t: string) => void; onContinue: (category?: LearningCategory) => void }

export type DurationUnit = "minutes" | "seconds";

export const formatLessonDuration = (value = 0, unit: DurationUnit = "minutes"): string | null => {
  if (!value) return null;
  if (unit === "seconds") {
    if (value < 60) return `${value} sec`;
    const mins = Math.floor(value / 60);
    const secs = value % 60;
    return secs ? `${mins} min ${secs} sec` : `${mins} min`;
  }
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  if (!hours) return `${mins} min`;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
};

export const hasLessonDuration = (value?: number | null): boolean => Number(value) > 0;

export const lessonDurationSeconds = (value = 0, unit: DurationUnit = "minutes"): number =>
  unit === "seconds" ? value : value * 60;

export const extractYouTubeId = (value?: string | null): string | null => {
  const raw = (value || "").trim();
  if (!raw) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
};

export const youtubeThumbnail = (value?: string | null): string | null => {
  const id = extractYouTubeId(value);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

export const youtubeEmbedUrl = (value?: string | null): string | null => {
  const id = extractYouTubeId(value);
  return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : null;
};

/* ════════ ICONS ════════ */
export const HomeIcon = ({ active }: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "#22c55e" : "none"} stroke={active ? "#22c55e" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
);
export const BookIcon = ({ active }: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#22c55e" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
export const MicIcon = ({ active }: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#22c55e" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
export const UserIcon = ({ active }: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#22c55e" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4"/>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
  </svg>
);
export const ArrowRight = ({ color = "white", size = 12 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);
export const ArrowLeft = ({ color = "#fff", size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);
export const ChevRight = ({ color = "#22c55e" }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
export const ChevDown = ({ color = "#111" }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
export const ChevUp = ({ color = "#ff5a2c" }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);
export const HeadphonesIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
    <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
  </svg>
);
export const BookmarkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);
export const PlayIcon = ({ size = 16, color = "white" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);
export const CheckIcon = ({ size = 12, color = "white" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
export const LockIcon = ({ size = 14, color = "#9ca3af" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
export const ClockIcon = ({ size = 12, color = "#9ca3af" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
export const FullscreenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9"/>
    <polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/>
    <line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);
export const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e67e22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
export const WarningNotice = ({ message }: { message?: string | null }) => {
  const text = (message || "").trim();
  if (!text) return null;
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 12, background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412", marginBottom: 12 }}>
      <div style={{ flexShrink: 0, marginTop: 1 }}><WarningIcon /></div>
      <p style={{ fontSize: 12.5, lineHeight: 1.55, margin: 0, fontWeight: 600 }}>{text}</p>
    </div>
  );
};
export const RichTextContent = ({ html, emptyText, style }: { html?: string | null; emptyText?: string; style?: React.CSSProperties }) => {
  const content = (html || "").trim();
  if (!content) return emptyText ? <p style={style}>{emptyText}</p> : null;
  return <div style={style}>{parse(content)}</div>;
};
export const XIcon = ({ color = "#666" }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

/* ════════ SHARED SMALL COMPONENTS ════════ */
export const Bar = ({ value, light = false }: BarProps) => (
  <div style={{ height: 3, background: light ? "rgba(255,255,255,0.22)" : "#e5e7eb", borderRadius: 8, overflow: "hidden", flex: 1 }}>
    <div style={{ height: "100%", width: `${value}%`, background: "#22c55e", borderRadius: 8 }} />
  </div>
);

export const SectionHeader = ({ title, action }: SectionHeaderProps) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 3, height: 13, background: "#22c55e", borderRadius: 2 }} />
      <span style={{ fontWeight: 800, fontSize: 13, color: "#111", letterSpacing: -0.2 }}>{title}</span>
    </div>
    {action && (
      <button style={{ background: "none", border: "none", cursor: "pointer", color: "#22c55e", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 2, padding: 0 }}>
        {action} <ChevRight />
      </button>
    )}
  </div>
);

export const categoryImage = (category?: LearningCategory | null) => {
  if (!category?.thumbnail_image) return null;
  return category.thumbnail_image.startsWith("http")
    ? category.thumbnail_image
    : `/api/storage/${category.thumbnail_image}`;
};

export const progressKey = (categoryId: number) => `learning-progress:${categoryId}`;

export const readLearningProgress = (categoryId?: number | null): number[] => {
  if (!categoryId || typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(progressKey(categoryId)) || "[]");
    return Array.isArray(parsed) ? parsed.map(Number).filter(Boolean) : [];
  } catch { return []; }
};

export const writeLearningProgress = (categoryId: number, lessonIds: number[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(progressKey(categoryId), JSON.stringify(Array.from(new Set(lessonIds))));
};

export const markLessonComplete = (categoryId: number, lessonId: number) => {
  writeLearningProgress(categoryId, [...readLearningProgress(categoryId), lessonId]);
};

export const loadLearningProgress = async (categoryId?: number | null): Promise<number[]> => {
  if (!categoryId) return [];
  try {
    const res = await api.get(`/categories/${categoryId}/progress`);
    const ids = Array.isArray(res.data?.completed_lesson_ids)
      ? res.data.completed_lesson_ids.map(Number).filter(Boolean) : [];
    writeLearningProgress(categoryId, ids);
    return ids;
  } catch { return readLearningProgress(categoryId); }
};

export const completeLearningLesson = async (categoryId: number, lessonId: number): Promise<number[]> => {
  const fallbackIds = [...readLearningProgress(categoryId), lessonId];
  writeLearningProgress(categoryId, fallbackIds);
  try {
    await api.post(`/lessons/${lessonId}/complete`);
    return loadLearningProgress(categoryId);
  } catch { return Array.from(new Set(fallbackIds)); }
};

export const parseLessonContentBlock = (item: { id: number; content: string; file_path?: string | null; file_name?: string | null }): LessonContentBlock => {
  try {
    const parsed = JSON.parse(item.content);
    if (parsed && typeof parsed === "object") {
      return { id: item.id, title: typeof parsed.title === "string" ? parsed.title : "", description: typeof parsed.description === "string" ? parsed.description : "", file_path: item.file_path ?? null, file_name: item.file_name ?? null };
    }
  } catch {}
  return { id: item.id, title: "", description: item.content || "", file_path: item.file_path ?? null, file_name: item.file_name ?? null };
};

/* ════════════════════════════════════════════════════════════
   HERO CARD
════════════════════════════════════════════════════════════ */
export const HeroCard = ({
  height = 300,
  onContinue,
  category,
  progress = 0,
  moduleNumber,
  moduleName,
  variant = "mobile",
}: HeroCardProps) => {
  const moduleLabel = (() => {
    if (!moduleName) return null;
    if (/^module\s+\d+$/i.test(moduleName.trim())) return null;
    return moduleName;
  })();

  const imgSrc = categoryImage(category);

  if (variant === "mobile") {
    return (
      <button
        type="button"
        onClick={onContinue}
        style={{
          display: "block", width: "100%", height,
          borderRadius: 18, overflow: "hidden", position: "relative",
          border: "none", padding: 0, cursor: "pointer",
          background: category?.background_color || "#071224",
          boxShadow: "0 4px 20px rgba(0,0,0,0.18)", flexShrink: 0, textAlign: "left",
        }}
      >
        {imgSrc && (
          <img src={imgSrc} alt={category?.title || "Course"}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, transparent 40%, rgba(4,12,28,0.55) 68%, rgba(4,12,28,0.88) 85%, rgba(4,12,28,0.96) 100%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "0 16px 18px" }}>
          <div style={{ marginBottom: 7 }}>
            <span style={{
              fontSize: 11, fontWeight: 800, color: "#22c55e",
              background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.45)",
              borderRadius: 20, padding: "0px 12px",
              display: "inline-flex", alignItems: "center", gap: 3,
            }}>
              Course
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#22c55e" }} />
            </span>
          </div>
          {(() => {
            const title = category?.title || "Course";
            const trainingMatch = title.match(/^(.*?)\s*(Training\.?)$/i);
            return trainingMatch ? (
              <>
                <div style={{ fontWeight: 900, fontSize: 24, color: "white", letterSpacing: -0.5, lineHeight: 1.2 }}>{trainingMatch[1]}</div>
                <div style={{ fontWeight: 900, fontSize: 24, color: "white", letterSpacing: -0.5, lineHeight: 1.2 }}>{trainingMatch[2]}</div>
              </>
            ) : (
              <div style={{ fontWeight: 900, fontSize: 20, color: "white", letterSpacing: -0.5, lineHeight: 1.2 }}>{title}</div>
            );
          })()}
        </div>
      </button>
    );
  }

  return (
    <div style={{
      borderRadius: 20, overflow: "hidden", position: "relative",
      height, background: category?.background_color || "#071224",
      boxShadow: "0 6px 28px rgba(0,0,0,0.20)", flexShrink: 0, cursor: "pointer",
    }} onClick={onContinue}>
      {imgSrc && (
        <img src={imgSrc} alt={category?.title || "Course"}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
      )}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, transparent 30%, rgba(4,12,28,0.5) 58%, rgba(4,12,28,0.92) 78%, rgba(4,12,28,1) 100%)",
        pointerEvents: "none",
      }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={{ marginBottom: 7 }}>
          <span style={{
            fontSize: 11, fontWeight: 800, color: "#22c55e",
            background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.45)",
            borderRadius: 20, padding: "0px 12px",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
            Course
          </span>
        </div>
        {(() => {
          const title = category?.title || "Course";
          const trainingMatch = title.match(/^(.*?)\s*(Training\.?)$/i);
          return trainingMatch ? (
            <>
              <div style={{ fontWeight: 900, fontSize: 18, color: "white", letterSpacing: -0.4, lineHeight: 1.2, marginBottom: 6 }}>{trainingMatch[1]}</div>
              <div style={{ fontWeight: 900, fontSize: 18, color: "white", letterSpacing: -0.4, lineHeight: 1.2, marginBottom: 6 }}>{trainingMatch[2]}</div>
            </>
          ) : (
            <div style={{ fontWeight: 900, fontSize: 18, color: "white", letterSpacing: -0.4, lineHeight: 1.2, marginBottom: 6 }}>{title}</div>
          );
        })()}
        {(moduleNumber || moduleLabel) && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            {moduleNumber && (
              <span style={{ fontSize: 10, fontWeight: 800, color: "#22c55e", background: "rgba(34,197,94,0.14)", border: "1px solid rgba(34,197,94,0.30)", borderRadius: 6, padding: "2px 8px" }}>
                Module {moduleNumber}
              </span>
            )}
            {moduleLabel && (
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {moduleLabel}
              </span>
            )}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.18)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "#22c55e", borderRadius: 8, transition: "width 0.4s ease" }} />
          </div>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", flexShrink: 0, fontWeight: 600 }}>{progress}% Complete</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onContinue(); }} style={{
          alignSelf: "flex-start",
          background: "#22c55e", color: "white", border: "none",
          borderRadius: 9, padding: "8px 18px", fontSize: 12, fontWeight: 800,
          display: "inline-flex", alignItems: "center", gap: 5,
          cursor: "pointer", boxShadow: "0 3px 12px rgba(34,197,94,0.40)",
        }}>
          Continue <ArrowRight color="white" size={11} />
        </button>
      </div>
    </div>
  );
};

/* ════════ HELP BOX ════════ */
export const HelpBox = ({ desktop = true }: HelpBoxProps) => (
  <div style={{
    background: "#EEF0FB", border: "1px solid rgba(99,102,241,0.13)",
    borderRadius: 16, display: "flex", alignItems: "center",
    gap: 12, padding: desktop ? "14px 16px" : "10px 12px",
  }}>
    <div style={{
      flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
      borderRadius: 12, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.18)",
      width: desktop ? 40 : 34, height: desktop ? 40 : 34,
    }}>
      <HeadphonesIcon size={desktop ? 20 : 17} />
    </div>
    <div style={{
      fontSize: 15,
      color: "#6b7280",
      lineHeight: 1.45,
      letterSpacing: -0.3,
      fontWeight: 500,
    }}>
      Have questions?{" "}
      <span style={{ fontWeight: 800, color: "#111827", letterSpacing: -0.3 }}>
        Simply contact your counsellor on WhatsApp.
      </span>
    </div>
  </div>
);

/* ════════ NEW DESIGN COMPONENTS ════════ */
export const UnlockIcon = ({ size = 18, color = "#111827" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
  </svg>
);

export const ConnectedWordmark = ({ color, size }: { color?: string; size?: number }) => (
  <img
    src="/images/logo/connected_logo.png"
    alt="Connected Logo"
    style={{ width: 120, height: 37, objectFit: "contain", display: "block" }}
  />
);

export const LightHeaderBar = ({ children, px = 0 }: { children?: React.ReactNode; px?: number }) => (
  <div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12 }}>
      <ConnectedWordmark />
      {children}
    </div>
    <div style={{ height: 1, background: "#e5e7eb" }} />
  </div>
);

export const GreetingHeader = ({ name, compact = false }: { name: string; compact?: boolean }) => (
  <div style={{ padding: compact ? "10px 0 12px" : "16px 0 18px" }}>
    <div style={{
      fontWeight: 900, fontSize: compact ? 24 : 28, color: "#111827",
      letterSpacing: -0.8, lineHeight: 1.15, marginBottom: compact ? 4 : 6,
    }}>
      Hello {name}.
    </div>
    <div style={{
      fontSize: 15,
      color: "#6b7280",
      lineHeight: 1.55,
      fontWeight: 500,
      letterSpacing: -0.25,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      Below you will find{" "}
      <span style={{
        color: "#111827",
        fontWeight: 800,
        letterSpacing: -0.3,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>courses personalized</span>
      {" "}to your study abroad journey. Enjoy!
    </div>
  </div>
);

export const PlainSectionTitle = ({ title, compact = false }: { title: string; compact?: boolean }) => (
  <div style={{ fontWeight: 900, fontSize: compact ? 14 : 17, color: "#111827", letterSpacing: -0.3, marginBottom: compact ? 8 : 12 }}>
    {title}
  </div>
);

export const CoursePill = () => (
  <span style={{
    fontSize: 11, fontWeight: 800, color: "#22c55e",
    background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)",
    borderRadius: 20, padding: "4px 12px",
    display: "inline-flex", alignItems: "center", gap: 6,
  }}>
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
    Course
  </span>
);

/* ════════════════════════════════════════════════════════════
   TRAINING CAROUSEL

   Dot logic — PAGE-BASED (not card-based):
   ─────────────────────────────────────────
   visibleCount = how many cards fit in the viewport at once
     mobile  → 1
     tablet  → 2
     desktop → 3

   pageCount = total cards − visibleCount + 1
     e.g. 4 cards on desktop (3 visible) → 4 − 3 + 1 = 2 dots
     e.g. 4 cards on mobile  (1 visible) → 4 − 1 + 1 = 4 dots
     e.g. 3 cards on desktop (3 visible) → 3 − 3 + 1 = 1 dot  → hidden

   Dots appear only when pageCount > 1.
   Clicking a dot scrolls to that card position.
════════════════════════════════════════════════════════════ */

/** Cards simultaneously visible per breakpoint. */
const VISIBLE_CARDS: Record<"mobile" | "tablet" | "desktop", number> = {
  mobile:  1,
  tablet:  2,
  desktop: 3,
};

export const TrainingCarousel = ({
  categories, loading, progressByCategory, continueByCategory,
  onContinue, emptyText, cardWidth = 260, cardHeight = 300, variant = "mobile",
}: {
  categories: LearningCategory[];
  loading: boolean;
  progressByCategory: Record<number, number>;
  continueByCategory: Record<number, { moduleNumber: number; moduleName: string }>;
  onContinue: (category?: LearningCategory) => void;
  emptyText: string;
  cardWidth?: number;
  cardHeight?: number;
  variant?: "mobile" | "tablet" | "desktop";
}) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const GAP = 12;

  // How many cards are visible at once for this breakpoint
  const visibleCount = VISIBLE_CARDS[variant];

  // Number of scrollable positions = total − visible + 1
  // (minimum 1 so we never get 0 or negative)
  const pageCount = Math.max(1, categories.length - visibleCount + 1);

  // Only render dots when there is more than one page to navigate
  const showDots = pageCount > 1;

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const rawIndex = el.scrollLeft / (cardWidth + GAP);
    const clamped = Math.max(0, Math.min(Math.round(rawIndex), pageCount - 1));
    setActiveIndex(clamped);
  };

  const scrollToPage = (pageIndex: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: pageIndex * (cardWidth + GAP), behavior: "smooth" });
    setActiveIndex(pageIndex);
  };

  if (loading) {
    return (
      <div style={{ height: cardHeight, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", background: "#f9fafb", borderRadius: 18, gap: 8, fontSize: 13 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        Loading…
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div style={{ padding: "20px 16px", color: "#6b7280", background: "#f9fafb", borderRadius: 18, fontSize: 13, textAlign: "center" }}>
        {emptyText}
      </div>
    );
  }

  return (
    <div>
      {/* ── Scrollable card strip ── */}
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="hs"
        style={{
          display: "flex", gap: GAP, overflowX: "auto",
          scrollSnapType: "x mandatory", paddingBottom: 2,
          marginLeft: -16, marginRight: -16, paddingLeft: 16, paddingRight: 16,
        }}
      >
        {categories.map((category) => (
          <div key={category.id} style={{ flex: `0 0 ${cardWidth}px`, scrollSnapAlign: "start" }}>
            <HeroCard
              height={cardHeight}
              variant="mobile"
              onContinue={() => onContinue(category)}
              category={category}
            />
          </div>
        ))}
      </div>

      {/* ── Page-based dot indicators ── */}
      {showDots && (
        <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 12 }}>
          {Array.from({ length: pageCount }).map((_, index) => (
            <div
              key={index}
              onClick={() => scrollToPage(index)}
              style={{
                width: index === activeIndex ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: index === activeIndex ? "#ff5a2c" : "#d1d5db",
                transition: "width 0.2s ease, background 0.2s ease",
                cursor: "pointer",
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ════════ RESOURCE CARD / GRID ════════ */
const RESOURCE_CARD_PALETTE = [
  { bg: "#fdebd2", accent: "#ff5a2c", iconBg: "rgba(255,255,255,0.60)" },
  { bg: "#e7e6f6", accent: "#6c5ce7", iconBg: "rgba(255,255,255,0.60)" },
  { bg: "#dff3e6", accent: "#16a34a", iconBg: "rgba(255,255,255,0.60)" },
  { bg: "#fde2e2", accent: "#dc2626", iconBg: "rgba(255,255,255,0.60)" },
];

export const ResourceCard = ({ category, index, onContinue }: { category: LearningCategory; index: number; onContinue: () => void }) => {
  const palette = RESOURCE_CARD_PALETTE[index % RESOURCE_CARD_PALETTE.length];
  return (
    <button type="button" onClick={onContinue} style={{
      background: palette.bg, borderRadius: 16, border: "none",
      padding: "12px 14px", textAlign: "left", cursor: "pointer",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      gap: 10, minHeight: 100, width: "100%", fontFamily: "inherit",
    }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: palette.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <UnlockIcon size={14} color="#111827" />
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 12.5, color: "#111827", lineHeight: 1.3, marginBottom: 7 }}>
          {category.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: palette.accent, fontWeight: 800, fontSize: 11 }}>
          Get Access <ArrowRight color={palette.accent} size={11} />
        </div>
      </div>
    </button>
  );
};

export const ResourceGrid = ({ categories, loading, onContinue, emptyText }: {
  categories: LearningCategory[]; loading: boolean;
  onContinue: (category?: LearningCategory) => void; emptyText: string;
}) => {
  if (loading) {
    return (
      <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", background: "#f9fafb", borderRadius: 16, gap: 8, fontSize: 13 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        Loading…
      </div>
    );
  }
  if (categories.length === 0) {
    return (
      <div style={{ padding: "16px", color: "#6b7280", background: "#f9fafb", borderRadius: 16, fontSize: 13, textAlign: "center" }}>
        {emptyText}
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {categories.map((category, index) => (
        <ResourceCard key={category.id} category={category} index={index} onContinue={() => onContinue(category)} />
      ))}
    </div>
  );
};

/* ════════ GLOBAL STYLES ════════ */
export const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Fraunces:opsz,wght@9..144,500..900&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Plus Jakarta Sans',sans-serif;background:#071224;-webkit-font-smoothing:antialiased;}
    .hs::-webkit-scrollbar{display:none;} .hs{-ms-overflow-style:none;scrollbar-width:none;}
    button{font-family:'Plus Jakarta Sans',sans-serif;}
    @keyframes pageIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  `}</style>
);