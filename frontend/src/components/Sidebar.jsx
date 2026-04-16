import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiGrid, FiUsers, FiUser, FiLogOut, FiShield,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { isAdminOrManager } from "../utils/permissions";
import { RoleBadge } from "./Badge";

const NavItem = ({ to, icon: Icon, label, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
          : "text-gray-400 hover:bg-gray-800 hover:text-white"
      }`
    }
  >
    <Icon size={18} />
    <span>{label}</span>
  </NavLink>
);

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-gray-900 flex flex-col min-h-screen">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg">
            <FiShield size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">UserHub</p>
            <p className="text-gray-500 text-xs">Management System</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 mb-2">Main</p>
        <NavItem to="/dashboard" icon={FiGrid} label="Dashboard" end />
        {isAdminOrManager(user) && <NavItem to="/users" icon={FiUsers} label="Users" />}
        <NavItem to="/profile" icon={FiUser} label="My Profile" />
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-gray-800">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.name}</p>
            <RoleBadge role={user?.role} />
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <FiLogOut size={18} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
