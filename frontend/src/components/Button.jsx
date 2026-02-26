import React from 'react'
import clsx from 'clsx'

export default function Button({ type, color }) {
    const buttonClass = clsx(`py-2 w-[100px] px-1 rounded-[7px]`, {
        'bg-green-200 text-green-700 font-bold': color === 'green',
        'bg-red-200 text-red-700 font-bold': color === 'red',
        'bg-blue-200 text-blue-700 font-bold': color === 'blue',
        // ajoute d’autres couleurs si besoin
    })

    return (
        <div>
            <button className={buttonClass}>{type}</button>
        </div>
    )
}
