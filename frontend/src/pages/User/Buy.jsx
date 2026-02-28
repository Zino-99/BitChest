import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";

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

export default function Buy() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [crypto, setCrypto]   = useState(null);
  const [wallet, setWallet]   = useState(null);
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const user = JSON.parse(sessionStorage.getItem("user"));

  // Charge la crypto + le solde wallet
  useEffect(() => {
    const headers = {
      "Content-Type": "application/json",
      "X-User-Id": user?.id,
    };

    Promise.all([
      fetch("https://127.0.0.1:8000/api/market", { headers }).then(r => r.json()),
      fetch("https://127.0.0.1:8000/api/wallet", { headers }).then(r => r.json()),
    ])
      .then(([cryptos, walletData]) => {
        const found = cryptos.find((c) => c.id === parseInt(id));
        if (!found) throw new Error("Cryptocurrency not found");
        setCrypto(found);
        setWallet(walletData);
      })
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, [id]);

  const totalCost = crypto && quantity ? crypto.currentPrice * parseFloat(quantity) : 0;
  const insufficientBalance = wallet && totalCost > wallet.euroBalance;

  const handleSubmit = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      setMessage({ type: "error", text: "Please enter a valid quantity" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("https://127.0.0.1:8000/api/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": user?.id,
        },
        body: JSON.stringify({
          cryptoId: crypto.id,
          quantity: parseFloat(quantity),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: `Successfully bought ${quantity} ${crypto.symbol}!` });
        setWallet((w) => ({ ...w, euroBalance: data.newBalance }));
        setQuantity("");
      } else {
        setMessage({
          type: "error",
          text: data.message === "Insufficient balance"
            ? `Insufficient balance. You need ${fmt(data.required)} € but only have ${fmt(data.balance)} €.`
            : data.message,
        });
      }
    } catch {
      setMessage({ type: "error", text: "Server error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-500 text-lg animate-pulse">Loading...</p>
    </div>
  );

  if (!crypto) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-red-500">Cryptocurrency not found.</p>
    </div>
  );

  const color = CRYPTO_COLORS[crypto.symbol] ?? "#43698f";

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-md mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate("/user/Market")} 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition"
        >
          <ArrowLeft size={18} />
          Back to market
        </button>

        <div className="bg-white rounded-2xl shadow-md p-8">
          {/* Crypto header */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow"
              style={{ backgroundColor: color }}
            >
              {crypto.symbol.slice(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{crypto.name}</h1>
              <p className="text-gray-400 text-sm">{crypto.symbol}</p>
            </div>
          </div>

          {/* Current price */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Current price</p>
            <p className="text-3xl font-bold text-blue-500">{fmt(crypto.currentPrice)} €</p>
          </div>

          {/* EUR Balance */}
          {wallet && (
            <div className="flex justify-between items-center mb-6 text-sm">
              <span className="text-gray-400">Your EUR balance</span>
              <span className="font-semibold text-gray-700">{fmt(wallet.euroBalance)} €</span>
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}>
              {message.text}
            </div>
          )}

          {/* Quantity input */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-2">
              Quantity ({crypto.symbol})
            </label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-full px-5 py-3 bg-gray-100 outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
            />
          </div>

          {/* Total cost */}
          {quantity > 0 && (
            <div className={`flex justify-between items-center mb-6 p-3 rounded-xl text-sm ${
              insufficientBalance ? "bg-red-50" : "bg-blue-50"
            }`}>
              <span className="text-gray-500">Total cost</span>
              <span className={`font-bold text-lg ${insufficientBalance ? "text-red-500" : "text-blue-500"}`}>
                {fmt(totalCost)} €
              </span>
            </div>
          )}

          {/* Buy button */}
          <button
            onClick={handleSubmit}
            disabled={submitting || insufficientBalance || !quantity || parseFloat(quantity) <= 0}
            className="w-full py-3 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-400 hover:scale-[1.02] transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} />
            {submitting ? "Processing..." : `Buy ${crypto.symbol}`}
          </button>

          {insufficientBalance && quantity > 0 && (
            <p className="text-center text-red-500 text-xs mt-3">
              Insufficient balance
            </p>
          )}
        </div>
      </div>
    </div>
  );
}