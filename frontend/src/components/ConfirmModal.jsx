import React from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import LoadingSpinner from "./LoadingSpinner";

export default function ConfirmModal({ isOpen, title, message, confirmLabel = "Confirm", variant = "danger", onConfirm, onCancel, loading = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-fade-in">
        <button onClick={onCancel} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
          <FiX size={18} />
        </button>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${variant === "danger" ? "bg-red-100" : "bg-amber-100"}`}>
          <FiAlertTriangle className={variant === "danger" ? "text-red-600" : "text-amber-600"} size={22} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary" disabled={loading}>Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={variant === "danger" ? "btn-danger" : "btn-primary"}
          >
            {loading ? <LoadingSpinner size="sm" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
