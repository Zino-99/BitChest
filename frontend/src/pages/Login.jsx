import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'

const Login = () => {
    // State hooks for form fields
    const [email, setEmail] = useState('') // email input value
    const [password, setPassword] = useState('') // password input value
    const [message, setMessage] = useState(null) // feedback message
    const [loading, setLoading] = useState(false) // loading state during API call

    const navigate = useNavigate() // navigate function from react-router

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault() // prevent default form submission
        setLoading(true) // show loading spinner
        setMessage(null) // clear previous message

        try {
            // Send POST request to login API
            const res = await fetch('https://127.0.0.1:8000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }), // send email and password
            })

            const data = await res.json() // parse JSON response

            if (res.ok) {
                // Save user info in session storage
                sessionStorage.setItem('user', JSON.stringify(data.user))
                navigate('/Dashboard') // redirect to dashboard
            } else {
                // Display error message from server
                setMessage(data.message || 'Incorrect credentials')
            }
        } catch (err) {
            // Handle network errors
            setMessage('Unable to contact the server')
        } finally {
            setLoading(false) // hide loading spinner
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#43698f] px-4 py-8">
            {/* Login card container */}
            <div className="bg-gray-100 w-full max-w-md rounded-3xl shadow-xl p-6 sm:p-8">
                {/* Logo / Title */}
                <h1 className="text-3xl sm:text-4xl font-bold text-center text-blue-500 mb-2">
                    BitChest
                </h1>
                <p className="text-center text-gray-600 mb-8 text-sm sm:text-base">
                    Sign in to your account
                </p>

                {/* Display error or feedback message */}
                {message && (
                    <div className="mb-4 p-3 rounded-xl bg-red-200 text-red-800 text-sm text-center">
                        {message}
                    </div>
                )}

                {/* Login form */}
                <form onSubmit={handleSubmit}>
                    {/* Email input */}
                    <div className="flex flex-col mb-5">
                        <label className="mb-2 text-gray-800 text-sm">
                            Email Address
                        </label>
                        <div className="flex items-center bg-gray-200 rounded-full px-4 py-3">
                            <Mail
                                className="text-gray-500 mr-3 flex-shrink-0"
                                size={18}
                            />
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

                    {/* Password input */}
                    <div className="flex flex-col mb-8">
                        <label className="mb-2 text-gray-800 text-sm">
                            Password
                        </label>
                        <div className="flex items-center bg-gray-200 rounded-full px-4 py-3">
                            <Lock
                                className="text-gray-500 mr-3 flex-shrink-0"
                                size={18}
                            />
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

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 sm:py-4 rounded-full text-white text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-400 hover:scale-[1.02] transition disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                {/* Sign up link */}
                <p className="text-center text-gray-500 mt-6 text-sm">
                    Not registered yet?{' '}
                    <a
                        href="/register"
                        className="text-blue-500 hover:underline font-semibold"
                    >
                        Sign up now
                    </a>
                </p>
            </div>
        </div>
    )
}

export default Login
