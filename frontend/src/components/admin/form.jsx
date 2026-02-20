import { useState } from 'react'
import { useEffect } from 'react'
export default function Form() {
    useEffect(() => genererMotDePasse(), [])
    const [passwordValue, setPasswordValue] = useState('')
    function genererMotDePasse(longueur = 12) {
        const caracteres =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+'

        let motDePasse = ''

        for (let i = 0; i < longueur; i++) {
            const indexAleatoire = Math.floor(Math.random() * caracteres.length)
            motDePasse += caracteres[indexAleatoire]
        }

        setPasswordValue(motDePasse)
    }
    return (
        <div className=" p-6 w-[69%] m-auto">
            <h2 className="text-center text-3xl text-gray-800">
                Add a new user
            </h2>
            <p className="text-center text-gray-700">
                take few minute to add a new user for Bitchest
            </p>
            <form action="" method="post" className=" flex flex-col">
                <label
                    htmlFor="firstname"
                    className="text-gray-900 font-semibold"
                >
                    FirstName
                </label>
                <input
                    id="firstname"
                    name="firstname"
                    type="text"
                    className="border mb-2 border-gray-400 px-4 py-1 rounded-[7px]"
                />

                <label
                    htmlFor="lastname"
                    className="text-gray-900 font-semibold"
                >
                    LastName
                </label>
                <input
                    id="lastname"
                    name="lastname"
                    type="text"
                    className="border mb-2 border-gray-400 px-4 py-1 rounded-[7px]"
                />

                <label htmlFor="email" className="text-gray-900 font-semibold">
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    type="text"
                    className="border mb-2 border-gray-400 px-4 py-1 rounded-[7px]"
                />

                <label
                    htmlFor="password"
                    className="text-gray-900 font-semibold"
                >
                    Password
                </label>
                <input
                    disabled
                    value={passwordValue}
                    id="password"
                    name="password"
                    type="text"
                    className="border mb-2 border-gray-400 px-4 py-1 rounded-[7px]"
                />

                <label
                    htmlFor="phoneNumber"
                    className="text-gray-900 font-semibold"
                >
                    Phone number
                </label>
                <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="number"
                    className="border mb-2 border-gray-400 px-4 py-1 rounded-[7px]"
                />

                <label htmlFor="email" className="text-gray-900 font-semibold">
                    Account euro
                </label>
                <input
                    disabled
                    value={500}
                    id="account"
                    name="account"
                    type="number"
                    className="border mb-2 border-gray-400 px-4 py-1 rounded-[7px]"
                />
            </form>
            <button
                type="submit"
                className="border mt-2 bg-black text-white border-gray-400 px-4 py-1.5 rounded-[7px] w-full cursor-pointer"
            >
                Add
            </button>
        </div>
    )
}
