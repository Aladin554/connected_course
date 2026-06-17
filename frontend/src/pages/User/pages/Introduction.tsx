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
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../api/axios";

import { completeLearningLesson, GlobalStyles, LearningCategory, LearningLesson, LearningModule, LessonNextAction, loadLearningProgress, Page } from "./shared";
import HomePage           from "./HomePage";
import WelcomePage        from "./WelcomePage";
import CourseOverviewPage from "./CourseOverviewPage";
import ModuleLessonsPage  from "./ModuleLessonsPage";
import LessonDetailPage   from "./LessonDetailPage";

const resolveLessonNextAction = (
  lessonIndex: number,
  totalLessons: number,
  moduleIndex: number,
  totalModules: number,
): LessonNextAction => {
  if (lessonIndex < totalLessons - 1) return "next-lesson";
  if (moduleIndex < totalModules - 1) return "next-module";
  return "complete-course";
};

export default function Introduction() {
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage]       = useState<Page>("home");
  const [tab,  setTab]        = useState("Home");
  const [selectedCategory, setSelectedCategory] = useState<LearningCategory | null>(null);
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [selectedModuleNumber, setSelectedModuleNumber] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LearningLesson | null>(null);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>(0);
  const [totalLessonsInModule, setTotalLessonsInModule] = useState<number>(0);
  const [lessonNextAction, setLessonNextAction] = useState<LessonNextAction>("next-lesson");
  const [lessonAdvancing, setLessonAdvancing] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : false
  );

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const goHome = () => {
      if (cancelled) return;
      setSelectedCategory(null);
      setSelectedModule(null);
      setSelectedModuleNumber(null);
      setSelectedLesson(null);
      setSelectedLessonIndex(0);
      setTotalLessonsInModule(0);
      setLessonNextAction("next-lesson");
      setPage("home");
      setRouteLoading(false);
    };

    const loadRoute = async () => {
      const segments = location.pathname
        .replace(/^\/introduction\/?/, "")
        .split("/")
        .filter(Boolean);

      if (segments.length === 0) {
        goHome();
        return;
      }

      const categoryId = Number(segments[1]);
      const routeKind = segments[2];
      const moduleId = Number(segments[3]);
      const lessonId = Number(segments[5]);

      if (segments[0] !== "category" || !categoryId) {
        navigate("/introduction", { replace: true });
        return;
      }

      setRouteLoading(true);

      try {
        const categoriesRes = await api.get("/my-categories");
        if (cancelled) return;
        const categories = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
        const category = categories.find((item: LearningCategory) => item.id === categoryId);

        if (!category) {
          navigate("/introduction", { replace: true });
          return;
        }

        setSelectedCategory(category);
        setSelectedModule(null);
        setSelectedModuleNumber(null);
        setSelectedLesson(null);
        setSelectedLessonIndex(0);
        setTotalLessonsInModule(0);
        setLessonNextAction("next-lesson");
        if (routeKind === "welcome") {
          setPage("welcome");
          return;
        }

        if (routeKind === "course") {
          setPage("course");
          return;
        }

        if (routeKind !== "module" || !moduleId) {
          navigate(`/introduction/category/${category.id}/welcome`, { replace: true });
          return;
        }

        const modulesRes = await api.get(`/categories/${category.id}/modules`);
        if (cancelled) return;
        const modules = Array.isArray(modulesRes.data) ? modulesRes.data : [];
        const module = modules.find((item: LearningModule) => item.id === moduleId);
        const moduleIndex = modules.findIndex((item: LearningModule) => item.id === moduleId);
        const completedLessonIds = await loadLearningProgress(category.id);

        if (!module) {
          navigate(`/introduction/category/${category.id}/course`, { replace: true });
          return;
        }

        const moduleLessonPairs = await Promise.all(
          modules.slice(0, Math.max(moduleIndex, 0)).map(async (item: LearningModule) => {
            const lessonsRes = await api.get(`/modules/${item.id}/lessons`);
            return Array.isArray(lessonsRes.data) ? lessonsRes.data : [];
          })
        );
        const moduleUnlocked = moduleIndex === 0 || moduleLessonPairs.every((lessons: LearningLesson[]) =>
          lessons.length > 0 && lessons.every((item) => completedLessonIds.includes(item.id))
        );

        if (!moduleUnlocked) {
          navigate(`/introduction/category/${category.id}/course`, { replace: true });
          return;
        }

        setSelectedModule(module);
        setSelectedModuleNumber(moduleIndex >= 0 ? moduleIndex + 1 : null);

        if (!segments[4]) {
          setPage("module");
          return;
        }

        if (segments[4] !== "lesson" || !lessonId) {
          navigate(`/introduction/category/${category.id}/module/${module.id}`, { replace: true });
          return;
        }

        const lessonsRes = await api.get(`/modules/${module.id}/lessons`);
        if (cancelled) return;
        const lessons = Array.isArray(lessonsRes.data) ? lessonsRes.data : [];
        const lesson = lessons.find((item: LearningLesson) => item.id === lessonId);
        const lessonIndex = lessons.findIndex((item: LearningLesson) => item.id === lessonId);

        if (!lesson) {
          navigate(`/introduction/category/${category.id}/module/${module.id}`, { replace: true });
          return;
        }

        const lessonUnlocked = lessonIndex === 0 || lessons.slice(0, lessonIndex).every((item: LearningLesson) => completedLessonIds.includes(item.id));

        if (!lessonUnlocked) {
          navigate(`/introduction/category/${category.id}/module/${module.id}`, { replace: true });
          return;
        }

        setSelectedLesson(lesson);
        setSelectedLessonIndex(lessonIndex);
        setTotalLessonsInModule(lessons.length);
        setLessonNextAction(resolveLessonNextAction(
          lessonIndex,
          lessons.length,
          moduleIndex >= 0 ? moduleIndex : 0,
          modules.length,
        ));
        setPage("lesson");
      } catch {
        if (!cancelled) navigate("/introduction", { replace: true });
      } finally {
        if (!cancelled) setRouteLoading(false);
      }
    };

    loadRoute();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate]);

  const showHome = () => navigate("/introduction");
  const showWelcome = (category: LearningCategory) => navigate(`/introduction/category/${category.id}/welcome`);
  const showCourse = (category = selectedCategory) => {
    if (category) navigate(`/introduction/category/${category.id}/course`);
  };
  const showModule = (module: LearningModule, category = selectedCategory) => {
    if (category) navigate(`/introduction/category/${category.id}/module/${module.id}`);
  };
  const showLesson = (lesson: LearningLesson, module = selectedModule, category = selectedCategory) => {
    if (category && module) navigate(`/introduction/category/${category.id}/module/${module.id}/lesson/${lesson.id}`);
  };

  const handleLessonNext = async () => {
    if (!selectedCategory || !selectedModule || !selectedLesson || lessonAdvancing) return;

    setLessonAdvancing(true);
    try {
      await completeLearningLesson(selectedCategory.id, selectedLesson.id);

      if (lessonNextAction === "complete-course") {
        return;
      }

      if (lessonNextAction === "next-module") {
        showCourse(selectedCategory);
        return;
      }

      const lessonsRes = await api.get(`/modules/${selectedModule.id}/lessons`);
      const lessons: LearningLesson[] = Array.isArray(lessonsRes.data) ? lessonsRes.data : [];
      const lessonIndex = lessons.findIndex((item) => item.id === selectedLesson.id);

      if (lessonIndex >= 0 && lessonIndex < lessons.length - 1) {
        showLesson(lessons[lessonIndex + 1], selectedModule, selectedCategory);
      }
    } finally {
      setLessonAdvancing(false);
    }
  };

  if (routeLoading) {
    return (
      <>
        <GlobalStyles />
        <div style={{ display: "flex", minHeight: "100dvh", alignItems: "center", justifyContent: "center", background: "#071224", color: "white", fontWeight: 800 }}>
          Loading...
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalStyles />

      {page === "welcome" ? (
        <WelcomePage
          onBack   ={showHome}
          onFinish ={() => showCourse()}
          isDesktop={isDesktop}
          category ={selectedCategory}
        />
      ) : page === "course" ? (
        <CourseOverviewPage
          onBack        ={() => selectedCategory ? showWelcome(selectedCategory) : showHome()}
          onHome        ={showHome}
          onModuleClick ={(module) => showModule(module)}
          isDesktop     ={isDesktop}
          category      ={selectedCategory}
        />
      ) : page === "module" ? (
        <ModuleLessonsPage
          onBack        ={() => showCourse()}
          onHome        ={showHome}
          onLessonClick ={(lesson) => showLesson(lesson)}
          isDesktop     ={isDesktop}
          module        ={selectedModule}
          moduleNumber  ={selectedModuleNumber}
          category      ={selectedCategory}
        />
      ) : page === "lesson" ? (
        <LessonDetailPage
          onBack      ={() => selectedModule ? showModule(selectedModule) : showCourse()}
          onHome      ={showHome}
          onNext      ={handleLessonNext}
          onFinishCourse={() => selectedCategory && showCourse(selectedCategory)}
          isDesktop   ={isDesktop}
          lesson      ={selectedLesson}
          lessonIndex ={selectedLessonIndex}
          totalLessons={totalLessonsInModule}
          nextAction  ={lessonNextAction}
          advancing   ={lessonAdvancing}
        />
      ) : (
        /* page === "home" */
        <HomePage
          tab       ={tab}
          setTab    ={setTab}
          onContinue={(category) => {
            if (!category) return;
            showWelcome(category);
          }}
        />
      )}

    </>
  );
}
