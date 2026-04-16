import React from "react";
import { ROLE_COLORS, STATUS_COLORS, ROLE_LABELS } from "../utils/permissions";

export function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_COLORS[role] || "bg-gray-100 text-gray-600"}`}>
      {ROLE_LABELS[role] || role}
    </span>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[status] || "bg-gray-100 text-gray-600"}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === "active" ? "bg-green-500" : "bg-red-500"}`} />
      {status}
    </span>
  );
}
