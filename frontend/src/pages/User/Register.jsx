import { useState } from "react";

export default function Register() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:8000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstname, lastname, email, password }),
    });

    if (res.ok) {
      alert("User registered!");
    } else {
      alert("Error registering user");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#43698f]">
      <div className="bg-gray-100 w-[420px] rounded-3xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center text-blue-500 mb-2">BitChest</h1>
        <p className="text-center text-gray-600 mb-8">Sign up for BitChest</p>

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
            className="w-full py-3 rounded-full text-white text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-400 hover:scale-[1.02] transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
