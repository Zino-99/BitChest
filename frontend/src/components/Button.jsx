import React from 'react'
import clsx from 'clsx'

export default function Button({ type, color }) {
    const buttonClass = clsx(`py-2 w-[100px] px-1 rounded-[7px]`, {
        'bg-green-300 text-green-700': color === 'green',
        'bg-red-300 text-red-700': color === 'red',
        'bg-blue-300 text-blue-700': color === 'blue',
        // ajoute d’autres couleurs si besoin
    })

    return (
        <div>
            <button className={buttonClass}>{type}</button>
        </div>
    )
}
