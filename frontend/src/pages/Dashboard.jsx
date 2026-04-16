import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiUsers, FiUserCheck, FiUserX, FiShield, FiUser, FiTrendingUp } from "react-icons/fi";
import { usersApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { isAdminOrManager } from "../utils/permissions";
import { RoleBadge, StatusBadge } from "../components/Badge";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdminOrManager(user)) { setLoading(false); return; }
    usersApi.stats()
      .then(({ data }) => setStats(data.data))
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, <span className="font-medium text-indigo-600">{user?.name}</span>
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="xl" /></div>
      ) : isAdminOrManager(user) && stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard icon={FiUsers} label="Total Users" value={stats.total} color="bg-indigo-500" />
            <StatCard icon={FiUserCheck} label="Active Users" value={stats.active} color="bg-green-500" />
            <StatCard icon={FiUserX} label="Inactive" value={stats.inactive} color="bg-red-400" />
            <StatCard icon={FiShield} label="Admins" value={stats.admins} color="bg-purple-500" sub={`${stats.managers} Manager(s)`} />
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FiTrendingUp className="text-indigo-500" /> Recently Added Users
              </h2>
              <Link to="/users" className="text-sm text-indigo-600 hover:underline font-medium">View all →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Name", "Email", "Role", "Status", "Joined"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4 first:pl-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.recentUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 pr-4 font-medium text-gray-900 text-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                            {u.name[0].toUpperCase()}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-500 text-sm">{u.email}</td>
                      <td className="py-3 pr-4"><RoleBadge role={u.role} /></td>
                      <td className="py-3 pr-4"><StatusBadge status={u.status} /></td>
                      <td className="py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl mb-6">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
              <FiUser size={26} className="text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <div className="mt-1"><RoleBadge role={user?.role} /></div>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">You are logged in as a <strong>User</strong>. You can manage your own profile.</p>
          <Link to="/profile" className="btn-primary">Go to My Profile</Link>
        </div>
      )}
    </div>
  );
}
