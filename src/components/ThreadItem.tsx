import { Heart, MessageCircle, Share2, CornerDownRight, CheckCircle2 } from "lucide-react";
import { Post, Comment } from "../types";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ThreadItemProps {
  post: Post;
  onLike: (id: string) => void;
  onComment: (id: string, content: string) => Promise<void>;
  comments: Comment[];
  isReply?: boolean;
}

export default function ThreadItem({ post, onLike, onComment, comments, isReply = false }: ThreadItemProps) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);
  const [showCommentsList, setShowCommentsList] = useState(false);
  const [copied, setCopied] = useState(false);

  // Parse relative time
  const getRelativeTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "ahora";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(post.id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`¡Mira este hilo en Voxium por @${post.author.username}!: "${post.content}"`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setLoadingReply(true);
    try {
      await onComment(post.id, replyText);
      setReplyText("");
      setShowReplyBox(false);
      setShowCommentsList(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReply(false);
    }
  };

  return (
    <div className={`p-4 border-b border-slate-900 bg-slate-950/25 relative ${isReply ? "bg-slate-950/40 pl-8 border-l border-slate-900" : ""}`}>
      <div className="flex space-x-3">
        
        {/* Left Side: Avatar and Thread Connector Line */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={post.author.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
              alt={post.author.displayName}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-900"
            />
            {post.author.isAiBot && (
              <span className="absolute -bottom-1 -right-1 bg-violet-600 text-[8px] font-bold text-white px-1 py-0.5 rounded-full border border-slate-950 uppercase scale-90">
                AI
              </span>
            )}
          </div>
          
          {/* Vertical line connecting threaded elements */}
          {!isReply && (post.repliesCount > 0 || comments.length > 0) && (
            <div className="w-[1.5px] bg-slate-800 grow my-2 rounded" />
          )}
        </div>

        {/* Right Side: Main post contents */}
        <div className="flex-1 min-w-0">
          
          {/* User metadata header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-100 hover:underline cursor-pointer text-sm truncate">
                {post.author.displayName}
              </span>
              <span className="text-slate-500 text-xs truncate">
                @{post.author.username}
              </span>
              {post.author.isVerified && (
                <CheckCircle2 size={13} className="text-indigo-400 fill-indigo-950/60 flex-shrink-0" />
              )}
            </div>
            <span className="text-xs text-slate-500">
              {getRelativeTime(post.createdAt)}
            </span>
          </div>

          {/* Post content body text */}
          <p className="mt-1 text-sm text-slate-200 leading-relaxed break-words whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Optional inline media attachments */}
          {post.mediaUrl && (
            <div className="mt-3 rounded-xl overflow-hidden border border-slate-900 bg-slate-900/30 max-h-72 flex justify-center items-center">
              {post.mediaUrl.endsWith(".mp4") ? (
                <video src={post.mediaUrl} controls className="max-h-72 w-full object-contain" />
              ) : (
                <img src={post.mediaUrl} alt="Post Attachment" referrerPolicy="no-referrer" className="max-h-72 w-full object-cover" />
              )}
            </div>
          )}

          {/* Hashtags display */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {post.tags.map((tag, i) => (
                <span key={i} className="text-xs text-indigo-400 hover:underline cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons list */}
          <div className="flex items-center space-x-6 mt-3.5 text-slate-400">
            {/* Like trigger */}
            <button
              onClick={handleLikeClick}
              className={`flex items-center space-x-1.5 text-xs transition-colors hover:text-rose-400 cursor-pointer ${post.likedByUser ? "text-rose-500 font-semibold" : ""}`}
            >
              <Heart
                size={16}
                className={`transition-transform duration-200 ${post.likedByUser ? "fill-rose-500 scale-125" : ""}`}
              />
              <span>{post.likesCount}</span>
            </button>

            {/* Comments toggle / list action */}
            <button
              onClick={() => {
                setShowReplyBox(!showReplyBox);
                setShowCommentsList(true);
              }}
              className="flex items-center space-x-1.5 text-xs transition-colors hover:text-indigo-400 cursor-pointer"
            >
              <MessageCircle size={16} />
              <span>{post.repliesCount}</span>
            </button>

            {/* Share action */}
            <button
              onClick={handleShareClick}
              className="relative flex items-center space-x-1.5 text-xs transition-colors hover:text-cyan-400 cursor-pointer"
            >
              <Share2 size={16} />
              <span>{copied ? "¡Copiado!" : "Compartir"}</span>
            </button>
          </div>

          {/* Nested Comments section collapse/expand indicator */}
          {comments.length > 0 && !showCommentsList && (
            <button
              onClick={() => setShowCommentsList(true)}
              className="flex items-center space-x-1.5 text-xs text-indigo-400 mt-3 font-semibold hover:underline"
            >
              <CornerDownRight size={12} />
              <span>Ver {comments.length} {comments.length === 1 ? "respuesta" : "respuestas"}</span>
            </button>
          )}

          {/* Collapsible replies list */}
          {showCommentsList && comments.length > 0 && (
            <div className="mt-4 space-y-3 pl-3 border-l-2 border-slate-900">
              <AnimatePresence>
                {comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-slate-300 py-2 border-b border-slate-900/40 last:border-0"
                  >
                    <div className="flex items-center space-x-2">
                      <img
                        src={comment.author.avatar}
                        alt={comment.author.displayName}
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-800"
                      />
                      <span className="font-bold text-slate-100">{comment.author.displayName}</span>
                      <span className="text-slate-500">@{comment.author.username}</span>
                      {comment.author.isVerified && (
                        <CheckCircle2 size={10} className="text-indigo-400 fill-indigo-950/60" />
                      )}
                      <span className="text-[10px] text-slate-600 ml-auto">{getRelativeTime(comment.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-slate-200 pl-7 leading-relaxed">{comment.content}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              <button
                onClick={() => setShowCommentsList(false)}
                className="text-slate-500 hover:text-slate-400 text-xs mt-1 font-semibold"
              >
                Ocultar respuestas
              </button>
            </div>
          )}

          {/* Quick inline comment reply form drawer */}
          <AnimatePresence>
            {showReplyBox && (
              <motion.form
                onSubmit={handleReplySubmit}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3.5"
              >
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Escribe una respuesta a @${post.author.username}...`}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={loadingReply || !replyText.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {loadingReply ? "..." : "Responder"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
