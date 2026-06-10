import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Save, Trash2 } from "lucide-react";
import api from "../../api/axios";
import { LearningCategory, LearningLesson, LearningModule } from "../User/pages/shared";

type LessonSectionForm = { id?: number; step_number: number; content?: string; title: string; description: string };
type MistakeForm = { id?: number; content: string };

const blankModule = {
  title: "",
  subtitle: "",
  description: "",
  icon_emoji: "",
  is_active: true,
};

const blankLesson = {
  title: "",
  duration_mins: 0,
  video_type: "youtube" as LearningLesson["video_type"],
  video_value: "",
  is_active: true,
  strategies: [{ step_number: 1, title: "", description: "" }] as LessonSectionForm[],
  model_answer: "",
  common_mistakes: [{ content: "" }] as MistakeForm[],
};

const parseLessonSection = (item: { id?: number; step_number: number; content: string }): LessonSectionForm => {
  try {
    const parsed = JSON.parse(item.content);
    if (parsed && typeof parsed === "object") {
      return {
        id: item.id,
        step_number: item.step_number,
        title: typeof parsed.title === "string" ? parsed.title : "",
        description: typeof parsed.description === "string" ? parsed.description : "",
      };
    }
  } catch {
    // Older lessons stored a single content string; keep it visible while editing.
  }

  return { id: item.id, step_number: item.step_number, title: "", description: item.content || "" };
};

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

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === Number(categoryId)),
    [categories, categoryId]
  );
  const selectedModule = useMemo(
    () => modules.find((module) => module.id === Number(moduleId)),
    [modules, moduleId]
  );
  const autoModuleTitle = useMemo(() => {
    const editingIndex = editingModuleId
      ? modules.findIndex((module) => module.id === editingModuleId)
      : -1;
    const moduleNumber = editingIndex >= 0 ? editingIndex + 1 : modules.length + 1;

    return `Module ${moduleNumber}`;
  }, [editingModuleId, modules]);

  useEffect(() => {
    api.get("/categories/active")
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        setCategories(rows);
        if (rows[0]) setCategoryId(String(rows[0].id));
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!categoryId) return;
    loadModules();
  }, [categoryId]);

  useEffect(() => {
    if (!moduleId) {
      setLessons([]);
      return;
    }
    loadLessons();
  }, [moduleId]);

  const loadModules = async () => {
    const res = await api.get(`/categories/${categoryId}/modules`);
    const rows = Array.isArray(res.data) ? res.data : [];
    setModules(rows);
    setModuleId(rows[0] ? String(rows[0].id) : "");
    setEditingModuleId(null);
    setModuleForm(blankModule);
  };

  const loadLessons = async () => {
    const res = await api.get(`/modules/${moduleId}/lessons`);
    setLessons(Array.isArray(res.data) ? res.data : []);
    setEditingLessonId(null);
    setLessonForm(blankLesson);
  };

  const saveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return;

    const payload = {
      ...moduleForm,
      title: autoModuleTitle,
      is_active: moduleForm.is_active ? 1 : 0,
    };

    if (editingModuleId) {
      await api.put(`/modules/${editingModuleId}`, payload);
    } else {
      await api.post(`/categories/${categoryId}/modules`, payload);
    }
    await loadModules();
  };

  const editModule = (module: LearningModule) => {
    setEditingModuleId(module.id);
    setModuleForm({
      title: module.title || "",
      subtitle: module.subtitle || "",
      description: module.description || "",
      icon_emoji: module.icon_emoji || "",
      is_active: Boolean(module.is_active),
    });
  };

  const deleteModule = async (module: LearningModule) => {
    if (!confirm(`Delete module "${module.title}"?`)) return;
    await api.delete(`/modules/${module.id}`);
    await loadModules();
  };

  const saveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleId) return;

    const payload = {
      title: lessonForm.title,
      duration_mins: Number(lessonForm.duration_mins || 0),
      video_type: "youtube",
      video_value: lessonForm.video_value,
      is_active: lessonForm.is_active ? 1 : 0,
      strategies: lessonForm.strategies
        .filter((item) => item.title.trim() || item.description.trim())
        .map((item, index) => ({
          id: item.id,
          step_number: index + 1,
          content: JSON.stringify({
            title: item.title.trim(),
            description: item.description.trim(),
          }),
        })),
      model_answer: "",
      common_mistakes: [],
    };

    if (editingLessonId) {
      await api.put(`/lessons/${editingLessonId}`, payload);
    } else {
      await api.post(`/modules/${moduleId}/lessons`, payload);
    }
    await loadLessons();
  };

  const editLesson = (lesson: LearningLesson) => {
    setEditingLessonId(lesson.id);
    setLessonForm({
      title: lesson.title || "",
      duration_mins: lesson.duration_mins || 0,
      video_type: "youtube",
      video_value: lesson.video_value || "",
      is_active: Boolean(lesson.is_active),
      strategies: lesson.strategies?.length
        ? lesson.strategies.map(parseLessonSection)
        : [{ step_number: 1, title: "", description: "" }],
      model_answer: lesson.lesson_model_answer?.content || "",
      common_mistakes: lesson.common_mistakes?.length
        ? lesson.common_mistakes.map((item) => ({ id: item.id, content: item.content }))
        : [{ content: "" }],
    });
  };

  const deleteLesson = async (lesson: LearningLesson) => {
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
    await api.delete(`/lessons/${lesson.id}`);
    await loadLessons();
  };

  const updateStrategy = (index: number, patch: Partial<LessonSectionForm>) => {
    setLessonForm((current) => ({
      ...current,
      strategies: current.strategies.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }));
  };

  const updateMistake = (index: number, patch: Partial<MistakeForm>) => {
    setLessonForm((current) => ({
      ...current,
      common_mistakes: current.common_mistakes.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h1 className="mb-4 text-2xl font-bold dark:text-gray-100">Learning Content</h1>
        <label className="mb-1 block text-sm font-medium dark:text-gray-300">Courses</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-800 dark:text-gray-100">
          {categories.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}
        </select>
        {selectedCategory && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{selectedCategory.description}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold dark:text-gray-100">Modules</h2>
            <button type="button" onClick={() => { setEditingModuleId(null); setModuleForm(blankModule); }} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white">
              <Plus size={16} /> New
            </button>
          </div>

          <form onSubmit={saveModule} className="space-y-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
              {autoModuleTitle}
            </div>
            <input placeholder="Subtitle" value={moduleForm.subtitle} onChange={(e) => setModuleForm({ ...moduleForm, subtitle: e.target.value })} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-800 dark:text-gray-100" />
            <textarea placeholder="Description" rows={3} value={moduleForm.description} onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-800 dark:text-gray-100" />
            <div>
              <input placeholder="Icon" value={moduleForm.icon_emoji} onChange={(e) => setModuleForm({ ...moduleForm, icon_emoji: e.target.value })} className="rounded-lg border px-3 py-2 dark:bg-gray-800 dark:text-gray-100" />
            </div>
            <label className="inline-flex items-center gap-2 dark:text-gray-300">
              <input type="checkbox" checked={moduleForm.is_active} onChange={(e) => setModuleForm({ ...moduleForm, is_active: e.target.checked })} /> Active
            </label>
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white">
              <Save size={16} /> {editingModuleId ? "Update Module" : "Save Module"}
            </button>
          </form>

          <div className="mt-5 space-y-2">
            {modules.map((module, index) => (
              <div key={module.id} className={`flex items-center justify-between rounded-lg border p-3 dark:border-gray-700 ${String(module.id) === moduleId ? "bg-blue-50 dark:bg-gray-800" : ""}`}>
                <button type="button" onClick={() => setModuleId(String(module.id))} className="text-left">
                  <div className="font-semibold dark:text-gray-100">{module.icon_emoji} Module {index + 1}</div>
                  <div className="text-sm text-gray-500">{module.all_lessons_count ?? module.lessons_count ?? 0} lessons</div>
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => editModule(module)} className="rounded p-2 text-yellow-600 hover:bg-yellow-50"><Edit size={16} /></button>
                  <button type="button" onClick={() => deleteModule(module)} className="rounded p-2 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold dark:text-gray-100">Lessons / Questions</h2>
            <button type="button" onClick={() => { setEditingLessonId(null); setLessonForm(blankLesson); }} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white" disabled={!selectedModule}>
              <Plus size={16} /> New
            </button>
          </div>

          <form onSubmit={saveLesson} className="space-y-3">
            <input required disabled={!selectedModule} placeholder="Question / lesson title" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-800 dark:text-gray-100" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input type="number" min={0} placeholder="Duration mins" value={lessonForm.duration_mins} onChange={(e) => setLessonForm({ ...lessonForm, duration_mins: Number(e.target.value) })} className="rounded-lg border px-3 py-2 dark:bg-gray-800 dark:text-gray-100" />
            </div>
            <input required placeholder="YouTube video link" value={lessonForm.video_value} onChange={(e) => setLessonForm({ ...lessonForm, video_value: e.target.value })} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-800 dark:text-gray-100" />

            <div>
              <div className="mb-2 font-semibold dark:text-gray-200">Title & Description</div>
              {lessonForm.strategies.map((strategy, index) => (
                <div key={index} className="mb-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <input placeholder="Title" value={strategy.title} onChange={(e) => updateStrategy(index, { title: e.target.value })} className="mb-2 w-full rounded-lg border px-3 py-2 dark:bg-gray-800 dark:text-gray-100" />
                  <textarea placeholder="Description" rows={3} value={strategy.description} onChange={(e) => updateStrategy(index, { description: e.target.value })} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-800 dark:text-gray-100" />
                </div>
              ))}
              <button type="button" onClick={() => setLessonForm((current) => ({ ...current, strategies: [...current.strategies, { step_number: current.strategies.length + 1, title: "", description: "" }] }))} className="text-sm text-blue-600">Add title & description</button>
            </div>

            <label className="inline-flex items-center gap-2 dark:text-gray-300">
              <input type="checkbox" checked={lessonForm.is_active} onChange={(e) => setLessonForm({ ...lessonForm, is_active: e.target.checked })} /> Active
            </label>
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white" disabled={!selectedModule}>
              <Save size={16} /> {editingLessonId ? "Update Lesson" : "Save Lesson"}
            </button>
          </form>

          <div className="mt-5 space-y-2">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between rounded-lg border p-3 dark:border-gray-700">
                <div>
                  <div className="font-semibold dark:text-gray-100">{lesson.title}</div>
                  <div className="text-sm text-gray-500">{lesson.duration_mins} mins</div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => editLesson(lesson)} className="rounded p-2 text-yellow-600 hover:bg-yellow-50"><Edit size={16} /></button>
                  <button type="button" onClick={() => deleteLesson(lesson)} className="rounded p-2 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
