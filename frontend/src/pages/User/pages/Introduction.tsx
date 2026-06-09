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

import { GlobalStyles, LearningCategory, LearningLesson, LearningModule, Page } from "./shared";
import HomePage           from "./HomePage";
import WelcomePage        from "./WelcomePage";
import CourseOverviewPage from "./CourseOverviewPage";
import ModuleLessonsPage  from "./ModuleLessonsPage";
import LessonDetailPage   from "./LessonDetailPage";

export default function Introduction() {
  const [page, setPage]       = useState<Page>("home");
  const [tab,  setTab]        = useState("Home");
  const [selectedCategory, setSelectedCategory] = useState<LearningCategory | null>(null);
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LearningLesson | null>(null);
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
          category ={selectedCategory}
        />
      ) : page === "course" ? (
        <CourseOverviewPage
          onBack        ={() => setPage("welcome")}
          onModuleClick ={(module) => {
            setSelectedModule(module);
            setPage("module");
          }}
          isDesktop     ={isDesktop}
          category      ={selectedCategory}
        />
      ) : page === "module" ? (
        <ModuleLessonsPage
          onBack        ={() => setPage("course")}
          onLessonClick ={(lesson) => {
            setSelectedLesson(lesson);
            setPage("lesson");
          }}
          isDesktop     ={isDesktop}
          module        ={selectedModule}
        />
      ) : page === "lesson" ? (
        <LessonDetailPage
          onBack   ={() => setPage("module")}
          isDesktop={isDesktop}
          lesson   ={selectedLesson}
        />
      ) : (
        /* page === "home" */
        <HomePage
          tab       ={tab}
          setTab    ={setTab}
          onContinue={(category) => {
            if (!category) return;
            setSelectedCategory(category);
            setSelectedModule(null);
            setSelectedLesson(null);
            setPage("welcome");
          }}
        />
      )}
    </>
  );
}
