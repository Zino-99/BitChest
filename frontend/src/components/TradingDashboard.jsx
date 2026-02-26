import React, { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

// Liste des cryptos
const cryptos = [
    { name: 'Bitcoin', min: 30000, max: 60000 },
    { name: 'Ethereum', min: 1000, max: 4000 },
    { name: 'Ripple', min: 0.2, max: 1.5 },
    { name: 'Bitcoin Cash', min: 200, max: 1500 },
    { name: 'Cardano', min: 0.5, max: 3 },
    { name: 'Litecoin', min: 50, max: 300 },
    { name: 'Dash', min: 50, max: 400 },
    { name: 'Iota', min: 0.1, max: 2 },
    { name: 'NEM', min: 0.1, max: 1 },
    { name: 'Stellar', min: 0.05, max: 0.8 },
]

// Générer toutes les dates d'un mois avec prix aléatoires selon crypto
const generateMonthData = (year, month, crypto) => {
    const daysInMonth = new Date(year, month, 0).getDate()
    const data = []

    for (let day = 1; day <= daysInMonth; day++) {
        const price = Math.random() * (crypto.max - crypto.min) + crypto.min
        data.push({
            date: `${year}-${String(month).padStart(2, '0')}-${String(
                day
            ).padStart(2, '0')}`,
            price: parseFloat(price.toFixed(2)),
        })
    }

    return data
}

export default function TradingAreaChart() {
    const [selectedCrypto, setSelectedCrypto] = useState(cryptos[0])
    const [data, setData] = useState(generateMonthData(2026, 2, selectedCrypto))
    const [selectedPrice, setSelectedPrice] = useState(null)

    const handleMouseMove = (state) => {
        if (state && state.activePayload) {
            setSelectedPrice(state.activePayload[0].payload.price)
        }
    }

    const handleBuy = () =>
        alert(`Buy ${selectedCrypto.name} at $${selectedPrice}`)
    const handleSell = () =>
        alert(`Sell ${selectedCrypto.name} at $${selectedPrice}`)

    const handleCryptoChange = (crypto) => {
        setSelectedCrypto(crypto)
        setData(generateMonthData(2026, 2, crypto))
        setSelectedPrice(null)
    }

    return (
        <div style={{ display: 'flex', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Sidebar crypto */}
            <div style={{ marginRight: 20 }}>
                {cryptos.map((crypto) => (
                    <button
                        key={crypto.name}
                        onClick={() => handleCryptoChange(crypto)}
                        style={{
                            display: 'block',
                            marginBottom: 10,
                            padding: '8px 12px',
                            backgroundColor:
                                selectedCrypto.name === crypto.name
                                    ? '#7e79d3'
                                    : '#eee',
                            color:
                                selectedCrypto.name === crypto.name
                                    ? '#fff'
                                    : '#000',
                            border: 'none',
                            borderRadius: 5,
                            cursor: 'pointer',
                        }}
                    >
                        {crypto.name}
                    </button>
                ))}
            </div>

            {/* Graph */}
            <div>
                <AreaChart
                    width={800}
                    height={400}
                    data={data}
                    margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                    onMouseMove={handleMouseMove}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={['dataMin', 'dataMax']} />
                    <Tooltip formatter={(value) => [`$${value}`, 'Price']} />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#7e79d3"
                        fill="#7e79d3"
                        fillOpacity={0.3}
                    />
                </AreaChart>

                {selectedPrice && (
                    <div style={{ marginTop: 10 }}>
                        <p>
                            Selected {selectedCrypto.name} Price: $
                            {selectedPrice}
                        </p>
                        <button onClick={handleBuy}>Buy</button>
                        <button onClick={handleSell} style={{ marginLeft: 10 }}>
                            Sell
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
