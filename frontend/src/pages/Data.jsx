import { useState } from 'react'

export default function Data() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}')
    const [firstname, setFirstname] = useState(user.firstname || '')
    const [lastname, setLastname] = useState(user.lastname || '')
    const [email, setEmail] = useState(user.email || '')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage(null)

        if (password && password !== confirmPassword) {
            setMessage({ type: 'error', text: 'The passwords do not match' })
            return
        }

        setLoading(true)

        try {
            const body = { firstname, lastname, email }
            if (password) body.password = password

            const res = await fetch(
                `https://127.0.0.1:8000/api/users/${user.id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                }
            )

            const data = await res.json()

            if (res.ok) {
                sessionStorage.setItem('user', JSON.stringify({ ...user, firstname, lastname, email }))
                setMessage({ type: 'success', text: 'Information updated successfully' })
                setPassword('')
                setConfirmPassword('')
            } else {
                setMessage({ type: 'error', text: data.message || 'Error updating information' })
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Impossible to contact the server' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="max-w-lg mx-auto">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">My Profile</h1>
                <p className="text-gray-500 text-sm mb-6">Update your personal information and password</p>

                {message && (
                    <div className={`mb-6 p-4 rounded-xl text-sm ${
                        message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                        {/* Firstname & Lastname */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex flex-col w-full sm:w-1/2">
                                <label className="mb-1 text-sm text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    value={firstname}
                                    onChange={(e) => setFirstname(e.target.value)}
                                    className="rounded-xl px-4 py-3 bg-gray-100 outline-none focus:ring-2 focus:ring-[#38618C] text-sm"
                                    required
                                />
                            </div>
                            <div className="flex flex-col w-full sm:w-1/2">
                                <label className="mb-1 text-sm text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    value={lastname}
                                    onChange={(e) => setLastname(e.target.value)}
                                    className="rounded-xl px-4 py-3 bg-gray-100 outline-none focus:ring-2 focus:ring-[#38618C] text-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col">
                            <label className="mb-1 text-sm text-gray-700">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="rounded-xl px-4 py-3 bg-gray-100 outline-none focus:ring-2 focus:ring-[#38618C] text-sm"
                                required
                            />
                        </div>

                        <hr className="border-gray-100" />
                        <p className="text-xs text-gray-400">Leave empty if you don't want to change the password</p>

                        {/* Password */}
                        <div className="flex flex-col">
                            <label className="mb-1 text-sm text-gray-700">New Password</label>
                            <input
                                type="password"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="rounded-xl px-4 py-3 bg-gray-100 outline-none focus:ring-2 focus:ring-[#38618C] text-sm"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col">
                            <label className="mb-1 text-sm text-gray-700">Confirm Password</label>
                            <input
                                type="password"
                                placeholder="********"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="rounded-xl px-4 py-3 bg-gray-100 outline-none focus:ring-2 focus:ring-[#38618C] text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="py-3 rounded-xl text-white font-semibold transition hover:opacity-90 disabled:opacity-50 text-sm mt-1"
                            style={{ backgroundColor: '#38618C' }}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}