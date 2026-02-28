import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingDown } from "lucide-react";

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

export default function Sell() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [crypto, setCrypto]         = useState(null);
  const [ownedQty, setOwnedQty]     = useState(0);
  const [wallet, setWallet]         = useState(null);
  const [quantity, setQuantity]     = useState("");
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage]       = useState(null);

  const user = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    const headers = {
      "Content-Type": "application/json",
      "X-User-Id": user?.id,
    };

    Promise.all([
      fetch("https://127.0.0.1:8000/api/market", { headers }).then(r => r.json()),
      fetch("https://127.0.0.1:8000/api/wallet", { headers }).then(r => r.json()),
    ])
      .then(([marketData, walletData]) => {
        // Trouve la crypto depuis l'URL
        const found = marketData.find((c) => c.id === parseInt(id));
        if (!found) throw new Error("Cryptocurrency not found");
        setCrypto(found);
        setWallet(walletData);

        // Calcule la quantité possédée depuis le wallet
        const cryptoInWallet = walletData.cryptos.find((c) => c.id === parseInt(id));
        if (cryptoInWallet) {
          const qty = cryptoInWallet.purchases.reduce((s, p) => s + p.quantity, 0);
          setOwnedQty(qty);
        }
      })
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, [id]);

  const totalReceived = crypto && quantity ? crypto.currentPrice * parseFloat(quantity) : 0;
  const insufficientCrypto = quantity ? parseFloat(quantity) > ownedQty : false;

  const handleSubmit = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      setMessage({ type: "error", text: "Please enter a valid quantity" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("https://127.0.0.1:8000/api/sell", {
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
        setMessage({
          type: "success",
          text: `Successfully sold ${quantity} ${crypto.symbol} for ${fmt(data.totalReceived)} €!`,
        });
        setWallet((w) => ({ ...w, euroBalance: data.newBalance }));
        setOwnedQty((prev) => prev - parseFloat(quantity));
        setQuantity("");
      } else {
        setMessage({
          type: "error",
          text: data.message === "Insufficient crypto balance"
            ? `You only own ${fmt(data.owned, 4)} ${crypto.symbol}.`
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
              <h1 className="text-2xl font-bold text-gray-800">Sell {crypto.name}</h1>
              <p className="text-gray-400 text-sm">{crypto.symbol}</p>
            </div>
          </div>

          {/* Current price */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Current price</p>
            <p className="text-3xl font-bold text-blue-500">{fmt(crypto.currentPrice)} €</p>
          </div>

          {/* Owned qty + EUR balance */}
          <div className="flex justify-between items-center mb-2 text-sm">
            <span className="text-gray-400">You own</span>
            <span className="font-semibold text-gray-700">{fmt(ownedQty, 4)} {crypto.symbol}</span>
          </div>
          {wallet && (
            <div className="flex justify-between items-center mb-6 text-sm">
              <span className="text-gray-400">EUR Balance</span>
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

          {ownedQty <= 0 ? (
            <div className="text-center text-gray-400 py-6">
              <p>You don't own any {crypto.name}.</p>
              <button
                onClick={() => navigate(`/user/buy/${crypto.id}`)}
                className="mt-4 text-blue-500 hover:underline text-sm"
              >
                Buy {crypto.symbol} instead
              </button>
            </div>
          ) : (
            <>
              {/* Quantity input */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm mb-2">
                  Quantity to sell
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full rounded-full px-5 py-3 bg-gray-100 outline-none focus:ring-2 focus:ring-red-300 text-gray-800"
                  />
                  <button
                    onClick={() => setQuantity(String(ownedQty))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-blue-500 hover:underline"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Total received */}
              {quantity > 0 && (
                <div className={`flex justify-between items-center mb-6 p-3 rounded-xl text-sm ${
                  insufficientCrypto ? "bg-red-50" : "bg-green-50"
                }`}>
                  <span className="text-gray-500">You will receive</span>
                  <span className={`font-bold text-lg ${insufficientCrypto ? "text-red-500" : "text-green-500"}`}>
                    {fmt(totalReceived)} €
                  </span>
                </div>
              )}

              {/* Sell button */}
              <button
                onClick={handleSubmit}
                disabled={submitting || insufficientCrypto || !quantity || parseFloat(quantity) <= 0}
                className="w-full py-3 rounded-full text-white font-semibold bg-gradient-to-r from-red-500 to-red-400 hover:scale-[1.02] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <TrendingDown size={18} />
                {submitting ? "Processing..." : `Sell ${crypto.symbol}`}
              </button>

              {insufficientCrypto && quantity > 0 && (
                <p className="text-center text-red-500 text-xs mt-3">
                  Insufficient {crypto.symbol} balance
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}