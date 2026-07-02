import React, { useState, useEffect } from "react";
import { 
  Home, Film, PlusSquare, Bell, User, Search, 
  Sparkles, MessageSquare, ShieldAlert, Award, 
  CheckCircle2, Smartphone, Gift, Heart, Send, MessageCircle, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Post, Comment, Notification, UserProfile } from "./types";
import BottomNav from "./components/BottomNav";
import Header from "./components/Header";
import ThreadItem from "./components/ThreadItem";
import CreatePostModal from "./components/CreatePostModal";
import ReportModal from "./components/ReportModal";
import ChatView from "./components/ChatView";
import AdminPanel from "./components/AdminPanel";
import MonetizationPanel from "./components/MonetizationPanel";
import MobileSetup from "./components/MobileSetup";

export default function App() {
  const [activeView, setActiveView] = useState<'threads' | 'reels' | 'create' | 'activity' | 'profile' | 'search' | 'chat' | 'admin' | 'monetization' | 'mobile-setup'>('threads');
  const [feedFilter, setFeedFilter] = useState<'foryou' | 'following'>('foryou');
  const [posts, setPosts] = useState<Post[]>([]);
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [comments, setComments] = useState<Comment[]>([]);  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  
  // Action triggers
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [aiWorking, setAiWorking] = useState(false);
  const [showVerifiedReg, setShowVerifiedReg] = useState(false);

  // Registration states
  const [regUsername, setRegUsername] = useState("");
  const [regDisplayName, setRegDisplayName] = useState("");
  const [regBio, setRegBio] = useState("");
  const [regAvatar, setRegAvatar] = useState("");

  // Content safety state: approved post IDs by user to reveal
  const [revealedPostIds, setRevealedPostIds] = useState<string[]>([]);

  // Fetch Current User Profile
   const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();

  if (
    email === "gcarolinamary@gmail.com" &&
    password === "05184033M7250!!"
  ) {
    alert("Login exitoso");
  } else {
    alert("Credenciales incorrectas");
  }
};
  const fetchProfile = () => {
    fetch("/api/users/user_current")
      .then(r => r.json())
      .then(data => setCurrentUser(data))
      .catch(() => {
        // Safe mock fallback if server is restarting
        setCurrentUser({
          id: "user_current",
          username: "tu_perfil",
          displayName: "Explorador de Voxium",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
          bio: "Probando el poder de Voxium! 🚀",
          banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
          followersCount: 142,
          followingCount: 89,
          tokens: 500,
          isPremium: false,
          isVerified: true
        });
      });
  };

  // Fetch Feed Posts
  const fetchFeed = () => {
    setLoadingFeed(true);
    const typeQuery = activeView === "reels" ? "type=reel" : "type=thread";
    const filterQuery = feedFilter === "following" ? "&feedFilter=following" : "";
    
    fetch(`/api/posts?${typeQuery}${filterQuery}`)
      .then(r => r.json())
      .then(async (data: Post[]) => {
        setPosts(data);
        // Pre-fetch comments for each post
        data.forEach(post => {
          fetch(`/api/posts/${post.id}/comments`)
            .then(r => r.json())
            .then(commList => {
              setComments(prev => ({ ...prev, [post.id]: commList }));
            });
        });
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingFeed(false));
  };

  // Fetch Notifications
  const fetchNotifications = () => {
    fetch("/api/notifications")
      .then(r => r.json())
      .then(data => setNotifications(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchProfile();
    fetchFeed();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchFeed();
      fetchNotifications();
    }, 6000);
    return () => clearInterval(interval);
  }, [activeView, feedFilter]);

  // Handle Post Creation
  const handleCreatePost = async (data: {
    type: "thread" | "reel";
    content: string;
    mediaUrl?: string;
    classification: "green" | "blue" | "red";
    tags: string[];
  }) => {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        fetchFeed();
        fetchProfile();
      } else {
        const errData = await res.json();
        alert(errData.error || "Ocurrió un error al publicar");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Likes
  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (res.ok) {
        // Instant optimism refresh
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            const liked = !p.likedByUser;
            return {
              ...p,
              likedByUser: liked,
              likesCount: liked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1)
            };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Comments
  const handleCommentSubmit = async (postId: string, contentText: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contentText })
      });
      if (res.ok) {
        const newComm = await res.json();
        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), newComm]
        }));
        // Update reply count locally
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return { ...p, repliesCount: p.repliesCount + 1 };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Report filing
  const handleReportSubmit = async (data: {
    postId: string;
    reason: string;
    suggestedColor: "green" | "blue" | "red";
  }) => {
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setReportPostId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger Gemini AI generation
  const handleTriggerAi = async (type: "thread" | "reel") => {
    setAiWorking(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });
      if (res.ok) {
        fetchFeed();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiWorking(false);
    }
  };

  // Handle User Registration Save
  const handleRegisterSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim()) return;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: regUsername,
          displayName: regDisplayName || regUsername,
          bio: regBio,
          avatar: regAvatar
        })
      });
      if (res.ok) {
        setShowVerifiedReg(false);
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle user follow
  const handleToggleFollow = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/follow`, { method: "POST" });
      if (res.ok) {
        fetchFeed();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Search trigger
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      .then(r => r.json())
      .then(data => setSearchResults(data))
      .catch(err => console.error(err));
  };

  // Reveal Sensitive content trigger
  const handleRevealSensitive = (postId: string) => {
    setRevealedPostIds(prev => [...prev, postId]);
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return (
    <div id="voxium_app_shell" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600/30 selection:text-indigo-200">
      
      {/* Header element */}
      <Header onTriggerAiGeneration={handleTriggerAi} aiWorking={aiWorking} />

      {/* Main Responsive Grid Layout (Desktop navigation list, center screen feed, mobile-ready) */}
      <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col md:flex-row pb-20 pt-1">
        
        {/* Left Side menu helper for desktop browsers */}
        <aside className="hidden md:flex flex-col w-64 p-4 space-y-6 shrink-0 border-r border-slate-900 h-[calc(100vh-70px)] sticky top-16">
          
          <div className="space-y-1">
            <h4 className="text-[10px] uppercase font-bold text-slate-500 px-3 tracking-widest">Navegación Principal</h4>
            <div className="space-y-1">
              <button
                onClick={() => setActiveView("threads")}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeView === "threads" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/35"}`}
              >
                <Home size={16} />
                <span>Hilos / Threads</span>
              </button>

              <button
                onClick={() => setActiveView("reels")}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeView === "reels" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/35"}`}
              >
                <Film size={16} />
                <span>Reels / Videos Cortos</span>
              </button>

              <button
                onClick={() => {
                  setActiveView("threads");
                  setIsCreateOpen(true);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-indigo-400 hover:bg-indigo-950/30 border border-indigo-900/10 hover:border-indigo-900/35 transition-all cursor-pointer"
              >
                <PlusSquare size={16} />
                <span>Crear Publicación</span>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-[10px] uppercase font-bold text-slate-500 px-3 tracking-widest">Herramientas & Mensajes</h4>
            <div className="space-y-1">
              <button
                onClick={() => setActiveView("chat")}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeView === "chat" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/35"}`}
              >
                <MessageSquare size={16} />
                <span>Chat Privado (Simulador)</span>
              </button>

              <button
                onClick={() => setActiveView("monetization")}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeView === "monetization" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/35"}`}
              >
                <Gift size={16} className="text-amber-500" />
                <span>Monetización / Cartera</span>
              </button>

              <button
                onClick={() => setActiveView("admin")}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeView === "admin" ? "bg-rose-950/60 text-rose-300 border border-rose-900/25" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/35"}`}
              >
                <ShieldAlert size={16} />
                <span>Panel de Moderación</span>
              </button>

              <button
                onClick={() => setActiveView("mobile-setup")}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeView === "mobile-setup" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/35"}`}
              >
                <Smartphone size={16} />
                <span>Compilar Android / iOS</span>
              </button>
            </div>
          </div>

          {/* Quick Profile presentation */}
          {currentUser && (
            <div className="mt-auto bg-slate-900/40 border border-slate-900 rounded-2xl p-3 flex items-center space-x-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.displayName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-xs text-slate-200 truncate">{currentUser.displayName}</span>
                  {currentUser.isVerified && <CheckCircle2 size={11} className="text-indigo-400 fill-indigo-950/60" />}
                </div>
                <span className="text-[10px] text-slate-500 block truncate">@{currentUser.username}</span>
                <span className="text-[9px] text-amber-400 font-bold block mt-0.5">🪙 {currentUser.tokens || 0} Tokens</span>
              </div>
            </div>
          )}

        </aside>

        {/* Center content container / responsive feed */}
        <main className="flex-1 max-w-lg md:max-w-2xl mx-auto px-4 w-full">
          
          {/* Main Feed Views */}
          {activeView === "threads" && (
            <div className="space-y-4">
              
              {/* Filter Tabs: Para Ti vs Siguiendo */}
              <div className="flex border-b border-slate-900">
                <button
                  onClick={() => setFeedFilter("foryou")}
                  className={`flex-1 py-3 text-xs font-extrabold tracking-wider border-b-2 transition-all cursor-pointer ${feedFilter === "foryou" ? "border-indigo-500 text-slate-100" : "border-transparent text-slate-500 hover:text-slate-300"}`}
                >
                  Para Ti (Verde/Azul)
                </button>
                <button
                  onClick={() => setFeedFilter("following")}
                  className={`flex-1 py-3 text-xs font-extrabold tracking-wider border-b-2 transition-all cursor-pointer ${feedFilter === "following" ? "border-indigo-500 text-slate-100" : "border-transparent text-slate-500 hover:text-slate-300"}`}
                >
                  Siguiendo
                </button>
              </div>

              {/* Quick interactive post input builder on top of feed */}
              <div 
                onClick={() => setIsCreateOpen(true)}
                className="bg-slate-900/40 border border-slate-900 rounded-2xl p-3.5 flex items-center space-x-3 cursor-pointer hover:bg-slate-900/60 transition-colors"
              >
                <img
                  src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                  alt="CurrentUser"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-xs text-slate-500 flex-1">¿Qué está pasando hoy? Escribe algo con moderación 🟢 🔵...</span>
                <PlusSquare size={16} className="text-slate-400" />
              </div>

              {/* Posts Feed container */}
              {loadingFeed ? (
                <div className="text-center py-12 text-slate-500">
                  <span className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-2" />
                  <p className="text-xs">Actualizando feed de Voxium...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/10 border border-slate-900 rounded-2xl p-6">
                  <p className="text-sm font-semibold text-slate-400">¡Feed vacío!</p>
                  <p className="text-xs text-slate-500 mt-1">Nuestros robots de IA están preparando publicaciones. O presiona el botón Sincronizar IA arriba.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {posts.map((post) => {
                    const isSensitive = post.classification === "blue";
                    const isRevealed = revealedPostIds.includes(post.id);

                    return (
                      <div key={post.id} className="relative bg-slate-950/15 border border-slate-900 rounded-2xl overflow-hidden mb-3">
                        
                        {/* 🔵 Azul safety curtain overlay */}
                        {isSensitive && !isRevealed ? (
                          <div className="p-6 text-center space-y-3 bg-slate-950/95 border border-indigo-950/40 rounded-2xl">
                            <AlertTriangle size={32} className="mx-auto text-indigo-400 animate-pulse" />
                            <div>
                              <span className="inline-block text-[9px] bg-indigo-950 text-indigo-400 font-bold border border-indigo-900/50 px-2.5 py-0.5 rounded-full mb-1">
                                Contenido Sensible 🔵 Azul
                              </span>
                              <h4 className="text-xs font-bold text-slate-200">Advertencia de Contenido +18 o sensible</h4>
                              <p className="text-[10px] text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                                Este post ha sido clasificado como sensible (Azul). Contiene lenguaje explícito, debate complejo o material violento moderado.
                              </p>
                            </div>
                            <div className="flex justify-center space-x-2 pt-1">
                              <button
                                onClick={() => handleRevealSensitive(post.id)}
                                className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg cursor-pointer"
                              >
                                Confirmar y ver contenido
                              </button>
                              <button
                                onClick={() => setReportPostId(post.id)}
                                className="text-[10px] font-bold bg-slate-900 hover:bg-slate-800 text-slate-400 px-3 py-1.5 rounded-lg cursor-pointer border border-slate-800"
                              >
                                Denunciar Post
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Standard post render */}
                            <ThreadItem
                              post={post}
                              onLike={handleLike}
                              onComment={handleCommentSubmit}
                              comments={comments[post.id] || []}
                            />
                            
                            {/* Tiny report button overlay */}
                            <button
                              onClick={() => setReportPostId(post.id)}
                              className="absolute top-4 right-12 text-[10px] text-slate-500 hover:text-rose-400 font-medium cursor-pointer"
                            >
                              Denunciar
                            </button>

                            {/* Classification label indicator in footer or header */}
                            <div className="absolute top-4 right-4">
                              <span className={`w-2 h-2 rounded-full inline-block ${
                                post.classification === "green" ? "bg-emerald-500" : "bg-indigo-500"
                              }`} title={`Clasificación: ${post.classification}`} />
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* Reels Screen Vertical loop player */}
          {activeView === "reels" && (
            <div className="space-y-4">
              <div className="text-center py-2 border-b border-slate-900">
                <span className="text-xs font-bold text-slate-300">Voxium Reels (Videos Verticales)</span>
              </div>

              {loadingFeed ? (
                <div className="text-center py-12 text-slate-500">
                  <span className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                </div>
              ) : posts.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-12">No hay Reels disponibles en este momento.</p>
              ) : (
                <div className="space-y-6">
                  {posts.map((reel) => (
                    <div key={reel.id} className="relative bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl">
                      
                      {/* Video tag loops */}
                      <div className="relative aspect-[9/16] max-h-[550px] w-full bg-black flex items-center justify-center">
                        <video
                          src={reel.mediaUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          controls
                          className="h-full w-full object-cover"
                        />

                        {/* Top corner classification */}
                        <div className="absolute top-4 left-4 bg-slate-950/70 backdrop-blur px-2.5 py-1 rounded-full border border-slate-800 flex items-center space-x-1">
                          <span className={`w-2 h-2 rounded-full inline-block ${
                            reel.classification === "green" ? "bg-emerald-500" : "bg-indigo-500"
                          }`} />
                          <span className="text-[9px] uppercase font-bold text-slate-300">{reel.classification}</span>
                        </div>

                        {/* Custom interactions sidebar layered on the video */}
                        <div className="absolute bottom-16 right-4 flex flex-col items-center space-y-4 z-10">
                          
                          {/* Profile */}
                          <div className="flex flex-col items-center">
                            <img
                              src={reel.author.avatar}
                              alt="Author"
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full border-2 border-indigo-500 object-cover"
                            />
                            {reel.author.isVerified && (
                              <span className="bg-indigo-500 p-0.5 rounded-full -mt-2 text-white text-[8px]">✓</span>
                            )}
                          </div>

                          {/* Likes */}
                          <button
                            onClick={() => handleLike(reel.id)}
                            className="bg-slate-950/70 p-2.5 rounded-full border border-slate-800 text-white hover:text-rose-400 transition-colors"
                          >
                            <Heart size={18} className={reel.likedByUser ? "fill-rose-500 text-rose-500 scale-110" : ""} />
                            <span className="block text-[9px] text-center font-bold mt-1">{reel.likesCount}</span>
                          </button>

                          {/* Comments */}
                          <button
                            onClick={() => {
                              setActiveView("threads");
                              setTimeout(() => {
                                const element = document.getElementById(`voxium_bottom_nav`);
                                if (element) element.scrollIntoView({ behavior: 'smooth' });
                              }, 300);
                            }}
                            className="bg-slate-950/70 p-2.5 rounded-full border border-slate-800 text-white hover:text-indigo-400 transition-colors"
                          >
                            <MessageCircle size={18} />
                            <span className="block text-[9px] text-center font-bold mt-1">{reel.repliesCount}</span>
                          </button>

                          {/* Report */}
                          <button
                            onClick={() => setReportPostId(reel.id)}
                            className="bg-slate-950/70 p-2.5 rounded-full border border-slate-800 text-rose-400 hover:text-rose-300 transition-colors"
                          >
                            <AlertTriangle size={18} />
                          </button>

                        </div>

                        {/* Custom media desc layered on bottom of video */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12 text-xs">
                          <div className="flex items-center space-x-1.5 font-bold mb-1">
                            <span className="text-slate-100">{reel.author.displayName}</span>
                            <span className="text-slate-400 text-[10px]">@{reel.author.username}</span>
                          </div>
                          <p className="text-slate-200 line-clamp-2 leading-relaxed mb-1">
                            {reel.content}
                          </p>
                          <div className="flex items-center space-x-1.5 text-indigo-300 text-[10px] font-semibold">
                            <Sparkles size={11} className="animate-pulse" />
                            <span>🎵 {reel.soundName || "Sonido Original - Voxium"}</span>
                          </div>
                        </div>

                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search trigger view */}
          {activeView === "search" && (
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="flex space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Busca por etiquetas o texto en Voxium (ej: cosmos)..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Buscar
                </button>
              </form>

              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 px-1">Resultados de búsqueda:</h4>
                  {searchResults.map((post) => (
                    <div key={post.id}>
                      <ThreadItem
                        post={post}
                        onLike={handleLike}
                        onComment={handleCommentSubmit}
                        comments={comments[post.id] || []}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 space-y-1">
                  <Search size={28} className="mx-auto opacity-30" />
                  <p className="text-xs">Introduce palabras clave para buscar hilos en Voxium.</p>
                </div>
              )}
            </div>
          )}

          {/* Interactive Chat messages view */}
          {activeView === "chat" && currentUser && (
            <ChatView currentUser={currentUser} />
          )}

          {/* Notifications Log Activity list */}
          {activeView === "activity" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <h3 className="font-bold text-sm text-slate-200">Centro de Notificaciones</h3>
                <button
                  onClick={async () => {
                    await fetch("/api/notifications/read", { method: "POST" });
                    fetchNotifications();
                  }}
                  className="text-[10px] text-indigo-400 hover:underline font-semibold"
                >
                  Marcar todo como leído
                </button>
              </div>

              {notifications.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-12">No hay actividad reciente.</p>
              ) : (
                <div className="divide-y divide-slate-900">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`p-3.5 flex items-start space-x-3 text-xs leading-relaxed ${notif.read ? "opacity-75" : "bg-indigo-950/10"}`}>
                      <img
                        src={notif.sender.avatar}
                        alt="Sender"
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-800"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-300">
                          <strong className="text-slate-100">@{notif.sender.username}</strong>{" "}
                          {notif.type === "like" && "le dio me gusta a tu publicación"}
                          {notif.type === "comment" && "respondió a tu publicación"}
                          {notif.type === "follow" && "comenzó a seguirte"}
                          {notif.type === "system" && (notif.message || "actualizó tu estado")}
                        </p>
                        <span className="block text-[10px] text-slate-500 mt-1">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* User Profile configure & edit screen */}
          {activeView === "profile" && currentUser && (
            <div className="space-y-4">
              
              {/* Banner / avatar card */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-900 bg-slate-900/40">
                <img
                  src={currentUser.banner}
                  alt="Banner"
                  className="w-full h-32 object-cover"
                />
                <div className="absolute -bottom-8 left-4">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.displayName}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-slate-950"
                  />
                </div>
                <button
                  onClick={() => setShowVerifiedReg(true)}
                  className="absolute right-4 bottom-4 text-[10px] font-bold bg-slate-950/80 hover:bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  Editar Perfil / Registro
                </button>
              </div>

              {/* Bio & Stats */}
              <div className="pt-8 px-2 space-y-2">
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-extrabold text-slate-100">{currentUser.displayName}</h3>
                  {currentUser.isVerified && <CheckCircle2 size={13} className="text-indigo-400 fill-indigo-950/60" />}
                  {currentUser.isPremium && (
                    <span className="text-[8px] bg-gradient-to-r from-violet-600 to-rose-500 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider scale-90">
                      PREMIUM
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 block">@{currentUser.username}</span>
                <p className="text-xs text-slate-300 leading-relaxed">{currentUser.bio}</p>

                <div className="flex space-x-4 pt-2.5 text-xs">
                  <span className="text-slate-400">⚡ <strong className="text-slate-100">{currentUser.followersCount}</strong> seguidores</span>
                  <span className="text-slate-400">⚡ <strong className="text-slate-100">{currentUser.followingCount}</strong> siguiendo</span>
                  <span className="text-amber-400 font-semibold">🪙 <strong className="text-slate-100">{currentUser.tokens || 0}</strong> Tokens</span>
                </div>
              </div>

              {/* Mobile Setup Quick trigger shortcut button */}
              <div className="p-3 bg-indigo-950/15 border border-indigo-900/30 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-indigo-300">¿Quieres probar Voxium en tu móvil?</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Empaquétalo fácilmente para Android y iPhone</p>
                </div>
                <button
                  onClick={() => setActiveView("mobile-setup")}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] cursor-pointer"
                >
                  Ver Guía Móvil 📱
                </button>
              </div>

            </div>
          )}

          {/* Monetization dashboard trigger */}
          {activeView === "monetization" && currentUser && (
            <MonetizationPanel currentUser={currentUser} onRefreshProfile={fetchProfile} />
          )}

          {/* Admin panel control trigger */}
          {activeView === "admin" && (
            <AdminPanel onRefreshFeed={fetchFeed} />
          )}

          {/* Mobile setup packaging guide trigger */}
          {activeView === "mobile-setup" && (
            <MobileSetup />
          )}

        </main>

      </div>

      {/* Bottom responsive navigation bar */}
      <BottomNav
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          fetchFeed();
        }}
        unreadCount={unreadNotifsCount}
      />

      {/* MODALS */}
      
      {/* Create post modal drawer */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreatePost}
      />

      {/* Report Modal drawer */}
      {reportPostId && (
        <ReportModal
          isOpen={true}
          postId={reportPostId}
          onClose={() => setReportPostId(null)}
          onSubmit={handleReportSubmit}
        />
      )}

      {/* Edit Profile / Session Register Modal drawer */}
      <AnimatePresence>
        {showVerifiedReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-5 space-y-4">
              <div className="text-center">
                <h3 className="font-extrabold text-sm text-slate-200">Editar Perfil / Registro Voxium</h3>
                <p className="text-[11px] text-slate-500 mt-1">Modifica tu identidad para interactuar con Carlos Tech y los bots AI</p>
              </div>

              <form onSubmit={handleRegisterSave} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Nombre de Usuario (ej: voxiom_fan):</label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder={currentUser?.username || "mi_usuario"}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Nombre para Mostrar (ej: Carlos):</label>
                  <input
                    type="text"
                    value={regDisplayName}
                    onChange={(e) => setRegDisplayName(e.target.value)}
                    placeholder={currentUser?.displayName || "Mi Nombre Real"}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Biografía descriptiva:</label>
                  <textarea
                    value={regBio}
                    onChange={(e) => setRegBio(e.target.value)}
                    placeholder={currentUser?.bio || "Describe tu talento..."}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">URL del Avatar / Foto:</label>
                  <input
                    type="url"
                    value={regAvatar}
                    onChange={(e) => setRegAvatar(e.target.value)}
                    placeholder={currentUser?.avatar || "https://images.unsplash.com/photo-..."}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={() => setShowVerifiedReg(false)}
                    className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
