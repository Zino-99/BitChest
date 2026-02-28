import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

const CRYPTO_COLORS = {
  BTC:  "#F7931A", ETH:  "#627EEA", XRP:  "#346AA9",
  BCH:  "#8DC351", ADA:  "#0033AD", LTC:  "#A0A0A0",
  DASH: "#008CE7", IOTA: "#555555", XEM:  "#67B2E8",
  XLM:  "#7D00FF",
};

function fmt(n, decimals = 2) {
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function Market() {
  const [cryptos, setCryptos]       = useState([]);
  const [selected, setSelected]     = useState(null);
  const [history, setHistory]       = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://127.0.0.1:8000/api/market", {
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => { if (!res.ok) throw new Error("Server error"); return res.json(); })
      .then((data) => { setCryptos(data); setSelected(data[0]); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Charge l'historique quand on sélectionne une crypto
  useEffect(() => {
    if (!selected) return;
    setLoadingChart(true);
    setHistory([]);
    fetch(`https://127.0.0.1:8000/api/market/${selected.id}/history`)
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .finally(() => setLoadingChart(false));
  }, [selected]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-400 animate-pulse">Loading market...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-red-500">{error}</p>
    </div>
  );

  const color = selected ? (CRYPTO_COLORS[selected.symbol] ?? "#43698f") : "#43698f";
  const positive = selected ? selected.change >= 0 : true;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Market <span className="text-blue-500">📈</span></h1>
        <p className="text-gray-400 text-sm mt-1">Select a cryptocurrency to view its chart</p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-160px)]">

        {/* ── Left: crypto list ── */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-2 overflow-y-auto pr-1">
          {cryptos.map((crypto) => {
            const col = CRYPTO_COLORS[crypto.symbol] ?? "#43698f";
            const pos = crypto.change >= 0;
            const isSelected = selected?.id === crypto.id;

            return (
              <button
                key={crypto.id}
                onClick={() => setSelected(crypto)}
                className={`w-full text-left rounded-2xl px-4 py-3 transition-all border-2 ${
                  isSelected
                    ? "bg-white border-blue-400 shadow-md"
                    : "bg-white border-transparent hover:border-gray-200 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                      style={{ backgroundColor: col }}
                    >
                      {crypto.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{crypto.name}</p>
                      <p className="text-xs text-gray-400">{crypto.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 text-sm">{fmt(crypto.currentPrice)} €</p>
                    <p className={`text-xs font-semibold flex items-center justify-end gap-1 ${
                      pos ? "text-green-500" : "text-red-500"
                    }`}>
                      {pos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {pos ? "+" : ""}{fmt(crypto.change, 2)}%
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Right: chart panel ── */}
        {selected && (
          <div className="flex-1 bg-white rounded-2xl shadow-md p-6 flex flex-col">

            {/* Crypto header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow"
                  style={{ backgroundColor: color }}
                >
                  {selected.symbol.slice(0, 2)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selected.name}</h2>
                  <p className="text-gray-400 text-sm">{selected.symbol}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/user/buy/${selected.id}`)}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded-full transition"
                >
                  <ShoppingCart size={16} />
                  Buy
                </button>
                <button
                  onClick={() => navigate(`/user/sell/${selected.id}`)}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-full transition"
                >
                  <TrendingDown size={16} />
                  Sell
                </button>
              </div>
            </div>

            {/* Price + change */}
            <div className="flex items-end gap-4 mb-6">
              <p className="text-4xl font-bold text-gray-800">{fmt(selected.currentPrice)} €</p>
              <p className={`text-lg font-semibold flex items-center gap-1 mb-1 ${
                positive ? "text-green-500" : "text-red-500"
              }`}>
                {positive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                {positive ? "+" : ""}{fmt(selected.change, 2)}%
              </p>
            </div>

            {/* Chart */}
            <div className="flex-1">
              {loadingChart ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-400 animate-pulse">Loading chart...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      interval={4}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      domain={["auto", "auto"]}
                      tickFormatter={(v) => `${fmt(v)} €`}
                      width={75}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [`${fmt(value)} €`, "Price"]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                        fontSize: "13px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={color}
                      strokeWidth={2.5}
                      fill="url(#chartGrad)"
                      dot={false}
                      activeDot={{ r: 5, fill: color }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <p className="text-xs text-gray-300 text-right mt-2">Price evolution — last 30 days</p>
          </div>
        )}
      </div>
    </div>
  );
}