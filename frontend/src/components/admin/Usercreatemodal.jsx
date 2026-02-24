import { useState } from "react";

const generateTempPassword = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

export default function UserCreateModal({ onClose, onCreated, apiBase }) {
  const [form, setForm] = useState({ firstname: "", lastname: "", email: "" });
  const [creating, setCreating] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    const password = generateTempPassword();
    try {
      const res = await fetch(`${apiBase}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, password }),
      });
      if (res.ok) {
        setTempPassword(password);
        onCreated();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Error creating user");
        onClose();
      }
    } catch {
      alert("Unable to reach the server");
      onClose();
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        {!tempPassword ? (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-800">Create New User</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-5">A temporary password will be generated after creation.</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 font-medium">First Name</label>
                  <input type="text" required placeholder="John" value={form.firstname}
                    onChange={(e) => setForm({ ...form, firstname: e.target.value })}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 font-medium">Last Name</label>
                  <input type="text" required placeholder="Doe" value={form.lastname}
                    onChange={(e) => setForm({ ...form, lastname: e.target.value })}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Email</label>
                <input type="email" required placeholder="john@example.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50">
                  {creating ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">User Created!</h2>
              <p className="text-sm text-gray-500 mt-1">Share this temporary password. It won't be shown again.</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Temporary Password</p>
              <div className="flex items-center justify-between gap-3">
                <code className="text-base font-mono font-semibold text-gray-800 tracking-widest">{tempPassword}</code>
                <button onClick={handleCopy}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex-shrink-0
                    ${copied ? "bg-green-100 text-green-700 border border-green-200" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>
            <button onClick={onClose}
              className="w-full py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition">
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}