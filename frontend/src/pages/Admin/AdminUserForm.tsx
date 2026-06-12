// AdminUserForm.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios.ts";
import { ArrowLeft, Users, X, Plus, ShieldCheck } from "lucide-react";

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

const isLikelyIp = (value: string): boolean => {
  const ipv4 =
    /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
  const ipv6 = /^[0-9A-Fa-f:]+$/;
  return ipv4.test(value) || (value.includes(":") && ipv6.test(value));
};

const inputClass = (error?: string) =>
  `w-full pl-3 pr-3 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${
    error
      ? "border-red-400 focus:ring-red-400"
      : "border-gray-200 dark:border-gray-700 focus:ring-blue-500"
  }`;

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
    adminCategoryIds: [] as number[],
    adminFrontendCategoryIds: [] as number[],
    allowed_ips: [] as string[],
  });
  const [errors, setErrors] = useState({
    first_name: "",
    last_name: "",
    email: "",
    roleId: "",
    password: "",
    allowed_ips: "",
  });
  const [ipInput, setIpInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const canCreateNewUsers =
    Number(currentUser?.role_id) === 1 || Number(currentUser?.can_create_users) === 1;

  useEffect(() => {
    api.get("/profile")
      .then((res) => setCurrentUser(res.data))
      .catch(() =>
        navigate("/dashboard/admin-users", {
          state: { message: "Failed to get current user", type: "error" },
        })
      );
  }, [navigate]);

  useEffect(() => {
    if (!currentUser) return;
    const roleId = Number(currentUser.role_id);
    const canCreate = Number(currentUser.can_create_users) === 1;
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
    const endpoint = Number(currentUser?.role_id) === 1 ? "/categories" : "/categories/active";
    api.get(endpoint)
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() =>
        navigate("/dashboard/admin-users", { state: { message: "Failed to fetch categories", type: "error" } })
      );
  }, [navigate, currentUser]);

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
              ? res.data.categories.map((c: Category) => c.id)
              : [],
            adminCategoryIds: Array.isArray(res.data.admin_categories)
              ? res.data.admin_categories.map((c: Category) => c.id)
              : [],
            adminFrontendCategoryIds: Array.isArray(res.data.admin_frontend_categories)
              ? res.data.admin_frontend_categories.map((c: Category) => c.id)
              : [],
            allowed_ips: Array.isArray(res.data.allowed_ips) ? res.data.allowed_ips : [],
          });
        })
        .catch(() =>
          navigate("/dashboard/admin-users", { state: { message: "Failed to load user", type: "error" } })
        );
    }
  }, [id, isEdit, navigate]);

  const validateForm = () => {
    const newErrors = { first_name: "", last_name: "", email: "", roleId: "", password: "", allowed_ips: "" };
    let valid = true;
    if (!form.first_name.trim()) { newErrors.first_name = "First name is required."; valid = false; }
    if (!form.last_name.trim()) { newErrors.last_name = "Last name is required."; valid = false; }
    if (!form.email.trim()) { newErrors.email = "Email is required."; valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { newErrors.email = "Invalid email address."; valid = false; }
    if (!form.roleId) { newErrors.roleId = "Role is required."; valid = false; }
    if (!isEdit && !form.password.trim()) { newErrors.password = "Password is required."; valid = false; }
    if (Number(currentUser?.role_id) === 1 && form.allowed_ips.some((ip) => !isLikelyIp(ip))) {
      newErrors.allowed_ips = "One or more IPs are invalid."; valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const addAllowedIp = () => {
    const raw = ipInput.trim();
    if (!raw) return;
    const values = raw.split(/[,\s]+/).map((v) => v.trim()).filter(Boolean);
    const invalid = values.find((v) => !isLikelyIp(v));
    if (invalid) { setErrors((prev) => ({ ...prev, allowed_ips: `Invalid IP: ${invalid}` })); return; }
    setForm((prev) => ({ ...prev, allowed_ips: Array.from(new Set([...prev.allowed_ips, ...values])) }));
    setErrors((prev) => ({ ...prev, allowed_ips: "" }));
    setIpInput("");
  };

  const removeAllowedIp = (ip: string) => {
    setForm((prev) => ({ ...prev, allowed_ips: prev.allowed_ips.filter((v) => v !== ip) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEdit && !canCreateNewUsers) {
      navigate("/dashboard/admin-users", { state: { message: "Add user permission is inactive.", type: "error" } });
      return;
    }
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
      if (Number(currentUser?.role_id) === 1) payload.allowed_ips = form.allowed_ips;
      if (Number(currentUser?.role_id) === 1 && Number(form.roleId) === 2) {
        payload.admin_category_ids = form.adminCategoryIds;
        payload.admin_frontend_category_ids = form.adminFrontendCategoryIds;
      }
      if (isEdit) {
        await api.put(`/users/${id}`, payload);
        navigate("/dashboard/admin-users", { state: { message: "User updated successfully!", type: "success" } });
      } else {
        await api.post("/users", payload);
        navigate("/dashboard/admin-users", { state: { message: "User added successfully!", type: "success" } });
      }
    } catch (err: any) {
      navigate("/dashboard/admin-users", {
        state: { message: err.response?.data?.message || "Error saving user", type: "error" },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((c) => c !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  const toggleAdminCategory = (categoryId: number) => {
    setForm((prev) => ({
      ...prev,
      adminCategoryIds: prev.adminCategoryIds.includes(categoryId)
        ? prev.adminCategoryIds.filter((c) => c !== categoryId)
        : [...prev.adminCategoryIds, categoryId],
    }));
  };

  const toggleAdminFrontendCategory = (categoryId: number) => {
    setForm((prev) => ({
      ...prev,
      adminFrontendCategoryIds: prev.adminFrontendCategoryIds.includes(categoryId)
        ? prev.adminFrontendCategoryIds.filter((c) => c !== categoryId)
        : [...prev.adminFrontendCategoryIds, categoryId],
    }));
  };

  const isSuperAdmin = Number(currentUser?.role_id) === 1;
  const isAdminRole = Number(form.roleId) === 2;
  const isUserRole = Number(form.roleId) === 3;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">Management</p>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                {isEdit ? "Edit User" : "Add New User"}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        {/* ── Form Card ── */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">

            {/* Basic Info */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Basic Information
                </h2>
              </div>
              <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    placeholder="John"
                    className={inputClass(errors.first_name)}
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.first_name}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    placeholder="Doe"
                    className={inputClass(errors.last_name)}
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.last_name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@example.com"
                    className={inputClass(errors.email)}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Password{" "}
                    {isEdit && (
                      <span className="text-xs font-normal text-gray-400">(leave blank to keep unchanged)</span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={isEdit ? "••••••••" : "Min. 8 characters"}
                    className={inputClass(errors.password)}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Role
                  </label>
                  <select
                    value={form.roleId}
                    onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                    className={inputClass(errors.roleId)}
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                  {errors.roleId && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.roleId}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Allowed IPs (admin only) */}
            {Number(currentUser?.role_id) === 1 && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-blue-500" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    IP Allowlist
                  </h2>
                </div>
                <div className="px-6 py-6">
                  {/* Tags */}
                  {form.allowed_ips.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {form.allowed_ips.map((ip) => (
                        <span
                          key={ip}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                        >
                          {ip}
                          <button
                            type="button"
                            onClick={() => removeAllowedIp(ip)}
                            className="hover:text-blue-900 dark:hover:text-white transition"
                            aria-label={`Remove ${ip}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ipInput}
                      onChange={(e) => setIpInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAllowedIp(); } }}
                      placeholder="e.g. 203.0.113.10 or paste multiple comma-separated"
                      className={inputClass(errors.allowed_ips)}
                    />
                    <button
                      type="button"
                      onClick={addAllowedIp}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex-shrink-0"
                    >
                      <Plus size={15} /> Add
                    </button>
                  </div>
                  {errors.allowed_ips && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.allowed_ips}</p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Leave empty to allow access from any IP address.
                  </p>
                </div>
              </div>
            )}

            {/* Admin panel course access */}
            {isSuperAdmin && isAdminRole && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Admin Panel — Course &amp; Learning Content
                    </h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Courses this admin can manage in the dashboard (backend).
                    </p>
                  </div>
                  {form.adminCategoryIds.length > 0 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                      {form.adminCategoryIds.length} selected
                    </span>
                  )}
                </div>
                <div className="px-6 py-6">
                  {categories.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500">No courses found.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categories.map((category) => {
                        const checked = form.adminCategoryIds.includes(category.id);
                        return (
                          <label
                            key={`admin-panel-${category.id}`}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition ${
                              checked
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-600"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleAdminCategory(category.id)}
                              className="h-4 w-4 rounded accent-blue-600 flex-shrink-0"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {category.flag_emoji ? `${category.flag_emoji} ` : ""}
                              {category.title}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Frontend course access for admin learner view */}
            {isSuperAdmin && isAdminRole && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Frontend — Course &amp; Learning Content
                    </h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Courses this admin can access in the user learning view (introduction).
                    </p>
                  </div>
                  {form.adminFrontendCategoryIds.length > 0 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                      {form.adminFrontendCategoryIds.length} selected
                    </span>
                  )}
                </div>
                <div className="px-6 py-6">
                  {categories.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500">No courses found.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categories.map((category) => {
                        const checked = form.adminFrontendCategoryIds.includes(category.id);
                        return (
                          <label
                            key={`admin-frontend-${category.id}`}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition ${
                              checked
                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-600"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleAdminFrontendCategory(category.id)}
                              className="h-4 w-4 rounded accent-emerald-600 flex-shrink-0"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {category.flag_emoji ? `${category.flag_emoji} ` : ""}
                              {category.title}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Student course enrollment */}
            {isUserRole && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Allowed Courses
                  </h2>
                  {form.categoryIds.length > 0 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                      {form.categoryIds.length} selected
                    </span>
                  )}
                </div>
                <div className="px-6 py-6">
                  {categories.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500">No active courses found.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categories.map((category) => {
                        const checked = form.categoryIds.includes(category.id);
                        return (
                          <label
                            key={category.id}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition ${
                              checked
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-600"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleCategory(category.id)}
                              className="h-4 w-4 rounded accent-blue-600 flex-shrink-0"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {category.flag_emoji ? `${category.flag_emoji} ` : ""}
                              {category.title}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pb-2">
              <button
                type="button"
                onClick={() => navigate("/dashboard/admin-users")}
                className="px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || (!isEdit && !canCreateNewUsers)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {submitting ? "Saving..." : isEdit ? "Update User" : "Create User"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}