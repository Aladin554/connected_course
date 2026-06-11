import React, { useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";
import {
  ArrowLeft,
  categoryImage,
  LearningCategory,
  RichTextContent,
  WarningNotice,
  XIcon,
} from "./shared";

interface WelcomeSlide {
  id: number;
  title: string;
  body_content: string;
  warning?: string | null;
  warning_position?: "after_title" | "after_description" | null;
  slide_order: number;
}

interface WelcomePageProps {
  onBack: () => void;
  onFinish: () => void;
  isDesktop: boolean;
  category: LearningCategory | null;
}

const pStyle: React.CSSProperties = {
  fontSize: 13.5,
  color: "#444",
  lineHeight: 1.7,
  marginBottom: 10,
};

function BulletItem({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff5a2c", flexShrink: 0, marginTop: 7 }} />
      <p style={{ fontSize: 13, color: "#333", lineHeight: 1.6, margin: 0 }}>{text}</p>
    </div>
  );
}

function renderBody(body: string) {
  if (/<[a-z][\s\S]*>/i.test(body)) {
    return <RichTextContent html={body} emptyText="No content has been added for this page yet." style={pStyle} />;
  }

  const lines = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return <p style={pStyle}>No content has been added for this page yet.</p>;
  }

  return lines.map((line, index) => {
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return <BulletItem key={index} text={line.slice(2)} />;
    }
    return <p key={index} style={pStyle}>{line}</p>;
  });
}

export default function WelcomePage({ onBack, onFinish, isDesktop, category }: WelcomePageProps) {
  const [dot, setDot] = useState(0);
  const [slides, setSlides] = useState<WelcomeSlide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDot(0);
    if (!category) { setSlides([]); setLoading(false); return; }
    setLoading(true);
    api.get(`/categories/${category.id}/welcome-slides`)
      .then((res) => setSlides(Array.isArray(res.data) ? res.data : []))
      .catch(() => setSlides([]))
      .finally(() => setLoading(false));
  }, [category]);

  const total = slides.length;
  const cur = slides[dot];
  const image = useMemo(() => categoryImage(category, 900), [category]);
  const heroBackground = category?.background_color || "#071224";

  // Key change: hero is now much shorter — 120px mobile, 160px desktop
  const heroHeight = isDesktop ? 160 : 120;

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100dvh", background: "#fff",
      animation: "pageIn .35s cubic-bezier(.22,1,.36,1)",
      overflow: "hidden",
    }}>

      {/* ── Hero: short so content gets the space it needs ── */}
      <div style={{ position: "relative", height: heroHeight, flexShrink: 0, background: heroBackground }}>
        {image && (
          <img
            src={image}
            alt={category?.title || "Category"}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }}
          />
        )}
        {/* fade to white at bottom */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(255,255,255,0) 30%,rgba(255,255,255,1) 100%)" }} />

        <button
          onClick={dot === 0 ? onBack : () => setDot((d) => d - 1)}
          style={{
            position: "absolute", top: 14, left: 14,
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}
        >
          {dot === 0 ? <XIcon /> : <ArrowLeft color="#111" size={16} />}
        </button>

        <div style={{
          position: "absolute", top: 14, right: 14,
          background: "rgba(255,255,255,0.9)", borderRadius: 20,
          padding: "4px 12px", fontSize: 11, fontWeight: 700,
          color: "#ff5a2c", border: "1px solid rgba(255,90,44,0.18)",
        }}>
          {total > 0 ? `${dot + 1} / ${total}` : "0 / 0"}
        </div>
      </div>

      {/* ── Scrollable content: flex:1 + minHeight:0 is the key ── */}
      <div
        className="hs"
        style={{
          flex: 1,
          minHeight: 0,       // ← critical: lets flexbox shrink this below content size
          overflowY: "auto",  // ← scrolls when text is long
          padding: isDesktop ? "16px 56px 0" : "14px 22px 0",
          maxWidth: isDesktop ? 680 : "100%",
          margin: isDesktop ? "0 auto" : undefined,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {loading ? (
          <p style={pStyle}>Loading welcome pages...</p>
        ) : cur ? (
          <>
            <h1 style={{ fontWeight: 900, fontSize: isDesktop ? 26 : 20, color: "#111", letterSpacing: -0.7, marginBottom: 14, lineHeight: 1.2, marginTop: 0 }}>
              {cur.title}
            </h1>
            {cur.warning_position === "after_title" && <WarningNotice message={cur.warning} />}
            <div>{renderBody(cur.body_content)}</div>
            {cur.warning_position !== "after_title" && <WarningNotice message={cur.warning} />}
          </>
        ) : (
          <>
            <h1 style={{ fontWeight: 900, fontSize: isDesktop ? 26 : 20, color: "#111", letterSpacing: -0.7, marginBottom: 14, lineHeight: 1.2, marginTop: 0 }}>
              {category?.title || "Welcome"}
            </h1>
            <p style={pStyle}>No welcome pages have been added for this category yet.</p>
          </>
        )}
        <div style={{ height: 24 }} />
      </div>

      {/* ── Footer: always pinned at bottom ── */}
      <div style={{
        flexShrink: 0,
        padding: isDesktop ? "14px 56px 28px" : "10px 22px 20px",
        background: "white", borderTop: "1px solid #f0f0f0",
        maxWidth: isDesktop ? 680 : "100%",
        margin: isDesktop ? "0 auto" : undefined,
        width: "100%", boxSizing: "border-box",
      }}>
        {total > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 14 }}>
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => setDot(i)}
                style={{
                  width: i === dot ? 24 : 7, height: 7, borderRadius: 4,
                  background: i === dot ? "#ff5a2c" : "#e5e7eb",
                  border: "none", cursor: "pointer", padding: 0,
                  transition: "all .3s ease",
                }}
              />
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          {dot > 0 && (
            <button
              onClick={() => setDot((d) => d - 1)}
              style={{
                flex: "0 0 auto", padding: isDesktop ? "14px 24px" : "13px 20px",
                background: "white", color: "#333", border: "1.5px solid #e5e7eb",
                borderRadius: 14, fontSize: isDesktop ? 15 : 14, fontWeight: 700, cursor: "pointer",
              }}
            >
              Back
            </button>
          )}
          <button
            onClick={() => total === 0 || dot >= total - 1 ? onFinish() : setDot((d) => d + 1)}
            disabled={loading}
            style={{
              flex: 1, padding: isDesktop ? "14px" : "13px",
              background: "#ff5a2c", color: "white", border: "none", borderRadius: 14,
              fontSize: isDesktop ? 15 : 14, fontWeight: 800,
              cursor: loading ? "default" : "pointer",
              boxShadow: "0 6px 20px rgba(255,90,44,.35)", opacity: loading ? 0.65 : 1,
            }}
          >
            {total === 0 || dot >= total - 1 ? "Got it, let's start!" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}