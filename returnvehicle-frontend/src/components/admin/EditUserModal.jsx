// src/components/admin/EditUserModal.jsx
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { adminUpdateUser } from "../../services/adminApi";

export default function EditUserModal({ user, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    role: user.role,
    status: user.status,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedUser = await adminUpdateUser(user.uid, formData);
      onUpdate(updatedUser);
      toast.success("User updated");
      onClose();
    } catch (err) {
      toast.error(err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-slate-900">
          Edit: {user.displayName}
        </h3>
        <p className="text-sm text-slate-500">{user.email}</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="mt-1 w-full rounded-xl border-slate-300"
            >
              <option value="user">user</option>
              <option value="driver">driver</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="mt-1 w-full rounded-xl border-slate-300"
            >
              <option value="approved">approved</option>
              <option value="blocked">blocked</option>
            </select>
          </div>
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
