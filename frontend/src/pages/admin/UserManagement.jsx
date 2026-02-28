import { useState, useEffect } from "react";
import UserCreateModal from "../../components/admin/Usercreatemodal";
import UserEditModal from "../../components/admin/Usereditmodal";
import UserDeleteModal from "../../components/admin/Userdeletemodal";

const API_BASE = "https://127.0.0.1:8000/api";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users`);
      const data = await res.json();
      setUsers(data);
    } catch {
      showMsg("error", "Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const getInitials = (u) => `${u.firstname?.[0] ?? ""}${u.lastname?.[0] ?? ""}`.toUpperCase();

  const roleColor = (role) =>
    role === "admin"
      ? "bg-amber-100 text-amber-700 border border-amber-200"
      : "bg-blue-50 text-blue-600 border border-blue-100";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500 mt-1">{users.length} registered user{users.length > 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={fetchUsers}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Add User</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Toast */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border
            ${message.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
            <span>{message.type === "success" ? "✓" : "✕"}</span>
            {message.text}
          </div>
        )}

        {/* Table — desktop */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hidden md:block">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
              <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-24 text-gray-400 text-sm">No users found</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {getInitials(u)}
                        </div>
                        <span className="font-medium text-gray-800">{u.firstname} {u.lastname}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColor(u.role)}`}>
                        {u.role === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US") : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditUser(u)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition border border-blue-100">
                          Edit
                        </button>
                        <button onClick={() => setDeleteUser(u)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition border border-red-100">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Cards — mobile */}
        <div className="md:hidden flex flex-col gap-3">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
              <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
              No users found
            </div>
          ) : (
            users.map((u) => (
              <div key={u.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {getInitials(u)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{u.firstname} {u.lastname}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColor(u.role)}`}>
                    {u.role === "admin" ? "Admin" : "User"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US") : "—"}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setEditUser(u)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition border border-blue-100">
                      Edit
                    </button>
                    <button onClick={() => setDeleteUser(u)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition border border-red-100">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Modals */}
      {showCreate && (
        <UserCreateModal apiBase={API_BASE} onClose={() => setShowCreate(false)} onCreated={() => fetchUsers()} />
      )}
      {editUser && (
        <UserEditModal user={editUser} apiBase={API_BASE} onClose={() => setEditUser(null)}
          onSaved={(successMsg, errorMsg) => {
            setEditUser(null);
            if (successMsg) { showMsg("success", successMsg); fetchUsers(); }
            else showMsg("error", errorMsg);
          }}
        />
      )}
      {deleteUser && (
        <UserDeleteModal user={deleteUser} apiBase={API_BASE} onClose={() => setDeleteUser(null)}
          onDeleted={(successMsg, errorMsg) => {
            setDeleteUser(null);
            if (successMsg) { showMsg("success", successMsg); fetchUsers(); }
            else showMsg("error", errorMsg);
          }}
        />
      )}
    </div>
  );
}