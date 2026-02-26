import React, { useEffect, useState } from 'react'
import Button from '../../components/Button'

const Market = () => {
    const [cryptos, setCryptos] = useState([])
    const [loading, setLoading] = useState(true) // Pour le loader

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/cryptocurrencies', { method: 'GET' }) // <-- Ici
            .then((res) => res.json())
            .then((data) => {
                setCryptos(data)
                setLoading(false)
            })
            .catch((err) => {
                console.error(
                    'Erreur lors de la récupération des cryptos :',
                    err
                )
                setLoading(false)
            })
    }, [])

    if (loading) {
        return (
            <div className="max-w-lg mx-auto mt-10">
                <h1>Pages Market</h1>
                <p>Chargement des cryptos...</p>
            </div>
        )
    }

    return (
        <div className="max-w-lg mx-auto mt-10">
            <h1>Pages Market</h1>
            <ul className="mt-4 space-y-2">
                {cryptos.length > 0 ? (
                    cryptos.map((crypto) => (
                        <li key={crypto.id} className="p-2 border rounded">
                            {crypto.symbol} - {crypto.name}
                        </li>
                    ))
                ) : (
                    <li>Aucune crypto disponible.</li>
                )}
            </ul>
            <div className="flex gap-4 mt-3">
                <Button type="Buy" color="green" />
                <Button type="sell" color="red" />
            </div>
        </div>
    )
}

export default Market
