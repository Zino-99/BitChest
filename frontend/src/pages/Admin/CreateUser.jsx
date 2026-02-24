import React, { useEffect } from 'react'
import { useState } from 'react'

const CreateUser = () => {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}')
    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')
    const [email, setEmail] = useState('')
    const [balance, setBalance] = useState('500.00')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        generatePassword()
    }, [])

    function generatePassword(length = 12) {
        const lower = 'abcdefghijklmnopqrstuvwxyz'
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        const numbers = '0123456789'
        const symbols = '!@#$%^&*()_+[]{}|;:,.<>?'

        let password = ''
        const allChars = lower + upper + numbers + symbols

        // S'assurer d'avoir au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 symbole
        password += lower[Math.floor(Math.random() * lower.length)]
        password += upper[Math.floor(Math.random() * upper.length)]
        password += numbers[Math.floor(Math.random() * numbers.length)]
        password += symbols[Math.floor(Math.random() * symbols.length)]

        for (let i = 4; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)]
        }

        // Mélanger les caractères pour plus d’aléatoire
        password = password
            .split('')
            .sort(() => 0.5 - Math.random())
            .join('')
        setPassword(password)
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage(null)
        try {
            const body = { firstname, lastname, email, password }
            const res = await fetch('https://127.0.0.1:8000/api/users', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(body),
            })
            const data = await res.json()
            if (res.ok) {
                sessionStorage.setItem(
                    'user',
                    JSON.stringify({ ...user, firstname, lastname, email })
                )
                setMessage({
                    type: 'success',
                    text: 'User created successfully',
                })
                setFirstname('')
                setLastname('')
                setEmail('')
                generatePassword(12)
            } else {
                setMessage({
                    type: 'errpr',
                    text: data.message || 'Error creating user',
                })
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Impossible to contact the server',
            })
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="max-w-lg mx-auto mt-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Add a user
            </h1>
            <p className="text-gray-500 mb-8 text-center">
                It only takes a few moments to add a new user to Bitchest.
            </p>

            {message && (
                <div
                    className={`mb-6 p-4 rounded-xl text-sm ${
                        message.type === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                >
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Firstname & Lastname */}
                <div className="flex gap-4">
                    <div className="flex flex-col w-1/2">
                        <label className="mb-1 text-sm text-gray-700">
                            First Name
                        </label>
                        <input
                            type="text"
                            value={firstname}
                            onChange={(e) => setFirstname(e.target.value)}
                            className="rounded-xl px-4 py-3 bg-gray-100 outline-none focus:ring-2 focus:ring-[#38618C]"
                            required
                        />
                    </div>
                    <div className="flex flex-col w-1/2">
                        <label className="mb-1 text-sm text-gray-700">
                            Last Name
                        </label>
                        <input
                            type="text"
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                            className="rounded-xl px-4 py-3 bg-gray-100 outline-none focus:ring-2 focus:ring-[#38618C]"
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
                        className="rounded-xl px-4 py-3 bg-gray-100 outline-none focus:ring-2 focus:ring-[#38618C]"
                        required
                    />
                </div>
                {/* Balance */}
                <div className="flex flex-col">
                    <label className="mb-1 text-sm text-gray-700">
                        Balance €
                    </label>
                    <input
                        type="text"
                        value={balance}
                        disabled
                        className="rounded-xl px-4 py-3 bg-gray-100 outline-none focus:ring-2 focus:ring-[#38618C]"
                        required
                    />
                </div>

                <hr className="border-gray-200" />
                <p className="text-sm text-gray-400">
                    The password is automatically generated
                </p>

                {/* Password */}
                <div className="flex flex-col">
                    <label className="mb-1 text-sm text-gray-700">
                        New Password
                    </label>
                    <input
                        disabled
                        type="text"
                        value={password}
                        className="rounded-xl px-4 py-3 bg-gray-100 outline-none focus:ring-2 focus:ring-[#38618C]"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="py-3 rounded-xl text-white font-semibold transition hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: '#38618C' }}
                >
                    {loading ? 'Loading...' : 'Add user'}
                </button>
            </form>
        </div>
    )
}

export default CreateUser
