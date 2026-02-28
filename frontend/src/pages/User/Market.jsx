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
  const [cryptos, setCryptos]           = useState([]);
  const [selected, setSelected]         = useState(null);
  const [history, setHistory]           = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading market...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-red-500">{error}</p>
    </div>
  );

  const color    = selected ? (CRYPTO_COLORS[selected.symbol] ?? "#43698f") : "#43698f";
  const positive = selected ? selected.change >= 0 : true;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Market <span className="text-blue-500">📈</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1 hidden md:block">
          Select a cryptocurrency to view its chart
        </p>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden md:flex gap-6 h-[calc(100vh-110px)]">
        <div className="w-80 flex-shrink-0 flex flex-col gap-2 overflow-y-auto pr-1">
          {cryptos.map((crypto) => (
            <CryptoListItem
              key={crypto.id}
              crypto={crypto}
              isSelected={selected?.id === crypto.id}
              onClick={() => setSelected(crypto)}
            />
          ))}
        </div>
        {selected && (
          <ChartPanel
            selected={selected}
            history={history}
            loadingChart={loadingChart}
            color={color}
            positive={positive}
            navigate={navigate}
          />
        )}
      </div>

      {/* ── MOBILE ── */}
      <div className="md:hidden flex flex-col gap-4">

        {/* Chart toujours visible */}
        {selected && (
          <ChartPanel
            selected={selected}
            history={history}
            loadingChart={loadingChart}
            color={color}
            positive={positive}
            navigate={navigate}
            mobile
          />
        )}

        {/* Liste scrollable horizontalement avec gradient */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            All cryptocurrencies
          </p>
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {cryptos.map((crypto) => {
                const col = CRYPTO_COLORS[crypto.symbol] ?? "#43698f";
                const pos = crypto.change >= 0;
                const isSelected = selected?.id === crypto.id;
                return (
                  <button
                    key={crypto.id}
                    onClick={() => setSelected(crypto)}
                    className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl ring-1 transition-all ${
                      isSelected
                        ? "bg-white ring-blue-300 shadow-md"
                        : "bg-white ring-gray-100"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${col}dd, ${col}88)` }}
                    >
                      {crypto.symbol.slice(0, 2)}
                    </div>
                    <p className="text-xs font-semibold text-gray-800">{crypto.symbol}</p>
                    <p className="text-xs font-bold text-gray-700">{fmt(crypto.currentPrice)} €</p>
                    <p className={`text-xs font-semibold ${pos ? "text-emerald-500" : "text-red-500"}`}>
                      {pos ? "+" : ""}{fmt(crypto.change, 2)}%
                    </p>
                  </button>
                );
              })}
            </div>
            {/* Gradient fondu droite */}
            <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CryptoListItem({ crypto, isSelected, onClick }) {
  const col = CRYPTO_COLORS[crypto.symbol] ?? "#43698f";
  const pos = crypto.change >= 0;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl px-4 py-3 transition-all ring-1 ${
        isSelected
          ? "bg-white ring-blue-300 shadow-md"
          : "bg-white ring-gray-100 hover:ring-gray-200 shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${col}dd, ${col}88)` }}
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
            pos ? "text-emerald-500" : "text-red-500"
          }`}>
            {pos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {pos ? "+" : ""}{fmt(crypto.change, 2)}%
          </p>
        </div>
      </div>
    </button>
  );
}

function ChartPanel({ selected, history, loadingChart, color, positive, navigate, mobile }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 flex flex-col ${
      mobile ? "" : "flex-1"
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow"
            style={{ background: `linear-gradient(135deg, ${color}dd, ${color}88)` }}
          >
            {selected.symbol.slice(0, 2)}
          </div>
          <div>
            <h2 className="text-lg md:text-2xl font-bold text-gray-800">{selected.name}</h2>
            <p className="text-gray-400 text-xs">{selected.symbol}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/user/buy/${selected.id}`)}
            className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-full text-sm transition"
          >
            <ShoppingCart size={14} />
            Buy
          </button>
          <button
            onClick={() => navigate(`/user/sell/${selected.id}`)}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-full text-sm transition"
          >
            <TrendingDown size={14} />
            Sell
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-end gap-3 mb-4">
        <p className="text-2xl md:text-4xl font-bold text-gray-800">{fmt(selected.currentPrice)} €</p>
        <p className={`text-sm font-semibold flex items-center gap-1 mb-1 ${
          positive ? "text-emerald-500" : "text-red-500"
        }`}>
          {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {positive ? "+" : ""}{fmt(selected.change, 2)}%
        </p>
      </div>

      {/* Chart */}
      <div style={{ height: "250px" }}>
        {loadingChart ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
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
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} interval={4} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} domain={["auto", "auto"]} tickFormatter={(v) => `${fmt(v)} €`} width={70} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => [`${fmt(value)} €`, "Price"]}
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.1)", fontSize: "12px" }}
              />
              <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2.5} fill="url(#chartGrad)" dot={false} activeDot={{ r: 5, fill: color }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      <p className="text-xs text-gray-300 text-right mt-2">Price evolution — last 30 days</p>
    </div>
  );
}