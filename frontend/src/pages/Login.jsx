import { Mail, Lock } from "lucide-react";

const Login = () => {
return (
    <div className="min-h-screen flex items-center justify-center bg-[#43698f]">
      <div className="bg-gray-100 w-[420px] rounded-3xl shadow-xl p-8">
        
        {/* Title */}
        <h1 className="text-4xl font-bold text-center text-blue-500 mb-2">
          BitChest
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Sign in to your account
        </p>

        {/* Email */}
        <div className="flex flex-col mb-5">
          <label className="mb-2 text-gray-800">Email Address</label>
          <div className="flex items-center bg-gray-200 rounded-full px-4 py-3">
            <Mail className="text-gray-500 mr-3" size={20} />
            <input
              type="email"
              placeholder="you@email.com"
              className="bg-transparent w-full outline-none"
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col mb-8">
          <label className="mb-2 text-gray-800">Password</label>
          <div className="flex items-center bg-gray-200 rounded-full px-4 py-3">
            <Lock className="text-gray-500 mr-3" size={20} />
            <input
              type="password"
              placeholder="************"
              className="bg-transparent w-full outline-none"
            />
          </div>
        </div>

        {/* Button */}
        <button className="w-full py-4 rounded-full text-white text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-400 hover:scale-[1.02] transition">
          Sign in
        </button>
      </div>
    </div>
  );
};

export default Login;