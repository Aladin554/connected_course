// src/pages/User/pages/Introduction.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Root entry point for the user learning flow.
// Drop this into your App.tsx route:
//   <Route path="/introduction" element={<ProtectedRoute allowedRoles={[2,3]} requireActivePanel={true}><Introduction /></ProtectedRoute>} />
//
// Internal page flow:
//   home ──onContinue──► welcome ──onFinish──► course ──onModuleClick──► module ──onLessonClick──► lesson
//   Each page has an onBack that reverses the step.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";

import { GlobalStyles, Page } from "./shared";
import HomePage           from "./HomePage";
import WelcomePage        from "./WelcomePage";
import CourseOverviewPage from "./CourseOverviewPage";
import ModuleLessonsPage  from "./ModuleLessonsPage";
import LessonDetailPage   from "./LessonDetailPage";

export default function Introduction() {
  const [page, setPage]       = useState<Page>("home");
  const [tab,  setTab]        = useState("Home");
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : false
  );

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <GlobalStyles />

      {page === "welcome" ? (
        <WelcomePage
          onBack   ={() => setPage("home")}
          onFinish ={() => setPage("course")}
          isDesktop={isDesktop}
        />
      ) : page === "course" ? (
        <CourseOverviewPage
          onBack        ={() => setPage("welcome")}
          onModuleClick ={() => setPage("module")}
          isDesktop     ={isDesktop}
        />
      ) : page === "module" ? (
        <ModuleLessonsPage
          onBack        ={() => setPage("course")}
          onLessonClick ={() => setPage("lesson")}
          isDesktop     ={isDesktop}
        />
      ) : page === "lesson" ? (
        <LessonDetailPage
          onBack   ={() => setPage("module")}
          isDesktop={isDesktop}
        />
      ) : (
        /* page === "home" */
        <HomePage
          tab       ={tab}
          setTab    ={setTab}
          onContinue={() => setPage("welcome")}
        />
      )}
    </>
  );
}