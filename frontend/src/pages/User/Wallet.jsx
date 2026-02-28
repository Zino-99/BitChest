import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, ChevronDown, Wallet2, BarChart3, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";

function computeCryptoStats(crypto) {
  const totalQty = crypto.purchases.reduce((s, p) => s + p.quantity, 0);
  const totalCost = crypto.purchases.reduce((s, p) => s + p.quantity * p.priceAtPurchase, 0);
  const avgUnitCost = totalQty > 0 ? totalCost / totalQty : 0;
  const currentValue = totalQty * crypto.currentPrice;
  const gain = currentValue - totalCost;
  return { totalQty, totalCost, avgUnitCost, currentValue, gain };
}

function fmt(n, decimals = 2) {
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric"
  });
}

const CRYPTO_COLORS = {
  BTC: "#F7931A", ETH: "#627EEA", XRP: "#346AA9",
  BCH: "#8DC351", ADA: "#0033AD", LTC: "#A0A0A0",
  DASH: "#008CE7", IOTA: "#555555", XEM: "#67B2E8", XLM: "#7D00FF",
};

function CryptoCard({ crypto }) {
  const [open, setOpen] = useState(false);
  const { totalQty, totalCost, avgUnitCost, currentValue, gain } = computeCryptoStats(crypto);
  const positive = gain >= 0;
  const color = CRYPTO_COLORS[crypto.symbol] ?? "#43698f";
  const gainPct = totalCost > 0 ? ((gain / totalCost) * 100).toFixed(2) : "0.00";
  const progress = Math.min(100, Math.max(0, (currentValue / (totalCost * 1.5)) * 100));

  return (
    <div className={`rounded-2xl overflow-hidden mb-3 transition-all duration-200 ${
      open
        ? "bg-white shadow-lg ring-1 ring-blue-100"
        : "bg-white shadow-sm hover:shadow-md ring-1 ring-gray-100"
    }`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-6 py-5 flex items-center gap-4 hover:bg-gray-50/30 transition"
      >
        {/* Icon */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${color}dd, ${color}88)` }}
        >
          {crypto.symbol.slice(0, 2)}
        </div>

        {/* Name + qty */}
        <div className="text-left flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm">{crypto.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: color }}
              />
            </div>
            <p className="text-xs text-gray-400">{fmt(totalQty, 4)} {crypto.symbol}</p>
          </div>
        </div>

        {/* Avg cost */}
        <div className="text-right hidden lg:block">
          <p className="text-xs text-gray-400 mb-0.5">Avg cost</p>
          <p className="text-sm font-semibold text-gray-600">{fmt(avgUnitCost)} €</p>
        </div>

        {/* Current value */}
        <div className="text-right hidden md:block">
          <p className="text-xs text-gray-400 mb-0.5">Value</p>
          <p className="text-sm font-semibold text-gray-800">{fmt(currentValue)} €</p>
        </div>

        {/* Gain badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 ${
          positive
            ? "bg-emerald-50 text-emerald-600"
            : "bg-red-50 text-red-500"
        }`}>
          {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          <span>{positive ? "+" : ""}{fmt(gain)} €</span>
          <span className="opacity-60">({positive ? "+" : ""}{gainPct}%)</span>
        </div>

        {/* Chevron */}
        <div className={`text-gray-300 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}>
          <ChevronDown size={16} />
        </div>
      </button>

      {/* Expanded */}
      {open && (
        <div className="border-t border-gray-50 bg-gray-50/40 px-6 py-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Purchase History
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Quantity</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Price / unit</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Total paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {crypto.purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(p.date)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-700 text-xs">
                      {fmt(p.quantity, 4)} <span className="text-gray-400 font-normal">{crypto.symbol}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 text-xs">{fmt(p.priceAtPurchase)} €</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800 text-xs">{fmt(p.quantity * p.priceAtPurchase)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary mini cards */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total invested", value: `${fmt(totalCost)} €`, color: "text-gray-800" },
              { label: "Total quantity", value: `${fmt(totalQty, 4)} ${crypto.symbol}`, color: "text-gray-800" },
              { label: "Avg unit cost", value: `${fmt(avgUnitCost)} €`, color: "text-gray-800" },
              { label: "Current price", value: `${fmt(crypto.currentPrice)} €`, color: "text-blue-500" },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-xl p-3 ring-1 ring-gray-100">
                <p className="text-gray-400 text-xs mb-1">{item.label}</p>
                <p className={`font-bold text-sm ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    fetch("https://127.0.0.1:8000/api/wallet", {
      method: "GET",
      headers: { "Content-Type": "application/json", "X-User-Id": user?.id },
    })
      .then((res) => { if (!res.ok) throw new Error("Unauthorized or server error"); return res.json(); })
      .then((data) => setWallet(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading portfolio...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl p-8 text-center shadow ring-1 ring-red-100 max-w-sm">
        <p className="text-red-500 font-semibold mb-1">Error</p>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    </div>
  );

  const totalInvested = wallet.cryptos.reduce((s, c) => s + computeCryptoStats(c).totalCost, 0);
  const totalCurrentValue = wallet.cryptos.reduce((s, c) => s + computeCryptoStats(c).currentValue, 0);
  const totalGain = totalCurrentValue - totalInvested;
  const totalPositive = totalGain >= 0;
  const gainPct = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center shadow">
            <Wallet2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Wallet</h1>
            <p className="text-gray-400 text-xs mt-0.5">{wallet.cryptos.length} active position{wallet.cryptos.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* EUR Balance */}
          <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-100 flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <DollarSign size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">EUR Balance</p>
              <p className="text-xl font-bold text-gray-800">{fmt(wallet.euroBalance)} €</p>
              <p className="text-xs text-gray-400 mt-0.5">Available to invest</p>
            </div>
          </div>

          {/* Portfolio value */}
          <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-100 flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <BarChart3 size={20} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Portfolio Value</p>
              <p className="text-xl font-bold text-blue-500">{fmt(totalCurrentValue)} €</p>
              <p className="text-xs text-gray-400 mt-0.5">Current market value</p>
            </div>
          </div>

          {/* Global gain */}
          <div className={`rounded-2xl p-5 shadow-sm ring-1 flex items-center gap-4 ${
            totalPositive ? "bg-emerald-50 ring-emerald-100" : "bg-red-50 ring-red-100"
          }`}>
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              totalPositive ? "bg-emerald-100" : "bg-red-100"
            }`}>
              {totalPositive
                ? <TrendingUp size={20} className="text-emerald-500" />
                : <TrendingDown size={20} className="text-red-500" />}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">Global Gain / Loss</p>
              <p className={`text-xl font-bold ${totalPositive ? "text-emerald-600" : "text-red-500"}`}>
                {totalPositive ? "+" : ""}{fmt(totalGain)} €
              </p>
              <p className={`text-xs mt-0.5 ${totalPositive ? "text-emerald-400" : "text-red-400"}`}>
                {totalPositive ? "+" : ""}{gainPct}% overall
              </p>
            </div>
          </div>
        </div>

        {/* Assets */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Assets</p>
          <p className="text-xs text-gray-300">{wallet.cryptos.length} position{wallet.cryptos.length !== 1 ? "s" : ""}</p>
        </div>

        {wallet.cryptos.length === 0 ? (
          <div className="bg-white rounded-2xl p-14 text-center ring-1 ring-gray-100 shadow-sm">
            <Wallet2 size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-medium">No assets yet</p>
            <p className="text-gray-300 text-xs mt-1">Go to the market to start investing.</p>
          </div>
        ) : (
          wallet.cryptos.map((c) => <CryptoCard key={c.id} crypto={c} />)
        )}
      </div>
    </div>
  );
}