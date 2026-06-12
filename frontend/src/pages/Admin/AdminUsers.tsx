// AdminUsers.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Edit, Plus, Trash2, Users, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import api from "../../api/axios.ts";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Role { id: number; name: string; }
interface User {
  id: number; first_name: string; last_name: string; email: string;
  role_id: number; panel_status: number | string; role?: Role;
  data_range: number | string; can_create_users: number | string;
  created_at?: string; updated_at?: string;
}

const Avatar = ({ name }: { name: string }) => {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const palettes = [
    ["bg-blue-100 dark:bg-blue-900/40", "text-blue-600 dark:text-blue-300"],
    ["bg-emerald-100 dark:bg-emerald-900/40", "text-emerald-600 dark:text-emerald-300"],
    ["bg-violet-100 dark:bg-violet-900/40", "text-violet-600 dark:text-violet-300"],
    ["bg-amber-100 dark:bg-amber-900/40", "text-amber-600 dark:text-amber-300"],
    ["bg-rose-100 dark:bg-rose-900/40", "text-rose-600 dark:text-rose-300"],
  ];
  const [bg, text] = palettes[name.charCodeAt(0) % palettes.length];
  return (
    <div className={`w-9 h-9 rounded-xl ${bg} ${text} flex items-center justify-center flex-shrink-0 text-sm font-bold`}>
      {initials}
    </div>
  );
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  const canAddUsers = Number(currentUser?.role_id) === 1 || Number(currentUser?.can_create_users) === 1;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      const type = location.state.type || "success";
      // @ts-ignore
      toast[type](location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    api.get("/profile").then((res) => setCurrentUser(res.data)).catch(() => setCurrentUser(null));
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const applyServerUpdate = (userId: number, serverData: any) => {
    setUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      const maybeUser = serverData.user ?? serverData;
      if (maybeUser && maybeUser.id === userId && typeof maybeUser === "object") return { ...u, ...maybeUser };
      const newU = { ...u };
      if (serverData.hasOwnProperty("data_range")) newU.data_range = Number(serverData.data_range);
      if (serverData.hasOwnProperty("can_create_users")) newU.can_create_users = Number(serverData.can_create_users);
      if (serverData.hasOwnProperty("panel_status")) newU.panel_status = Number(serverData.panel_status);
      return newU;
    }));
  };

  const togglePermission = async (user: User) => {
    if (currentUser?.id === user.id) { toast.error("You cannot change your own permissions!"); return; }
    const oldVal = user.can_create_users;
    const optimistic = Number(oldVal) === 1 ? 0 : 1;
    setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, can_create_users: optimistic } : u));
    try {
      const res = await api.patch(`/users/${user.id}/toggle-permission`);
      const body = res.data ?? {};
      if (body.user || body.id) applyServerUpdate(user.id, body.user ?? body);
      else if (body.hasOwnProperty("can_create_users")) applyServerUpdate(user.id, { can_create_users: body.can_create_users });
      else fetchUsers();
      const finalValue = body.can_create_users ?? body.user?.can_create_users;
      toast.success(`Permission: ${finalValue === 1 ? "Active" : "Inactive"}`);
    } catch (err: any) {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, can_create_users: oldVal } : u));
      toast.error(err?.response?.data?.message || "Failed to update permission");
    }
  };

  // ── NEW: Toggle panel status ──
  const togglePanelStatus = async (user: User) => {
    if (currentUser?.id === user.id) { toast.error("You cannot change your own panel status!"); return; }
    const oldVal = user.panel_status;
    const optimistic = Number(oldVal) === 1 ? 0 : 1;
    setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, panel_status: optimistic } : u));
    try {
      const res = await api.patch(`/users/${user.id}/toggle-panel-status`);
      const body = res.data ?? {};
      if (body.hasOwnProperty("panel_status")) applyServerUpdate(user.id, { panel_status: body.panel_status });
      else if (body.user || body.id) applyServerUpdate(user.id, body.user ?? body);
      else fetchUsers();
      const finalValue = body.panel_status ?? body.user?.panel_status;
      toast.success(`Panel status: ${Number(finalValue) === 1 ? "Active" : "Inactive"}`);
    } catch (err: any) {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, panel_status: oldVal } : u));
      toast.error(err?.response?.data?.message || "Failed to update panel status");
    }
  };

  const confirmDelete = (id: number) => {
    if (currentUser?.id === id) { toast.error("You cannot delete yourself!"); return; }
    setDeleteUserId(id);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;
    try {
      await api.delete(`/users/${deleteUserId}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error deleting user");
    } finally {
      setIsModalOpen(false);
      setDeleteUserId(null);
    }
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelected(!selectAll ? users.map((u) => u.id) : []);
  };

  const toggleSelect = (id: number) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const formatDate = (dateString?: string) =>
    !dateString ? "—" : new Date(dateString).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users
      .filter((u) => {
        if (!term) return true;
        const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
        return fullName.includes(term) || u.email.toLowerCase().includes(term) || (u.role?.name.toLowerCase() || "").includes(term);
      })
      .filter((u) => roleFilter === "all" ? true : u.role?.name.toLowerCase() === roleFilter)
      .sort((a, b) => {
        if (!a.created_at || !b.created_at) return 0;
        return sortOrder === "asc"
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [users, search, roleFilter, sortOrder]);

  const totalRows = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const startEntry = totalRows === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const endEntry = Math.min(currentPage * perPage, totalRows);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }, [totalPages, currentPage]);

  const activeFilterCount = (roleFilter !== "all" ? 1 : 0) + (sortOrder !== "desc" ? 1 : 0);

  // ── Panel status badge — now a clickable button ──
  const PanelBadge = ({ user }: { user: User }) => {
    const active = Number(user.panel_status) === 1;
    const isSelf = currentUser?.id === user.id;
    return (
      <button
        onClick={() => togglePanelStatus(user)}
        disabled={isSelf}
        title={isSelf ? "Cannot change your own panel status" : `Click to ${active ? "deactivate" : "activate"}`}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition
          ${active
            ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-800/50"
            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }
          ${isSelf ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? "bg-violet-500" : "bg-gray-400"}`} />
        {active ? "Active" : "Inactive"}
      </button>
    );
  };

  // desktop col count
  const desktopColCount = currentUser?.role_id === 1 ? 8 : 7;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-950 p-3 sm:p-6 md:p-8">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">

        {/* ── Header ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Users size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">Management</p>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">Users</h1>
            </div>
          </div>
          {canAddUsers && (
            <Link
              to="/dashboard/admin-users/add"
              className="flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-200 dark:shadow-none transition"
            >
              <Plus size={15} />
              <span className="hidden xs:inline">Add User</span>
              <span className="xs:hidden">Add</span>
            </Link>
          )}
        </div>

        {/* ── Table Card ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">

          {/* ── Toolbar ── */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
            {/* Row 1: search + filter toggle */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-8 pr-4 py-2 sm:py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`sm:hidden flex items-center gap-1.5 px-.5 py-2 rounded-xl border-2 text-sm font-semibold transition flex-shrink-0 ${
                  showFilters || activeFilterCount > 0
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                <SlidersHorizontal size={15} />
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Desktop filters inline */}
              <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value as any); setCurrentPage(1); }}
                  className="border-2 border-gray-200 dark:border-gray-700 rounded-xl px-.5 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="all">All roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="border-2 border-gray-200 dark:border-gray-700 rounded-xl px-.5 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="desc">Newest first</option>
                  <option value="asc">Oldest first</option>
                </select>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>Show</span>
                  <select
                    value={perPage}
                    onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="border-2 border-gray-200 dark:border-gray-700 rounded-xl px-.5 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 2: mobile filter panel */}
            {showFilters && (
              <div className="sm:hidden grid grid-cols-3 gap-2 pt-1">
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value as any); setCurrentPage(1); }}
                  className="border-2 border-gray-200 dark:border-gray-700 rounded-xl px-2 py-2 text-xs bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="all">All roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="border-2 border-gray-200 dark:border-gray-700 rounded-xl px-2 py-2 text-xs bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="desc">Newest first</option>
                  <option value="asc">Oldest first</option>
                </select>
                <select
                  value={perPage}
                  onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="border-2 border-gray-200 dark:border-gray-700 rounded-xl px-2 py-2 text-xs bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            )}
          </div>

          {/* ── Desktop Table ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-10">
                    <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} className="w-4 h-4 rounded accent-blue-600 cursor-pointer" />
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">User</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Role</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Panel</th>
                  {currentUser?.role_id === 1 && (
                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Permission</th>
                  )}
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Created</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Updated</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: desktopColCount }).map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" style={{ width: j === 1 ? "60%" : "40%" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={desktopColCount} className="py-16 text-center">
                      <Users className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                      <p className="text-gray-400 font-medium">No users found</p>
                      {search && <p className="text-sm text-gray-400 mt-1">Try a different search term</p>}
                    </td>
                  </tr>
                ) : (
                  paginated.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition">
                      <td className="px-6 py-4 text-center">
                        <input type="checkbox" checked={selected.includes(user.id)} onChange={() => toggleSelect(user.id)} className="w-4 h-4 rounded accent-blue-600 cursor-pointer" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={`${user.first_name} ${user.last_name}`} />
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">{user.first_name} {user.last_name}</div>
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${user.role?.name.toLowerCase() === "admin" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}>
                          {user.role?.name || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <PanelBadge user={user} />
                      </td>
                      {currentUser?.role_id === 1 && (
                        <td className="px-6 py-4">
                          <button
                            onClick={() => togglePermission(user)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${Number(user.can_create_users) === 1 ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200" : "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200"}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${Number(user.can_create_users) === 1 ? "bg-emerald-500" : "bg-red-400"}`} />
                            {Number(user.can_create_users) === 1 ? "Allowed" : "Denied"}
                          </button>
                        </td>
                      )}
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">{formatDate(user.created_at)}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">{formatDate(user.updated_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => navigate(`/dashboard/admin-users/${user.id}/edit`)} className="p-2.5 rounded-xl text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition" title="Edit"><Edit size={17} /></button>
                          <button onClick={() => confirmDelete(user.id)} className="p-2.5 rounded-xl text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition" title="Delete"><Trash2 size={17} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards ── */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-4 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-36 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    <div className="h-3 w-48 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  </div>
                </div>
              ))
            ) : paginated.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                <p className="text-gray-400 font-medium">No users found</p>
                {search && <p className="text-sm text-gray-400 mt-1">Try a different search term</p>}
              </div>
            ) : (
              paginated.map((user) => (
                <div key={user.id} className="px-4 py-3.5 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition">
                  <div className="flex items-center gap-3">
                    {/* checkbox + avatar */}
                    <input type="checkbox" checked={selected.includes(user.id)} onChange={() => toggleSelect(user.id)} className="w-4 h-4 rounded accent-blue-600 cursor-pointer flex-shrink-0" />
                    <Avatar name={`${user.first_name} ${user.last_name}`} />

                    {/* main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                          {user.first_name} {user.last_name}
                        </span>
                        {/* action buttons top-right */}
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => navigate(`/dashboard/admin-users/${user.id}/edit`)} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => confirmDelete(user.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                        {user.email}
                      </div>

                      {/* badges row */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${user.role?.name.toLowerCase() === "admin" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}>
                          {user.role?.name || "—"}
                        </span>

                        <PanelBadge user={user} />

                        {currentUser?.role_id === 1 && (
                          <button
                            onClick={() => togglePermission(user)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold transition ${Number(user.can_create_users) === 1 ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300" : "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${Number(user.can_create_users) === 1 ? "bg-emerald-500" : "bg-red-400"}`} />
                            {Number(user.can_create_users) === 1 ? "Allowed" : "Denied"}
                          </button>
                        )}

                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                          {formatDate(user.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Pagination Footer ── */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
            <div className="flex flex-col xs:flex-row items-center justify-between gap-3">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 order-2 xs:order-1">
                <span className="font-semibold text-gray-700 dark:text-gray-200">{startEntry}–{endEntry}</span>
                {" "}of{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-200">{totalRows}</span> users
              </p>

              <div className="flex items-center gap-1 order-1 xs:order-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 sm:p-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={15} />
                </button>

                {pageNumbers.map((num, i) =>
                  num === "..." ? (
                    <span key={`e-${i}`} className="px-1 text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={num}
                      onClick={() => setCurrentPage(num as number)}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs sm:text-sm font-semibold border-2 transition ${num === currentPage ? "bg-blue-600 border-blue-600 text-white" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      {num}
                    </button>
                  )
                )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 sm:p-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-500" size={24} />
            </div>
            <h3 className="text-center text-lg font-bold text-gray-900 dark:text-white mb-1">Delete user?</h3>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">This action is permanent and cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}