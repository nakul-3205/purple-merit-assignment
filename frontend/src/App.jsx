import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/LoadingSpinner";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserList from "./pages/UserList";
import UserDetail from "./pages/UserDetail";
import UserCreate from "./pages/UserCreate";
import UserEdit from "./pages/UserEdit";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Auth-required shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin + Manager */}
          <Route element={<ProtectedRoute roles={["admin", "manager"]} />}>
            <Route path="/users" element={<UserList />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/users/:id/edit" element={<UserEdit />} />
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/users/create" element={<UserCreate />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
