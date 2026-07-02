import React, { useState } from "react";
import { X, AlertTriangle, ShieldAlert } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  postId: string;
  onClose: () => void;
  onSubmit: (data: {
    postId: string;
    reason: string;
    suggestedColor: "green" | "blue" | "red";
  }) => Promise<void>;
}

export default function ReportModal({ isOpen, postId, onClose, onSubmit }: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [suggestedColor, setSuggestedColor] = useState<"green" | "blue" | "red">("blue");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        postId,
        reason,
        suggestedColor
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setReason("");
        setSuggestedColor("blue");
        onClose();
      }, 2200);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/40">
          <span className="font-bold text-slate-200 text-sm flex items-center space-x-2">
            <AlertTriangle size={15} className="text-amber-500" />
            <span>Presentar Denuncia / Reclamo</span>
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-950/80 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              ✓
            </div>
            <h4 className="font-bold text-slate-100 text-sm">Denuncia enviada con éxito</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              La queja ha sido registrada en el Panel de Administración de Voxium. El equipo evaluará la veracidad del reporte.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs text-slate-400 leading-relaxed space-y-1.5">
              <p className="font-semibold text-slate-300">⚖️ Políticas de Denuncia Falsa:</p>
              <p>Un reporte falso repetitivo puede acarrear una suspensión de cuenta o advertencia en tu perfil. Asegúrate de clasificar correctamente el contenido.</p>
            </div>

            {/* Suggested Classification rating */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 flex items-center space-x-1">
                <ShieldAlert size={13} className="text-indigo-400" />
                <span>¿Qué clasificación sugerirías para este post?</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSuggestedColor("green")}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${suggestedColor === "green" ? "bg-emerald-950/60 border-emerald-500 text-emerald-300" : "bg-slate-950/40 border-slate-800/60 text-slate-500 hover:text-slate-300"}`}
                >
                  <span className="text-xs font-bold block">🟢 Verde</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">SFW</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSuggestedColor("blue")}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${suggestedColor === "blue" ? "bg-indigo-950/60 border-indigo-500 text-indigo-300" : "bg-slate-950/40 border-slate-800/60 text-slate-500 hover:text-slate-300"}`}
                >
                  <span className="text-xs font-bold block">🔵 Azul</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">NSFW / +18</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSuggestedColor("red")}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${suggestedColor === "red" ? "bg-rose-950/60 border-rose-500 text-rose-300" : "bg-slate-950/40 border-slate-800/60 text-slate-500 hover:text-slate-300"}`}
                >
                  <span className="text-xs font-bold block">🔴 Rojo</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Ilegal / TOS</span>
                </button>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Detalla la razón de tu denuncia
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explica detalladamente por qué consideras inapropiado este post..."
                rows={3}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-500"
              />
            </div>

            {/* Action button */}
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm transition-all duration-200 cursor-pointer shadow-md disabled:opacity-50"
            >
              {loading ? "Registrando queja..." : "Enviar Denuncia"}
            </button>

          </form>
        )}
      </div>
    </div>
  );
}
