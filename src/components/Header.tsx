import { Sparkles, RefreshCw } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onTriggerAiGeneration: (type: "thread" | "reel") => Promise<void>;
  aiWorking: boolean;
}

export default function Header({ onTriggerAiGeneration, aiWorking }: HeaderProps) {
  const [showAiMenu, setShowAiMenu] = useState(false);

  const handleGen = async (type: "thread" | "reel") => {
    setShowAiMenu(false);
    await onTriggerAiGeneration(type);
  };

  return (
    <header id="voxium_header" className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4">
      <div className="max-w-md mx-auto flex justify-between items-center h-16">
        
        {/* Brand logo & name */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-violet-600 to-rose-500 flex items-center justify-center font-bold text-white text-lg tracking-wider shadow-md shadow-indigo-900/30">
            V
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-indigo-200 to-violet-300 bg-clip-text text-transparent">
            Voxium
          </span>
          <span className="text-[10px] bg-indigo-950/60 text-indigo-400 border border-indigo-900/50 px-1.5 py-0.5 rounded-full font-mono">
            v1.0
          </span>
        </div>

        {/* AI Generator Control Hub */}
        <div className="relative">
          <button
            onClick={() => setShowAiMenu(!showAiMenu)}
            disabled={aiWorking}
            className="flex items-center space-x-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 hover:text-white px-2.5 py-1.5 rounded-full border border-indigo-900/40 text-xs font-medium transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {aiWorking ? (
              <RefreshCw size={14} className="animate-spin text-rose-400" />
            ) : (
              <Sparkles size={14} className="text-violet-400 animate-pulse" />
            )}
            <span>{aiWorking ? "Generando..." : "Sincronizar IA"}</span>
          </button>

          {showAiMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 text-slate-500 font-semibold border-b border-slate-800/60">
                Simulador Gemini AI
              </div>
              <button
                onClick={() => handleGen("thread")}
                className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-indigo-400 transition-colors"
              >
                📝 Crear Hilo de IA
              </button>
              <button
                onClick={() => handleGen("reel")}
                className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-indigo-400 transition-colors"
              >
                🎬 Crear Reel de IA
              </button>
            </div>
          )}
        </div>
        
      </div>
    </header>
  );
}
