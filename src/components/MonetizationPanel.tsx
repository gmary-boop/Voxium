import { useState } from "react";
import { CreditCard, Sparkles, Award, Coins, HelpCircle, Gift, CheckCircle2 } from "lucide-react";
import { UserProfile } from "../types";

interface MonetizationPanelProps {
  currentUser: UserProfile;
  onRefreshProfile: () => void;
}

export default function MonetizationPanel({ currentUser, onRefreshProfile }: MonetizationPanelProps) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [tipReceiver, setTipReceiver] = useState("bot_tech");
  const [tipAmount, setTipAmount] = useState(100);

  const creators = [
    { id: "bot_tech", name: "Carlos Tech" },
    { id: "bot_vibe", name: "Lucía Estética" },
    { id: "bot_cosmos", name: "Elena Cosmos" }
  ];

  const handleTogglePremium = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/monetization/premium", { method: "POST" });
      if (res.ok) {
        setSuccessMsg(currentUser.isPremium ? "Membresía Premium cancelada" : "¡Felicidades! Eres miembro Voxium Premium ✨");
        onRefreshProfile();
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimTokens = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/monetization/tokens/claim", { method: "POST" });
      if (res.ok) {
        setSuccessMsg("¡Has reclamado tus 200 tokens diarios gratuitos! 🪙");
        onRefreshProfile();
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTip = async () => {
    if ((currentUser.tokens || 0) < tipAmount) {
      alert("Tokens insuficientes. Reclama tokens diarios gratuitos antes.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/monetization/tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: tipReceiver, amount: tipAmount })
      });
      if (res.ok) {
        const receiverName = creators.find(c => c.id === tipReceiver)?.name || "Creador";
        setSuccessMsg(`¡Has enviado una propina de ${tipAmount} tokens a ${receiverName}! Revisa tus mensajes privados 📩`);
        onRefreshProfile();
        setTimeout(() => setSuccessMsg(""), 4500);
      } else {
        const data = await res.json();
        alert(data.error || "Ocurrió un error");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="voxium_monetization_panel" className="max-w-md mx-auto p-4 bg-slate-950 border border-slate-900 rounded-2xl shadow-xl space-y-4">
      
      {/* Wallet Balance Display */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 border border-indigo-500/20 rounded-xl p-4 text-center space-y-3">
        <Coins size={36} className="mx-auto text-amber-400 animate-bounce" />
        <div>
          <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-widest">Cartera Voxium Tokens</span>
          <h2 className="text-3xl font-extrabold text-white mt-1">
            {currentUser.tokens || 0} <span className="text-amber-400 text-lg">🪙</span>
          </h2>
        </div>
        
        <div className="pt-2 flex gap-2 justify-center">
          <button
            onClick={handleClaimTokens}
            disabled={loading}
            className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Claim 200 Tokens Gratis
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-indigo-950/50 border border-indigo-900 text-indigo-300 text-xs py-2 px-3 rounded-lg text-center animate-in fade-in duration-250">
          {successMsg}
        </div>
      )}

      {/* Subscription cards */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1.5">
            <Award className="text-violet-400" size={18} />
            <span className="font-bold text-xs text-slate-200">Suscripción Voxium Premium</span>
          </div>
          <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-900/50 px-2 py-0.5 rounded-full font-bold">
            Socio Fundador
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Soporta el mantenimiento económico del servidor Voxium y desbloquea insignias exclusivas de verificación en tus publicaciones.
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
          <div>
            <span className="text-xs text-slate-400 block">Precio exclusivo de prueba:</span>
            <span className="text-sm font-extrabold text-white">$1.99 USD / mes</span>
          </div>
          <button
            onClick={handleTogglePremium}
            disabled={loading}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${currentUser.isPremium ? "bg-rose-950 text-rose-300 border border-rose-900/40" : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow"}`}
          >
            {currentUser.isPremium ? "Cancelar Premium" : "Adquirir Membresía"}
          </button>
        </div>
      </div>

      {/* Sending tips simulator to creators */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center space-x-1.5">
          <Gift className="text-amber-500" size={18} />
          <span className="font-bold text-xs text-slate-200">Apoyar e interactuar con Creadores</span>
        </div>

        <div className="space-y-2">
          {/* Target Creator */}
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">Destinatario del Regalo:</label>
            <select
              value={tipReceiver}
              onChange={(e) => setTipReceiver(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              {creators.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Preset Tipping pool */}
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">Monto de Propina:</label>
            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 250].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTipAmount(val)}
                  className={`py-1 rounded-md text-xs font-bold border transition-all cursor-pointer ${tipAmount === val ? "bg-amber-950 border-amber-500 text-amber-300" : "bg-slate-950/40 border-slate-800 text-slate-500"}`}
                >
                  {val} 🪙
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSendTip}
            disabled={loading}
            className="w-full mt-2 py-2 bg-slate-950 hover:bg-slate-900 text-amber-400 hover:text-amber-300 font-bold border border-amber-500/20 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Enviar Regalo de {tipAmount} Tokens
          </button>
        </div>
      </div>

    </div>
  );
}
