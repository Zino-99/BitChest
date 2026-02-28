import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
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
        setMessage({ type: "success", text: data.message || "Account created!" });
        setFirstname(""); setLastname(""); setEmail(""); setPassword("");
        setTimeout(() => navigate("/Login"), 1500);
      } else {
        setMessage({ type: "error", text: data.message || "Registration failed" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Unable to contact the server" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#43698f] px-4 py-8">
      <div className="bg-gray-100 w-full max-w-md rounded-3xl shadow-xl p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-blue-500 mb-2">BitChest</h1>
        <p className="text-center text-gray-600 mb-8 text-sm sm:text-base">Sign up for BitChest</p>

        {message && (
          <div className={`mb-4 p-3 rounded-xl text-sm ${
            message.type === "success" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex flex-col w-full sm:w-1/2">
              <label className="mb-1 text-gray-700 text-sm">First Name</label>
              <input
                type="text"
                placeholder="Sophie"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className="rounded-full px-4 py-3 bg-gray-200 outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                required
              />
            </div>
            <div className="flex flex-col w-full sm:w-1/2">
              <label className="mb-1 text-gray-700 text-sm">Last Name</label>
              <input
                type="text"
                placeholder="Doe"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className="rounded-full px-4 py-3 bg-gray-200 outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                required
              />
            </div>
          </div>

          <div className="flex flex-col mb-4">
            <label className="mb-1 text-gray-700 text-sm">Email</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-full px-4 py-3 bg-gray-200 outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              required
            />
          </div>

          <div className="flex flex-col mb-6">
            <label className="mb-1 text-gray-700 text-sm">Password</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-full px-4 py-3 bg-gray-200 outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full text-white text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-400 hover:scale-[1.02] transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Already have an account?{" "}
          <a href="/Login" className="text-blue-500 hover:underline font-semibold">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}