import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("https://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        sessionStorage.setItem("user", JSON.stringify(data.user));
        navigate("/Dashboard");
      } else {
        setMessage(data.message || "Incorrect credentials");
      }
    } catch (err) {
      setMessage("Unable to contact the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#43698f] px-4 py-8">
      <div className="bg-gray-100 w-full max-w-md rounded-3xl shadow-xl p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-blue-500 mb-2">
          BitChest
        </h1>
        <p className="text-center text-gray-600 mb-8 text-sm sm:text-base">
          Sign in to your account
        </p>

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-red-200 text-red-800 text-sm text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col mb-5">
            <label className="mb-2 text-gray-800 text-sm">Email Address</label>
            <div className="flex items-center bg-gray-200 rounded-full px-4 py-3">
              <Mail className="text-gray-500 mr-3 flex-shrink-0" size={18} />
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent w-full outline-none text-sm"
                required
              />
            </div>
          </div>

          <div className="flex flex-col mb-8">
            <label className="mb-2 text-gray-800 text-sm">Password</label>
            <div className="flex items-center bg-gray-200 rounded-full px-4 py-3">
              <Lock className="text-gray-500 mr-3 flex-shrink-0" size={18} />
              <input
                type="password"
                placeholder="************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent w-full outline-none text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-4 rounded-full text-white text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-400 hover:scale-[1.02] transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Not registered yet?{" "}
          <a href="/register" className="text-blue-500 hover:underline font-semibold">
            Sign up now
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;