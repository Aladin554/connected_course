import { useEffect, useMemo, useState } from "react";
import {
  Edit, Plus, Save, Trash2, X, BookOpen, PlayCircle,
  ChevronRight, CheckCircle2, Layers, Video, Paperclip, ExternalLink,
} from "lucide-react";
import api from "../../api/axios";
import { LearningCategory, LearningLesson, LearningModule, formatLessonDuration } from "../User/pages/shared";
import RichTextEditor from "../../components/form/RichTextEditor";

type LessonSectionForm = {
  id?: number;
  step_number: number;
  title: string;
  description: string;
  file_path?: string | null;
  file_name?: string | null;
  uploading?: boolean;
};

const storageUrl = (path: string) =>
  path.startsWith("http") ? path : `/api/storage/${path}`;

const parseLessonSection = (item: any): LessonSectionForm => {
  try {
    const parsed = JSON.parse(item.content);
    return {
      id: item.id,
      step_number: item.step_number,
      title: parsed?.title || "",
      description: parsed?.description || "",
      file_path: item.file_path || null,
      file_name: item.file_name || null,
    };
  } catch {
    return {
      id: item.id,
      step_number: item.step_number,
      title: "",
      description: item.content || "",
      file_path: item.file_path || null,
      file_name: item.file_name || null,
    };
  }
};

const blankModule = {
  title: "",
  description: "",
  warning: "",
  icon_emoji: "",
  is_active: true,
};

const blankLesson = {
  title: "",
  warning: "",
  duration_mins: 0,
  duration_unit: "minutes" as "minutes" | "seconds",
  video_type: "youtube" as LearningLesson["video_type"],
  video_value: "",
  is_active: true,
  strategies: [{ step_number: 1, title: "", description: "" }] as LessonSectionForm[],
};

type ActivePanel = "module-form" | "lesson-form" | null;

export default function LearningContent() {
  const [categories, setCategories] = useState<LearningCategory[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [moduleId, setModuleId] = useState("");
  const [lessons, setLessons] = useState<LearningLesson[]>([]);

  const [moduleForm, setModuleForm] = useState(blankModule);
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);

  const [lessonForm, setLessonForm] = useState(blankLesson);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  // Mobile: which column is visible ("modules" | "lessons")
  const [mobileView, setMobileView] = useState<"modules" | "lessons">("modules");

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === Number(categoryId)),
    [categories, categoryId]
  );
  const selectedModule = useMemo(
    () => modules.find((m) => m.id === Number(moduleId)),
    [modules, moduleId]
  );

  useEffect(() => {
    api.get("/categories/active").then((res) => {
      const data = Array.isArray(res.data) ? res.data : [];
      setCategories(data);
      if (data[0]) setCategoryId(String(data[0].id));
    });
  }, []);

  useEffect(() => {
    if (!categoryId) return;
    loadModules();
  }, [categoryId]);

  useEffect(() => {
    if (!moduleId) { setLessons([]); return; }
    loadLessons();
  }, [moduleId]);

  const loadModules = async () => {
    try {
      const res = await api.get(`/categories/${categoryId}/modules`);
      const data = Array.isArray(res.data) ? res.data : [];
      setModules(data);
      setModuleId(data[0] ? String(data[0].id) : "");
      resetModuleForm();
    } catch {
      setModules([]);
      setModuleId("");
      resetModuleForm();
    }
  };

  const loadLessons = async () => {
    try {
      const res = await api.get(`/modules/${moduleId}/lessons`);
      setLessons(Array.isArray(res.data) ? res.data : []);
      resetLessonForm();
    } catch {
      setLessons([]);
      resetLessonForm();
    }
  };

  const resetModuleForm = () => { setEditingModuleId(null); setModuleForm(blankModule); };
  const resetLessonForm = () => { setEditingLessonId(null); setLessonForm(blankLesson); };

  const openNewModulePanel = () => { resetModuleForm(); setActivePanel("module-form"); };
  const openNewLessonPanel = () => { resetLessonForm(); setActivePanel("lesson-form"); };
  const closePanel = () => { setActivePanel(null); resetModuleForm(); resetLessonForm(); };

  const saveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleForm.title.trim()) return;
    setIsSaving(true);
    const payload = { ...moduleForm, title: moduleForm.title.trim(), is_active: moduleForm.is_active ? 1 : 0 };
    if (editingModuleId) {
      await api.put(`/modules/${editingModuleId}`, payload);
    } else {
      await api.post(`/categories/${categoryId}/modules`, payload);
    }
    await loadModules();
    setIsSaving(false);
    setActivePanel(null);
  };

  const saveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title.trim()) return;
    setIsSaving(true);
    const payload = {
      title: lessonForm.title.trim(),
      warning: lessonForm.warning.trim(),
      duration_mins: Number(lessonForm.duration_mins),
      duration_unit: lessonForm.duration_unit,
      video_type: "youtube",
      video_value: lessonForm.video_value.trim(),
      is_active: lessonForm.is_active ? 1 : 0,
      strategies: lessonForm.strategies
        .filter(s => s.title.trim() || s.description.trim() || s.file_path)
        .map((s, i) => ({
          id: s.id,
          step_number: i + 1,
          content: JSON.stringify({ title: s.title.trim(), description: s.description.trim() }),
          file_path: s.file_path || null,
          file_name: s.file_name || null,
        })),
    };
    if (editingLessonId) {
      await api.put(`/lessons/${editingLessonId}`, payload);
    } else {
      await api.post(`/modules/${moduleId}/lessons`, payload);
    }
    await loadLessons();
    setIsSaving(false);
    setActivePanel(null);
  };

  const editModule = (module: LearningModule) => {
    setEditingModuleId(module.id);
    setModuleForm({
      title: module.title || "",
      description: module.description || "",
      warning: module.warning || "",
      icon_emoji: module.icon_emoji || "",
      is_active: Boolean(module.is_active),
    });
    setActivePanel("module-form");
  };

  const editLesson = (lesson: LearningLesson) => {
    setEditingLessonId(lesson.id);
    setLessonForm({
      title: lesson.title || "",
      warning: lesson.warning || "",
      duration_mins: lesson.duration_mins || 0,
      duration_unit: lesson.duration_unit === "seconds" ? "seconds" : "minutes",
      video_value: lesson.video_value || "",
      is_active: Boolean(lesson.is_active),
      video_type: "youtube",
      strategies: lesson.strategies?.length
        ? lesson.strategies.map(parseLessonSection)
        : [{ step_number: 1, title: "", description: "" }],
    });
    setActivePanel("lesson-form");
  };

  const deleteModule = async (module: LearningModule) => {
    if (!confirm(`Delete module "${module.title}"?`)) return;
    await api.delete(`/modules/${module.id}`);
    await loadModules();
  };

  const deleteLesson = async (lesson: LearningLesson) => {
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
    await api.delete(`/lessons/${lesson.id}`);
    await loadLessons();
  };

  const updateStrategy = (index: number, patch: Partial<LessonSectionForm>) => {
    setLessonForm(prev => ({
      ...prev,
      strategies: prev.strategies.map((item, i) => i === index ? { ...item, ...patch } : item),
    }));
  };

  const addStrategy = () => {
    setLessonForm(prev => ({
      ...prev,
      strategies: [...prev.strategies, { step_number: prev.strategies.length + 1, title: "", description: "" }],
    }));
  };

  const removeStrategy = (index: number) => {
    setLessonForm(prev => ({ ...prev, strategies: prev.strategies.filter((_, i) => i !== index) }));
  };

  const uploadStrategyFile = async (index: number, file: File) => {
    updateStrategy(index, { uploading: true });
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/strategy-files", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateStrategy(index, {
        file_path: res.data.file_path,
        file_name: res.data.file_name,
        uploading: false,
      });
    } catch {
      updateStrategy(index, { uploading: false });
      alert("Failed to upload file.");
    }
  };

  const removeStrategyFile = (index: number) => {
    updateStrategy(index, { file_path: null, file_name: null });
  };

  // ─── Breadcrumb Step Indicator ─────────────────────────────────────────────
  const StepIndicator = () => (
    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium flex-wrap">
      <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${categoryId ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
        <BookOpen size={12} />
        <span>Course</span>
        {categoryId && <CheckCircle2 size={12} className="text-blue-600" />}
      </div>
      <ChevronRight size={14} className="text-gray-400" />
      <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${moduleId ? "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
        <Layers size={12} />
        <span>Module</span>
        {moduleId && <CheckCircle2 size={12} className="text-violet-600" />}
      </div>
      <ChevronRight size={14} className="text-gray-400" />
      <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${moduleId ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
        <Video size={12} />
        <span>Lesson</span>
      </div>
    </div>
  );

  // ─── Shared input class ────────────────────────────────────────────────────
  const inputClass =
    "w-full rounded-xl sm:rounded-2xl border-2 border-gray-200 dark:border-gray-700 px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none transition";

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-950 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">

        {/* ── Top Header ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 flex-shrink-0" />
              Learning Content
            </h1>
            <StepIndicator />
          </div>

          {/* Course Select */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2">
                Step 1 — Select Course
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl sm:rounded-2xl border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.title}</option>
                ))}
              </select>
            </div>
            {selectedCategory?.description && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                {selectedCategory.description}
              </p>
            )}
          </div>
        </div>

        {/* ── Mobile Tab Switcher (< lg) ── */}
        <div className="lg:hidden flex rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <button
            onClick={() => setMobileView("modules")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition
              ${mobileView === "modules"
                ? "bg-violet-600 text-white"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
          >
            <Layers size={15} />
            Modules
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${mobileView === "modules" ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
              {modules.length}
            </span>
          </button>
          <button
            onClick={() => setMobileView("lessons")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition
              ${mobileView === "lessons"
                ? "bg-emerald-600 text-white"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
          >
            <PlayCircle size={15} />
            Lessons
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${mobileView === "lessons" ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
              {lessons.length}
            </span>
          </button>
        </div>

        {/* ── Main Two-Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

          {/* ════ MODULES COLUMN ════ */}
          <div className={`bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden
            ${mobileView !== "modules" ? "hidden lg:flex" : "flex"}`}>
            {/* Header */}
            <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 bg-violet-600 dark:bg-violet-700 flex flex-col gap-3 sm:gap-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-200">Step 2</p>
                <span className="text-xs text-violet-300 font-medium">
                  {modules.length} module{modules.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Layers size={18} /> Modules
                </h2>
                <button
                  onClick={openNewModulePanel}
                  className="flex items-center gap-1.5 sm:gap-2 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex-shrink-0"
                >
                  <Plus size={14} /> New Module
                </button>
              </div>
            </div>

            {/* Helper hint */}
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-violet-50 dark:bg-violet-950/40 border-b border-violet-100 dark:border-violet-900 text-xs text-violet-700 dark:text-violet-300 flex items-center gap-2">
              <span>👆</span>
              <span className="hidden sm:inline">Click a module below to see its lessons in Step 3</span>
              <span className="sm:hidden">Tap a module to load its lessons</span>
            </div>

            {/* Module List */}
            <div className="flex-1 overflow-auto divide-y divide-gray-100 dark:divide-gray-800">
              {modules.length === 0 ? (
                <div className="py-12 sm:py-16 text-center px-4">
                  <Layers className="w-9 h-9 sm:w-10 sm:h-10 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                  <p className="text-gray-400 font-medium text-sm">No modules yet</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">Click "New Module" to get started</p>
                </div>
              ) : (
                modules.map((module, idx) => {
                  const isSelected = String(module.id) === moduleId;
                  return (
                    <div
                      key={module.id}
                      onClick={() => {
                        setModuleId(String(module.id));
                        setMobileView("lessons"); // auto-switch on mobile
                      }}
                      className={`px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between cursor-pointer transition group
                        ${isSelected
                          ? "bg-violet-50 dark:bg-violet-950/40 border-l-4 border-violet-500"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent"
                        }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <span className="text-xl sm:text-2xl flex-shrink-0">{module.icon_emoji || "📚"}</span>
                        <div className="min-w-0">
                          <div className={`font-semibold text-sm sm:text-base truncate ${isSelected ? "text-violet-700 dark:text-violet-300" : "text-gray-800 dark:text-gray-200"}`}>
                            {module.title || `Module ${idx + 1}`}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {module.all_lessons_count ?? module.lessons_count ?? 0} lessons
                            {!module.is_active && (
                              <span className="ml-2 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500">
                                inactive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Actions — always visible on mobile, hover on desktop */}
                      <div className={`flex gap-0.5 sm:gap-1 flex-shrink-0 transition
                        ${isSelected ? "opacity-100" : "opacity-100 lg:opacity-0 lg:group-hover:opacity-100"}`}>
                        <button
                          onClick={(e) => { e.stopPropagation(); editModule(module); }}
                          className="p-2 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-xl transition"
                          title="Edit module"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteModule(module); }}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition"
                          title="Delete module"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ════ LESSONS COLUMN ════ */}
          <div className={`bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden
            ${mobileView !== "lessons" ? "hidden lg:flex" : "flex"}`}>
            {/* Header */}
            <div className={`px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 flex flex-col gap-3 sm:gap-4 transition-colors ${selectedModule ? "bg-emerald-600 dark:bg-emerald-700" : "bg-gray-400 dark:bg-gray-600"}`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Step 3</p>
                <span className="text-xs text-white/60 font-medium">
                  {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 min-w-0">
                  <PlayCircle size={18} className="flex-shrink-0" />
                  <span className="truncate">
                    {selectedModule ? `Lessons — ${selectedModule.title}` : "Lessons"}
                  </span>
                </h2>
                <button
                  onClick={openNewLessonPanel}
                  disabled={!selectedModule}
                  className="flex items-center gap-1.5 sm:gap-2 bg-white/20 hover:bg-white/30 active:bg-white/40 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex-shrink-0"
                >
                  <Plus size={14} /> New Lesson
                </button>
              </div>
            </div>

            {/* Helper hint */}
            {!selectedModule ? (
              <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 flex items-center gap-2">
                <span>👈</span>
                <span className="hidden sm:inline">Select a module first to manage its lessons</span>
                <span className="sm:hidden">Go to Modules tab and pick one first</span>
              </div>
            ) : (
              <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <span>✅</span>
                Managing lessons inside <strong className="truncate">{selectedModule.title}</strong>
              </div>
            )}

            {/* Lesson List */}
            <div className="flex-1 overflow-auto divide-y divide-gray-100 dark:divide-gray-800">
              {!selectedModule ? (
                <div className="py-12 sm:py-16 text-center px-4">
                  <PlayCircle className="w-9 h-9 sm:w-10 sm:h-10 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                  <p className="text-gray-400 font-medium text-sm">No module selected</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    <span className="hidden sm:inline">Pick a module on the left to view lessons</span>
                    <span className="sm:hidden">Switch to the Modules tab to pick one</span>
                  </p>
                </div>
              ) : lessons.length === 0 ? (
                <div className="py-12 sm:py-16 text-center px-4">
                  <PlayCircle className="w-9 h-9 sm:w-10 sm:h-10 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                  <p className="text-gray-400 font-medium text-sm">No lessons yet</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">Click "New Lesson" to add one</p>
                </div>
              ) : (
                lessons.map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    className="px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 group transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-300 font-semibold text-xs sm:text-sm flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">{lesson.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {formatLessonDuration(lesson.duration_mins, lesson.duration_unit === "seconds" ? "seconds" : "minutes")}
                          {!lesson.is_active && (
                            <span className="ml-2 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500">
                              inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Actions — always visible on mobile */}
                    <div className="flex gap-0.5 sm:gap-1 flex-shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition">
                      <button
                        onClick={() => editLesson(lesson)}
                        className="p-2 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-xl transition"
                        title="Edit lesson"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => deleteLesson(lesson)}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition"
                        title="Delete lesson"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* SLIDE-OVER PANEL — MODULE FORM                                         */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activePanel === "module-form" && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closePanel} />
          {/* Full-width on mobile, max-w-lg on sm+ */}
          <div className="relative w-full sm:max-w-lg bg-white dark:bg-gray-900 h-full overflow-auto shadow-2xl flex flex-col">
            {/* Panel Header */}
            <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 bg-violet-600 dark:bg-violet-700 sticky top-0 z-10">
              <div className="flex items-start justify-between gap-4 mb-2 sm:mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-200 mt-1">
                  {editingModuleId ? "Editing Module" : "New Module"}
                </p>
                <button
                  onClick={closePanel}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition flex-shrink-0 -mt-1 -mr-1"
                >
                  <X size={20} />
                </button>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Layers size={20} />
                {editingModuleId ? moduleForm.title || "Module" : "Create Module"}
              </h3>
            </div>

            {/* Context Breadcrumb */}
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-violet-50 dark:bg-violet-950/40 border-b border-violet-100 dark:border-violet-900 text-xs text-violet-600 dark:text-violet-400 flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <BookOpen size={12} />
              <span className="font-medium truncate max-w-[120px]">{selectedCategory?.title}</span>
              <ChevronRight size={12} />
              <span>{editingModuleId ? "Editing module" : "Adding new module"}</span>
            </div>

            <form onSubmit={saveModule} className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                  Module Title <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  className={`${inputClass} focus:ring-2 focus:ring-violet-500 focus:border-violet-400`}
                  placeholder="e.g. Pawn Structures"
                />
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <RichTextEditor
                  value={moduleForm.description}
                  onChange={(desc) => setModuleForm({ ...moduleForm, description: desc })}
                  height={160}
                />
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                  Warning / Note
                </label>
                <textarea
                  rows={3}
                  value={moduleForm.warning}
                  onChange={(e) => setModuleForm({ ...moduleForm, warning: e.target.value })}
                  className={`${inputClass} resize-none focus:ring-2 focus:ring-violet-500`}
                  placeholder="Any important warnings or notes..."
                />
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer select-none pb-2.5 sm:pb-3">
                    <input
                      type="checkbox"
                      checked={moduleForm.is_active}
                      onChange={(e) => setModuleForm({ ...moduleForm, is_active: e.target.checked })}
                      className="w-4 h-4 rounded accent-violet-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                  </label>
                </div>
              </div>

              {/* Sticky Save */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-900 pt-3 sm:pt-4 pb-2 -mx-4 sm:-mx-6 px-4 sm:px-6 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-70 transition shadow-lg shadow-violet-200 dark:shadow-none text-sm sm:text-base"
                >
                  <Save size={18} />
                  {isSaving ? "Saving…" : editingModuleId ? "Update Module" : "Create Module"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* SLIDE-OVER PANEL — LESSON FORM                                         */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activePanel === "lesson-form" && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closePanel} />
          <div className="relative w-full sm:max-w-2xl bg-white dark:bg-gray-900 h-full overflow-auto shadow-2xl flex flex-col">
            {/* Panel Header */}
            <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 bg-emerald-600 dark:bg-emerald-700 sticky top-0 z-10">
              <div className="flex items-start justify-between gap-4 mb-2 sm:mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200 mt-1">
                  {editingLessonId ? "Editing Lesson" : "New Lesson"}
                </p>
                <button
                  onClick={closePanel}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition flex-shrink-0 -mt-1 -mr-1"
                >
                  <X size={20} />
                </button>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <PlayCircle size={20} />
                {editingLessonId ? lessonForm.title || "Lesson" : "Create Lesson"}
              </h3>
            </div>

            {/* Context Breadcrumb */}
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 flex-wrap">
              <BookOpen size={12} />
              <span className="font-medium truncate max-w-[80px]">{selectedCategory?.title}</span>
              <ChevronRight size={12} />
              <Layers size={12} />
              <span className="font-medium truncate max-w-[80px]">{selectedModule?.title}</span>
              <ChevronRight size={12} />
              <span>{editingLessonId ? "Editing" : "New lesson"}</span>
            </div>

            <form onSubmit={saveLesson} className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                  Lesson Title <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className={`${inputClass} focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400`}
                  placeholder="e.g. Italian Game: Main Line"
                />
              </div>

              {/* Duration + Video — stacked on mobile, side-by-side on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                    Duration
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      value={lessonForm.duration_mins}
                      onChange={(e) => setLessonForm({ ...lessonForm, duration_mins: Number(e.target.value) })}
                      className={`${inputClass} focus:ring-2 focus:ring-emerald-500 flex-1`}
                    />
                    <select
                      value={lessonForm.duration_unit}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          duration_unit: e.target.value === "seconds" ? "seconds" : "minutes",
                        })
                      }
                      className={`${inputClass} focus:ring-2 focus:ring-emerald-500 w-28 sm:w-32`}
                    >
                      <option value="minutes">Minutes</option>
                      <option value="seconds">Seconds</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                    YouTube Video ID / URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={lessonForm.video_value}
                    onChange={(e) => setLessonForm({ ...lessonForm, video_value: e.target.value })}
                    className={`${inputClass} focus:ring-2 focus:ring-emerald-500`}
                    placeholder="dQw4w9WgXcQ"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                  Warning / Prerequisites
                </label>
                <textarea
                  rows={2}
                  value={lessonForm.warning}
                  onChange={(e) => setLessonForm({ ...lessonForm, warning: e.target.value })}
                  className={`${inputClass} resize-none focus:ring-2 focus:ring-emerald-500`}
                  placeholder="Any warnings or prerequisites..."
                />
              </div>

              {/* Strategies */}
              <div>
                <div className="flex justify-between items-center mb-2.5 sm:mb-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Strategies / Steps
                  </label>
                  <button
                    type="button"
                    onClick={addStrategy}
                    className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                  >
                    <Plus size={14} /> Add Step
                  </button>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {lessonForm.strategies.map((strategy, index) => (
                    <div
                      key={index}
                      className="border-2 border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-gray-50 dark:bg-gray-950 relative"
                    >
                      <button
                        type="button"
                        onClick={() => removeStrategy(index)}
                        className="absolute top-2.5 right-2.5 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                      >
                        <X size={15} />
                      </button>
                      <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Step {index + 1}
                        </span>
                      </div>
                      <input
                        placeholder="Step title..."
                        value={strategy.title}
                        onChange={(e) => updateStrategy(index, { title: e.target.value })}
                        className="w-full mb-2.5 sm:mb-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 px-3.5 py-2 sm:py-2.5 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition text-sm"
                      />
                      <RichTextEditor
                        value={strategy.description}
                        onChange={(desc) => updateStrategy(index, { description: desc })}
                        height={130}
                      />
                      <div className="mt-3">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                          File Attachment
                        </label>
                        {strategy.file_path ? (
                          <div className="flex items-center justify-between gap-2 p-3 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
                            <a
                              href={storageUrl(strategy.file_path)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:underline min-w-0"
                            >
                              <Paperclip size={14} className="flex-shrink-0" />
                              <span className="truncate">{strategy.file_name || "Uploaded file"}</span>
                              <ExternalLink size={12} className="flex-shrink-0" />
                            </a>
                            <button
                              type="button"
                              onClick={() => removeStrategyFile(index)}
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition flex-shrink-0"
                              aria-label="Remove file"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              disabled={strategy.uploading}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadStrategyFile(index, file);
                                e.target.value = "";
                              }}
                            />
                            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:border-emerald-400 transition">
                              <Paperclip size={14} />
                              {strategy.uploading ? "Uploading..." : "Upload file"}
                            </span>
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={lessonForm.is_active}
                  onChange={(e) => setLessonForm({ ...lessonForm, is_active: e.target.checked })}
                  className="w-4 h-4 rounded accent-emerald-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Lesson</span>
              </label>

              {/* Sticky Save */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-900 pt-3 sm:pt-4 pb-2 -mx-4 sm:-mx-6 px-4 sm:px-6 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-70 transition shadow-lg shadow-emerald-200 dark:shadow-none text-sm sm:text-base"
                >
                  <Save size={18} />
                  {isSaving ? "Saving…" : editingLessonId ? "Update Lesson" : "Create Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}