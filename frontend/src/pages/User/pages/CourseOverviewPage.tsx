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
  LearningModule,
  PlayIcon,
} from "./shared";

interface CourseOverviewPageProps {
  onBack: () => void;
  onModuleClick: (module: LearningModule) => void;
  isDesktop: boolean;
  category: LearningCategory | null;
}

export default function CourseOverviewPage({ onBack, onModuleClick, isDesktop, category }: CourseOverviewPageProps) {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) {
      setModules([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    api.get(`/categories/${category.id}/modules`)
      .then((res) => setModules(Array.isArray(res.data) ? res.data : []))
      .catch(() => setModules([]))
      .finally(() => setLoading(false));
  }, [category]);

  const image = useMemo(() => categoryImage(category, 900), [category]);
  const lessonsCount = modules.reduce((total, module) => total + (module.lessons_count ?? module.all_lessons_count ?? 0), 0);
  const firstModule = modules[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "#fff", animation: "pageIn .35s cubic-bezier(.22,1,.36,1)", overflow: "hidden" }}>
      <div style={{ position: "relative", height: isDesktop ? 320 : 280, flexShrink: 0, background: category?.background_color || "#071224" }}>
        {image && (
          <img
            src={image}
            alt={category?.title || "Category"}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(4,12,28,.5) 0%,rgba(4,12,28,.85) 100%)" }} />

        <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px" }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.15)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ArrowLeft size={16} />
          </button>
          <button style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.15)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <BookmarkIcon />
          </button>
        </div>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 20px 20px" }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>{category?.flag_emoji || ""}</div>
          <h1 style={{ fontWeight: 900, fontSize: isDesktop ? 30 : 26, color: "white", letterSpacing: -0.8, lineHeight: 1.1, marginBottom: 8 }}>
            {category?.title || "Learning Category"}
          </h1>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.65)", marginBottom: 12 }}>
            {lessonsCount} Lessons • {modules.length} Modules
          </div>

          <button
            onClick={() => firstModule && onModuleClick(firstModule)}
            disabled={!firstModule}
            style={{ width: "100%", padding: "14px", background: "#ff5a2c", color: "white", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: firstModule ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px rgba(255,90,44,.4)", opacity: firstModule ? 1 : 0.65 }}
          >
            Continue Learning <ArrowRight />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", background: "white" }} className="hs">
        <div style={{ margin: "20px 16px 0" }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#111", marginBottom: 14 }}>Your Learning Path</div>
          {loading ? (
            <div style={{ fontSize: 13, color: "#6b7280" }}>Loading modules...</div>
          ) : modules.length === 0 ? (
            <div style={{ fontSize: 13, color: "#6b7280" }}>No modules have been added for this category yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {modules.map((module, i) => (
                <div key={module.id} style={{ display: "flex", alignItems: "stretch", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 24 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: i === 0 ? "#22c55e" : "#f3f4f6", border: i === 0 ? "none" : "2px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {i === 0 ? <PlayIcon size={8} /> : <CheckIcon size={10} color="#9ca3af" />}
                    </div>
                    {i < modules.length - 1 && (
                      <div style={{ width: 2, flex: 1, minHeight: 12, background: "#e5e7eb", marginTop: 2 }} />
                    )}
                  </div>

                  <div
                    onClick={() => onModuleClick(module)}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: i < modules.length - 1 ? 14 : 0, cursor: "pointer" }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#111" }}>{module.title}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{module.subtitle || module.description || `${module.lessons_count ?? module.all_lessons_count ?? 0} lessons`}</div>
                    </div>
                    <ChevRight color={i === 0 ? "#22c55e" : "#d1d5db"} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}
