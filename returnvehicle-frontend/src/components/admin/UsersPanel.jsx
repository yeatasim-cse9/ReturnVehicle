// src/components/admin/UsersPanel.jsx
import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { adminListUsers, adminUpdateUser } from "../../services/adminApi";
import EditUserModal from "./EditUserModal";
import { User, Pencil } from "lucide-react";

// Helper components inside this file for simplicity
function Spinner({ label = "Loading..." }) {
  return (
    <div className="inline-flex items-center gap-2 text-slate-600 text-sm">
      {" "}
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />{" "}
      {label}{" "}
    </div>
  );
}

function Avatar({ photoURL, name, size = 32 }) {
  const letter = (name || "").charAt(0).toUpperCase();
  return photoURL ? (
    <img
      src={photoURL}
      alt={name}
      className="rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="rounded-full bg-slate-200 text-slate-700 grid place-items-center font-semibold"
      style={{ width: size, height: size }}
    >
      {" "}
      {letter || <User size={16} />}{" "}
    </div>
  );
}

const roleColors = {
  user: "bg-slate-100 text-slate-700",
  driver: "bg-blue-100 text-blue-700",
  admin: "bg-purple-100 text-purple-700",
};
const statusColors = {
  approved: "bg-green-100 text-green-700",
  blocked: "bg-red-100 text-red-700",
};

// Main Panel Component
export default function UsersPanel() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminListUsers({ limit: 100 }); // Increase limit or add pagination
      setUsers(data.items || []);
    } catch (err) {
      toast.error(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (updatedUser) => {
    setUsers(users.map((u) => (u.uid === updatedUser.uid ? updatedUser : u)));
  };

  if (loading) return <Spinner />;

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-600 font-medium">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.uid}>
                <td className="px-4 py-3 flex items-center gap-3">
                  <Avatar photoURL={user.photoURL} name={user.displayName} />
                  <span className="font-medium text-slate-900">
                    {user.displayName || "N/A"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <div>{user.email}</div>
                  <div className="text-xs">
                    {user.phoneNumber || "No phone"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      roleColors[user.role]
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      statusColors[user.status]
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="p-2 rounded-md hover:bg-slate-100 text-slate-600"
                  >
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
}
