import React, { useState, useEffect, useRef } from "react";
import { Send, Sparkles, MessageCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import { PrivateMessage, UserProfile } from "../types";

interface ChatViewProps {
  currentUser: UserProfile;
}

export default function ChatView({ currentUser }: ChatViewProps) {
  const [contacts, setContacts] = useState<UserProfile[]>([]);
  const [activeContact, setActiveContact] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch AI contacts
  useEffect(() => {
    setLoadingContacts(true);
    // Hardcoded fetching AI bots for interactive fun
    const botIds = ["bot_tech", "bot_vibe", "bot_cosmos"];
    Promise.all(botIds.map(id => 
      fetch(`/api/users/${id}`).then(r => r.json())
    ))
      .then(data => {
        setContacts(data);
        if (data.length > 0) {
          setActiveContact(data[0]);
        }
      })
      .catch(err => console.error("Error loading chat contacts", err))
      .finally(() => setLoadingContacts(false));
  }, []);

  // Fetch messages regularly
  const fetchMessages = () => {
    fetch("/api/messages")
      .then(r => r.json())
      .then(data => setMessages(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2500); // Poll messages
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeContact]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    setSending(true);
    const contentToSend = newMessage;
    setNewMessage("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: activeContact.id,
          content: contentToSend
        })
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const filteredMessages = messages.filter(m => 
    activeContact && (
      (m.senderId === "user_current" && m.receiverId === activeContact.id) ||
      (m.senderId === activeContact.id && m.receiverId === "user_current")
    )
  );

  return (
    <div id="voxium_chat_view" className="flex flex-col md:flex-row h-[calc(100vh-130px)] max-w-md md:max-w-4xl mx-auto bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden mt-2">
      
      {/* Contacts List Bar */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-900 flex flex-col bg-slate-950">
        <div className="p-4 border-b border-slate-900 flex items-center justify-between">
          <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
            <MessageCircle size={16} className="text-indigo-400" />
            <span>Mensajes Privados</span>
          </h3>
          <span className="text-[9px] bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-900/50">
            Bots Activos
          </span>
        </div>

        <div className="overflow-y-auto divide-y divide-slate-900/50 flex-1">
          {loadingContacts ? (
            <p className="text-xs text-slate-500 p-4 text-center">Cargando creadores...</p>
          ) : (
            contacts.map(contact => {
              const isSelected = activeContact?.id === contact.id;
              // Get latest message
              const lastMsg = messages
                .filter(m => (m.senderId === contact.id && m.receiverId === "user_current") || (m.senderId === "user_current" && m.receiverId === contact.id))
                .slice(-1)[0];

              return (
                <button
                  key={contact.id}
                  onClick={() => setActiveContact(contact)}
                  className={`w-full text-left p-3.5 flex items-center space-x-3 transition-colors cursor-pointer ${isSelected ? "bg-slate-900/80" : "hover:bg-slate-900/20"}`}
                >
                  <div className="relative">
                    <img
                      src={contact.avatar}
                      alt={contact.displayName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-900"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-xs text-slate-200 truncate flex items-center space-x-1">
                        <span>{contact.displayName}</span>
                        {contact.isVerified && <CheckCircle2 size={11} className="text-indigo-400 fill-indigo-950/60" />}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {lastMsg ? lastMsg.content : contact.bio}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Conversation area */}
      <div className="flex-1 flex flex-col bg-slate-950/50">
        {activeContact ? (
          <>
            {/* Header with active user */}
            <div className="p-3 border-b border-slate-900 bg-slate-950 flex items-center space-x-3">
              <img
                src={activeContact.avatar}
                alt={activeContact.displayName}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-800"
              />
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-xs text-slate-200">{activeContact.displayName}</span>
                  {activeContact.isVerified && <CheckCircle2 size={11} className="text-indigo-400 fill-indigo-950/60" />}
                </div>
                <span className="text-[9px] text-slate-500">@{activeContact.username} • En línea</span>
              </div>

              {/* Sparkles indicating AI-powered conversations */}
              <div className="ml-auto flex items-center space-x-1.5 text-[9px] text-violet-400 bg-violet-950/40 border border-violet-900/50 px-2 py-1 rounded-full font-semibold">
                <Sparkles size={11} className="animate-pulse" />
                <span>Simulador Gemini</span>
              </div>
            </div>

            {/* Message bubbles list */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-8 text-slate-500 space-y-2">
                  <MessageCircle size={32} className="mx-auto opacity-30 text-indigo-400" />
                  <p className="text-xs">¡Inicia la conversación privada!</p>
                  <p className="text-[10px] text-slate-600">Pregúntale sobre tecnología, astrofísica o fotografía estética.</p>
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isOwn = msg.senderId === "user_current";
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1 duration-150`}
                    >
                      <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-md ${isOwn ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800/80"}`}>
                        <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                        <span className="block text-[8px] text-slate-400 mt-1 text-right">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick pre-filled prompt chips for immediate testing */}
            <div className="px-3 py-1.5 border-t border-slate-900 bg-slate-950 flex flex-wrap gap-1.5 overflow-x-auto">
              <button
                onClick={() => setNewMessage("Hola, ¿en qué proyectos de inteligencia artificial andas hoy?")}
                className="text-[10px] text-slate-400 hover:text-indigo-300 bg-slate-900 border border-slate-800 rounded-full px-2.5 py-1 transition-colors cursor-pointer"
              >
                🤖 Proyectos IA
              </button>
              <button
                onClick={() => setNewMessage("¿Me enseñas una curiosidad genial sobre el espacio exterior?")}
                className="text-[10px] text-slate-400 hover:text-indigo-300 bg-slate-900 border border-slate-800 rounded-full px-2.5 py-1 transition-colors cursor-pointer"
              >
                🌌 Curiosidad Espacial
              </button>
              <button
                onClick={() => setNewMessage("¿Qué paletas estéticas recomiendas para mi marca?")}
                className="text-[10px] text-slate-400 hover:text-indigo-300 bg-slate-900 border border-slate-800 rounded-full px-2.5 py-1 transition-colors cursor-pointer"
              >
                🎨 Paletas de Color
              </button>
            </div>

            {/* Input field footer */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-900 bg-slate-950 flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje seguro..."
                disabled={sending}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-500"
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl px-4 flex items-center justify-center transition-colors cursor-pointer shadow-md"
              >
                <Send size={15} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center space-y-3">
            <MessageCircle size={40} className="opacity-20 text-indigo-400 animate-pulse" />
            <p className="text-xs font-semibold text-slate-400">Selecciona un Creador AI de la barra izquierda para chatear en Voxium.</p>
          </div>
        )}
      </div>

    </div>
  );
}
