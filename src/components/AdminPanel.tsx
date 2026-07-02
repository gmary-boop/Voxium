import { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle, Trash2, Ban, AlertOctagon, XCircle, FileText } from "lucide-react";
import { Complaint } from "../types";

interface AdminPanelProps {
  onRefreshFeed: () => void;
}

export default function AdminPanel({ onRefreshFeed }: AdminPanelProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchComplaints = () => {
    setLoading(true);
    fetch("/api/admin/complaints")
      .then(r => r.json())
      .then(data => setComplaints(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleResolve = async (id: string, action: 'green' | 'blue' | 'red' | 'dismiss') => {
    try {
      const res = await fetch(`/api/admin/complaints/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        setMsg(`Acción ejecutada con éxito para la denuncia #${id.substring(5, 10)}`);
        fetchComplaints();
        onRefreshFeed();
        setTimeout(() => setMsg(""), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="voxium_admin_panel" className="max-w-md mx-auto p-4 bg-slate-950 border border-slate-900 rounded-2xl shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center space-x-2 border-b border-slate-900 pb-3">
        <div className="w-7 h-7 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center">
          <ShieldCheck size={16} />
        </div>
        <div>
          <h2 className="font-extrabold text-sm text-slate-100">Panel de Control de Moderación</h2>
          <p className="text-[10px] text-slate-500">Regula contenido (🟢 Verde / 🔵 Azul / 🔴 Rojo) y sanciona reportes falsos</p>
        </div>
      </div>

      {msg && (
        <div className="bg-indigo-950/40 border border-indigo-900 text-indigo-300 text-xs py-2 px-3 rounded-lg flex items-center space-x-2 animate-in slide-in-from-top-1">
          <CheckCircle size={14} className="text-emerald-400" />
          <span>{msg}</span>
        </div>
      )}

      {/* Stats Quick grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 text-center">
          <span className="block text-[9px] text-slate-500 uppercase font-bold tracking-wider">Pendientes</span>
          <span className="text-lg font-extrabold text-amber-500">
            {complaints.filter(c => c.status === "pending").length}
          </span>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 text-center">
          <span className="block text-[9px] text-slate-500 uppercase font-bold tracking-wider">Resueltos</span>
          <span className="text-lg font-extrabold text-indigo-400">
            {complaints.filter(c => c.status === "resolved").length}
          </span>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 text-center">
          <span className="block text-[9px] text-slate-500 uppercase font-bold tracking-wider">Falsas / Descartadas</span>
          <span className="text-lg font-extrabold text-rose-400">
            {complaints.filter(c => c.status === "dismissed").length}
          </span>
        </div>
      </div>

      {/* Main complaint items list */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 flex items-center space-x-1.5 px-1">
          <FileText size={13} />
          <span>Quejas y Apelaciones de Usuarios</span>
        </h3>

        {loading ? (
          <p className="text-xs text-slate-500 p-4 text-center">Cargando denuncias registradas...</p>
        ) : complaints.length === 0 ? (
          <div className="text-center p-6 bg-slate-900/10 border border-slate-900 rounded-xl space-y-1.5">
            <p className="text-xs text-slate-500">No hay quejas registradas en este momento.</p>
            <p className="text-[10px] text-slate-600">Presenta reportes en hilos o reels para verlos aquí.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {complaints.map((comp) => (
              <div
                key={comp.id}
                className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5 relative"
              >
                {/* ID and Status badge header */}
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono text-slate-500">ID: #{comp.id.substring(5, 12)}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                    comp.status === "pending" ? "bg-amber-950/50 border-amber-500/30 text-amber-400" :
                    comp.status === "resolved" ? "bg-indigo-950/50 border-indigo-500/30 text-indigo-400" :
                    "bg-rose-950/50 border-rose-500/30 text-rose-400"
                  }`}>
                    {comp.status === "pending" ? "Pendiente" : comp.status === "resolved" ? "Resuelto" : "Falso / Descartado"}
                  </span>
                </div>

                {/* Complaint context */}
                <div className="space-y-1 text-xs">
                  <p className="text-slate-400"><strong className="text-slate-200">Motivo de reporte:</strong> {comp.reason}</p>
                  <p className="text-slate-400"><strong className="text-slate-200">Post reportado:</strong> <span className="italic text-slate-300">"{comp.postExcerpt}"</span></p>
                  <p className="text-slate-400">
                    <strong className="text-slate-200">Clasificación sugerida:</strong>{" "}
                    <span className="font-semibold text-indigo-400 uppercase text-[10px]">
                      {comp.suggestedColor === "green" ? "🟢 Verde" : comp.suggestedColor === "blue" ? "🔵 Azul" : "🔴 Rojo"}
                    </span>
                  </p>
                </div>

                {/* Interactive Moderation Action Bar */}
                {comp.status === "pending" && (
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleResolve(comp.id, "green")}
                      className="text-[10px] font-bold bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/20 py-1.5 px-2 rounded-lg cursor-pointer"
                    >
                      🟢 Mantener Verde SFW
                    </button>
                    <button
                      onClick={() => handleResolve(comp.id, "blue")}
                      className="text-[10px] font-bold bg-indigo-950 hover:bg-indigo-900 text-indigo-400 border border-indigo-500/20 py-1.5 px-2 rounded-lg cursor-pointer"
                    >
                      🔵 Marcar Azul +18
                    </button>
                    <button
                      onClick={() => handleResolve(comp.id, "red")}
                      className="text-[10px] font-bold bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-500/20 py-1.5 px-2 rounded-lg flex items-center space-x-1 cursor-pointer"
                    >
                      <Trash2 size={11} />
                      <span>🔴 Auto-Borrar</span>
                    </button>
                    <button
                      onClick={() => handleResolve(comp.id, "dismiss")}
                      className="text-[10px] font-bold bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-800 py-1.5 px-2 rounded-lg flex items-center space-x-1 ml-auto cursor-pointer"
                    >
                      <Ban size={11} className="text-slate-500" />
                      <span>Descartar (Sancionar Reportero)</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guide Footer */}
      <div className="bg-indigo-950/20 border border-indigo-900/30 p-3 rounded-xl text-[10px] text-slate-400 space-y-1">
        <p className="font-bold text-slate-300">💡 Instrucciones del Administrador:</p>
        <p>1. 🟢 **Verde** permite visualizar libremente a todos los visitantes.</p>
        <p>2. 🔵 **Azul** aplica una cortina protectora de confirmación antes de visualizar el post.</p>
        <p>3. 🔴 **Rojo** elimina el contenido inmediatamente para cumplir con las normativas legales.</p>
        <p>4. Al descartar denuncias infundadas, el reportero es advertido automáticamente. Dos advertencias resultan en baneo temporal.</p>
      </div>

    </div>
  );
}
