import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function computeCryptoStats(crypto) {
  const totalQty = crypto.purchases.reduce((s, p) => s + p.quantity, 0);
  const totalCost = crypto.purchases.reduce(
    (s, p) => s + p.quantity * p.priceAtPurchase,
    0
  );
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
  return new Date(dateStr).toLocaleDateString("en-US");
}

// ─── CryptoCard ───────────────────────────────────────────────────────────────
const CRYPTO_COLORS = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  SOL: "#9945FF",
  BNB: "#F3BA2F",
  ADA: "#0033AD",
  XRP: "#346AA9",
};

function CryptoCard({ crypto }) {
  const [open, setOpen] = useState(false);
  const { totalQty, totalCost, avgUnitCost, currentValue, gain } =
    computeCryptoStats(crypto);
  const positive = gain >= 0;
  const color = CRYPTO_COLORS[crypto.symbol] ?? "#43698f";

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow"
            style={{ backgroundColor: color }}
          >
            {crypto.symbol.slice(0, 2)}
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-800">{crypto.name}</p>
            <p className="text-xs text-gray-400">
              {fmt(totalQty, 4)} {crypto.symbol}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">Unit cost</p>
            <p className="text-sm font-medium text-gray-700">
              {fmt(avgUnitCost)} €
            </p>
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">Current value</p>
            <p className="text-sm font-medium text-gray-700">
              {fmt(currentValue)} €
            </p>
          </div>

          <div className="text-right min-w-[100px]">
            <p className="text-xs text-gray-400">Gain / Loss</p>
            <p
              className={`text-sm font-bold flex items-center justify-end gap-1 ${
                positive ? "text-green-500" : "text-red-500"
              }`}
            >
              {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {positive ? "+" : ""}
              {fmt(gain)} €
            </p>
          </div>

          <div className="text-gray-400">
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3 tracking-wide">
            Purchase history
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase">
                <th className="text-left pb-2">Date</th>
                <th className="text-right pb-2">Quantity</th>
                <th className="text-right pb-2">Purchase price</th>
                <th className="text-right pb-2">Total paid</th>
              </tr>
            </thead>
            <tbody>
              {crypto.purchases.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="py-2 text-gray-600">{fmtDate(p.date)}</td>
                  <td className="py-2 text-right text-gray-700">
                    {fmt(p.quantity, 4)} {crypto.symbol}
                  </td>
                  <td className="py-2 text-right text-gray-700">
                    {fmt(p.priceAtPurchase)} €
                  </td>
                  <td className="py-2 text-right font-medium text-gray-800">
                    {fmt(p.quantity * p.priceAtPurchase)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 pt-3 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-gray-400 text-xs">Total invested</p>
              <p className="font-semibold text-gray-800">{fmt(totalCost)} €</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Total quantity</p>
              <p className="font-semibold text-gray-800">
                {fmt(totalQty, 4)} {crypto.symbol}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Avg unit cost</p>
              <p className="font-semibold text-gray-800">
                {fmt(avgUnitCost)} €
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Current price</p>
              <p className="font-semibold text-blue-500">
                {fmt(crypto.currentPrice)} €
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));

    fetch("https://127.0.0.1:8000/api/wallet", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": user?.id,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized or server error");
        return res.json();
      })
      .then((data) => setWallet(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-lg animate-pulse">
          Loading your portfolio...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-sm">
          <p className="text-red-500 font-semibold mb-2">Error</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const totalInvested = wallet.cryptos.reduce((s, c) => {
    const { totalCost } = computeCryptoStats(c);
    return s + totalCost;
  }, 0);

  const totalCurrentValue = wallet.cryptos.reduce((s, c) => {
    const { currentValue } = computeCryptoStats(c);
    return s + currentValue;
  }, 0);

  const totalGain = totalCurrentValue - totalInvested;
  const totalPositive = totalGain >= 0;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto mb-6">
        <h1 className="text-4xl font-bold text-gray-800">
          Hello, {wallet.user.firstname} {wallet.user.lastname} 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">Here is your portfolio</p>
      </div>

      <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-md">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            EUR Balance
          </p>
          <p className="text-2xl font-bold text-gray-800">
            {fmt(wallet.euroBalance)} €
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-md">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            Portfolio value
          </p>
          <p className="text-2xl font-bold text-blue-500">
            {fmt(totalCurrentValue)} €
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-md">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            Global gain / loss
          </p>
          <p
            className={`text-2xl font-bold flex items-center gap-2 ${
              totalPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {totalPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            {totalPositive ? "+" : ""}
            {fmt(totalGain)} €
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-gray-700 font-semibold text-lg mb-4">
          My cryptocurrencies
        </h2>
        {wallet.cryptos.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow">
            You don't own any cryptocurrency yet.
          </div>
        ) : (
          wallet.cryptos.map((c) => <CryptoCard key={c.id} crypto={c} />)
        )}
      </div>
    </div>
  );
}