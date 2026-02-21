import { useState } from "react";

export default function Register() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("https://127.0.0.1:8000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstname, lastname, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message || "Utilisateur créé !" });
        setFirstname("");
        setLastname("");
        setEmail("");
        setPassword("");
      } else {
        setMessage({ type: "error", text: data.message || "Erreur lors de l'inscription" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Impossible de contacter le serveur" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#43698f]">
      <div className="bg-gray-100 w-[420px] rounded-3xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center text-blue-500 mb-2">BitChest</h1>
        <p className="text-center text-gray-600 mb-8">Sign up for BitChest</p>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.type === "success" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex gap-4 mb-4">
            <div className="flex flex-col w-1/2">
              <label className="mb-1 text-gray-700">First Name</label>
              <input
                type="text"
                placeholder="Sophie"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className="rounded-full px-4 py-3 bg-gray-200 outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div className="flex flex-col w-1/2">
              <label className="mb-1 text-gray-700">Last Name</label>
              <input
                type="text"
                placeholder="Doe"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className="rounded-full px-4 py-3 bg-gray-200 outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
          </div>

          <div className="flex flex-col mb-4">
            <label className="mb-1 text-gray-700">Email</label>
            <input
              type="email"
              placeholder="exemple@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-full px-4 py-3 bg-gray-200 outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="flex flex-col mb-6">
            <label className="mb-1 text-gray-700">Password</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-full px-4 py-3 bg-gray-200 outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full text-white text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-400 hover:scale-[1.02] transition disabled:opacity-50"
          >
            {loading ? "Création..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}