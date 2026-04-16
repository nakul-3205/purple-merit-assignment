import React, { useState } from "react";
import { FiUser, FiLock, FiSave, FiCalendar } from "react-icons/fi";
import { usersApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { RoleBadge, StatusBadge } from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-sm text-gray-400">{label}</span>
    <span className="text-sm text-gray-700 font-medium">{value || "—"}</span>
  </div>
);

export default function Profile() {
  const { user, setUser } = useAuth();
  const [nameForm, setNameForm] = useState({ name: user?.name || "" });
  const [passForm, setPassForm] = useState({ password: "", confirmPassword: "" });
  const [nameLoading, setNameLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passErrors, setPassErrors] = useState({});

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!nameForm.name.trim() || nameForm.name.trim().length < 2) { toast.error("Name must be at least 2 characters"); return; }
    setNameLoading(true);
    try {
      const { data } = await usersApi.update(user._id, { name: nameForm.name });
      setUser((u) => ({ ...u, name: data.data.user.name }));
      toast.success("Name updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setNameLoading(false);
    }
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!passForm.password || passForm.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (passForm.password !== passForm.confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (Object.keys(errs).length) { setPassErrors(errs); return; }
    setPassLoading(true);
    try {
      await usersApi.update(user._id, { password: passForm.password });
      toast.success("Password changed!");
      setPassForm({ password: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account settings</p>
      </div>

      <div className="grid gap-5">
        {/* Info card */}
        <div className="card">
          <div className="flex items-center gap-5 pb-5 mb-4 border-b border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <div className="flex gap-2 mt-2">
                <RoleBadge role={user?.role} />
                <StatusBadge status={user?.status} />
              </div>
            </div>
          </div>
          <InfoRow label="User ID" value={user?._id} />
          <InfoRow label="Last Login" value={user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : "—"} />
        </div>

        {/* Edit name */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FiUser className="text-indigo-500" /> Update Name
          </h3>
          <form onSubmit={handleNameSubmit} className="flex gap-3">
            <input
              value={nameForm.name}
              onChange={(e) => setNameForm({ name: e.target.value })}
              className="input-field flex-1"
              placeholder="Your full name"
            />
            <button type="submit" className="btn-primary" disabled={nameLoading}>
              {nameLoading ? <LoadingSpinner size="sm" /> : <><FiSave size={15} /> Save</>}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FiLock className="text-indigo-500" /> Change Password
          </h3>
          <form onSubmit={handlePassSubmit} className="space-y-4">
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                value={passForm.password}
                onChange={(e) => { setPassForm((f) => ({ ...f, password: e.target.value })); setPassErrors((x) => ({ ...x, password: "" })); }}
                className="input-field"
                placeholder="Min 6 characters"
              />
              {passErrors.password && <p className="error-text">{passErrors.password}</p>}
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                value={passForm.confirmPassword}
                onChange={(e) => { setPassForm((f) => ({ ...f, confirmPassword: e.target.value })); setPassErrors((x) => ({ ...x, confirmPassword: "" })); }}
                className="input-field"
                placeholder="Repeat password"
              />
              {passErrors.confirmPassword && <p className="error-text">{passErrors.confirmPassword}</p>}
            </div>
            <button type="submit" className="btn-primary" disabled={passLoading}>
              {passLoading ? <LoadingSpinner size="sm" /> : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
