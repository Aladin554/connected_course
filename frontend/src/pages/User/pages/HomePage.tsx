// src/pages/User/pages/HomePage.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Home dashboard — mobile & desktop responsive.
// Props: tab, setTab, onContinue (navigate to WelcomePage)
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import {
  tabs, categoryImage,
  Bar, SectionHeader, HeroCard, HelpBox,
  BellIcon, ArrowRight,
  LayoutProps, LearningCategory, LearningLesson, LearningModule, loadLearningProgress,
} from "./shared";

interface HomeLayoutProps extends LayoutProps {
  categories: LearningCategory[];
  loadingCategories: boolean;
  progressByCategory: Record<number, number>;
}

/* ── Mobile ── */
function MobileHome({ tab, setTab, onContinue, categories, loadingCategories, progressByCategory }: HomeLayoutProps) {
  const modules = categories.map((category) => ({
    category,
    title: category.title,
    progress: progressByCategory[category.id] || 0,
    img: categoryImage(category, 300),
    background: category.background_color || "#071224",
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", width: "100%", overflow: "hidden", background: "#071224" }}>
      {/* Top bar */}
      <div style={{ padding: "10px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 17, color: "white", letterSpacing: -0.5 }}>
            Connected<span style={{ color: "#22c55e" }}>.</span>
          </div>
          <div style={{ color: "#22c55e", fontSize: 7.5, fontWeight: 700, letterSpacing: "0.22em", marginTop: 1 }}>EDUCATION</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", lineHeight: 0, padding: 0 }}><BellIcon /></button>
          <div style={{ position: "relative" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, color: "white", background: "rgba(255,255,255,.1)" }}>SZ</div>
            <div style={{ position: "absolute", bottom: 1, right: 1, width: 7, height: 7, borderRadius: "50%", background: "#22c55e", border: "2px solid #071224" }} />
          </div>
        </div>
      </div>

      {/* Greeting */}
      <div style={{ padding: "8px 16px 10px", flexShrink: 0 }}>
        <div style={{ fontWeight: 900, fontSize: 18, color: "white", letterSpacing: -0.4, lineHeight: 1.2, marginBottom: 3 }}>
          Good morning,<br />Syed Zeeshad 👋
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", lineHeight: 1.4 }}>Keep going! You're one step closer to your dream.</div>
      </div>

      {/* White card */}
      <div style={{ flex: 1, minHeight: 0, background: "white", borderRadius: "20px 20px 0 0", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", padding: "13px 15px 0", gap: 11 }} className="hs">
          <div style={{ flexShrink: 0 }}>
            <SectionHeader title="Continue Learning" />
            {loadingCategories ? (
              <div style={{ height: 190, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", background: "#f9fafb", borderRadius: 16 }}>Loading...</div>
              ) : categories[0] ? (
              <HeroCard height={190} onContinue={() => onContinue(categories[0])} category={categories[0]} progress={progressByCategory[categories[0].id] || 0} />
            ) : (
              <div style={{ padding: 16, color: "#6b7280", background: "#f9fafb", borderRadius: 16 }}>No learning category assigned yet.</div>
            )}
          </div>
          <div style={{ flexShrink: 0 }}>
            <SectionHeader title="Your Modules" action="View All" />
            <div className="hs" style={{ display: "flex", gap: 8, overflowX: "auto", marginLeft: -15, paddingLeft: 15, marginRight: -15, paddingRight: 10, paddingBottom: 2 }}>
              {loadingCategories ? (
                <div style={{ color: "#6b7280", fontSize: 12 }}>Loading modules...</div>
              ) : modules.length === 0 ? (
                <div style={{ color: "#6b7280", fontSize: 12 }}>No modules available.</div>
              ) : modules.map((m, i) => (
                <div key={i} onClick={() => onContinue(m.category)} style={{ flexShrink: 0, width: 118, borderRadius: 12, overflow: "hidden", background: "white", border: "1px solid #efefef", boxShadow: "0 2px 8px rgba(0,0,0,.07)", cursor: "pointer" }}>
                  <div style={{ height: 70, overflow: "hidden", background: m.background }}>
                    {m.img && <img src={m.img} alt={m.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  </div>
                  <div style={{ padding: "6px 8px 8px" }}>
                    <div style={{ fontWeight: 700, fontSize: 10, color: "#111", marginBottom: 5, lineHeight: 1.3 }}>{m.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Bar value={m.progress} />
                      <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700, flexShrink: 0 }}>{m.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flexShrink: 0, paddingBottom: 12 }}>
            <HelpBox desktop={false} />
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav style={{ background: "white", flexShrink: 0, borderTop: "1px solid rgba(0,0,0,.07)", boxShadow: "0 -2px 12px rgba(0,0,0,.07)", display: "flex", justifyContent: "space-around", padding: "7px 0 max(8px,env(safe-area-inset-bottom))" }}>
        {tabs.map(({ label, icon }) => {
          const a = tab === label;
          return (
            <button key={label} onClick={() => setTab(label)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: a ? "#22c55e" : "#9ca3af", padding: "0 8px" }}>
              {icon(a)}
              <span style={{ fontSize: 9.5, fontWeight: a ? 700 : 500, lineHeight: 1 }}>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ── Desktop ── */
function DesktopHome({ tab, setTab, onContinue, categories, loadingCategories, progressByCategory }: HomeLayoutProps) {
  const modules = categories.map((category) => ({
    category,
    title: category.title,
    progress: progressByCategory[category.id] || 0,
    img: categoryImage(category, 300),
    background: category.background_color || "#071224",
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: "#071224" }}>
      <div style={{ padding: "28px 56px 52px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 22, color: "white", letterSpacing: -0.6 }}>
              Connected<span style={{ color: "#22c55e" }}>.</span>
            </div>
            <div style={{ color: "#22c55e", fontSize: 8, fontWeight: 700, letterSpacing: "0.22em", marginTop: 2 }}>EDUCATION</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", lineHeight: 0, padding: 0 }}><BellIcon /></button>
            <div style={{ position: "relative" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "white", background: "rgba(255,255,255,.1)" }}>SZ</div>
              <div style={{ position: "absolute", bottom: 1, right: 1, width: 9, height: 9, borderRadius: "50%", background: "#22c55e", border: "2px solid #071224" }} />
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 32, color: "white", letterSpacing: -1, lineHeight: 1.15, marginBottom: 8 }}>
            Good morning, Syed Zeeshad 👋
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.45)", lineHeight: 1.5 }}>Keep going! You're one step closer to your dream.</div>
        </div>
      </div>

      <div style={{ flex: 1, background: "white", borderRadius: "24px 24px 0 0" }}>
        <div style={{ padding: "36px 56px 48px", display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 28 }}>
            <div>
              <SectionHeader title="Continue Learning" />
              {loadingCategories ? (
                <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", background: "#f9fafb", borderRadius: 16 }}>Loading...</div>
              ) : categories[0] ? (
                <HeroCard height={280} onContinue={() => onContinue(categories[0])} category={categories[0]} progress={progressByCategory[categories[0].id] || 0} />
              ) : (
                <div style={{ padding: 18, color: "#6b7280", background: "#f9fafb", borderRadius: 16 }}>No learning category assigned yet.</div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <SectionHeader title="Your Modules" action="View All" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, flex: 1 }}>
                {loadingCategories ? (
                  <div style={{ color: "#6b7280", fontSize: 13 }}>Loading modules...</div>
                ) : modules.length === 0 ? (
                  <div style={{ color: "#6b7280", fontSize: 13 }}>No modules available.</div>
                ) : modules.map((m, i) => (
                  <div key={i} onClick={() => onContinue(m.category)} style={{ background: "white", borderRadius: 14, overflow: "hidden", border: "1px solid #f0f0f0", boxShadow: "0 2px 10px rgba(0,0,0,.05)", display: "flex", alignItems: "center", cursor: "pointer" }}>
                    <div style={{ width: 82, height: 74, flexShrink: 0, overflow: "hidden", background: m.background }}>
                      {m.img && <img src={m.img} alt={m.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </div>
                    <div style={{ padding: "10px 14px", flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 11, color: "#111", marginBottom: 7, lineHeight: 1.35 }}>{m.title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Bar value={m.progress} />
                        <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700, flexShrink: 0 }}>{m.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <HelpBox desktop={true} />
        </div>
      </div>
    </div>
  );
}

/* ── Exported Page ── */
export default function HomePage({ tab, setTab, onContinue }: LayoutProps) {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : false
  );
  const [categories, setCategories] = useState<LearningCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [progressByCategory, setProgressByCategory] = useState<Record<number, number>>({});

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    api.get("/my-categories")
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadHomeProgress = async () => {
      const pairs = await Promise.all(categories.map(async (category) => {
        try {
          const modulesRes = await api.get(`/categories/${category.id}/modules`);
          const modules = Array.isArray(modulesRes.data) ? modulesRes.data : [];
          const lessonGroups = await Promise.all(
            modules.map(async (module: LearningModule) => {
              try {
                const lessonsRes = await api.get(`/modules/${module.id}/lessons`);
                return Array.isArray(lessonsRes.data) ? lessonsRes.data : [];
              } catch {
                return [];
              }
            })
          );
          const lessonIds = lessonGroups.flat().map((lesson: LearningLesson) => lesson.id);
          const completedIds = await loadLearningProgress(category.id);
          const completedCount = lessonIds.filter((id) => completedIds.includes(id)).length;
          const progress = lessonIds.length > 0 ? Math.round((completedCount / lessonIds.length) * 100) : 0;

          return [category.id, progress] as const;
        } catch {
          return [category.id, 0] as const;
        }
      }));

      if (!cancelled) setProgressByCategory(Object.fromEntries(pairs));
    };

    if (categories.length) {
      loadHomeProgress();
    } else {
      setProgressByCategory({});
    }

    return () => {
      cancelled = true;
    };
  }, [categories]);

  return isDesktop
    ? <DesktopHome tab={tab} setTab={setTab} onContinue={onContinue} categories={categories} loadingCategories={loadingCategories} progressByCategory={progressByCategory} />
    : <MobileHome  tab={tab} setTab={setTab} onContinue={onContinue} categories={categories} loadingCategories={loadingCategories} progressByCategory={progressByCategory} />;
}
