import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import LoadingSpinner from "./LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { isAdmin } from "../utils/permissions";

export default function UserForm({ initialValues = {}, onSubmit, submitLabel = "Save", isCreate = false }) {
  const { user: currentUser } = useAuth();
  const [form, setForm] = useState({
    name: initialValues.name || "",
    email: initialValues.email || "",
    password: "",
    role: initialValues.role || "user",
    status: initialValues.status || "active",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = "Name must be at least 2 characters";
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Valid email is required";
    if (isCreate && (!form.password || form.password.length < 6)) errs.password = "Password must be at least 6 characters";
    if (!isCreate && form.password && form.password.length < 6) errs.password = "Password must be at least 6 characters";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, role: form.role, status: form.status };
      if (form.password) payload.password = form.password;
      await onSubmit(payload);
    } catch (err) {
      const apiErrors = err.response?.data?.errors || [];
      const fieldErrors = {};
      apiErrors.forEach((e) => { fieldErrors[e.field] = e.message; });
      if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
    } finally {
      setLoading(false);
    }
  };

  const canChangeRole = isAdmin(currentUser) && !(initialValues._id && String(initialValues._id) === String(currentUser._id));
  const canChangeStatus = isAdmin(currentUser) && !(initialValues._id && String(initialValues._id) === String(currentUser._id));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="label">Full Name <span className="text-red-500">*</span></label>
        <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Jane Doe" />
        {errors.name && <p className="error-text">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="label">Email Address <span className="text-red-500">*</span></label>
        <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="jane@company.com" />
        {errors.email && <p className="error-text">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="label">{isCreate ? "Password" : "New Password"} {isCreate && <span className="text-red-500">*</span>}</label>
        <div className="relative">
          <input
            name="password"
            type={showPass ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            className="input-field pr-10"
            placeholder={isCreate ? "Min 6 characters" : "Leave blank to keep current"}
          />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>
        {errors.password && <p className="error-text">{errors.password}</p>}
      </div>

      {/* Role + Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Role</label>
          <select name="role" value={form.role} onChange={handleChange} disabled={!canChangeRole} className="input-field">
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" value={form.status} onChange={handleChange} disabled={!canChangeStatus} className="input-field">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="pt-2">
        <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : submitLabel}
        </button>
      </div>
    </form>
  );
}
