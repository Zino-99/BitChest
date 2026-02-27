import { useState } from "react";
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockWallet = {
  user: { firstname: "Bruno", lastname: "Dupont" },
  euroBalance: 1250.0,
  cryptos: [
    {
      id: 1,
      name: "Bitcoin",
      symbol: "BTC",
      currentPrice: 30000,
      color: "#F7931A",
      purchases: [
        { id: 1, date: "2020-10-01", quantity: 1, priceAtPurchase: 10000 },
        { id: 2, date: "2021-03-14", quantity: 0.5, priceAtPurchase: 18000 },
        { id: 3, date: "2022-01-27", quantity: 0.5, priceAtPurchase: 20000 },
      ],
    },
    {
      id: 2,
      name: "Ethereum",
      symbol: "ETH",
      currentPrice: 1800,
      color: "#627EEA",
      purchases: [
        { id: 4, date: "2021-05-10", quantity: 3, priceAtPurchase: 3200 },
        { id: 5, date: "2022-06-20", quantity: 2, priceAtPurchase: 1100 },
      ],
    },
    {
      id: 3,
      name: "Solana",
      symbol: "SOL",
      currentPrice: 95,
      color: "#9945FF",
      purchases: [
        { id: 6, date: "2023-01-15", quantity: 10, priceAtPurchase: 120 },
      ],
    },
  ],
};

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
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

// ─── Components ───────────────────────────────────────────────────────────────

function CryptoCard({ crypto }) {
  const [open, setOpen] = useState(false);
  const { totalQty, totalCost, avgUnitCost, currentValue, gain } =
    computeCryptoStats(crypto);
  const positive = gain >= 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow"
            style={{ backgroundColor: crypto.color }}
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
            <p className="text-xs text-gray-400">Coût unitaire</p>
            <p className="text-sm font-medium text-gray-700">
              {fmt(avgUnitCost)} €
            </p>
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">Valeur actuelle</p>
            <p className="text-sm font-medium text-gray-700">
              {fmt(currentValue)} €
            </p>
          </div>

          <div className="text-right min-w-[100px]">
            <p className="text-xs text-gray-400">Plus-value</p>
            <p
              className={`text-sm font-bold flex items-center justify-end gap-1 ${
                positive ? "text-green-500" : "text-red-500"
              }`}
            >
              {positive ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
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
            Historique des achats
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase">
                <th className="text-left pb-2">Date</th>
                <th className="text-right pb-2">Quantité</th>
                <th className="text-right pb-2">Cours d'achat</th>
                <th className="text-right pb-2">Total payé</th>
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
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Wallet() {
  const wallet = mockWallet;

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
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Solde EUR
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {fmt(wallet.euroBalance)} €
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Valeur du portefeuille
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {fmt(totalCurrentValue)} €
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              Plus-value globale
            </p>
            <p
              className={`text-2xl font-bold flex items-center gap-2 ${
                totalPositive ? "text-green-500" : "text-red-500"
              }`}
            >
              {totalPositive ? (
                <TrendingUp size={20} />
              ) : (
                <TrendingDown size={20} />
              )}
              {totalPositive ? "+" : ""}
              {fmt(totalGain)} €
            </p>
          </div>
        </div>

        <div>
          {wallet.cryptos.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-xl">
              Vous ne possédez aucune crypto pour le moment.
            </div>
          ) : (
            wallet.cryptos.map((c) => (
              <CryptoCard key={c.id} crypto={c} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
