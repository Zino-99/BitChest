import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CRYPTO_COLORS = {
  BTC:  "#F7931A", ETH:  "#627EEA", XRP:  "#346AA9",
  BCH:  "#8DC351", ADA:  "#0033AD", LTC:  "#BFBBBB",
  DASH: "#008CE7", IOTA: "#242424", XEM:  "#67B2E8",
  XLM:  "#7D00FF",
};

function fmt(n, decimals = 2) {
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function Market() {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://127.0.0.1:8000/api/market", {
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then((data) => setCryptos(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-500 text-lg animate-pulse">Loading market...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-sm">
        <p className="text-red-500 font-semibold mb-2">Error</p>
        <p className="text-gray-600 text-sm">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Market 📈</h1>
        <p className="text-gray-400 text-sm mt-1">Live cryptocurrency prices</p>
      </div>

      <div className="max-w-3xl mx-auto">
        {cryptos.map((crypto) => {
          const positive = crypto.change >= 0;
          const color = CRYPTO_COLORS[crypto.symbol] ?? "#43698f";

          return (
            <div
              key={crypto.id}
              className="bg-white rounded-2xl shadow-md px-6 py-4 mb-4 flex items-center justify-between"
            >
              {/* Left: icon + name */}
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow"
                  style={{ backgroundColor: color }}
                >
                  {crypto.symbol.slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{crypto.name}</p>
                  <p className="text-xs text-gray-400">{crypto.symbol}</p>
                </div>
              </div>

              {/* Right: price + change + buy button */}
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-bold text-gray-800">{fmt(crypto.currentPrice)} €</p>
                  <p
                    className={`text-xs font-semibold flex items-center justify-end gap-1 ${
                      positive ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {positive ? "+" : ""}{fmt(crypto.change, 2)}%
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/buy/${crypto.id}`)}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition"
                >
                  <ShoppingCart size={14} />
                  Buy
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}