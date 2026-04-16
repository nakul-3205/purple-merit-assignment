import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiFilter, FiEye } from "react-icons/fi";
import { usersApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { canCreateUser, canDeleteUser, canChangeStatus } from "../utils/permissions";
import { RoleBadge, StatusBadge } from "../components/Badge";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const LIMIT = 10;

export default function UserList() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState({ users: [], pagination: { page: 1, totalPages: 1, total: 0, limit: LIMIT } });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", role: "", status: "", page: 1, limit: LIMIT });
  const [deleteModal, setDeleteModal] = useState({ open: false, userId: null, userName: "" });
  const [statusModal, setStatusModal] = useState({ open: false, userId: null, userName: "", currentStatus: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (!params.search) delete params.search;
      if (!params.role) delete params.role;
      if (!params.status) delete params.status;
      const { data: res } = await usersApi.list(params);
      setData(res.data);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }));
  const handleFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value, page: 1 }));
  const handlePage = (page) => setFilters((f) => ({ ...f, page }));

  const confirmDelete = async () => {
    setActionLoading(true);
    try {
      await usersApi.delete(deleteModal.userId);
      toast.success("User deleted");
      setDeleteModal({ open: false, userId: null, userName: "" });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmToggle = async () => {
    setActionLoading(true);
    try {
      await usersApi.toggleStatus(statusModal.userId);
      const next = statusModal.currentStatus === "active" ? "deactivated" : "activated";
      toast.success(`User ${next}`);
      setStatusModal({ open: false, userId: null, userName: "", currentStatus: "" });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Status change failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all system users</p>
        </div>
        {canCreateUser(currentUser) && (
          <Link to="/users/create" className="btn-primary">
            <FiPlus size={16} /> Add User
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-5 !p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-52">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              value={filters.search}
              onChange={handleSearch}
              placeholder="Search by name or email…"
              className="input-field pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter size={15} className="text-gray-400" />
            <select value={filters.role} onChange={handleFilter("role")} className="input-field w-36">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </select>
            <select value={filters.status} onChange={handleFilter("status")} className="input-field w-36">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="xl" /></div>
        ) : data.users.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FiSearch size={36} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No users found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["User", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 last:text-right">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-bold flex-shrink-0">
                        {u.name[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{u.email}</td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(`/users/${u._id}`)} title="View" className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-colors">
                        <FiEye size={15} />
                      </button>
                      <button onClick={() => navigate(`/users/${u._id}/edit`)} title="Edit" className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-colors">
                        <FiEdit2 size={15} />
                      </button>
                      {canChangeStatus(currentUser) && String(u._id) !== String(currentUser._id) && (
                        <button
                          onClick={() => setStatusModal({ open: true, userId: u._id, userName: u.name, currentStatus: u.status })}
                          title={u.status === "active" ? "Deactivate" : "Activate"}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-amber-600 transition-colors"
                        >
                          {u.status === "active" ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                        </button>
                      )}
                      {canDeleteUser(currentUser) && String(u._id) !== String(currentUser._id) && (
                        <button
                          onClick={() => setDeleteModal({ open: true, userId: u._id, userName: u.name })}
                          title="Delete"
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && data.pagination.totalPages > 1 && (
          <Pagination pagination={data.pagination} onPageChange={handlePage} />
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete User"
        message={`Are you sure you want to permanently delete "${deleteModal.userName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ open: false, userId: null, userName: "" })}
      />
      <ConfirmModal
        isOpen={statusModal.open}
        title={statusModal.currentStatus === "active" ? "Deactivate User" : "Activate User"}
        message={`Are you sure you want to ${statusModal.currentStatus === "active" ? "deactivate" : "activate"} "${statusModal.userName}"?`}
        confirmLabel={statusModal.currentStatus === "active" ? "Deactivate" : "Activate"}
        variant={statusModal.currentStatus === "active" ? "danger" : "primary"}
        loading={actionLoading}
        onConfirm={confirmToggle}
        onCancel={() => setStatusModal({ open: false, userId: null, userName: "", currentStatus: "" })}
      />
    </div>
  );
}
