import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiArrowLeft, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiCalendar, FiUser } from "react-icons/fi";
import { usersApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { canDeleteUser, canChangeStatus } from "../utils/permissions";
import { RoleBadge, StatusBadge } from "../components/Badge";
import ConfirmModal from "../components/ConfirmModal";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
    <span className="text-sm text-gray-400 w-40 flex-shrink-0">{label}</span>
    <span className="text-sm text-gray-800 font-medium text-right">{value || "—"}</span>
  </div>
);

export default function UserDetail() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    usersApi.getById(id)
      .then(({ data }) => setUser(data.data.user))
      .catch((err) => {
        toast.error(err.response?.data?.message || "User not found");
        navigate("/users");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await usersApi.delete(id);
      toast.success("User deleted");
      navigate("/users");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    setActionLoading(true);
    try {
      const { data } = await usersApi.toggleStatus(id);
      setUser(data.data.user);
      toast.success(`User ${data.data.user.status === "active" ? "activated" : "deactivated"}`);
      setStatusModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="xl" /></div>;
  if (!user) return null;

  const isSelf = String(currentUser._id) === String(user._id);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><FiArrowLeft /></button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">User Profile</h1>
          <p className="text-sm text-gray-400">View user details and audit info</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Link to={`/users/${id}/edit`} className="btn-secondary"><FiEdit2 size={15} /> Edit</Link>
          {canChangeStatus(currentUser) && !isSelf && (
            <button onClick={() => setStatusModal(true)} className="btn-secondary">
              {user.status === "active" ? <FiToggleLeft size={15} /> : <FiToggleRight size={15} />}
              {user.status === "active" ? "Deactivate" : "Activate"}
            </button>
          )}
          {canDeleteUser(currentUser) && !isSelf && (
            <button onClick={() => setDeleteModal(true)} className="btn-danger"><FiTrash2 size={15} /> Delete</button>
          )}
        </div>
      </div>

      <div className="grid gap-5">
        {/* Profile card */}
        <div className="card">
          <div className="flex items-center gap-5 pb-5 mb-5 border-b border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold">
              {user.name[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <RoleBadge role={user.role} />
                <StatusBadge status={user.status} />
              </div>
            </div>
          </div>
          <InfoRow label="Last Login" value={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"} />
        </div>

        {/* Audit trail */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FiCalendar className="text-indigo-500" /> Audit Information
          </h3>
          <InfoRow label="Created At" value={new Date(user.createdAt).toLocaleString()} />
          <InfoRow label="Created By" value={user.createdBy ? `${user.createdBy.name} (${user.createdBy.email})` : "System"} />
          <InfoRow label="Updated At" value={new Date(user.updatedAt).toLocaleString()} />
          <InfoRow label="Updated By" value={user.updatedBy ? `${user.updatedBy.name} (${user.updatedBy.email})` : "—"} />
          <InfoRow label="User ID" value={user._id} />
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal}
        title="Delete User"
        message={`Are you sure you want to permanently delete "${user.name}"?`}
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(false)}
      />
      <ConfirmModal
        isOpen={statusModal}
        title={user.status === "active" ? "Deactivate User" : "Activate User"}
        message={`Change status of "${user.name}" to ${user.status === "active" ? "inactive" : "active"}?`}
        confirmLabel={user.status === "active" ? "Deactivate" : "Activate"}
        variant={user.status === "active" ? "danger" : "primary"}
        loading={actionLoading}
        onConfirm={handleToggleStatus}
        onCancel={() => setStatusModal(false)}
      />
    </div>
  );
}
