import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios.ts";
import { ArrowLeft } from "lucide-react";

interface Role {
  id: number;
  name: string;
}

interface Category {
  id: number;
  title: string;
  flag_emoji?: string | null;
}

interface CurrentUser {
  role_id: number;
  can_create_users: number;
}

export default function AdminUserForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    roleId: isEdit ? "" : "3",
    password: "",
    categoryIds: [] as number[],
  });
  const [errors, setErrors] = useState({
    first_name: "",
    last_name: "",
    email: "",
    roleId: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get("/profile")
      .then((res) => setCurrentUser(res.data))
      .catch(() => {
        navigate("/dashboard/admin-users", {
          state: { message: "Failed to get current user", type: "error" },
        });
      });
  }, [navigate]);

  useEffect(() => {
    if (!currentUser) return;

    const roleId = currentUser.role_id;
    const canCreate = currentUser.can_create_users === 1;

    if (roleId === 1) return;
    if (roleId === 2 && canCreate) return;

    navigate("/dashboard/admin-users", {
      state: { message: "You do not have access to this page.", type: "error" },
    });
  }, [currentUser, navigate]);

  useEffect(() => {
    api.get("/roles")
      .then((res) => setRoles(Array.isArray(res.data) ? res.data : []))
      .catch(() =>
        navigate("/dashboard/admin-users", { state: { message: "Failed to fetch roles", type: "error" } })
      );
  }, [navigate]);

  useEffect(() => {
    api.get("/categories/active")
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() =>
        navigate("/dashboard/admin-users", { state: { message: "Failed to fetch categories", type: "error" } })
      );
  }, [navigate]);

  useEffect(() => {
    if (isEdit && id) {
      api.get(`/users/${id}`)
        .then((res) => {
          setForm({
            first_name: res.data.first_name || "",
            last_name: res.data.last_name || "",
            email: res.data.email || "",
            roleId: res.data.role_id?.toString() || res.data.role?.id?.toString() || "",
            password: "",
            categoryIds: Array.isArray(res.data.categories)
              ? res.data.categories.map((category: Category) => category.id)
              : [],
          });
        })
        .catch(() =>
          navigate("/dashboard/admin-users", { state: { message: "Failed to load user", type: "error" } })
        );
    }
  }, [id, isEdit, navigate]);

  const validateForm = () => {
    const newErrors = { first_name: "", last_name: "", email: "", roleId: "", password: "" };
    let valid = true;

    if (!form.first_name.trim()) { newErrors.first_name = "First name is required."; valid = false; }
    if (!form.last_name.trim()) { newErrors.last_name = "Last name is required."; valid = false; }
    if (!form.email.trim()) { newErrors.email = "Email is required."; valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { newErrors.email = "Invalid email address."; valid = false; }
    if (!form.roleId) { newErrors.roleId = "Role is required."; valid = false; }
    if (!isEdit && !form.password.trim()) { newErrors.password = "Password is required."; valid = false; }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload: any = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        role_id: Number(form.roleId),
        category_ids: form.categoryIds,
      };

      if (form.password) payload.password = form.password;

      if (isEdit) {
        await api.put(`/users/${id}`, payload);
        navigate("/dashboard/admin-users", { state: { message: "User updated successfully!", type: "success" } });
      } else {
        await api.post("/users", payload);
        navigate("/dashboard/admin-users", { state: { message: "User added successfully!", type: "success" } });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error saving user";
      navigate("/dashboard/admin-users", { state: { message: msg, type: "error" } });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  return (
    <div className="p-16 border border-gray-200 rounded-2xl dark:border-gray-700 dark:bg-gray-900 shadow-sm max-w-5xl mx-auto w-full">
      <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-3 py-2 mb-6 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-200 shadow-sm">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back</span>
      </button>

      <h1 className="text-2xl font-semibold mb-6 dark:text-gray-200">{isEdit ? "Edit User" : "Add New User"}</h1>

      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block mb-1 text-sm font-medium dark:text-gray-300">First Name</label>
            <input type="text" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className={`w-full border px-3 py-2 rounded-lg text-lg dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 ${errors.first_name ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`} />
            {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium dark:text-gray-300">Last Name</label>
            <input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className={`w-full border px-3 py-2 rounded-lg text-lg dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 ${errors.last_name ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`} />
            {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium dark:text-gray-300">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`w-full border px-3 py-2 rounded-lg text-lg dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 ${errors.email ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`} />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium dark:text-gray-300">Password {isEdit && "(leave blank to keep unchanged)"}</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`w-full border px-3 py-2 rounded-lg text-lg dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 ${errors.password ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`} />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium dark:text-gray-300">Role</label>
            <select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })} className={`w-full border px-3 py-2 rounded-lg text-lg dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 ${errors.roleId ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}>
              <option value="">Select role</option>
              {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
            </select>
            {errors.roleId && <p className="text-red-500 text-sm mt-1">{errors.roleId}</p>}
          </div>
        </div>

        <div>
          <label className="block mb-3 text-sm font-medium dark:text-gray-300">Allowed Categories</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">No active categories found.</div>
            ) : (
              categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={form.categoryIds.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-base">
                    {category.flag_emoji ? `${category.flag_emoji} ` : ""}
                    {category.title}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button type="button" onClick={() => navigate("/dashboard/admin-users")} className="px-5 py-2 rounded-lg border dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
          <button type="submit" disabled={submitting} className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-lg disabled:opacity-50">{submitting ? "Saving..." : "Save User"}</button>
        </div>
      </form>
    </div>
  );
}
