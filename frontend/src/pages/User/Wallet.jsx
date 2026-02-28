import { useState, useEffect } from 'react'
import {
    TrendingUp,
    TrendingDown,
    ChevronDown,
    Wallet2,
    BarChart3,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react'

function computeCryptoStats(crypto) {
    const totalQty = crypto.purchases.reduce((s, p) => s + p.quantity, 0)
    const totalCost = crypto.purchases.reduce(
        (s, p) => s + p.quantity * p.priceAtPurchase,
        0
    )
    const avgUnitCost = totalQty > 0 ? totalCost / totalQty : 0
    const currentValue = totalQty * crypto.currentPrice
    const gain = currentValue - totalCost
    return { totalQty, totalCost, avgUnitCost, currentValue, gain }
}

function fmt(n, decimals = 2) {
    return Number(n).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    })
}

function fmtDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

const CRYPTO_COLORS = {
    BTC: '#F7931A',
    ETH: '#627EEA',
    XRP: '#346AA9',
    BCH: '#8DC351',
    ADA: '#0033AD',
    LTC: '#A0A0A0',
    DASH: '#008CE7',
    IOTA: '#555555',
    XEM: '#67B2E8',
    XLM: '#7D00FF',
}

function CryptoCard({ crypto }) {
    const [open, setOpen] = useState(false)
    const { totalQty, totalCost, avgUnitCost, currentValue, gain } =
        computeCryptoStats(crypto)
    const positive = gain >= 0
    const color = CRYPTO_COLORS[crypto.symbol] ?? '#43698f'
    const gainPct =
        totalCost > 0 ? ((gain / totalCost) * 100).toFixed(2) : '0.00'

    return (
        <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm mb-3">
            {/* Main row */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full px-4 py-4 flex items-center gap-3 hover:bg-gray-50/40 transition active:bg-gray-100"
            >
                {/* Icon */}
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: color }}
                >
                    {crypto.symbol.slice(0, 2)}
                </div>

                {/* Name + qty */}
                <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="font-semibold text-gray-900 text-sm truncate w-full text-left">
                        {crypto.name}
                    </span>
                    <span className="text-xs text-gray-400">
                        {fmt(totalQty, 4)} {crypto.symbol}
                    </span>
                </div>

                {/* Value + gain stacked */}
                <div className="flex flex-col items-end shrink-0 gap-1">
                    <span className="font-semibold text-gray-900 text-sm">
                        {fmt(currentValue)} €
                    </span>
                    <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            positive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-600'
                        }`}
                    >
                        {positive ? '+' : ''}
                        {gainPct}%
                    </span>
                </div>

                {/* Chevron */}
                <ChevronDown
                    className={`text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    size={16}
                />
            </button>

            {/* Expanded */}
            {open && (
                <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-4">
                    {/* Summary mini cards — 2x2 grid on mobile */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {[
                            {
                                label: 'Total invested',
                                value: `${fmt(totalCost)} €`,
                            },
                            {
                                label: 'Quantity',
                                value: `${fmt(totalQty, 4)} ${crypto.symbol}`,
                            },
                            {
                                label: 'Avg unit cost',
                                value: `${fmt(avgUnitCost)} €`,
                            },
                            {
                                label: 'Current price',
                                value: `${fmt(crypto.currentPrice)} €`,
                                highlight: true,
                            },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="bg-white rounded-xl p-3 shadow-sm"
                            >
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">
                                    {item.label}
                                </p>
                                <p
                                    className={`text-sm font-semibold ${item.highlight ? 'text-blue-500' : 'text-gray-800'}`}
                                >
                                    {item.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Gain banner */}
                    <div
                        className={`rounded-xl px-4 py-3 flex items-center justify-between mb-4 ${positive ? 'bg-green-50' : 'bg-red-50'}`}
                    >
                        <div className="flex items-center gap-2">
                            {positive ? (
                                <ArrowUpRight
                                    size={16}
                                    className="text-green-600"
                                />
                            ) : (
                                <ArrowDownRight
                                    size={16}
                                    className="text-red-500"
                                />
                            )}
                            <span
                                className={`text-sm font-medium ${positive ? 'text-green-700' : 'text-red-600'}`}
                            >
                                Gain / Loss
                            </span>
                        </div>
                        <span
                            className={`text-sm font-bold ${positive ? 'text-green-700' : 'text-red-600'}`}
                        >
                            {positive ? '+' : ''}
                            {fmt(gain)} €
                        </span>
                    </div>

                    {/* Purchase history */}
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Purchase History
                    </p>
                    <div className="space-y-2">
                        {crypto.purchases.map((p, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-xl px-3 py-3 shadow-sm flex items-center justify-between"
                            >
                                <div>
                                    <p className="text-xs text-gray-500">
                                        {fmtDate(p.date)}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {fmt(p.quantity, 4)}{' '}
                                        <span className="text-xs font-normal text-gray-400">
                                            {crypto.symbol}
                                        </span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400">
                                        {fmt(p.priceAtPurchase)} € / u
                                    </p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {fmt(p.quantity * p.priceAtPurchase)} €
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function Wallet() {
    const [wallet, setWallet] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const user = JSON.parse(sessionStorage.getItem('user'))
        fetch('https://127.0.0.1:8000/api/wallet', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': user?.id,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error('Unauthorized or server error')
                return res.json()
            })
            .then((data) => setWallet(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400">
                        Loading portfolio...
                    </p>
                </div>
            </div>
        )

    if (error)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white rounded-2xl p-6 shadow text-center max-w-sm w-full">
                    <p className="font-semibold text-gray-800 mb-1">Error</p>
                    <p className="text-sm text-red-500">{error}</p>
                </div>
            </div>
        )

    const totalInvested = wallet.cryptos.reduce(
        (s, c) => s + computeCryptoStats(c).totalCost,
        0
    )
    const totalCurrentValue = wallet.cryptos.reduce(
        (s, c) => s + computeCryptoStats(c).currentValue,
        0
    )
    const totalGain = totalCurrentValue - totalInvested
    const totalPositive = totalGain >= 0
    const gainPct =
        totalInvested > 0
            ? ((totalGain / totalInvested) * 100).toFixed(2)
            : '0.00'

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sticky header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 pt-12 pb-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                        <Wallet2 size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 leading-tight">
                            My Wallet
                        </h1>
                        <p className="text-xs text-gray-400">
                            {wallet.cryptos.length} active position
                            {wallet.cryptos.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-4 py-4 space-y-3">
                {/* Stats cards — scroll horizontally on very small screens */}
                <div className="grid grid-cols-3 gap-2">
                    {/* EUR Balance */}
                    <div className="bg-white rounded-2xl p-3 shadow-sm flex flex-col gap-1">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                            <DollarSign size={14} className="text-blue-500" />
                        </div>
                        <p className="text-[10px] text-gray-400 leading-tight">
                            EUR Balance
                        </p>
                        <p className="text-sm font-bold text-gray-900 leading-tight">
                            {fmt(wallet.euroBalance)} €
                        </p>
                    </div>

                    {/* Portfolio value */}
                    <div className="bg-white rounded-2xl p-3 shadow-sm flex flex-col gap-1">
                        <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                            <BarChart3 size={14} className="text-purple-500" />
                        </div>
                        <p className="text-[10px] text-gray-400 leading-tight">
                            Portfolio
                        </p>
                        <p className="text-sm font-bold text-gray-900 leading-tight">
                            {fmt(totalCurrentValue)} €
                        </p>
                    </div>

                    {/* Global gain */}
                    <div
                        className={`rounded-2xl p-3 shadow-sm flex flex-col gap-1 ${totalPositive ? 'bg-green-50' : 'bg-red-50'}`}
                    >
                        <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${totalPositive ? 'bg-green-100' : 'bg-red-100'}`}
                        >
                            {totalPositive ? (
                                <TrendingUp
                                    size={14}
                                    className="text-green-600"
                                />
                            ) : (
                                <TrendingDown
                                    size={14}
                                    className="text-red-500"
                                />
                            )}
                        </div>
                        <p className="text-[10px] text-gray-500 leading-tight">
                            Gain / Loss
                        </p>
                        <p
                            className={`text-sm font-bold leading-tight ${totalPositive ? 'text-green-700' : 'text-red-600'}`}
                        >
                            {totalPositive ? '+' : ''}
                            {fmt(totalGain)} €
                        </p>
                        <p
                            className={`text-[10px] font-medium ${totalPositive ? 'text-green-600' : 'text-red-500'}`}
                        >
                            {totalPositive ? '+' : ''}
                            {gainPct}%
                        </p>
                    </div>
                </div>

                {/* Assets section */}
                <div className="flex items-center justify-between pt-2 pb-1">
                    <p className="text-sm font-bold text-gray-800">Assets</p>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {wallet.cryptos.length} position
                        {wallet.cryptos.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {wallet.cryptos.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                        <BarChart3
                            size={32}
                            className="text-gray-200 mx-auto mb-3"
                        />
                        <p className="font-semibold text-gray-700 mb-1">
                            No assets yet
                        </p>
                        <p className="text-sm text-gray-400">
                            Go to the market to start investing.
                        </p>
                    </div>
                ) : (
                    wallet.cryptos.map((c) => (
                        <CryptoCard key={c.symbol} crypto={c} />
                    ))
                )}

                {/* Bottom safe area padding */}
                <div className="h-6" />
            </div>
        </div>
    )
}
