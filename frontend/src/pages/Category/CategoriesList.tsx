import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Edit, Image, Plus, Trash2, BookOpen, Search, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../api/axios";

interface Category {
  id: number;
  title: string;
  type?: "training" | "resource" | null;
  flag_emoji?: string | null;
  description?: string | null;
  thumbnail_image?: string | null;
  is_active: boolean;
}

const storageUrl = (path: string) =>
  path.startsWith("http") ? path : `/api/storage/${path}`;

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/profile")
      .then((res) => setIsSuperAdmin(Number(res.data?.role_id) === 1))
      .catch(() => setIsSuperAdmin(false));
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch {
      alert("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch {
      alert("Error deleting course");
    }
  };

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return categories.filter((c) =>
      [c.title, c.description || "", c.type || ""].some((v) => v.toLowerCase().includes(term))
    );
  }, [categories, search]);

  const typeLabel = (type?: string | null) =>
    type === "resource" ? "Resource" : "Training";

  const typeBadgeClass = (type?: string | null) =>
    type === "resource"
      ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300"
      : "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300";

  const totalRows = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / perPage));
  const paginated = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const startEntry = totalRows === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const endEntry = Math.min(currentPage * perPage, totalRows);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    )
      pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }, [totalPages, currentPage]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-950 p-3 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">

        {/* ── Header ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <BookOpen size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                Management
              </p>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">
                Courses
              </h1>
            </div>
          </div>

          {isSuperAdmin && (
            <Link
              to="/dashboard/categories/add"
              className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold shadow-lg shadow-blue-200 dark:shadow-none transition w-full sm:w-auto"
            >
              <Plus size={17} /> Add Course
            </Link>
          )}
        </div>

        {/* ── Table Card ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-3">
            {/* Search – full width on all sizes */}
            <div className="relative w-full">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Per-page + count row */}
            <div className="flex items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm">Show</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border-2 border-gray-200 dark:border-gray-700 rounded-xl px-.5 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <span className="text-xs sm:text-sm text-gray-400">
                <strong className="text-gray-700 dark:text-gray-200">{totalRows}</strong> total
              </span>
            </div>
          </div>

          {/* ── Desktop Table (md+) ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Course
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Thumbnail
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Type
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  {/* <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Description
                  </th> */}
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div
                            className="h-4 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse"
                            style={{ width: j === 0 ? "60%" : j === 3 ? "80%" : "40%" }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                      <p className="text-gray-400 font-medium">No courses found</p>
                      {search && (
                        <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginated.map((category) => (
                    <tr
                      key={category.id}
                      className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0 text-lg">
                            {category.flag_emoji || (
                              <BookOpen size={16} className="text-blue-400" />
                            )}
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {category.title}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {category.thumbnail_image ? (
                          <a
                            href={storageUrl(category.thumbnail_image)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm"
                          >
                            <Image size={15} /> View
                          </a>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-700 text-sm">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${typeBadgeClass(category.type)}`}
                        >
                          {typeLabel(category.type)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold
                            ${category.is_active
                              ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              category.is_active ? "bg-emerald-500" : "bg-gray-400"
                            }`}
                          />
                          {category.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* <td className="px-6 py-4 max-w-xs">
                        {category.description ? (
                          <p
                            className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: category.description }}
                          />
                        ) : (
                          <span className="text-gray-300 dark:text-gray-700 text-sm">—</span>
                        )}
                      </td> */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/dashboard/categories/${category.id}/edit`)
                            }
                            className="p-2.5 rounded-xl text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition"
                            aria-label="Edit course"
                            title="Edit"
                          >
                            <Edit size={17} />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-2.5 rounded-xl text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                            aria-label="Delete course"
                            title="Delete"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards (< md) ── */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse flex-shrink-0" />
                    <div className="h-4 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse w-1/2" />
                  </div>
                  <div className="h-3 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse w-3/4" />
                  <div className="h-3 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse w-1/3" />
                </div>
              ))
            ) : paginated.length === 0 ? (
              <div className="py-16 text-center">
                <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                <p className="text-gray-400 font-medium">No courses found</p>
                {search && (
                  <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                )}
              </div>
            ) : (
              paginated.map((category) => (
                <div
                  key={category.id}
                  className="p-4 hover:bg-blue-50/40 dark:hover:bg-blue-950/10 transition"
                >
                  {/* Top row: avatar + title + actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0 text-lg">
                        {category.flag_emoji || (
                          <BookOpen size={16} className="text-blue-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm">
                          {category.title}
                        </p>
                        {/* Status badge inline on mobile */}
                        <span
                          className={`inline-flex items-center mt-0.5 mr-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${typeBadgeClass(category.type)}`}
                        >
                          {typeLabel(category.type)}
                        </span>
                        <span
                          className={`inline-flex items-center mt-0.5 px-2 py-0.5 rounded-full text-xs font-bold
                            ${category.is_active
                              ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1 ${
                              category.is_active ? "bg-emerald-500" : "bg-gray-400"
                            }`}
                          />
                          {category.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() =>
                          navigate(`/dashboard/categories/${category.id}/edit`)
                        }
                        className="p-2.5 rounded-xl text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/40 active:scale-95 transition"
                        aria-label="Edit course"
                      >
                        <Edit size={17} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2.5 rounded-xl text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-95 transition"
                        aria-label="Delete course"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {category.description && (
                    <p
                      className="mt-2.5 text-gray-500 dark:text-gray-400 text-xs line-clamp-2 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: category.description }}
                    />
                  )}

                  {/* Thumbnail link */}
                  {category.thumbnail_image && (
                    <a
                      href={storageUrl(category.thumbnail_image)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs"
                    >
                      <Image size={13} /> View thumbnail
                    </a>
                  )}
                </div>
              ))
            )}
          </div>

          {/* ── Pagination footer ── */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-900">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
              Showing{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {startEntry}–{endEntry}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">{totalRows}</span>{" "}
              courses
            </p>

            <div className="flex items-center gap-1 order-1 sm:order-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 sm:p-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              {pageNumbers.map((num, i) =>
                num === "..." ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-1 py-1 text-gray-400 text-sm"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num as number)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold border-2 transition
                      ${
                        num === currentPage
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    {num}
                  </button>
                )
              )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}