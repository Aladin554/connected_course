import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Edit, Image, Plus, Trash2 } from "lucide-react";
import api from "../../api/axios";

interface Category {
  id: number;
  title: string;
  flag_emoji?: string | null;
  description?: string | null;
  thumbnail_image?: string | null;
  is_active: boolean;
}

const storageUrl = (path: string) => path.startsWith("http") ? path : `/api/storage/${path}`;

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
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
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch {
      alert("Error deleting category");
    }
  };

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return categories.filter((category) =>
      [category.title, category.description || ""].some((value) =>
        value.toLowerCase().includes(term)
      )
    );
  }, [categories, search]);

  const totalRows = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / perPage));
  const paginated = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-700 lg:p-6 dark:bg-gray-900">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-3">
        <h1 className="text-lg sm:text-2xl font-bold dark:text-gray-200">
          Courses
        </h1>
        <Link
          to="/dashboard/categories/add"
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-white text-base font-medium shadow-sm hover:bg-blue-700"
        >
          <Plus size={20} /> Add Course
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between mb-4 gap-3 items-center">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-base">
          <span>Show</span>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border px-5 py-2 rounded text-base dark:bg-gray-800 dark:text-gray-200"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-4 py-2 rounded w-full md:w-64 text-base dark:bg-gray-800 dark:text-gray-200"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full text-base">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
            <tr>
              <th className="px-6 py-4 text-left font-medium text-gray-700 dark:text-gray-200 border-r">Title</th>
              <th className="px-6 py-4 text-left font-medium text-gray-700 dark:text-gray-200 border-r">Image</th>
              <th className="px-6 py-4 text-left font-medium text-gray-700 dark:text-gray-200 border-r">Status</th>
              <th className="px-6 py-4 text-left font-medium text-gray-700 dark:text-gray-200 border-r">Description</th>
              <th className="px-6 py-4 text-left font-medium text-gray-700 dark:text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {loading ? (
              <tr><td colSpan={5} className="py-4 text-center dark:text-gray-200">Loading...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={5} className="py-4 text-center dark:text-gray-200">No categories found</td></tr>
            ) : (
              paginated.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 border-r text-gray-900 dark:text-gray-200 font-semibold">
                    {category.flag_emoji ? `${category.flag_emoji} ` : ""}{category.title}
                  </td>
                  <td className="px-6 py-4 border-r text-gray-700 dark:text-gray-300">
                    {category.thumbnail_image ? (
                      <a href={storageUrl(category.thumbnail_image)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                        <Image size={16} /> View
                      </a>
                    ) : "-"}
                  </td>
                  <td className="px-6 py-4 border-r">
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${category.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {category.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-r text-gray-600 dark:text-gray-400 truncate max-w-xs">
                    {category.description || "-"}
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button onClick={() => navigate(`/dashboard/categories/${category.id}/edit`)} className="p-3 rounded hover:bg-yellow-100 text-yellow-600" aria-label="Edit category">
                      <Edit size={20} />
                    </button>
                    <button onClick={() => handleDelete(category.id)} className="p-3 rounded hover:bg-red-100 text-red-600" aria-label="Delete category">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-2 text-gray-700 dark:text-gray-300">
        <div>Showing {totalRows === 0 ? 0 : (currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, totalRows)} of {totalRows} entries</div>
        <div className="flex flex-wrap items-center space-x-1">
          <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-2 border rounded disabled:opacity-50 dark:border-gray-600">Previous</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button key={num} onClick={() => setCurrentPage(num)} className={`px-3 py-2 border rounded dark:border-gray-600 ${num === currentPage ? "bg-blue-600 text-white" : ""}`}>{num}</button>
          ))}
          <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-2 border rounded disabled:opacity-50 dark:border-gray-600">Next</button>
        </div>
      </div>
    </div>
  );
}
