// src/pages/User/pages/WelcomePage.tsx
// ─────────────────────────────────────────────────────────────────────────────
// 5-slide onboarding walkthrough shown before the course begins.
// Props: onBack → HomePage, onFinish → CourseOverviewPage, isDesktop
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";
import {
  ArrowLeft, ArrowRight, XIcon, WarningIcon,
} from "./shared";

/* ── Slide sub-components ── */
const pStyle: React.CSSProperties = { fontSize: 13.5, color: "#444", lineHeight: 1.7, marginBottom: 10 };

function BulletItem({ text }: { text: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff5a2c", flexShrink: 0, marginTop: 7 }} />
      <p style={{ fontSize: 13, color: "#333", lineHeight: 1.6, margin: 0 }}>{text}</p>
    </div>
  );
}

function NumberedItem({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#ff5a2c", color: "white", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{n}</div>
      <p style={{ fontSize: 13, color: "#333", lineHeight: 1.6, margin: 0 }}>
        <strong style={{ color: "#111" }}>{title}</strong> — {desc}
      </p>
    </div>
  );
}

function StepLabel({ n, color, title, desc }: { n: string; color: string; title: string; desc: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 3 }}>{n} — {title}</div>
      <p style={{ fontSize: 13, color: "#444", lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  );
}

function WarnBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff8f3", border: "1px solid #fcd6bb", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}>
      <div style={{ flexShrink: 0, marginTop: 1 }}><WarningIcon /></div>
      <p style={{ fontSize: 12.5, color: "#c0392b", lineHeight: 1.6, margin: 0, fontWeight: 600 }}>{children}</p>
    </div>
  );
}

/* ── Slide definitions ── */
const slides = [
  {
    title: "Welcome Message",
    body: (
      <>
        <p style={pStyle}>Congratulations on receiving your university offer! You are now one step closer to beginning your study abroad journey in the UK.</p>
        <p style={{ ...pStyle, marginBottom: 14 }}>Before you can travel, you will need to complete two important interviews:</p>
        <NumberedItem n={1} title="The CAS Self-Recorded Interview" desc="A video interview required by your university to confirm your genuine intent to study." />
        <NumberedItem n={2} title="The UK Student Visa Interview" desc="Conducted at the British High Commission to verify your eligibility for a student visa." />
        <p style={{ ...pStyle, marginTop: 14 }}>This course will prepare you for both interviews — giving you the exact questions, strategies, and model answers you need to walk in (or record) with complete confidence.</p>
      </>
    ),
  },
  {
    title: "How to Use Each Lesson",
    body: (
      <>
        <p style={pStyle}>Every question in this course follows the same three-step format:</p>
        <StepLabel n="Step 1" color="#e67e22" title="Read the Question:" desc="Understand exactly what is being asked and why the interviewer is asking it." />
        <StepLabel n="Step 2" color="#e67e22" title="Study the Strategy:" desc="Each question comes with a strategy breakdown telling you what points to cover, what to avoid, and how to structure your answer." />
        <StepLabel n="Step 3" color="#e67e22" title="Read the Model Answer:" desc="A full model answer is provided with [placeholder text in brackets] wherever you need to insert your own personal details." />
        <WarnBox>Do NOT memorise answers word for word. Use the model answers as a guide and practise speaking in your own natural voice. Interviewers can tell when answers are rehearsed robotically.</WarnBox>
      </>
    ),
  },
  {
    title: "Key Tips Before You Begin",
    body: (
      <>
        <BulletItem text={<><strong>Be honest.</strong> Every answer must reflect your real situation.</>} />
        <BulletItem text={<><strong>Be specific.</strong> Know your course name, modules, university location, and financial details inside out.</>} />
        <BulletItem text={<><strong>Practice out loud.</strong> Practise speaking your answers in front of a mirror or record yourself.</>} />
        <BulletItem text={<><strong>Know your documents.</strong> Have your offer letter, CAS number, financial statements, and passport ready.</>} />
        <BulletItem text={<><strong>Stay calm.</strong> If you are a genuine student with genuine intent, your answers will come naturally.</>} />
      </>
    ),
  },
  {
    title: "A Note on the CAS Self-Recorded Interview",
    body: (
      <>
        <WarnBox>Any attempt to cheat, use notes, or have someone else answer for you will result in withdrawal of your offer.</WarnBox>
        <BulletItem text="You will be alone — no interviewer is present in the room" />
        <BulletItem text="Your recording will be reviewed by university staff" />
        <BulletItem text="You must read an integrity statement at the beginning" />
        <BulletItem text="You must show your passport to confirm your identity on camera" />
      </>
    ),
  },
  {
    title: "When Should You Complete This Course?",
    body: (
      <>
        <p style={pStyle}>Complete this course at least three weeks before your CAS interview or visa appointment so you have enough time to:</p>
        <BulletItem text="Personalise the model answers" />
        <BulletItem text="Practise speaking out loud" />
        <BulletItem text="Review any areas where you feel less confident" />
      </>
    ),
  },
];

const TOTAL = slides.length;

/* ── Main Component ── */
interface WelcomePageProps {
  onBack: () => void;
  onFinish: () => void;
  isDesktop: boolean;
}

export default function WelcomePage({ onBack, onFinish, isDesktop }: WelcomePageProps) {
  const [dot, setDot] = useState(0);
  const cur = slides[dot];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "#fff", animation: "pageIn .35s cubic-bezier(.22,1,.36,1)", overflow: "hidden" }}>
      {/* Hero image */}
      <div style={{ position: "relative", height: isDesktop ? 240 : 200, flexShrink: 0 }}>
        <img
          src="https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=900&q=80"
          alt="London"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(255,255,255,0) 30%,rgba(255,255,255,1) 100%)" }} />

        {/* Back / close btn */}
        <button
          onClick={dot === 0 ? onBack : () => setDot(d => d - 1)}
          style={{ position: "absolute", top: 14, left: 14, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          {dot === 0 ? <XIcon /> : <ArrowLeft color="#111" size={16} />}
        </button>

        {/* Slide counter */}
        <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.9)", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: "#ff5a2c", border: "1px solid rgba(255,90,44,0.18)" }}>
          {dot + 1} / {TOTAL}
        </div>
      </div>

      {/* Scrollable body */}
      <div
        style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: isDesktop ? "4px 56px 0" : "4px 22px 0", maxWidth: isDesktop ? 680 : "100%", margin: isDesktop ? "0 auto" : undefined, width: "100%" }}
        className="hs"
      >
        <h1 style={{ fontWeight: 900, fontSize: isDesktop ? 26 : 20, color: "#111", letterSpacing: -0.7, marginBottom: 14, lineHeight: 1.2 }}>
          {cur.title}
        </h1>
        <div>{cur.body}</div>
        <div style={{ height: 24 }} />
      </div>

      {/* Footer */}
      <div style={{ flexShrink: 0, padding: isDesktop ? "14px 56px 28px" : "10px 22px 20px", background: "white", borderTop: "1px solid #f0f0f0", maxWidth: isDesktop ? 680 : "100%", margin: isDesktop ? "0 auto" : undefined, width: "100%" }}>
        {/* Dot indicators */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 14 }}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <button
              key={i}
              onClick={() => setDot(i)}
              style={{ width: i === dot ? 24 : 7, height: 7, borderRadius: 4, background: i === dot ? "#ff5a2c" : "#e5e7eb", border: "none", cursor: "pointer", padding: 0, transition: "all .3s ease" }}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          {dot > 0 && (
            <button
              onClick={() => setDot(d => d - 1)}
              style={{ flex: "0 0 auto", padding: isDesktop ? "14px 24px" : "13px 20px", background: "white", color: "#333", border: "1.5px solid #e5e7eb", borderRadius: 14, fontSize: isDesktop ? 15 : 14, fontWeight: 700, cursor: "pointer" }}
            >
              Back
            </button>
          )}
          <button
            onClick={() => dot < TOTAL - 1 ? setDot(d => d + 1) : onFinish()}
            style={{ flex: 1, padding: isDesktop ? "14px" : "13px", background: "#ff5a2c", color: "white", border: "none", borderRadius: 14, fontSize: isDesktop ? 15 : 14, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 20px rgba(255,90,44,.35)" }}
          >
            {dot < TOTAL - 1 ? "Next" : "Got it, let's start!"}
          </button>
        </div>
      </div>
    </div>
  );
}