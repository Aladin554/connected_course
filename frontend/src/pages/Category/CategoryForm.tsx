import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../../api/axios";

interface WelcomeSlideForm {
  id?: number;
  title: string;
  body_content: string;
  warning: string;
  is_active: boolean;
}

const emptySlide = (): WelcomeSlideForm => ({
  title: "",
  body_content: "",
  warning: "",
  is_active: true,
});

export default function CategoryForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    description: "",
    is_active: true,
  });
  const [slides, setSlides] = useState<WelcomeSlideForm[]>([emptySlide()]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;

    api.get(`/categories/${id}`)
      .then((res) => {
        setForm({
          title: res.data.title || "",
          description: res.data.description || "",
          is_active: Boolean(res.data.is_active),
        });
        const loadedSlides = Array.isArray(res.data.all_welcome_slides)
          ? res.data.all_welcome_slides.map((slide: any) => ({
              id: slide.id,
              title: slide.title || "",
              body_content: slide.body_content || "",
              warning: slide.warning || "",
              is_active: Boolean(slide.is_active),
            }))
          : [];
        setSlides(loadedSlides.length > 0 ? loadedSlides : [emptySlide()]);
      })
      .catch(() =>
        navigate("/dashboard/categories", { state: { message: "Failed to load category", type: "error" } })
      );
  }, [id, isEdit, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("description", form.description);
    payload.append("is_active", form.is_active ? "1" : "0");
    slides.forEach((slide, index) => {
      if (slide.id) payload.append(`welcome_slides[${index}][id]`, slide.id.toString());
      payload.append(`welcome_slides[${index}][title]`, slide.title);
      payload.append(`welcome_slides[${index}][body_content]`, slide.body_content);
      payload.append(`welcome_slides[${index}][warning]`, slide.warning);
      payload.append(`welcome_slides[${index}][is_active]`, slide.is_active ? "1" : "0");
    });
    if (thumbnail) payload.append("thumbnail_image", thumbnail);
    if (isEdit) payload.append("_method", "PUT");

    try {
      if (isEdit) {
        await api.post(`/categories/${id}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post("/categories", payload, { headers: { "Content-Type": "multipart/form-data" } });
      }
      navigate("/dashboard/categories", {
        state: { message: `Category ${isEdit ? "updated" : "created"} successfully`, type: "success" },
      });
    } catch (err: any) {
      const message = err.response?.data?.message || "Error saving category";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateSlide = (index: number, patch: Partial<WelcomeSlideForm>) => {
    setSlides((current) =>
      current.map((slide, slideIndex) =>
        slideIndex === index ? { ...slide, ...patch } : slide
      )
    );
  };

  const addSlide = () => {
    setSlides((current) => [...current, emptySlide()]);
  };

  const removeSlide = (index: number) => {
    setSlides((current) =>
      current.length === 1 ? [emptySlide()] : current.filter((_, slideIndex) => slideIndex !== index)
    );
  };

  return (
    <div className="p-8 md:p-12 border border-gray-200 rounded-2xl dark:border-gray-700 dark:bg-gray-900 shadow-sm max-w-5xl mx-auto w-full">
      <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-3 py-2 mb-6 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back</span>
      </button>

      <h1 className="text-2xl font-semibold mb-6 dark:text-gray-200">{isEdit ? "Edit Course" : "Add Course"}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block mb-1 text-sm font-medium dark:text-gray-300">Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border px-3 py-2 rounded-lg text-lg dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium dark:text-gray-300">Thumbnail Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
              className="w-full border px-3 py-2 rounded-lg text-lg dark:bg-gray-700 dark:text-gray-200"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium dark:text-gray-300">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={5}
            className="w-full border px-3 py-2 rounded-lg text-lg dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <label className="inline-flex items-center gap-3 dark:text-gray-300">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300"
          />
          Active
        </label>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold dark:text-gray-200">Welcome Pages</h2>
            <button type="button" onClick={addSlide} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
              Add Page
            </button>
          </div>

          {slides.map((slide, index) => (
            <div key={slide.id ?? index} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="font-semibold dark:text-gray-200">Page {index + 1}</div>
                <button type="button" onClick={() => removeSlide(index)} className="px-3 py-2 rounded-lg border text-red-600 hover:bg-red-50 dark:border-gray-700">
                  Remove
                </button>
              </div>

              <div>
                  <label className="block mb-1 text-sm font-medium dark:text-gray-300">Page Title</label>
                  <input
                    type="text"
                    required
                    value={slide.title}
                    onChange={(e) => updateSlide(index, { title: e.target.value })}
                    className="w-full border px-3 py-2 rounded-lg text-lg dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
              </div>

              <div className="mt-4">
                <label className="block mb-1 text-sm font-medium dark:text-gray-300">Page Body</label>
                <textarea
                  required
                  value={slide.body_content}
                  onChange={(e) => updateSlide(index, { body_content: e.target.value })}
                  rows={6}
                  className="w-full border px-3 py-2 rounded-lg text-lg dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mt-4">
                <label className="block mb-1 text-sm font-medium dark:text-gray-300">Warning</label>
                <textarea
                  value={slide.warning}
                  onChange={(e) => updateSlide(index, { warning: e.target.value })}
                  rows={3}
                  className="w-full border px-3 py-2 rounded-lg text-lg dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <label className="mt-3 inline-flex items-center gap-3 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={slide.is_active}
                  onChange={(e) => updateSlide(index, { is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Active
              </label>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/dashboard/categories")} className="px-5 py-2 rounded-lg border dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
          <button type="submit" disabled={submitting} className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-lg disabled:opacity-50">{submitting ? "Saving..." : "Save Course"}</button>
        </div>
      </form>
    </div>
  );
}
