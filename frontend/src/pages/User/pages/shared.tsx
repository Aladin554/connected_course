// src/pages/User/pages/shared.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Shared icons, data, and small components reused across all learning pages.
// ─────────────────────────────────────────────────────────────────────────────
import React, { ReactElement } from "react";
import parse from "html-react-parser";
import api from "../../../api/axios";

/* ── Types ── */
export type Page = "home" | "welcome" | "course" | "module" | "lesson";
export interface LearningCategory {
  id: number;
  title: string;
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
  duration_mins: number;
  video_type: "upload" | "youtube" | "vimeo" | "bunny";
  video_value: string;
  video_thumbnail?: string | null;
  sort_order: number;
  is_active: boolean;
  strategies?: { id: number; step_number: number; content: string }[];
  lesson_model_answer?: { id: number; content: string } | null;
  common_mistakes?: { id: number; content: string; sort_order: number }[];
}
export interface LessonContentBlock {
  id: number;
  title: string;
  description: string;
}
export interface IconProps  { active: boolean }
export interface BarProps   { value: number; light?: boolean }
export interface SectionHeaderProps { title: string; action?: string }
export interface HeroCardProps { height?: number; onContinue: () => void; category?: LearningCategory | null; progress?: number; moduleNumber?: number | null; moduleName?: string | null }
export interface HelpBoxProps  { desktop: boolean }
export interface LayoutProps   { tab: string; setTab: (t: string) => void; onContinue: (category?: LearningCategory) => void }

/* ════════ ICONS ════════ */
export const HomeIcon = ({ active }: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24"
    fill={active ? "#22c55e" : "none"}
    stroke={active ? "#22c55e" : "#9ca3af"}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
);
export const BookIcon = ({ active }: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke={active ? "#22c55e" : "#9ca3af"}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
export const MicIcon = ({ active }: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke={active ? "#22c55e" : "#9ca3af"}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
export const UserIcon = ({ active }: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke={active ? "#22c55e" : "#9ca3af"}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4"/>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
  </svg>
);
export const ArrowRight = ({ color = "white", size = 12 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);
export const ArrowLeft = ({ color = "#fff", size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);
export const ChevRight = ({ color = "#22c55e" }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
export const ChevDown = ({ color = "#111" }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
export const ChevUp = ({ color = "#ff5a2c" }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);
export const HeadphonesIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
    <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
  </svg>
);
export const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
export const BookmarkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);
export const PlayIcon = ({ size = 16, color = "white" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);
export const CheckIcon = ({ size = 12, color = "white" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
export const LockIcon = ({ size = 14, color = "#9ca3af" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
export const ClockIcon = ({ size = 12, color = "#9ca3af" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
export const FullscreenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9"/>
    <polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/>
    <line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);
export const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="#e67e22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

export const RichTextContent = ({
  html,
  emptyText,
  style,
}: {
  html?: string | null;
  emptyText?: string;
  style?: React.CSSProperties;
}) => {
  const content = (html || "").trim();
  if (!content) {
    return emptyText ? <p style={style}>{emptyText}</p> : null;
  }

  return <div style={style}>{parse(content)}</div>;
};
export const XIcon = ({ color = "#666" }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

/* ════════ DATA ════════ */
export const tabs: { label: string; icon: (a: boolean) => ReactElement }[] = [
  { label: "Home",           icon: (a) => <HomeIcon active={a} /> },
  { label: "Modules",        icon: (a) => <BookIcon active={a} /> },
  { label: "Mock Interview", icon: (a) => <MicIcon  active={a} /> },
  { label: "Profile",        icon: (a) => <UserIcon active={a} /> },
];

export const homeModules = [
  { title: "UK Interview Training",  progress: 72, img: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=300&q=80" },
  { title: "Australia GS Training",  progress: 58, img: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=300&q=80" },
  { title: "New Zealand Training",   progress: 40, img: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=300&q=80" },
  { title: "Canada Visa Prep",       progress: 58, img: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=300&q=80" },
];

export const courseModules = [
  { id: 1, title: "Module 1", subtitle: "Verification & Integrity",         status: "completed"  as const },
  { id: 2, title: "Module 2", subtitle: "About Your Course",                status: "completed"  as const },
  { id: 3, title: "Module 3", subtitle: "Your University & Location",       status: "completed"  as const },
  { id: 4, title: "Module 4", subtitle: "Finances & Funding",               status: "inprogress" as const },
  { id: 5, title: "Module 5", subtitle: "Career Goals & Future Plans",      status: "locked"     as const },
  { id: 6, title: "Module 6", subtitle: "Student Life & Wellbeing",         status: "locked"     as const },
  { id: 7, title: "Module 7", subtitle: "Personal & Personality Questions", status: "locked"     as const },
  { id: 8, title: "Module 8", subtitle: "Visa Interview Questions",         status: "locked"     as const },
];

export const moduleLessons = [
  { id: 1, title: "Who is Sponsoring You?",    mins: 8,  status: "completed"  as const },
  { id: 2, title: "How Much Have You Paid?",   mins: 5,  status: "completed"  as const },
  { id: 3, title: "Living Cost Questions",     mins: 10, status: "inprogress" as const },
  { id: 4, title: "Bank Statements & Funds",   mins: 7,  status: "locked"     as const },
  { id: 5, title: "Scholarships & Loans",      mins: 6,  status: "locked"     as const },
  { id: 6, title: "Mixed Financial Scenarios", mins: 8,  status: "locked"     as const },
];

export const lessonData = {
  title: "Living Cost Questions",
  lessonNum: 3,
  totalLessons: 6,
  mins: 10,
  videoThumb: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
  strategy: [
    "Start by clearly mentioning who is sponsoring your studies.",
    "Explain your sponsor's job and relationship to you.",
    "Mention the total income or financial capacity.",
    "State how much tuition has already been paid (if applicable).",
    "Explain how living expenses will be covered.",
    "Be confident, consistent, and honest.",
  ],
  modelAnswer: `"My father is sponsoring my studies in the UK. He is a Senior Manager at XYZ Company and earns approximately £85,000 per year. He has saved for my education over the past few years. I have already paid my full tuition fees. For living expenses, he will provide £1,200 per month, which is sufficient to cover my accommodation, food, transport, and other personal expenses."`,
  commonMistakes: [
    "Giving inconsistent or unclear financial information",
    "Not mentioning tuition already paid",
    "Providing unrealistic or exaggerated amounts",
    "Saying \"I don't know\" or unsure statements",
  ],
};

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

export const categoryImage = (category?: LearningCategory | null, size = 800) => {
  if (!category?.thumbnail_image) {
    return null;
  }

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
  } catch {
    return [];
  }
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
      ? res.data.completed_lesson_ids.map(Number).filter(Boolean)
      : [];
    writeLearningProgress(categoryId, ids);
    return ids;
  } catch {
    return readLearningProgress(categoryId);
  }
};

export const completeLearningLesson = async (categoryId: number, lessonId: number): Promise<number[]> => {
  const fallbackIds = [...readLearningProgress(categoryId), lessonId];
  writeLearningProgress(categoryId, fallbackIds);

  try {
    await api.post(`/lessons/${lessonId}/complete`);
    return loadLearningProgress(categoryId);
  } catch {
    return Array.from(new Set(fallbackIds));
  }
};

export const parseLessonContentBlock = (item: { id: number; content: string }): LessonContentBlock => {
  try {
    const parsed = JSON.parse(item.content);
    if (parsed && typeof parsed === "object") {
      return {
        id: item.id,
        title: typeof parsed.title === "string" ? parsed.title : "",
        description: typeof parsed.description === "string" ? parsed.description : "",
      };
    }
  } catch {
    // Keep old plain text lessons readable after the admin form changed shape.
  }

  return { id: item.id, title: "", description: item.content || "" };
};

export const HeroCard = ({ height = 190, onContinue, category, progress = 0, moduleNumber, moduleName }: HeroCardProps) => (
  <div style={{ borderRadius: 16, overflow: "hidden", position: "relative", height, boxShadow: "0 4px 24px rgba(0,0,0,0.18)", background: category?.background_color || "#071224" }}>
    {categoryImage(category) && (
      <img src={categoryImage(category) || ""} alt={category?.title || "Category"}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
    )}
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(95deg,rgba(4,12,28,0.95) 0%,rgba(4,12,28,0.78) 42%,rgba(4,12,28,0.08) 100%)" }} />
    <div style={{ position: "relative", zIndex: 1, padding: "16px 18px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.13)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🏛️</div>
        </div>
        <div style={{ fontWeight: 900, fontSize: height > 200 ? 22 : 15, color: "white", letterSpacing: -0.5, marginBottom: 3 }}>{category?.title || "Course"}</div>
        <div style={{ fontSize: height > 200 ? 13 : 10.5, color: "rgba(255,255,255,0.68)", lineHeight: 1.45 }}>
          {moduleName
            ? (/^module\s+\d+$/i.test(moduleName.trim()) ? moduleName : `Module ${moduleNumber || 1}: ${moduleName}`)
            : "No module available yet."}
        </div>
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", flexShrink: 0 }}>{progress}% Complete</span>
          <Bar value={progress} light />
        </div>
        <button onClick={onContinue} style={{ background: "#22c55e", color: "white", border: "none", borderRadius: 9, padding: "8px 18px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer", boxShadow: "0 3px 12px rgba(34,197,94,0.4)" }}>
          Continue <ArrowRight />
        </button>
      </div>
    </div>
  </div>
);

export const HelpBox = ({ desktop }: HelpBoxProps) => (
  <div style={{ background: "#f6faf7", borderRadius: desktop ? 16 : 12, padding: desktop ? "16px 20px" : "10px 12px", display: "flex", alignItems: "center", gap: desktop ? 14 : 10, border: "1px solid rgba(34,197,94,0.13)" }}>
    <div style={{ width: desktop ? 42 : 36, height: desktop ? 42 : 36, borderRadius: desktop ? 12 : 9, background: "#f0fdf4", border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <HeadphonesIcon size={desktop ? 20 : 18} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: 800, fontSize: desktop ? 13 : 12, color: "#111", marginBottom: 2 }}>Need Help?</div>
      <div style={{ fontSize: desktop ? 11 : 10, color: "#9ca3af", lineHeight: 1.4 }}>We're here to support you on your journey.</div>
    </div>
    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#22c55e", fontSize: desktop ? 11 : 10.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap", padding: 0, flexShrink: 0 }}>
      Contact Support <ArrowRight color="#22c55e" size={11} />
    </button>
  </div>
);

/* ════════ GLOBAL STYLES (inject once at top-level) ════════ */
export const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Plus Jakarta Sans',sans-serif;background:#071224;-webkit-font-smoothing:antialiased;}
    .hs::-webkit-scrollbar{display:none;} .hs{-ms-overflow-style:none;scrollbar-width:none;}
    button{font-family:'Plus Jakarta Sans',sans-serif;}
    @keyframes pageIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
  `}</style>
);
