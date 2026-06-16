import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, BookOpen, Image, FileText, AlertTriangle,
  Plus, Trash2, Save, ToggleLeft, ToggleRight, ChevronDown,
  GripVertical,
} from "lucide-react";
import api from "../../api/axios";
import RichTextEditor from "../../components/form/RichTextEditor";

interface WelcomeSlideForm {
  id?: number;
  title: string;
  body_content: string;
  warning: string;
  warning_position: "after_title" | "after_description";
  is_active: boolean;
}

const emptySlide = (): WelcomeSlideForm => ({
  title: "",
  body_content: "",
  warning: "",
  warning_position: "after_description",
  is_active: true,
});

// ── Moved OUTSIDE component to prevent remount on every render ──────────────
const inputClass =
  "w-full border-2 border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

const Field = ({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) => (
  <div>
    <label className="block text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2 uppercase tracking-wide">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);
// ────────────────────────────────────────────────────────────────────────────

export default function CategoryForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ title: "", description: "", type: "training" as "training" | "resource", is_active: true });
  const [slides, setSlides] = useState<WelcomeSlideForm[]>([emptySlide()]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedSlides, setExpandedSlides] = useState<Set<number>>(new Set([0]));
  const [canAddCourses, setCanAddCourses] = useState(false);
  const [canEditCourses, setCanEditCourses] = useState(false);

  useEffect(() => {
    api.get("/profile")
      .then((res) => {
        const roleId = Number(res.data?.role_id);
        setCanAddCourses(roleId === 1 || Number(res.data?.can_add_courses) === 1);
        setCanEditCourses(roleId === 1 || Number(res.data?.can_edit_courses) === 1);
        if (roleId === 2) {
          if (isEdit && Number(res.data?.can_edit_courses) !== 1) {
            navigate("/dashboard/categories", {
              state: { message: "You do not have permission to edit courses.", type: "error" },
            });
          } else if (!isEdit && Number(res.data?.can_add_courses) !== 1) {
            navigate("/dashboard/categories", {
              state: { message: "You do not have permission to add courses.", type: "error" },
            });
          }
        }
      })
      .catch(() => {
        setCanAddCourses(false);
        setCanEditCourses(false);
      });
  }, [navigate, isEdit]);

  useEffect(() => {
    if (!isEdit || !id) return;
    api.get(`/categories/${id}`)
      .then((res) => {
        setForm({
          title: res.data.title || "",
          description: res.data.description || "",
          type: res.data.type === "resource" ? "resource" : "training",
          is_active: Boolean(res.data.is_active),
        });
        const loadedSlides = Array.isArray(res.data.all_welcome_slides)
          ? res.data.all_welcome_slides.map((slide: any) => ({
              id: slide.id,
              title: slide.title || "",
              body_content: slide.body_content || "",
              warning: slide.warning || "",
              warning_position:
                slide.warning_position === "after_title" ? "after_title" : "after_description",
              is_active: Boolean(slide.is_active),
            }))
          : [];
        const final = loadedSlides.length > 0 ? loadedSlides : [emptySlide()];
        setSlides(final);
        setExpandedSlides(new Set(final.map((_: any, i: number) => i)));
      })
      .catch(() =>
        navigate("/dashboard/categories", {
          state: { message: "Failed to load category", type: "error" },
        })
      );
  }, [id, isEdit, navigate]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setThumbnail(file);
    setThumbnailPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && !canEditCourses) {
      alert("You do not have permission to edit courses.");
      return;
    }
    if (!isEdit && !canAddCourses) {
      alert("You do not have permission to add courses.");
      return;
    }
    setSubmitting(true);
    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("type", form.type);
    payload.append("description", form.description);
    payload.append("is_active", form.is_active ? "1" : "0");
    slides.forEach((slide, index) => {
      if (slide.id) payload.append(`welcome_slides[${index}][id]`, slide.id.toString());
      payload.append(`welcome_slides[${index}][title]`, slide.title);
      payload.append(`welcome_slides[${index}][body_content]`, slide.body_content);
      payload.append(`welcome_slides[${index}][warning]`, slide.warning);
      payload.append(`welcome_slides[${index}][warning_position]`, slide.warning_position);
      payload.append(`welcome_slides[${index}][is_active]`, slide.is_active ? "1" : "0");
    });
    if (thumbnail) payload.append("thumbnail_image", thumbnail);
    if (isEdit) payload.append("_method", "PUT");
    try {
      if (isEdit) {
        await api.post(`/categories/${id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/categories", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      navigate("/dashboard/categories", {
        state: {
          message: `Course ${isEdit ? "updated" : "created"} successfully`,
          type: "success",
        },
      });
    } catch (err: any) {
      alert(err.response?.data?.message || "Error saving course");
    } finally {
      setSubmitting(false);
    }
  };

  const updateSlide = (index: number, patch: Partial<WelcomeSlideForm>) =>
    setSlides((c) => c.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  const addSlide = () => {
    const newIndex = slides.length;
    setSlides((c) => [...c, emptySlide()]);
    setExpandedSlides((prev) => new Set([...prev, newIndex]));
  };

  const removeSlide = (index: number) => {
    setSlides((c) => (c.length === 1 ? [emptySlide()] : c.filter((_, i) => i !== index)));
    setExpandedSlides((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
  };

  const toggleSlide = (index: number) =>
    setExpandedSlides((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-950 p-3 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto">

        {/* ── Top nav ── */}
        <div className="flex items-center justify-between mb-5 sm:mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition font-medium text-sm sm:text-base"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          {/* Status toggle pill */}
          <button
            type="button"
            onClick={() => setForm({ ...form, is_active: !form.is_active })}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border-2 transition
              ${form.is_active
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
                : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500"
              }`}
          >
            {form.is_active
              ? <><ToggleRight size={16} /> Active</>
              : <><ToggleLeft size={16} /> Inactive</>
            }
          </button>
        </div>

        {/* ── Page title ── */}
        <div className="mb-5 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <BookOpen size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                {isEdit ? "Edit Course" : "New Course"}
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                {isEdit ? form.title || "Loading…" : "Create a Course"}
              </h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

          {/* ── Course Details Card ── */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <FileText size={15} className="text-blue-500" />
              <h2 className="font-bold text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                Course Details
              </h2>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <Field label="Course Title" required>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. UK Interview Training"
                />
              </Field>

              <Field label="Course Type" required>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value === "resource" ? "resource" : "training",
                    })
                  }
                  className={inputClass}
                >
                  <option value="training">Training</option>
                  <option value="resource">Resource</option>
                </select>
              </Field>

              {/* <Field label="Description">
                <RichTextEditor
                  value={form.description}
                  onChange={(description) => setForm({ ...form, description })}
                  disabled={submitting}
                  height={220}
                />
              </Field> */}

              {/* Thumbnail */}
              <Field label="Thumbnail Image">
                <label className="flex items-center gap-3 sm:gap-4 cursor-pointer group">
                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl border-2 border-dashed flex items-center justify-center flex-shrink-0 overflow-hidden transition
                      ${thumbnailPreview
                        ? "border-blue-300 dark:border-blue-700"
                        : "border-gray-300 dark:border-gray-700 group-hover:border-blue-400"
                      }`}
                  >
                    {thumbnailPreview ? (
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image size={24} className="text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:underline truncate">
                      {thumbnail ? thumbnail.name : "Click to upload image"}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      JPG, PNG, WEBP — recommended 16:9
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </div>
                </label>
              </Field>
            </div>
          </div>

          {/* ── Welcome Pages Card ── */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-violet-500" />
                <h2 className="font-bold text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                  Welcome Pages
                </h2>
                <span className="ml-1 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 text-xs font-bold px-2 py-0.5 rounded-full">
                  {slides.length}
                </span>
              </div>
              <button
                type="button"
                onClick={addSlide}
                className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition"
              >
                <Plus size={14} />
                <span className="hidden xs:inline">Add Page</span>
                <span className="xs:hidden">Add</span>
              </button>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {slides.map((slide, index) => {
                const isExpanded = expandedSlides.has(index);
                return (
                  <div key={slide.id ?? index}>
                    {/* Slide accordion header */}
                    <div
                      className={`px-4 sm:px-6 py-3.5 sm:py-4 flex items-center gap-2 sm:gap-3 cursor-pointer select-none transition
                        ${isExpanded
                          ? "bg-violet-50 dark:bg-violet-950/30"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        }`}
                      onClick={() => toggleSlide(index)}
                    >
                      <GripVertical
                        size={15}
                        className="text-gray-300 dark:text-gray-700 flex-shrink-0 hidden sm:block"
                      />

                      {/* Page number badge */}
                      <div
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
                          ${isExpanded
                            ? "bg-violet-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                          }`}
                      >
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-semibold text-xs sm:text-sm truncate ${
                            isExpanded
                              ? "text-violet-700 dark:text-violet-300"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {slide.title || `Page ${index + 1}`}
                        </div>
                        {!isExpanded && slide.warning && (
                          <div className="text-xs text-amber-500 flex items-center gap-1 mt-0.5">
                            <AlertTriangle size={10} /> Has warning
                          </div>
                        )}
                      </div>

                      {/* Active pill */}
                      <div
                        className={`text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex-shrink-0 hidden xs:flex
                          ${slide.is_active
                            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                          }`}
                      >
                        {slide.is_active ? "Active" : "Inactive"}
                      </div>

                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform flex-shrink-0 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {/* Slide body */}
                    {isExpanded && (
                      <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-2 space-y-4 sm:space-y-5 bg-violet-50/40 dark:bg-violet-950/10">

                        <Field label="Page Title" required>
                          <input
                            type="text"
                            required
                            value={slide.title}
                            onChange={(e) => updateSlide(index, { title: e.target.value })}
                            className={inputClass}
                            placeholder="e.g. Welcome to the course"
                          />
                        </Field>

                        <Field label="Page Body">
                          <RichTextEditor
                            required
                            value={slide.body_content}
                            onChange={(body_content) => updateSlide(index, { body_content })}
                            disabled={submitting}
                            height={350}
                          />
                        </Field>

                        {/* Warning + position */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <Field label="Warning / Note">
                            <textarea
                              value={slide.warning}
                              onChange={(e) => updateSlide(index, { warning: e.target.value })}
                              rows={3}
                              className={inputClass + " resize-none"}
                              placeholder="Optional warning text..."
                            />
                          </Field>
                          <Field label="Warning Position">
                            <select
                              value={slide.warning_position}
                              onChange={(e) =>
                                updateSlide(index, {
                                  warning_position: e.target
                                    .value as WelcomeSlideForm["warning_position"],
                                })
                              }
                              className={inputClass}
                            >
                              <option value="after_title">After title</option>
                              <option value="after_description">After description</option>
                            </select>
                            <p className="text-xs text-gray-400 mt-1.5">
                              Controls where the warning banner appears on this page.
                            </p>
                          </Field>
                        </div>

                        {/* Footer row: active toggle + delete */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-violet-100 dark:border-violet-900/40">
                          <button
                            type="button"
                            onClick={() => updateSlide(index, { is_active: !slide.is_active })}
                            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border-2 transition
                              ${slide.is_active
                                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
                                : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500"
                              }`}
                          >
                            {slide.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                            {slide.is_active ? "Active" : "Inactive"}
                          </button>

                          <button
                            type="button"
                            onClick={() => removeSlide(index)}
                            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 active:bg-red-100 border-2 border-red-200 dark:border-red-900 transition"
                          >
                            <Trash2 size={14} />
                            <span className="hidden xs:inline">Remove Page</span>
                            <span className="xs:hidden">Remove</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Action Bar ── */}
          <div className="flex items-center justify-between gap-3 bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3.5 sm:py-4 shadow-sm">
            <button
              type="button"
              onClick={() => navigate("/dashboard/categories")}
              className="px-4 sm:px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base disabled:opacity-60 transition shadow-lg shadow-blue-200 dark:shadow-none"
            >
              <Save size={16} />
              {submitting ? "Saving…" : isEdit ? "Update Course" : "Create Course"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}