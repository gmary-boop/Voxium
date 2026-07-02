import React, { useState } from "react";
import { X, Globe, EyeOff, Film, AlignLeft, ShieldCheck } from "lucide-react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: "thread" | "reel";
    content: string;
    mediaUrl?: string;
    classification: "green" | "blue" | "red";
    tags: string[];
  }) => Promise<void>;
}

export default function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
  const [type, setType] = useState<"thread" | "reel">("thread");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [classification, setClassification] = useState<"green" | "blue" | "red">("green");
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Predefined beautiful looping assets for easy testing
  const stockVideos = [
    { name: "Luces de Neón", url: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-light-42284-large.mp4" },
    { name: "Baile de Neón", url: "https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-neon-lights-42280-large.mp4" },
    { name: "Olas del Mar", url: "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-ocean-near-a-cliff-43118-large.mp4" },
    { name: "Ciudad Cyberpunk", url: "https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-city-street-with-neon-lights-42278-large.mp4" }
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setLoading(true);
    try {
      const tags = tagInput
        .split(",")
        .map(t => t.trim().replace("#", ""))
        .filter(t => t.length > 0);

      await onSubmit({
        type,
        content,
        mediaUrl: type === "reel" ? (mediaUrl || stockVideos[0].url) : (mediaUrl || undefined),
        classification,
        tags
      });
      
      setContent("");
      setMediaUrl("");
      setTagInput("");
      setClassification("green");
      onClose();
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
            <span>Crear Nueva Publicación</span>
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          
          {/* Format selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800/80">
            <button
              type="button"
              onClick={() => setType("thread")}
              className={`py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center space-x-2 cursor-pointer ${type === "thread" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
            >
              <AlignLeft size={14} />
              <span>Hilo / Post</span>
            </button>
            <button
              type="button"
              onClick={() => setType("reel")}
              className={`py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center space-x-2 cursor-pointer ${type === "reel" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
            >
              <Film size={14} />
              <span>Reel (Video)</span>
            </button>
          </div>

          {/* Classification rating container */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 flex items-center space-x-1">
              <ShieldCheck size={13} className="text-indigo-400" />
              <span>Clasificación de Contenido</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setClassification("green")}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${classification === "green" ? "bg-emerald-950/60 border-emerald-500 text-emerald-300" : "bg-slate-950/40 border-slate-800/60 text-slate-500 hover:text-slate-300"}`}
              >
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold">🟢 Verde</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Apto para todo el público</p>
              </button>

              <button
                type="button"
                onClick={() => setClassification("blue")}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${classification === "blue" ? "bg-indigo-950/60 border-indigo-500 text-indigo-300" : "bg-slate-950/40 border-slate-800/60 text-slate-500 hover:text-slate-300"}`}
              >
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="text-xs font-bold">🔵 Azul</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Contenido sensible / +18</p>
              </button>

              <button
                type="button"
                onClick={() => setClassification("red")}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${classification === "red" ? "bg-rose-950/60 border-rose-500 text-rose-300" : "bg-slate-950/40 border-slate-800/60 text-slate-500 hover:text-slate-300"}`}
              >
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs font-bold">🔴 Rojo</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Prohibido (TOS delete)</p>
              </button>
            </div>
            {classification === "red" && (
              <p className="text-[10px] text-rose-400 mt-2 bg-rose-950/30 border border-rose-900/50 p-2 rounded-md leading-relaxed">
                ⚠️ Atención: El material ilegal, pornográfico o violento extremo está estrictamente prohibido en Voxium y se eliminará instantáneamente del feed público.
              </p>
            )}
          </div>

          {/* Text input */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={type === "thread" ? "¿Qué estás pensando hoy en Voxium?" : "Describe tu video reel de Voxium..."}
              maxLength={280}
              rows={4}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-500"
            />
            <div className="text-right text-[10px] text-slate-500 mt-1">
              {content.length}/280 caracteres
            </div>
          </div>

          {/* Optional Stock Media Preset selection for Reels */}
          {type === "reel" && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Selecciona un Video Loop para tu Reel:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {stockVideos.map((video, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMediaUrl(video.url)}
                    className={`py-1.5 px-2 text-left rounded-md border text-xs transition-all truncate cursor-pointer ${mediaUrl === video.url ? "bg-indigo-950/50 border-indigo-500 text-indigo-300" : "bg-slate-950/40 border-slate-800 text-slate-400"}`}
                  >
                    🎥 {video.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Optional direct media link */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Enlace de Imagen/Video personalizado (Opcional)
            </label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Etiquetas / Hashtags (Separados por comas)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="tecnologia, cosmos, aesthetic"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-sm transition-all duration-200 cursor-pointer shadow-md disabled:opacity-50"
          >
            {loading ? "Publicando en Voxium..." : "Publicar Ahora"}
          </button>

        </form>
      </div>
    </div>
  );
}
