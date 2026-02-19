export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#43698f]">
      <div className="bg-gray-100 w-[420px] rounded-3xl shadow-xl p-8">
        
        {/* Title */}
        <h1 className="text-4xl font-bold text-center text-blue-500 mb-2">
          BitChest
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Sign up for BitChest
        </p>

        {/* Name row */}
        <div className="flex gap-4 mb-4">
          <div className="flex flex-col w-1/2">
            <label className="mb-1 text-gray-700">First Name</label>
            <input
              type="text"
              placeholder="Sophie"
              className="rounded-full px-4 py-3 bg-gray-200 outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex flex-col w-1/2">
            <label className="mb-1 text-gray-700">Last Name</label>
            <input
              type="text"
              placeholder="Sophie"
              className="rounded-full px-4 py-3 bg-gray-200 outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col mb-4">
          <label className="mb-1 text-gray-700">Email</label>
          <input
            type="email"
            placeholder="exemple@email.com"
            className="rounded-full px-4 py-3 bg-gray-200 outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col mb-6">
          <label className="mb-1 text-gray-700">Password</label>
          <input
            type="password"
            placeholder="********"
            className="rounded-full px-4 py-3 bg-gray-200 outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
       

        {/* Button */}
        <button className="w-full py-3 rounded-full text-white text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-400 hover:scale-[1.02] transition">
          Register
        </button>
      </div>
    </div>
  );
}
