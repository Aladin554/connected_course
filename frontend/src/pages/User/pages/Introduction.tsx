import { useState, useEffect, useRef, ReactElement } from "react";

/* ── Types ── */
type Page = "home" | "welcome" | "course" | "module" | "lesson";

interface IconProps { active: boolean; }
interface BarProps { value: number; light?: boolean; }
interface SectionHeaderProps { title: string; action?: string; }
interface HeroCardProps { height?: number; onContinue: () => void; }
interface HelpBoxProps { desktop: boolean; }
interface LayoutProps { tab: string; setTab: (t: string) => void; onContinue: () => void; }

/* ════════════════════════ ICONS ════════════════════════ */
const HomeIcon = ({ active }: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={active?"#22c55e":"none"} stroke={active?"#22c55e":"#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/>
  </svg>
);
const BookIcon = ({ active }: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active?"#22c55e":"#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const MicIcon = ({ active }: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active?"#22c55e":"#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const UserIcon = ({ active }: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active?"#22c55e":"#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
  </svg>
);
const ArrowRight = ({ color="white", size=12 }: { color?:string; size?:number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const ArrowLeft = ({ color="#fff", size=18 }: { color?:string; size?:number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const ChevRight = ({ color="#22c55e" }: { color?:string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
);
const ChevDown = ({ color="#111" }: { color?:string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
);
const ChevUp = ({ color="#ff5a2c" }: { color?:string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
);
const HeadphonesIcon = ({ size=18 }: { size?:number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
    <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
  </svg>
);
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const BookmarkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);
const PlayIcon = ({ size=16, color="white" }: { size?:number; color?:string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);
const CheckIcon = ({ size=12, color="white" }: { size?:number; color?:string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const LockIcon = ({ size=14, color="#9ca3af" }: { size?:number; color?:string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const ClockIcon = ({ size=12, color="#9ca3af" }: { size?:number; color?:string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const FullscreenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);
const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e67e22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const XIcon = ({ color="#666" }: { color?:string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

/* ════════════════════════ DATA ════════════════════════ */
const tabs: { label: string; icon: (a: boolean) => ReactElement }[] = [
  { label: "Home",           icon: (a) => <HomeIcon active={a} /> },
  { label: "Modules",        icon: (a) => <BookIcon active={a} /> },
  { label: "Mock Interview", icon: (a) => <MicIcon  active={a} /> },
  { label: "Profile",        icon: (a) => <UserIcon active={a} /> },
];

const homeModules = [
  { title: "UK Interview Training",  progress: 72, img: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=300&q=80" },
  { title: "Australia GS Training",  progress: 58, img: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=300&q=80" },
  { title: "New Zealand Training",   progress: 40, img: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=300&q=80" },
  { title: "Canada Visa Prep",       progress: 58, img: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=300&q=80" },
];

const courseModules = [
  {
    id: 1,
    title: "Module 1",
    subtitle: "Verification & Integrity",
    status: "completed" as const,
  },
  {
    id: 2,
    title: "Module 2",
    subtitle: "About Your Course",
    status: "completed" as const,
  },
  {
    id: 3,
    title: "Module 3",
    subtitle: "Your University & Location",
    status: "completed" as const,
  },
  {
    id: 4,
    title: "Module 4",
    subtitle: "Finances & Funding",
    status: "inprogress" as const,
  },
  {
    id: 5,
    title: "Module 5",
    subtitle: "Career Goals & Future Plans",
    status: "locked" as const,
  },
  {
    id: 6,
    title: "Module 6",
    subtitle: "Student Life & Wellbeing",
    status: "locked" as const,
  },
  {
    id: 7,
    title: "Module 7",
    subtitle: "Personal & Personality Questions",
    status: "locked" as const,
  },
  {
    id: 8,
    title: "Module 8",
    subtitle: "Visa Interview Questions",
    status: "locked" as const,
  },
];

const moduleLessons = [
  { id: 1, title: "Who is Sponsoring You?",    mins: 8,  status: "completed" as const },
  { id: 2, title: "How Much Have You Paid?",   mins: 5,  status: "completed" as const },
  { id: 3, title: "Living Cost Questions",     mins: 10, status: "inprogress" as const },
  { id: 4, title: "Bank Statements & Funds",   mins: 7,  status: "locked" as const },
  { id: 5, title: "Scholarships & Loans",      mins: 6,  status: "locked" as const },
  { id: 6, title: "Mixed Financial Scenarios", mins: 8,  status: "locked" as const },
];

const lessonData = {
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

/* ════════════════════════ SHARED COMPONENTS ════════════════════════ */
const Bar = ({ value, light=false }: BarProps) => (
  <div style={{ height: 3, background: light ? "rgba(255,255,255,0.22)" : "#e5e7eb", borderRadius: 8, overflow: "hidden", flex: 1 }}>
    <div style={{ height: "100%", width: `${value}%`, background: "#22c55e", borderRadius: 8 }} />
  </div>
);

const SectionHeader = ({ title, action }: SectionHeaderProps) => (
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

const HeroCard = ({ height=190, onContinue }: HeroCardProps) => (
  <div style={{ borderRadius: 16, overflow: "hidden", position: "relative", height, boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}>
    <img src="https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800&q=80" alt="Big Ben"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(95deg,rgba(4,12,28,0.95) 0%,rgba(4,12,28,0.78) 42%,rgba(4,12,28,0.08) 100%)" }} />
    <div style={{ position: "relative", zIndex: 1, padding: "16px 18px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.13)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🏛️</div>
          <span style={{ color: "#22c55e", fontSize: 11, fontWeight: 700 }}>Module 4</span>
        </div>
        <div style={{ fontWeight: 900, fontSize: height > 200 ? 22 : 15, color: "white", letterSpacing: -0.5, marginBottom: 3 }}>UK Interview Training</div>
        <div style={{ fontSize: height > 200 ? 13 : 10.5, color: "rgba(255,255,255,0.5)" }}>Financial Questions</div>
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", flexShrink: 0 }}>72% Complete</span>
          <Bar value={72} light />
        </div>
        <button onClick={onContinue} style={{ background: "#22c55e", color: "white", border: "none", borderRadius: 9, padding: "8px 18px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer", boxShadow: "0 3px 12px rgba(34,197,94,0.4)" }}>
          Continue <ArrowRight />
        </button>
      </div>
    </div>
  </div>
);

const HelpBox = ({ desktop }: HelpBoxProps) => (
  <div style={{ background: "#f6faf7", borderRadius: desktop ? 16 : 12, padding: desktop ? "16px 20px" : "10px 12px", display: "flex", alignItems: "center", gap: desktop ? 14 : 10, border: "1px solid rgba(34,197,94,0.13)" }}>
    <div style={{ width: desktop?42:36, height: desktop?42:36, borderRadius: desktop?12:9, background: "#f0fdf4", border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <HeadphonesIcon size={desktop?20:18} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: 800, fontSize: desktop?13:12, color: "#111", marginBottom: 2 }}>Need Help?</div>
      <div style={{ fontSize: desktop?11:10, color: "#9ca3af", lineHeight: 1.4 }}>We're here to support you on your journey.</div>
    </div>
    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#22c55e", fontSize: desktop?11:10.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap", padding: 0, flexShrink: 0 }}>
      Contact Support <ArrowRight color="#22c55e" size={11} />
    </button>
  </div>
);

/* ════════════════════════ WELCOME PAGE ════════════════════════ */
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
      <p style={{ fontSize: 13, color: "#333", lineHeight: 1.6, margin: 0 }}><strong style={{ color: "#111" }}>{title}</strong> — {desc}</p>
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

function WelcomePage({ onBack, onFinish, isDesktop }: { onBack:()=>void; onFinish:()=>void; isDesktop:boolean }) {
  const [dot, setDot] = useState(0);
  const total = 5;
  const slides = [
    { title: "Welcome Message", body: (<>
      <p style={pStyle}>Congratulations on receiving your university offer! You are now one step closer to beginning your study abroad journey in the UK.</p>
      <p style={{ ...pStyle, marginBottom: 14 }}>Before you can travel, you will need to complete two important interviews:</p>
      <NumberedItem n={1} title="The CAS Self-Recorded Interview" desc="A video interview required by your university to confirm your genuine intent to study." />
      <NumberedItem n={2} title="The UK Student Visa Interview" desc="Conducted at the British High Commission to verify your eligibility for a student visa." />
      <p style={{ ...pStyle, marginTop: 14 }}>This course will prepare you for both interviews — giving you the exact questions, strategies, and model answers you need to walk in (or record) with complete confidence.</p>
    </>) },
    { title: "How to Use Each Lesson", body: (<>
      <p style={pStyle}>Every question in this course follows the same three-step format:</p>
      <StepLabel n="Step 1" color="#e67e22" title="Read the Question:" desc="Understand exactly what is being asked and why the interviewer is asking it." />
      <StepLabel n="Step 2" color="#e67e22" title="Study the Strategy:" desc="Each question comes with a strategy breakdown telling you what points to cover, what to avoid, and how to structure your answer." />
      <StepLabel n="Step 3" color="#e67e22" title="Read the Model Answer:" desc="A full model answer is provided with [placeholder text in brackets] wherever you need to insert your own personal details." />
      <WarnBox>Do NOT memorise answers word for word. Use the model answers as a guide and practise speaking in your own natural voice. Interviewers can tell when answers are rehearsed robotically.</WarnBox>
    </>) },
    { title: "Key Tips Before You Begin", body: (<>
      <BulletItem text={<><strong>Be honest.</strong> Every answer must reflect your real situation.</>} />
      <BulletItem text={<><strong>Be specific.</strong> Know your course name, modules, university location, and financial details inside out.</>} />
      <BulletItem text={<><strong>Practice out loud.</strong> Practise speaking your answers in front of a mirror or record yourself.</>} />
      <BulletItem text={<><strong>Know your documents.</strong> Have your offer letter, CAS number, financial statements, and passport ready.</>} />
      <BulletItem text={<><strong>Stay calm.</strong> If you are a genuine student with genuine intent, your answers will come naturally.</>} />
    </>) },
    { title: "A Note on the CAS Self-Recorded Interview", body: (<>
      <WarnBox>Any attempt to cheat, use notes, or have someone else answer for you will result in withdrawal of your offer.</WarnBox>
      <BulletItem text="You will be alone — no interviewer is present in the room" />
      <BulletItem text="Your recording will be reviewed by university staff" />
      <BulletItem text="You must read an integrity statement at the beginning" />
      <BulletItem text="You must show your passport to confirm your identity on camera" />
    </>) },
    { title: "When Should You Complete This Course?", body: (<>
      <p style={pStyle}>Complete this course at least three weeks before your CAS interview or visa appointment so you have enough time to:</p>
      <BulletItem text="Personalise the model answers" />
      <BulletItem text="Practise speaking out loud" />
      <BulletItem text="Review any areas where you feel less confident" />
    </>) },
  ];
  const cur = slides[dot];
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100dvh", background:"#fff", animation:"pageIn .35s cubic-bezier(.22,1,.36,1)", overflow:"hidden" }}>
      <div style={{ position:"relative", height: isDesktop?240:200, flexShrink:0 }}>
        <img src="https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=900&q=80" alt="London" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 25%" }} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(255,255,255,0) 30%,rgba(255,255,255,1) 100%)" }} />
        <button onClick={dot===0?onBack:()=>setDot(d=>d-1)} style={{ position:"absolute", top:14, left:14, width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,0.9)", border:"1px solid rgba(0,0,0,0.08)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
          {dot===0 ? <XIcon /> : <ArrowLeft color="#111" size={16} />}
        </button>
        <div style={{ position:"absolute", top:14, right:14, background:"rgba(255,255,255,0.9)", borderRadius:20, padding:"4px 12px", fontSize:11, fontWeight:700, color:"#ff5a2c", border:"1px solid rgba(255,90,44,0.18)" }}>{dot+1} / {total}</div>
      </div>
      <div style={{ flex:1, minHeight:0, overflowY:"auto", padding: isDesktop?"4px 56px 0":"4px 22px 0", maxWidth: isDesktop?680:"100%", margin: isDesktop?"0 auto":undefined, width:"100%" }} className="hs">
        <h1 style={{ fontWeight:900, fontSize: isDesktop?26:20, color:"#111", letterSpacing:-0.7, marginBottom:14, lineHeight:1.2 }}>{cur.title}</h1>
        <div>{cur.body}</div>
        <div style={{ height:24 }} />
      </div>
      <div style={{ flexShrink:0, padding: isDesktop?"14px 56px 28px":"10px 22px 20px", background:"white", borderTop:"1px solid #f0f0f0", maxWidth: isDesktop?680:"100%", margin: isDesktop?"0 auto":undefined, width:"100%" }}>
        <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:14 }}>
          {Array.from({ length: total }).map((_,i) => (
            <button key={i} onClick={()=>setDot(i)} style={{ width:i===dot?24:7, height:7, borderRadius:4, background:i===dot?"#ff5a2c":"#e5e7eb", border:"none", cursor:"pointer", padding:0, transition:"all .3s ease" }} />
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          {dot>0 && <button onClick={()=>setDot(d=>d-1)} style={{ flex:"0 0 auto", padding: isDesktop?"14px 24px":"13px 20px", background:"white", color:"#333", border:"1.5px solid #e5e7eb", borderRadius:14, fontSize: isDesktop?15:14, fontWeight:700, cursor:"pointer" }}>Back</button>}
          <button onClick={()=>dot<total-1?setDot(d=>d+1):onFinish()} style={{ flex:1, padding: isDesktop?"14px":"13px", background:"#ff5a2c", color:"white", border:"none", borderRadius:14, fontSize: isDesktop?15:14, fontWeight:800, cursor:"pointer", boxShadow:"0 6px 20px rgba(255,90,44,.35)" }}>
            {dot<total-1?"Next":"Got it, let's start!"}
          </button>
        </div>
      </div>
      <style>{`@keyframes pageIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </div>
  );
}

/* ════════════════════════ COURSE OVERVIEW ════════════════════════ */
function CourseOverviewPage({ onBack, onModuleClick, isDesktop }: { onBack:()=>void; onModuleClick:()=>void; isDesktop:boolean }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100dvh", background:"#fff", animation:"pageIn .35s cubic-bezier(.22,1,.36,1)", overflow:"hidden" }}>
      <div style={{ position:"relative", height: isDesktop?320:280, flexShrink:0 }}>
        <img src="https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=900&q=80" alt="UK" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 30%" }} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(4,12,28,.5) 0%,rgba(4,12,28,.85) 100%)" }} />
        <div style={{ position:"absolute", top:0, left:0, right:0, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px" }}>
          <button onClick={onBack} style={{ width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,.15)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><ArrowLeft size={16} /></button>
          <button style={{ width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,.15)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><BookmarkIcon /></button>
        </div>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"0 20px 20px" }}>
          <div style={{ fontSize:22, marginBottom:4 }}>🇬🇧</div>
          <h1 style={{ fontWeight:900, fontSize: isDesktop?30:26, color:"white", letterSpacing:-0.8, lineHeight:1.1, marginBottom:8 }}>UK Interview Training</h1>
          <div style={{ fontSize:12, color:"rgba(255,255,255,.65)", marginBottom:12 }}>43 Lessons • 7 Modules</div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.75)", flexShrink:0 }}>72% Complete</div>
            <div style={{ flex:1, height:4, background:"rgba(255,255,255,.2)", borderRadius:4, overflow:"hidden" }}>
              <div style={{ width:"72%", height:"100%", background:"#22c55e", borderRadius:4 }} />
            </div>
          </div>
          <button onClick={onModuleClick} style={{ width:"100%", padding:"14px", background:"#ff5a2c", color:"white", border:"none", borderRadius:14, fontSize:15, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 4px 16px rgba(255,90,44,.4)" }}>
            Continue Learning <ArrowRight />
          </button>
        </div>
      </div>
      <div style={{ flex:1, minHeight:0, overflowY:"auto", background:"white" }} className="hs">
        <div style={{ margin:"16px 16px 0" }}>
          <div style={{ fontSize:11, color:"#9ca3af", fontWeight:600, marginBottom:8 }}>Last Lesson</div>
          <div onClick={onModuleClick} style={{ display:"flex", alignItems:"center", gap:12, background:"#f9fafb", borderRadius:14, padding:"12px 14px", cursor:"pointer", border:"1px solid #f0f0f0" }}>
            <div style={{ width:40, height:40, borderRadius:10, background:"#e8fdf1", border:"1px solid rgba(34,197,94,.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800, fontSize:13, color:"#111", lineHeight:1.3 }}>Module 4:<br/>Financial Questions</div>
              <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>Lesson 3 of 6</div>
            </div>
            <ChevRight color="#9ca3af" />
          </div>
        </div>
        <div style={{ margin:"20px 16px 0" }}>
          <div style={{ fontWeight:800, fontSize:14, color:"#111", marginBottom:14 }}>Your Learning Path</div>
          <div style={{ display:"flex", flexDirection:"column" }}>
            {courseModules.map((m,i)=>{
              const isDone = m.status==="completed";
              const isActive = m.status==="inprogress";
              const isLocked = m.status==="locked";
              return (
                <div key={m.id} style={{ display:"flex", alignItems:"stretch", gap:12 }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0, width:24 }}>
                    <div style={{ width:24, height:24, borderRadius:"50%", background: isLocked?"#f3f4f6":isDone?"#22c55e":"#22c55e", border: isLocked?"2px solid #e5e7eb":"none", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {isLocked?<LockIcon size={12} color="#9ca3af"/>:isDone?<CheckIcon size={10}/>:<PlayIcon size={8}/>}
                    </div>
                    {i<courseModules.length-1 && <div style={{ width:2, flex:1, minHeight:12, background: isDone?"#22c55e":"#e5e7eb", marginTop:2 }} />}
                  </div>
                  <div onClick={isLocked?undefined:onModuleClick} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"space-between", paddingBottom: i<courseModules.length-1?14:0, cursor: isLocked?"default":"pointer" }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13, color: isLocked?"#9ca3af":"#111" }}>{m.title}</div>
                      <div style={{ fontSize:11, color:"#9ca3af", marginTop:1 }}>{m.subtitle}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      {isDone && <span style={{ fontSize:11, fontWeight:700, color:"#22c55e" }}>Completed</span>}
                      {isActive && <span style={{ fontSize:11, fontWeight:700, color:"#22c55e" }}>In Progress</span>}
                      {isLocked?<LockIcon size={14} color="#d1d5db"/>:<ChevRight color={isActive?"#22c55e":"#d1d5db"}/>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ height:32 }} />
      </div>
      <style>{`@keyframes pageIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </div>
  );
}

/* ════════════════════════ MODULE LESSONS PAGE ════════════════════════ */
function ModuleLessonsPage({ onBack, onLessonClick, isDesktop }: { onBack:()=>void; onLessonClick:()=>void; isDesktop:boolean }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100dvh", background:"#0d1f35", animation:"pageIn .35s cubic-bezier(.22,1,.36,1)", overflow:"hidden" }}>
      {/* Dark header */}
      <div style={{ padding:"14px 18px 20px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <button onClick={onBack} style={{ width:32, height:32, borderRadius:"50%", background:"rgba(255,255,255,.1)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><ArrowLeft size={15}/></button>
          <span style={{ color:"rgba(255,255,255,.7)", fontSize:13, fontWeight:600 }}>Module 4</span>
          <div style={{ width:32 }} />
        </div>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#ff5a2c", letterSpacing:"0.08em", marginBottom:4 }}>MODULE 4</div>
            <h1 style={{ fontWeight:900, fontSize:24, color:"white", letterSpacing:-0.8, marginBottom:6, lineHeight:1.15 }}>Financial Questions</h1>
            <p style={{ fontSize:12, color:"rgba(255,255,255,.5)", lineHeight:1.5 }}>Learn how to confidently answer questions about your finances and funding.</p>
          </div>
          <div style={{ width:52, height:52, borderRadius:"50%", background:"rgba(34,197,94,.15)", border:"1px solid rgba(34,197,94,.25)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ fontSize:22, color:"#22c55e" }}>£</span>
          </div>
        </div>
        <div style={{ marginTop:16, display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ fontSize:12, color:"rgba(255,255,255,.6)", fontWeight:600 }}>6 Lessons</span>
          <span style={{ fontSize:12, color:"#22c55e", fontWeight:700 }}>In Progress</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ flex:1, height:4, background:"rgba(255,255,255,.12)", borderRadius:4, overflow:"hidden" }}>
            <div style={{ width:"50%", height:"100%", background:"#22c55e", borderRadius:4 }} />
          </div>
          <span style={{ fontSize:12, color:"rgba(255,255,255,.6)", fontWeight:700, flexShrink:0 }}>50%</span>
        </div>
      </div>
      {/* White lessons */}
      <div style={{ flex:1, minHeight:0, background:"white", borderRadius:"20px 20px 0 0", overflowY:"auto", padding:"6px 0 24px" }} className="hs">
        {moduleLessons.map((lesson,i)=>{
          const isDone = lesson.status==="completed";
          const isActive = lesson.status==="inprogress";
          const isLocked = lesson.status==="locked";
          return (
            <div key={lesson.id} onClick={isActive ? onLessonClick : undefined} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background: isActive?"#fff8f4":"white", borderBottom: i<moduleLessons.length-1?"1px solid #f3f4f6":"none", cursor: isActive?"pointer":isLocked?"default":"pointer" }}>
              <div style={{ width:36, height:36, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background: isDone?"#22c55e":isActive?"#ff5a2c":"#f3f4f6", border: isLocked?"1px solid #e5e7eb":"none" }}>
                {isDone&&<CheckIcon size={13}/>}
                {isActive&&<PlayIcon size={12}/>}
                {isLocked&&<span style={{ fontSize:12, fontWeight:700, color:"#9ca3af" }}>{lesson.id}</span>}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:10.5, color: isActive?"#ff5a2c":"#9ca3af", fontWeight:600, marginBottom:2 }}>Lesson {lesson.id}</div>
                <div style={{ fontWeight:700, fontSize:13.5, color: isLocked?"#9ca3af":"#111", marginBottom:3 }}>{lesson.title}</div>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <ClockIcon size={11} color={isActive?"#ff5a2c":"#9ca3af"} />
                  <span style={{ fontSize:11, color: isActive?"#ff5a2c":"#9ca3af" }}>{lesson.mins} mins</span>
                </div>
              </div>
              {isActive&&<button onClick={onLessonClick} style={{ padding:"8px 16px", background:"#ff5a2c", color:"white", border:"none", borderRadius:10, fontSize:12, fontWeight:700, cursor:"pointer", flexShrink:0 }}>Continue</button>}
              {isDone&&<ChevRight color="#d1d5db"/>}
              {isLocked&&<LockIcon size={15} color="#d1d5db"/>}
            </div>
          );
        })}
      </div>
      <style>{`@keyframes pageIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </div>
  );
}

/* ════════════════════════ LESSON DETAIL PAGE ════════════════════════ */
function LessonDetailPage({ onBack, isDesktop }: { onBack:()=>void; isDesktop:boolean }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const togglePlay = () => {
    if (playing) {
      clearInterval(intervalRef.current!);
      setPlaying(false);
    } else {
      setPlaying(true);
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { clearInterval(intervalRef.current!); setPlaying(false); return 100; }
          return p + 0.4;
        });
      }, 100);
    }
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const toggleSection = (key: string) => {
    setExpanded(e => e.includes(key) ? e.filter(k=>k!==key) : [...e, key]);
  };

  const totalSecs = 4*60+35;
  const currentSecs = Math.floor((progress/100)*totalSecs);
  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const sections = [
    {
      key: "strategy",
      label: "Strategy to Answer the Question",
      content: (
        <ol style={{ paddingLeft: 18, margin: 0 }}>
          {lessonData.strategy.map((s,i) => (
            <li key={i} style={{ fontSize:13, color:"#444", lineHeight:1.7, marginBottom:4 }}>{s}</li>
          ))}
        </ol>
      ),
    },
    {
      key: "model",
      label: "Model Answer",
      content: <p style={{ fontSize:13, color:"#444", lineHeight:1.75, margin:0, fontStyle:"italic" }}>{lessonData.modelAnswer}</p>,
    },
    {
      key: "mistakes",
      label: "Common Mistakes",
      content: (
        <ul style={{ paddingLeft: 0, margin: 0, listStyle:"none" }}>
          {lessonData.commonMistakes.map((m,i) => (
            <li key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:6 }}>
              <span style={{ color:"#ff5a2c", fontWeight:700, fontSize:14, lineHeight:1.5 }}>•</span>
              <span style={{ fontSize:13, color:"#444", lineHeight:1.6 }}>{m}</span>
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100dvh", background:"#0d1f35", animation:"pageIn .35s cubic-bezier(.22,1,.36,1)", overflow:"hidden" }}>
      {/* Top nav */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px 10px", flexShrink:0 }}>
        <button onClick={onBack} style={{ width:32, height:32, borderRadius:"50%", background:"rgba(255,255,255,.1)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><ArrowLeft size={15}/></button>
        <span style={{ color:"rgba(255,255,255,.75)", fontSize:13, fontWeight:600 }}>Lesson {lessonData.lessonNum} of {lessonData.totalLessons}</span>
        <button style={{ width:32, height:32, borderRadius:"50%", background:"rgba(255,255,255,.1)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><BookmarkIcon /></button>
      </div>

      {/* Progress dots */}
      <div style={{ display:"flex", gap:4, padding:"0 18px 12px", flexShrink:0 }}>
        {moduleLessons.map((l,i) => {
          const done = l.status==="completed";
          const active = l.id === lessonData.lessonNum;
          return (
            <div key={i} style={{ flex:1, height:3, borderRadius:2, background: done?"#ff5a2c": active?"#ff5a2c":"rgba(255,255,255,.2)" }} />
          );
        })}
      </div>

      {/* Title */}
      <div style={{ padding:"0 18px 10px", flexShrink:0 }}>
        <h1 style={{ fontWeight:900, fontSize:22, color:"white", letterSpacing:-0.6, marginBottom:6, lineHeight:1.15 }}>{lessonData.title}</h1>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <ClockIcon size={13} color="rgba(255,255,255,.5)" />
          <span style={{ fontSize:12, color:"rgba(255,255,255,.5)" }}>{lessonData.mins} mins</span>
        </div>
      </div>

      {/* Video player */}
      <div style={{ position:"relative", margin:"0 18px 0", borderRadius:14, overflow:"hidden", flexShrink:0 }}>
        <img src={lessonData.videoThumb} alt="lesson" style={{ width:"100%", height:200, objectFit:"cover", display:"block" }} />
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.3)" }} />
        {/* Play button */}
        <button onClick={togglePlay} style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-60%)", width:48, height:48, borderRadius:"50%", background:"rgba(255,255,255,.9)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:"0 4px 16px rgba(0,0,0,.3)" }}>
          {playing ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#111" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          ) : (
            <PlayIcon size={18} color="#111" />
          )}
        </button>
        {/* Bottom bar */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"8px 12px", background:"linear-gradient(to top,rgba(0,0,0,.7),transparent)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:11, color:"white", fontWeight:600, flexShrink:0 }}>{fmt(currentSecs)}</span>
            <div style={{ flex:1, height:3, background:"rgba(255,255,255,.3)", borderRadius:2, overflow:"hidden", cursor:"pointer" }}>
              <div style={{ width:`${progress}%`, height:"100%", background:"#ff5a2c", borderRadius:2 }} />
            </div>
            <span style={{ fontSize:11, color:"rgba(255,255,255,.7)", flexShrink:0 }}>{fmt(totalSecs)}</span>
            <button style={{ background:"none", border:"none", cursor:"pointer", lineHeight:0, padding:0 }}><FullscreenIcon /></button>
          </div>
        </div>
      </div>

      {/* Scrollable white section */}
      <div style={{ flex:1, minHeight:0, background:"white", borderRadius:"20px 20px 0 0", marginTop:14, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ flex:1, overflowY:"auto", padding:"16px 18px 0" }} className="hs">
          <p style={{ fontSize:12, color:"#9ca3af", marginBottom:14 }}>Expand the sections below to learn more.</p>

          {sections.map((sec) => {
            const isOpen = expanded.includes(sec.key);
            return (
              <div key={sec.key} style={{ borderBottom:"1px solid #f0f0f0", marginBottom:0 }}>
                <button onClick={()=>toggleSection(sec.key)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>
                  <span style={{ fontWeight:800, fontSize:14, color:"#111" }}>{sec.label}</span>
                  {isOpen ? <ChevUp /> : <ChevDown />}
                </button>
                {isOpen && (
                  <div style={{ paddingBottom:16 }}>
                    {sec.content}
                  </div>
                )}
              </div>
            );
          })}
          <div style={{ height:16 }} />
        </div>

        {/* Next Question button */}
        <div style={{ padding:"12px 18px 20px", background:"white", borderTop:"1px solid #f5f5f5", flexShrink:0 }}>
          <button style={{ width:"100%", padding:"15px", background:"#ff5a2c", color:"white", border:"none", borderRadius:14, fontSize:15, fontWeight:800, cursor:"pointer", boxShadow:"0 6px 20px rgba(255,90,44,.35)" }}>
            Next Question
          </button>
        </div>
      </div>
      <style>{`@keyframes pageIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </div>
  );
}

/* ════════════════════════ MAIN APP ════════════════════════ */
export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [tab, setTab] = useState("Home");
  const [isDesktop, setIsDesktop] = useState(typeof window !== "undefined" ? window.innerWidth >= 768 : false);
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#071224;-webkit-font-smoothing:antialiased;}
        .hs::-webkit-scrollbar{display:none;} .hs{-ms-overflow-style:none;scrollbar-width:none;}
        button{font-family:'Plus Jakarta Sans',sans-serif;}
      `}</style>

      {page==="welcome"  ? <WelcomePage      onBack={()=>setPage("home")}    onFinish={()=>setPage("course")}  isDesktop={isDesktop} /> :
       page==="course"   ? <CourseOverviewPage onBack={()=>setPage("welcome")} onModuleClick={()=>setPage("module")} isDesktop={isDesktop} /> :
       page==="module"   ? <ModuleLessonsPage  onBack={()=>setPage("course")}  onLessonClick={()=>setPage("lesson")} isDesktop={isDesktop} /> :
       page==="lesson"   ? <LessonDetailPage   onBack={()=>setPage("module")}  isDesktop={isDesktop} /> :
       isDesktop         ? <DesktopLayout tab={tab} setTab={setTab} onContinue={()=>setPage("welcome")} /> :
                           <MobileLayout  tab={tab} setTab={setTab} onContinue={()=>setPage("welcome")} />}
    </>
  );
}

/* ════════════════════════ MOBILE LAYOUT ════════════════════════ */
function MobileLayout({ tab, setTab, onContinue }: LayoutProps) {
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100dvh", width:"100%", overflow:"hidden", background:"#071224" }}>
      <div style={{ padding:"10px 16px 0", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
        <div>
          <div style={{ fontWeight:900, fontSize:17, color:"white", letterSpacing:-0.5 }}>Connected<span style={{ color:"#22c55e" }}>.</span></div>
          <div style={{ color:"#22c55e", fontSize:7.5, fontWeight:700, letterSpacing:"0.22em", marginTop:1 }}>EDUCATION</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button style={{ background:"none", border:"none", cursor:"pointer", lineHeight:0, padding:0 }}><BellIcon /></button>
          <div style={{ position:"relative" }}>
            <div style={{ width:32, height:32, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,.3)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:11, color:"white", background:"rgba(255,255,255,.1)" }}>SZ</div>
            <div style={{ position:"absolute", bottom:1, right:1, width:7, height:7, borderRadius:"50%", background:"#22c55e", border:"2px solid #071224" }} />
          </div>
        </div>
      </div>
      <div style={{ padding:"8px 16px 10px", flexShrink:0 }}>
        <div style={{ fontWeight:900, fontSize:18, color:"white", letterSpacing:-0.4, lineHeight:1.2, marginBottom:3 }}>Good morning,<br/>Syed Zeeshad 👋</div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,.45)", lineHeight:1.4 }}>Keep going! You're one step closer to your dream.</div>
      </div>
      <div style={{ flex:1, minHeight:0, background:"white", borderRadius:"20px 20px 0 0", overflow:"hidden", display:"flex", flexDirection:"column" }}>
        <div style={{ flex:1, minHeight:0, overflowY:"auto", overflowX:"hidden", display:"flex", flexDirection:"column", padding:"13px 15px 0", gap:11 }} className="hs">
          <div style={{ flexShrink:0 }}>
            <SectionHeader title="Continue Learning" />
            <HeroCard height={190} onContinue={onContinue} />
          </div>
          <div style={{ flexShrink:0 }}>
            <SectionHeader title="Your Modules" action="View All" />
            <div className="hs" style={{ display:"flex", gap:8, overflowX:"auto", marginLeft:-15, paddingLeft:15, marginRight:-15, paddingRight:10, paddingBottom:2 }}>
              {homeModules.map((m,i)=>(
                <div key={i} style={{ flexShrink:0, width:118, borderRadius:12, overflow:"hidden", background:"white", border:"1px solid #efefef", boxShadow:"0 2px 8px rgba(0,0,0,.07)", cursor:"pointer" }}>
                  <div style={{ height:70, overflow:"hidden" }}><img src={m.img} alt={m.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} /></div>
                  <div style={{ padding:"6px 8px 8px" }}>
                    <div style={{ fontWeight:700, fontSize:10, color:"#111", marginBottom:5, lineHeight:1.3 }}>{m.title}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <Bar value={m.progress} />
                      <span style={{ fontSize:10, color:"#22c55e", fontWeight:700, flexShrink:0 }}>{m.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flexShrink:0, paddingBottom:12 }}><HelpBox desktop={false} /></div>
        </div>
      </div>
      <nav style={{ background:"white", flexShrink:0, borderTop:"1px solid rgba(0,0,0,.07)", boxShadow:"0 -2px 12px rgba(0,0,0,.07)", display:"flex", justifyContent:"space-around", padding:"7px 0 max(8px,env(safe-area-inset-bottom))" }}>
        {tabs.map(({ label, icon }) => {
          const a = tab===label;
          return (
            <button key={label} onClick={()=>setTab(label)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, color: a?"#22c55e":"#9ca3af", padding:"0 8px" }}>
              {icon(a)}
              <span style={{ fontSize:9.5, fontWeight: a?700:500, lineHeight:1 }}>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ════════════════════════ DESKTOP LAYOUT ════════════════════════ */
function DesktopLayout({ tab, setTab, onContinue }: LayoutProps) {
  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100dvh", background:"#071224" }}>
      <div style={{ padding:"28px 56px 52px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
          <div>
            <div style={{ fontWeight:900, fontSize:22, color:"white", letterSpacing:-0.6 }}>Connected<span style={{ color:"#22c55e" }}>.</span></div>
            <div style={{ color:"#22c55e", fontSize:8, fontWeight:700, letterSpacing:"0.22em", marginTop:2 }}>EDUCATION</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <button style={{ background:"none", border:"none", cursor:"pointer", lineHeight:0, padding:0 }}><BellIcon /></button>
            <div style={{ position:"relative" }}>
              <div style={{ width:38, height:38, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,.3)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:12, color:"white", background:"rgba(255,255,255,.1)" }}>SZ</div>
              <div style={{ position:"absolute", bottom:1, right:1, width:9, height:9, borderRadius:"50%", background:"#22c55e", border:"2px solid #071224" }} />
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontWeight:900, fontSize:32, color:"white", letterSpacing:-1, lineHeight:1.15, marginBottom:8 }}>Good morning, Syed Zeeshad 👋</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,.45)", lineHeight:1.5 }}>Keep going! You're one step closer to your dream.</div>
        </div>
      </div>
      <div style={{ flex:1, background:"white", borderRadius:"24px 24px 0 0" }}>
        <div style={{ padding:"36px 56px 48px", display:"flex", flexDirection:"column", gap:32 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1.1fr 0.9fr", gap:28 }}>
            <div>
              <SectionHeader title="Continue Learning" />
              <HeroCard height={280} onContinue={onContinue} />
            </div>
            <div style={{ display:"flex", flexDirection:"column" }}>
              <SectionHeader title="Your Modules" action="View All" />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, flex:1 }}>
                {homeModules.map((m,i)=>(
                  <div key={i} style={{ background:"white", borderRadius:14, overflow:"hidden", border:"1px solid #f0f0f0", boxShadow:"0 2px 10px rgba(0,0,0,.05)", display:"flex", alignItems:"center", cursor:"pointer" }}>
                    <div style={{ width:82, height:74, flexShrink:0, overflow:"hidden" }}><img src={m.img} alt={m.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} /></div>
                    <div style={{ padding:"10px 14px", flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:11, color:"#111", marginBottom:7, lineHeight:1.35 }}>{m.title}</div>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <Bar value={m.progress} />
                        <span style={{ fontSize:10, color:"#22c55e", fontWeight:700, flexShrink:0 }}>{m.progress}%</span>
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
      {/* <nav style={{ background:"white", borderTop:"1px solid rgba(0,0,0,.06)", display:"flex", justifyContent:"flex-start", padding:"12px 56px", gap:6 }}>
        {tabs.map(({ label, icon }) => {
          const a = tab===label;
          return (
            <button key={label} onClick={()=>setTab(label)} style={{ background: a?"#f0fdf4":"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:7, color: a?"#22c55e":"#9ca3af", padding:"9px 20px", borderRadius:10, fontSize:12.5, fontWeight: a?700:500 }}
              onMouseEnter={e=>{ if(!a)(e.currentTarget as HTMLButtonElement).style.background="#f9fafb"; }}
              onMouseLeave={e=>{ if(!a)(e.currentTarget as HTMLButtonElement).style.background="none"; }}
            >
              {icon(a)}<span>{label}</span>
            </button>
          );
        })}
      </nav> */}
    </div>
  );
}