import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { usersApi } from "../api";
import UserForm from "../components/UserForm";
import toast from "react-hot-toast";

export default function UserCreate() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      await usersApi.create(data);
      toast.success("User created successfully!");
      navigate("/users");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user");
      throw err;
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><FiArrowLeft /></button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Create New User</h1>
          <p className="text-sm text-gray-400">Add a new user to the system</p>
        </div>
      </div>
      <div className="card">
        <UserForm onSubmit={handleSubmit} submitLabel="Create User" isCreate />
      </div>
    </div>
  );
}
