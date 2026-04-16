import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { usersApi } from "../api";
import UserForm from "../components/UserForm";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

export default function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getById(id)
      .then(({ data }) => setUser(data.data.user))
      .catch(() => { toast.error("User not found"); navigate("/users"); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data) => {
    try {
      await usersApi.update(id, data);
      toast.success("User updated!");
      navigate(`/users/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
      throw err;
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="xl" /></div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><FiArrowLeft /></button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit User</h1>
          <p className="text-sm text-gray-400">{user?.name} · {user?.email}</p>
        </div>
      </div>
      <div className="card">
        <UserForm initialValues={user} onSubmit={handleSubmit} submitLabel="Save Changes" />
      </div>
    </div>
  );
}
