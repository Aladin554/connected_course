import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { AxiosError } from "axios";
import { Edit, Plus, Shield, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import api from "../../../api/axios";
import "react-toastify/dist/ReactToastify.css";

type AdminAllowedIp = {
  id: number;
  ip: string;
  description: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

type FormState = {
  ip: string;
  description: string;
  is_active: boolean;
};

const initialFormState: FormState = {
  ip: "",
  description: "",
  is_active: true,
};

function getErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message || fallback;
}

function normalizeRow(row: {
  id: number;
  ip: string;
  description: string | null;
  is_active: boolean | number;
  created_at?: string;
  updated_at?: string;
}): AdminAllowedIp {
  return {
    ...row,
    is_active: row.is_active === true || row.is_active === 1,
  };
}

export default function AdminAllowedIps() {
  const [rows, setRows] = useState<AdminAllowedIp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [perPage, setPerPage] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const fetchRows = async () => {
    try {
      setLoading(true);
      const res = await api.get<
        {
          id: number;
          ip: string;
          description: string | null;
          is_active: boolean | number;
          created_at?: string;
          updated_at?: string;
        }[]
      >("/admin-allowed-ips");

      setRows((res.data || []).map(normalizeRow));
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load allowed IPs"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();

    if (!needle) {
      return rows;
    }

    return rows.filter((row) => {
      const description = row.description || "";
      return (
        row.ip.toLowerCase().includes(needle) ||
        description.toLowerCase().includes(needle)
      );
    });
  }, [rows, search]);

  const totalRows = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / perPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const resetForm = () => {
    setEditingId(null);
    setForm(initialFormState);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const ip = form.ip.trim();
    if (!ip) {
      toast.error("IP/CIDR is required");
      return;
    }

    const payload = {
      ip,
      description: form.description.trim() || null,
      is_active: form.is_active,
    };

    try {
      setSubmitting(true);

      if (editingId) {
        await api.put(`/admin-allowed-ips/${editingId}`, payload);
        toast.success("Allowed IP updated");
      } else {
        await api.post("/admin-allowed-ips", payload);
        toast.success("Allowed IP added");
      }

      resetForm();
      fetchRows();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save allowed IP"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (row: AdminAllowedIp) => {
    setEditingId(row.id);
    setForm({
      ip: row.ip,
      description: row.description || "",
      is_active: row.is_active,
    });
  };

  const toggleStatus = async (row: AdminAllowedIp) => {
    try {
      await api.patch(`/admin-allowed-ips/${row.id}`, {
        is_active: !row.is_active,
      });
      toast.success(
        `IP ${!row.is_active ? "activated" : "deactivated"} successfully`
      );
      fetchRows();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update status"));
    }
  };

  const detectMyIp = async () => {
    try {
      const res = await api.get<unknown>("/show-ip");
      const data = res.data;

      let ip = "";
      if (typeof data === "string") {
        ip = data;
      } else if (
        data &&
        typeof data === "object" &&
        "your_ip" in data &&
        typeof (data as { your_ip?: unknown }).your_ip === "string"
      ) {
        ip = (data as { your_ip: string }).your_ip;
      }

      if (!ip) {
        toast.error("Could not detect current IP");
        return;
      }

      setForm((prev) => ({ ...prev, ip }));
      toast.success("Current IP loaded");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to detect current IP"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) {
      return;
    }

    try {
      await api.delete(`/admin-allowed-ips/${deleteTargetId}`);
      toast.success("Allowed IP deleted");
      setDeleteTargetId(null);
      fetchRows();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to delete allowed IP"));
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-700 lg:p-6 dark:bg-gray-900 bg-white relative w-full max-w-[950px] mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        theme="colored"
      />

      <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-3">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 text-center sm:text-left flex items-center gap-2">
          <Shield size={24} /> Admin IP Security
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/40"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={form.ip}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, ip: event.target.value }))
            }
            placeholder="IP or CIDR (e.g. 203.0.113.10 or 203.0.113.0/24)"
            className="md:col-span-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg text-base placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
            placeholder="Description (optional)"
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg text-base placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, is_active: event.target.checked }))
              }
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            Active
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={detectMyIp}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Use My Current IP
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              <Plus size={16} /> {editingId ? "Update IP" : "Add IP"}
            </button>
          </div>
        </div>
      </form>

      <div className="flex flex-col md:flex-row justify-between mb-4 gap-3 items-center">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-base">
          <span>Show</span>
          <select
            value={perPage}
            onChange={(event) => {
              setPerPage(Number(event.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-2 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
        </div>

        <input
          type="text"
          placeholder="Search IP or description..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg text-base placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-72"
        />
      </div>

      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-base bg-white dark:bg-gray-900">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                IP / CIDR
              </th>
              <th className="px-6 py-4 text-left font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                Description
              </th>
              <th className="px-6 py-4 text-left font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                Status
              </th>
              <th className="px-6 py-4 text-left font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                Updated
              </th>
              <th className="px-6 py-4 text-left font-medium text-gray-700 dark:text-gray-300">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-12 text-gray-500 dark:text-gray-400"
                >
                  Loading...
                </td>
              </tr>
            ) : paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-12 text-gray-500 dark:text-gray-400"
                >
                  No allowed IPs found
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-mono">
                    {row.ip}
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                    {row.description || "-"}
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => toggleStatus(row)}
                      className={`px-3 py-1.5 rounded text-white text-sm font-medium transition ${
                        row.is_active
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {row.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                    {row.updated_at
                      ? new Date(row.updated_at).toISOString().split("T")[0]
                      : "-"}
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button
                      onClick={() => handleEdit(row)}
                      className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition"
                      aria-label="Edit allowed IP"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(row.id)}
                      className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                      aria-label="Delete allowed IP"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : paginatedRows.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No allowed IPs found
          </div>
        ) : (
          paginatedRows.map((row) => (
            <div
              key={row.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm"
            >
              <div className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                {row.ip}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {row.description || "-"}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => toggleStatus(row)}
                  className={`px-3 py-1.5 rounded text-white text-sm font-medium ${
                    row.is_active ? "bg-green-600" : "bg-red-600"
                  }`}
                >
                  {row.is_active ? "Active" : "Inactive"}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(row)}
                    className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(row.id)}
                    className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mt-6 text-sm text-gray-700 dark:text-gray-300">
        <div>
          Showing {totalRows === 0 ? 0 : (currentPage - 1) * perPage + 1} to{" "}
          {Math.min(currentPage * perPage, totalRows)} of {totalRows} entries
        </div>
        <div className="flex gap-1 mt-3 md:mt-0">
          <button
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg transition ${
                  num === currentPage
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {num}
              </button>
            )
          )}
          <button
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Next
          </button>
        </div>
      </div>

      {deleteTargetId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="text-red-600 dark:text-red-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Delete Allowed IP?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
