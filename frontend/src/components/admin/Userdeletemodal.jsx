export default function UserDeleteModal({ user, onClose, onDeleted, apiBase }) {
  const handleDelete = async () => {
    try {
      const res = await fetch(`${apiBase}/users/${user.id}`, { method: "DELETE" });
      if (res.ok) {
        onDeleted(`${user.firstname} ${user.lastname} deleted`);
      } else {
        onDeleted(null, "Error deleting user");
      }
    } catch {
      onDeleted(null, "Unable to reach the server");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Delete User</h2>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete <span className="font-medium text-gray-700">{user.firstname} {user.lastname}</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleDelete}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}