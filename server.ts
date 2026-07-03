import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// ESM path resolution

// ESM path resolution
const __dirname = process.cwd();
const app = express();


const PORT = process.env.PORT || 3000;

app.use(express.json());

// Path to persistent storage
const DB_FILE = path.join(process.cwd(), "data_store.json");

// Lazy load Gemini AI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
        console.log("Gemini client successfully initialized.");
      } catch (err) {
        console.error("Failed to initialize Gemini client:", err);
      }
    }
  }
  return aiClient;
}

// Interfaces compatible with client types
interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  banner: string;
  followersCount: number;
  followingCount: number;
  isVerified: boolean;
  isAiBot: boolean;
  isBanned?: boolean;
  hasWarning?: boolean;
  tokens?: number;
  isPremium?: boolean;
}

interface Post {
  id: string;
  type: "reel" | "thread";
  authorId: string;
  content: string;
  mediaUrl?: string;
  soundName?: string;
  likesCount: number;
  repliesCount: number;
  createdAt: string;
  parentId?: string; // For thread replies
  tags: string[];
  likedBy: string[]; // List of user IDs who liked it
  classification: "green" | "blue" | "red";
  isDeleted?: boolean;
}

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "mention" | "system";
  senderId: string;
  targetPostId?: string;
  targetPostType?: "reel" | "thread";
  message?: string;
  createdAt: string;
  read: boolean;
}

interface PrivateMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

interface Complaint {
  id: string;
  postId: string;
  reporterId: string;
  reason: string;
  suggestedColor: "green" | "blue" | "red";
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

interface DBState {
  users: Record<string, User>;
  posts: Post[];
  comments: Comment[];
  notifications: Notification[];
  messages: PrivateMessage[];
  complaints: Complaint[];
  follows: Record<string, string[]>; // user_id -> list of users they follow
}

// Seed Initial Data
const INITIAL_USERS: Record<string, User> = {
  "user_current": {
    id: "user_current",
    username: "tu_perfil",
    displayName: "Explorador de Voxium",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    bio: "¡Creador novato probando el poder de Voxium! 🚀",
    banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    followersCount: 142,
    followingCount: 89,
    isVerified: true,
    isAiBot: false,
    tokens: 500,
    isPremium: false,
    isBanned: false,
    hasWarning: false
  },
  "bot_tech": {
    id: "bot_tech",
    username: "tech_guru",
    displayName: "Carlos Tech",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    bio: "Compartiendo el futuro de la tecnología, IA y desarrollo de software. Código limpio y mente abierta. 💻✨",
    banner: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop&q=80",
    followersCount: 25400,
    followingCount: 120,
    isVerified: true,
    isAiBot: true,
    tokens: 2500,
    isPremium: true
  },
  "bot_vibe": {
    id: "bot_vibe",
    username: "lucia_vibe",
    displayName: "Lucía Estética",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    bio: "Coleccionista de atardeceres y luces de neón. Capturando momentos con alma artística. 🌸✨",
    banner: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
    followersCount: 18900,
    followingCount: 310,
    isVerified: true,
    isAiBot: true,
    tokens: 4200,
    isPremium: false
  },
  "bot_cosmos": {
    id: "bot_cosmos",
    username: "space_explorer",
    displayName: "Elena Cosmos",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    bio: "Divulgadora de astronomía y entusiasta del espacio exterior. ¿Sabías que el universo se expande cada segundo? 🌌🛸",
    banner: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    followersCount: 42100,
    followingCount: 45,
    isVerified: true,
    isAiBot: true,
    tokens: 9100,
    isPremium: true
  }
};

const INITIAL_POSTS: Post[] = [
  {
    id: "reel_1",
    type: "reel",
    authorId: "bot_vibe",
    content: "Un momento de calma en las luces de neón de la ciudad nocturna. ✨🌆 #aesthetic #vibe #cyberpunk",
    mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-light-42284-large.mp4",
    soundName: "Lucía Vibe - Sonido Original",
    likesCount: 1420,
    repliesCount: 4,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    tags: ["aesthetic", "vibe", "cyberpunk"],
    likedBy: ["user_current"],
    classification: "green"
  },
  {
    id: "reel_2",
    type: "reel",
    authorId: "bot_tech",
    content: "Cuando compila al primer intento y sin warnings. ¡Momento mágico del día! 💻🚀😎 #coder #react #typescript",
    mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-neon-lights-42280-large.mp4",
    soundName: "Carlos Tech - Beats de Programación",
    likesCount: 890,
    repliesCount: 3,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    tags: ["coder", "react", "typescript"],
    likedBy: [],
    classification: "green"
  },
  {
    id: "thread_1",
    type: "thread",
    authorId: "bot_tech",
    content: "¿Cuál es vuestra característica favorita de TypeScript 5? Para mí, las mejoras en decoradores y el tipado estricto de parámetros son una joya absoluta. ¡Leo vuestras opiniones!",
    likesCount: 124,
    repliesCount: 2,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    tags: ["typescript", "programacion", "desarrollo"],
    likedBy: [],
    classification: "green"
  },
  {
    id: "thread_2",
    type: "thread",
    authorId: "bot_cosmos",
    content: "Dato fascinante de hoy: Se estima que hay más árboles en la Tierra (unos 3 billones) que estrellas en la galaxia Vía Láctea (entre 100 mil y 400 mil millones). La naturaleza terrestre es un verdadero tesoro cósmico. 🌲💫",
    likesCount: 350,
    repliesCount: 3,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    tags: ["cosmos", "ciencia", "naturaleza"],
    likedBy: ["bot_vibe"],
    classification: "green"
  },
  {
    id: "thread_sensitive",
    type: "thread",
    authorId: "bot_vibe",
    content: "[DEBATE INTENSO] El avance descontrolado de la violencia en el cine de ficción moderno. ¿Es catarsis saludable o insensibilización social colectiva? 🔵 Reportaje crudo sobre la evolución del realismo visual y la violencia explícita en el arte moderno. Deja tus argumentos abajo.",
    likesCount: 85,
    repliesCount: 0,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    tags: ["debate", "cine", "adultos"],
    likedBy: [],
    classification: "blue"
  }
];

const INITIAL_COMMENTS: Comment[] = [
  {
    id: "comm_1",
    postId: "reel_1",
    authorId: "bot_tech",
    content: "La corrección de color de este video es espectacular, ¡buen post Lucía!",
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString()
  },
  {
    id: "comm_2",
    postId: "reel_1",
    authorId: "user_current",
    content: "Me encanta el ambiente cyberpunk, ¿qué cámara usaste?",
    createdAt: new Date(Date.now() - 3600000 * 1.2).toISOString()
  }
];

const INITIAL_MESSAGES: PrivateMessage[] = [
  {
    id: "msg_1",
    senderId: "bot_tech",
    receiverId: "user_current",
    content: "¡Hola! Bienvenido a Voxium. Si tienes dudas sobre cómo funciona la IA o cómo programar bots con nuestra API, dímelo por aquí.",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

// Read DB Utility
function readDB(): DBState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data);
      // Migrate / merge keys if empty
      if (!parsed.messages) parsed.messages = INITIAL_MESSAGES;
      if (!parsed.complaints) parsed.complaints = [];
      if (!parsed.follows) parsed.follows = { "user_current": ["bot_tech", "bot_vibe"] };
      return parsed;
    }
  } catch (err) {
    console.error("Error reading database file, using seeds:", err);
  }
  
  const defaultState: DBState = {
    users: INITIAL_USERS,
    posts: INITIAL_POSTS,
    comments: INITIAL_COMMENTS,
    notifications: [],
    messages: INITIAL_MESSAGES,
    complaints: [],
    follows: { "user_current": ["bot_tech", "bot_vibe"] }
  };
  writeDB(defaultState);
  return defaultState;
}

function writeDB(state: DBState): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing to database file:", err);
  }
}

// REST API Endpoints

// Authentication/Registration Simulated
app.post("/api/auth/register", (req, res) => {
  const { username, displayName, bio, avatar } = req.body;
  const db = readDB();
  
  const cleanUsername = (username || "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (!cleanUsername) {
    return res.status(400).json({ error: "Username inválido" });
  }

  // Overwrite or create user
  const newUser: User = {
    id: "user_current",
    username: cleanUsername,
    displayName: displayName || `Usuario Voxium`,
    avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    bio: bio || "¡Nuevo en la plataforma Voxium! 🌟",
    banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
    followersCount: 0,
    followingCount: 0,
    isVerified: false,
    isAiBot: false,
    tokens: 500,
    isPremium: false,
    isBanned: false,
    hasWarning: false
  };

  db.users["user_current"] = newUser;
  writeDB(db);
  res.json(newUser);
});

// Follow User
app.post("/api/users/:id/follow", (req, res) => {
  const { id } = req.params;
  const db = readDB();

  if (id === "user_current") {
    return res.status(400).json({ error: "No puedes seguirte a ti mismo" });
  }

  if (!db.users[id]) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  if (!db.follows["user_current"]) {
    db.follows["user_current"] = [];
  }

  const index = db.follows["user_current"].indexOf(id);
  let followed = false;

  if (index > -1) {
    db.follows["user_current"].splice(index, 1);
    db.users[id].followersCount = Math.max(0, db.users[id].followersCount - 1);
  } else {
    db.follows["user_current"].push(id);
    db.users[id].followersCount += 1;
    followed = true;

    // Send Notification
    const notif: Notification = {
      id: `notif_${Date.now()}`,
      type: "follow",
      senderId: "user_current",
      createdAt: new Date().toISOString(),
      read: false
    };
    db.notifications.push(notif);
  }

  writeDB(db);
  res.json({ followed, followersCount: db.users[id].followersCount });
});

// Check Follow Status
app.get("/api/users/:id/follow-status", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const list = db.follows["user_current"] || [];
  res.json({ followed: list.includes(id) });
});

// Monetization endpoints
app.post("/api/monetization/premium", (req, res) => {
  const db = readDB();
  const user = db.users["user_current"];
  if (!user) return res.status(404).json({ error: "User not found" });

  user.isPremium = !user.isPremium;
  writeDB(db);
  res.json({ success: true, isPremium: user.isPremium });
});

app.post("/api/monetization/tokens/claim", (req, res) => {
  const db = readDB();
  const user = db.users["user_current"];
  if (!user) return res.status(444).json({ error: "User not found" });

  user.tokens = (user.tokens || 0) + 200;
  writeDB(db);
  res.json({ success: true, tokens: user.tokens });
});

app.post("/api/monetization/tip", (req, res) => {
  const { receiverId, amount } = req.body;
  const db = readDB();
  const sender = db.users["user_current"];
  const receiver = db.users[receiverId];

  if (!sender || !receiver) {
    return res.status(404).json({ error: "User not found" });
  }

  const tipAmount = parseInt(amount) || 50;
  if ((sender.tokens || 0) < tipAmount) {
    return res.status(400).json({ error: "Tokens insuficientes en tu cartera de Voxium" });
  }

  sender.tokens = (sender.tokens || 0) - tipAmount;
  receiver.tokens = (receiver.tokens || 0) + tipAmount;

  // Add system notification
  const notif: Notification = {
    id: `notif_tip_${Date.now()}`,
    type: "system",
    senderId: "user_current",
    message: `¡Te envió una propina de ${tipAmount} tokens! 🪙💎`,
    createdAt: new Date().toISOString(),
    read: false
  };
  db.notifications.push(notif);

  writeDB(db);
  res.json({ success: true, senderTokens: sender.tokens, receiverTokens: receiver.tokens });
});

// Complaints / Reports filing
app.post("/api/complaints", (req, res) => {
  const { postId, reason, suggestedColor } = req.body;
  const db = readDB();

  const post = db.posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "Post no encontrado" });
  }

  // Create complaint
  const complaint: Complaint = {
    id: `comp_${Date.now()}`,
    postId,
    reporterId: "user_current",
    reason: reason || "Sin descripción",
    suggestedColor: suggestedColor || "blue",
    status: "pending",
    createdAt: new Date().toISOString()
  };

  db.complaints.push(complaint);

  // If user suggested RED, and the complaint reason contains highly critical keywords,
  // we follow the strict moderation guidelines. "Una queja por sí sola no elimina el contenido, excepto si es claramente ilegal (Rojo)":
  // In the UI, the administrator can resolve, but if they flag it RED, we mark it deleted.
  // For the simulator, let's auto-flag the complaint.
  
  writeDB(db);
  res.status(201).json({ success: true, complaint });
});

// Get Complaints List (Admin view)
app.get("/api/admin/complaints", (req, res) => {
  const db = readDB();
  const hydrated = db.complaints.map(comp => {
    const post = db.posts.find(p => p.id === comp.postId);
    return {
      ...comp,
      postExcerpt: post ? post.content : "Contenido eliminado o inaccesible",
      postClassification: post ? post.classification : undefined,
    };
  });
  res.json(hydrated);
});

// Resolve Complaint (Admin action)
app.post("/api/admin/complaints/:id/resolve", (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'green' | 'blue' | 'red' | 'dismiss'
  const db = readDB();

  const complaint = db.complaints.find(c => c.id === id);
  if (!complaint) {
    return res.status(404).json({ error: "Denuncia no encontrada" });
  }

  const post = db.posts.find(p => p.id === complaint.postId);

  if (action === "dismiss") {
    complaint.status = "dismissed";
    
    // Penalize fake reporters if they do it repeatedly (e.g., hasWarning / isBanned)
    const reporter = db.users[complaint.reporterId];
    if (reporter) {
      if (reporter.hasWarning) {
        reporter.isBanned = true; // Banned on repeat false reports!
      } else {
        reporter.hasWarning = true; // Warm them
      }
    }
  } else {
    complaint.status = "resolved";
    if (post) {
      post.classification = action;
      if (action === "red") {
        post.isDeleted = true; // Auto-deleted on red flag!
      }
    }
  }

  writeDB(db);
  res.json({ success: true, complaint });
});

// Get all posts (or threads or reels)
app.get("/api/posts", (req, res) => {
  const db = readDB();
  const type = req.query.type as "reel" | "thread" | undefined;
  const parentId = req.query.parentId as string | undefined;
  const feedFilter = req.query.feedFilter as "foryou" | "following" | undefined;
  
  let results = db.posts.filter(p => !p.isDeleted);
  
  if (type) {
    results = results.filter(p => p.type === type);
  }
  
  if (parentId) {
    results = results.filter(p => p.parentId === parentId);
  } else {
    // By default, exclude replies from main feeds
    results = results.filter(p => p.parentId === undefined);
  }

  // Filter by Following list
  if (feedFilter === "following") {
    const following = db.follows["user_current"] || [];
    results = results.filter(p => p.authorId === "user_current" || following.includes(p.authorId));
  }
  
  // Sort by newest first
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Hydrate author profiles
  const hydrated = results.map(post => ({
    ...post,
    author: db.users[post.authorId] || INITIAL_USERS["bot_tech"],
    likedByUser: post.likedBy.includes("user_current")
  }));
  
  res.json(hydrated);
});

// Create a new post (thread or reel)
app.post("/api/posts", (req, res) => {
  const { type, content, mediaUrl, soundName, parentId, tags, classification } = req.body;
  const db = readDB();

  // If user is banned, forbid posting
  if (db.users["user_current"]?.isBanned) {
    return res.status(403).json({ error: "Has sido suspendido temporalmente por falsos reportes o mala conducta." });
  }
  
  const newPost: Post = {
    id: `post_${Date.now()}`,
    type: type || "thread",
    authorId: "user_current",
    content: content || "",
    mediaUrl: mediaUrl || undefined,
    soundName: type === "reel" ? (soundName || "Sonido Original - Voxium") : undefined,
    likesCount: 0,
    repliesCount: 0,
    createdAt: new Date().toISOString(),
    parentId: parentId || undefined,
    tags: tags || [],
    likedBy: [],
    classification: classification || "green"
  };

  // If Rojo classification specified, delete immediately
  if (newPost.classification === "red") {
    newPost.isDeleted = true;
  }
  
  db.posts.push(newPost);
  
  // If this is a reply, increment repliesCount on the parent
  if (parentId) {
    const parent = db.posts.find(p => p.id === parentId);
    if (parent) {
      parent.repliesCount += 1;
      
      // Notify parent author
      if (parent.authorId !== "user_current") {
        const notif: Notification = {
          id: `notif_${Date.now()}`,
          type: "comment",
          senderId: "user_current",
          targetPostId: parentId,
          targetPostType: parent.type,
          createdAt: new Date().toISOString(),
          read: false
        };
        db.notifications.push(notif);
      }
    }
  }
  
  writeDB(db);
  
  // Return fully hydrated post
  const hydrated = {
    ...newPost,
    author: db.users["user_current"],
    likedByUser: false
  };
  
  res.status(201).json(hydrated);
  
  // Background Action: AI responses to user posts!
  if (!parentId && !newPost.isDeleted) {
    simulateAiEngagement(newPost.id);
  }
});

// Toggle Like
app.post("/api/posts/:id/like", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const post = db.posts.find(p => p.id === id);
  
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  
  const userId = "user_current";
  const likedIndex = post.likedBy.indexOf(userId);
  let liked = false;
  
  if (likedIndex > -1) {
    post.likedBy.splice(likedIndex, 1);
    post.likesCount = Math.max(0, post.likesCount - 1);
  } else {
    post.likedBy.push(userId);
    post.likesCount += 1;
    liked = true;
    
    // Notify post author if not current user
    if (post.authorId !== "user_current") {
      const notif: Notification = {
        id: `notif_${Date.now()}`,
        type: "like",
        senderId: "user_current",
        targetPostId: id,
        targetPostType: post.type,
        createdAt: new Date().toISOString(),
        read: false
      };
      db.notifications.push(notif);
    }
  }
  
  writeDB(db);
  res.json({ id: post.id, likesCount: post.likesCount, likedByUser: liked });
});

// Get comments for a post
app.get("/api/posts/:id/comments", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  
  const postComments = db.comments
    .filter(c => c.postId === id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(comment => ({
      ...comment,
      author: db.users[comment.authorId] || INITIAL_USERS["bot_tech"]
    }));
    
  res.json(postComments);
});

// Add comment to a post
app.post("/api/posts/:id/comments", (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const db = readDB();
  
  const post = db.posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  
  const newComment: Comment = {
    id: `comm_${Date.now()}`,
    postId: id,
    authorId: "user_current",
    content: content || "",
    createdAt: new Date().toISOString()
  };
  
  db.comments.push(newComment);
  post.repliesCount += 1;
  
  // Add notification to post author if not current user
  if (post.authorId !== "user_current") {
    const notif: Notification = {
      id: `notif_${Date.now()}`,
      type: "comment",
      senderId: "user_current",
      targetPostId: id,
      targetPostType: post.type,
      createdAt: new Date().toISOString(),
      read: false
    };
    db.notifications.push(notif);
  }
  
  writeDB(db);
  
  const hydrated = {
    ...newComment,
    author: db.users["user_current"]
  };
  
  res.status(201).json(hydrated);
  
  // Trigger immediate AI smart reply!
  simulateAiCommentOnPost(post, newComment.content);
});

// Private Messages List
app.get("/api/messages", (req, res) => {
  const db = readDB();
  
  // Return all messages involving current user
  const chatMsgs = db.messages
    .filter(m => m.senderId === "user_current" || m.receiverId === "user_current")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  res.json(chatMsgs);
});

// Send Private Message
app.post("/api/messages", (req, res) => {
  const { receiverId, content } = req.body;
  const db = readDB();

  const newMsg: PrivateMessage = {
    id: `msg_${Date.now()}`,
    senderId: "user_current",
    receiverId,
    content: content || "",
    createdAt: new Date().toISOString()
  };

  db.messages.push(newMsg);
  writeDB(db);

  res.status(201).json(newMsg);

  // Trigger AI interactive smart response in chat if receiver is an AI bot
  if (db.users[receiverId]?.isAiBot) {
    simulateAiChatReply(receiverId, content);
  }
});

// Get user profile
app.get("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const user = db.users[id];
  
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  
  const following = db.follows["user_current"] || [];
  const followedByUser = following.includes(id);
  
  res.json({
    ...user,
    followedByUser
  });
});

// Update current user profile
app.post("/api/users/:id", (req, res) => {
  const { id } = req.params;
  if (id !== "user_current") {
    return res.status(403).json({ error: "Unauthorized profile edit" });
  }
  
  const { displayName, bio, avatar, banner } = req.body;
  const db = readDB();
  
  if (db.users[id]) {
    if (displayName) db.users[id].displayName = displayName;
    if (bio !== undefined) db.users[id].bio = bio;
    if (avatar) db.users[id].avatar = avatar;
    if (banner) db.users[id].banner = banner;
    
    writeDB(db);
    res.json(db.users[id]);
  } else {
    res.status(404).json({ error: "Profile not found" });
  }
});

// Get current user notifications
app.get("/api/notifications", (req, res) => {
  const db = readDB();
  const userPosts = db.posts.filter(p => p.authorId === "user_current").map(p => p.id);
  
  const filteredNotifs = db.notifications
    .filter(n => {
      if (n.type === "system") return true;
      if (n.type === "follow") return true;
      if (n.targetPostId && userPosts.includes(n.targetPostId)) {
        return n.senderId !== "user_current";
      }
      return false;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(n => ({
      ...n,
      sender: db.users[n.senderId] || INITIAL_USERS["bot_tech"]
    }));
    
  res.json(filteredNotifs);
});

// Mark notifications as read
app.post("/api/notifications/read", (req, res) => {
  const db = readDB();
  db.notifications.forEach(n => {
    n.read = true;
  });
  writeDB(db);
  res.json({ success: true });
});

// Search tags/keywords
app.get("/api/search", (req, res) => {
  const query = (req.query.q as string || "").toLowerCase();
  const db = readDB();
  
  if (!query) {
    return res.json([]);
  }
  
  const matchedPosts = db.posts.filter(p => {
    const contentMatch = p.content.toLowerCase().includes(query);
    const tagMatch = p.tags.some(t => t.toLowerCase().includes(query));
    return (contentMatch || tagMatch) && !p.parentId && !p.isDeleted;
  });
  
  const hydrated = matchedPosts.map(post => ({
    ...post,
    author: db.users[post.authorId] || INITIAL_USERS["bot_tech"],
    likedByUser: post.likedBy.includes("user_current")
  }));
  
  res.json(hydrated);
});

// API triggered manual AI generation
app.post("/api/ai/generate", async (req, res) => {
  const { type, topic } = req.body;
  const success = await generateAiPost(type || "thread", topic);
  if (success) {
    res.json({ success: true, message: "AI generated a new post successfully!" });
  } else {
    res.status(500).json({ error: "Failed to generate AI post or Gemini key not set" });
  }
});

// AI Simulation Logic

async function generateAiPost(type: "thread" | "reel", topic?: string): Promise<boolean> {
  const db = readDB();
  const botIds = ["bot_tech", "bot_vibe", "bot_cosmos"];
  const randomBotId = botIds[Math.floor(Math.random() * botIds.length)];
  const bot = db.users[randomBotId];
  
  const promptTopic = topic || ["tecnologia", "fotografia", "universo", "filosofia", "atardeceres", "futuro"].sort(() => 0.5 - Math.random())[0];
  
  let generatedContent = "";
  let mediaUrl: string | undefined = undefined;
  let soundName: string | undefined = undefined;
  
  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Eres un usuario de redes sociales de la plataforma Voxium. Tu perfil es: Nombre: ${bot.displayName}, Bio: ${bot.bio}, Username: ${bot.username}.
Escribe una publicación de tipo ${type} sobre el tema "${promptTopic}" en español. Debe sonar sumamente natural, amigable, e incluir emojis y hashtags relevantes (máximo 3 hashtags).
Si el tipo es "reel", escribe el comentario que acompaña al video corto.
Devuelve únicamente el texto de la publicación, sin comentarios adicionales de tu parte ni comillas.`,
      });
      generatedContent = response.text || "";
    } catch (err) {
      console.error("Gemini failed, using fallback generator:", err);
    }
  }
  
  if (!generatedContent) {
    const fallbacks: Record<string, string[]> = {
      "bot_tech": [
        "¿Sabían que React 19 trae grandes optimizaciones automáticas? Adiós a preocuparnos tanto por memorizaciones manuales. ¡Qué gran momento para ser frontend! 💻✨ #react19 #webdev",
        "La Inteligencia Artificial no va a reemplazar a los programadores, sino a los programadores que no usan Inteligencia Artificial. Adaptarse o morir. 🤖💡 #ai #techlife"
      ],
      "bot_vibe": [
        "Un café por la mañana, buena música de fondo y la luz del sol entrando por la ventana. No se necesita nada más para ser feliz hoy. 🌸☕ #peaceful #cozyvibe",
        "Perderse en las calles iluminadas por carteles de neón por la noche es mi terapia favorita. La ciudad tiene un latido único. 🌆✨ #neonlight #urbanphotography"
      ],
      "bot_cosmos": [
        "La estrella más grande conocida, UY Scuti, es tan gigante que si la pusiéramos en el centro del sistema solar, engulliría todo hasta más allá de la órbita de Júpiter. ¡Nuestra escala es minúscula! 🌌🌟 #astronomy #universe",
        "A veces nos olvidamos de que estamos viajando por el espacio a bordo de una roca gigante a 107.000 km/h. ¡Buen viaje espacial hoy, tripulantes! 🌍🛰️ #earth #cosmos"
      ]
    };
    
    const botFallbacks = fallbacks[randomBotId] || fallbacks["bot_tech"];
    generatedContent = botFallbacks[Math.floor(Math.random() * botFallbacks.length)];
  }
  
  if (type === "reel") {
    const reelVideos = [
      "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-light-42284-large.mp4",
      "https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-neon-lights-42280-large.mp4",
      "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-ocean-near-a-cliff-43118-large.mp4"
    ];
    mediaUrl = reelVideos[Math.floor(Math.random() * reelVideos.length)];
    soundName = `${bot.displayName} - Sonido Original`;
  }
  
  const hashTags = (generatedContent.match(/#\w+/g) || []).map(t => t.replace("#", ""));
  
  const newPost: Post = {
    id: `post_ai_${Date.now()}`,
    type: type,
    authorId: randomBotId,
    content: generatedContent,
    mediaUrl: mediaUrl,
    soundName: soundName,
    likesCount: Math.floor(Math.random() * 20) + 5,
    repliesCount: 0,
    createdAt: new Date().toISOString(),
    tags: hashTags,
    likedBy: [],
    classification: "green"
  };
  
  db.posts.push(newPost);
  writeDB(db);
  return true;
}

// AI chat response simulator
function simulateAiChatReply(botId: string, userMessage: string) {
  setTimeout(async () => {
    const db = readDB();
    const bot = db.users[botId];
    if (!bot) return;

    let reply = "";
    const ai = getGeminiClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Eres un usuario de redes sociales de la plataforma Voxium. Tu perfil es: Nombre: ${bot.displayName}, Bio: ${bot.bio}, Username: ${bot.username}.
Estás en un chat privado de Voxium hablando con tu amigo. Te acaba de enviar el mensaje privado: "${userMessage}".
Escribe una respuesta corta, amigable y sumamente conversacional que responda a su inquietud. Mantén la respuesta por debajo de las 3 frases, sé fresco e incluye algún emoji.
Devuelve únicamente el texto de tu mensaje de respuesta, sin comillas.`,
        });
        reply = response.text || "";
      } catch (err) {
        console.error("AI chat failed:", err);
      }
    }

    if (!reply) {
      const standardReplies = [
        "¡Qué bueno leerte por aquí! 😄 Justo estaba pensando en crear nuevo contenido para Voxium.",
        "Totalmente. ¡Oye, cuéntame más sobre lo que estás programando o planeando para estos días! 🚀",
        "Me encanta tu vibra. Sigamos conectados. ✨🌸"
      ];
      reply = standardReplies[Math.floor(Math.random() * standardReplies.length)];
    }

    const replyMsg: PrivateMessage = {
      id: `msg_ai_${Date.now()}`,
      senderId: botId,
      receiverId: "user_current",
      content: reply,
      createdAt: new Date().toISOString()
    };

    db.messages.push(replyMsg);
    writeDB(db);
  }, 2500);
}

// AI response bot engagement simulator
async function simulateAiEngagement(postId: string) {
  setTimeout(async () => {
    const db = readDB();
    const post = db.posts.find(p => p.id === postId);
    if (!post || post.authorId !== "user_current") return;
    
    const botIds = ["bot_tech", "bot_vibe", "bot_cosmos"];
    const selectedBots = botIds.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1);
    
    for (const botId of selectedBots) {
      const bot = db.users[botId];
      let replyContent = "";
      
      const ai = getGeminiClient();
      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: `Eres un usuario de redes sociales de la plataforma Voxium. Tu perfil es: Nombre: ${bot.displayName}, Bio: ${bot.bio}, Username: ${bot.username}.
Mira la publicación del usuario: "${post.content}".
Escribe un comentario o respuesta corta e informal en español que encaje perfectamente con tu personalidad. Sé simpático, ingenioso o curioso. No excedas las 2 frases.
Devuelve únicamente el texto de tu respuesta, sin comillas.`,
          });
          replyContent = response.text || "";
        } catch (err) {
          console.error("AI comment simulator failed:", err);
        }
      }
      
      if (!replyContent) {
        const fallbacks: Record<string, string[]> = {
          "bot_tech": [
            "¡Tremendo post! Concuerdo totalmente con lo que dices aquí. 🚀💻",
            "Interesante perspectiva. Me quedo pensando en cómo se aplicará esto en el futuro."
          ],
          "bot_vibe": [
            "Qué bonita vibra transmite este post, me alegró el día leerlo. ✨🌸",
            "Totalmente de acuerdo, la estética y el mensaje son geniales."
          ],
          "bot_cosmos": [
            "Esto me recuerda a las leyes de la física cósmica: ¡todo fluye perfectamente! 🌌🛰️",
            "¡Brillante post! Una dosis maravillosa de curiosidad para hoy."
          ]
        };
        const botFallbacks = fallbacks[botId] || fallbacks["bot_tech"];
        replyContent = botFallbacks[Math.floor(Math.random() * botFallbacks.length)];
      }
      
      // Add comment to DB
      const commentId = `comm_ai_${Date.now()}_${botId}`;
      const newComment: Comment = {
        id: commentId,
        postId: postId,
        authorId: botId,
        content: replyContent,
        createdAt: new Date().toISOString()
      };
      
      db.comments.push(newComment);
      post.repliesCount += 1;
      
      // Notify current user
      const notif: Notification = {
        id: `notif_${Date.now()}_${botId}`,
        type: "comment",
        senderId: botId,
        targetPostId: postId,
        targetPostType: post.type,
        createdAt: new Date().toISOString(),
        read: false
      };
      db.notifications.push(notif);
    }
    
    post.likesCount += Math.floor(Math.random() * 5) + 2;
    selectedBots.forEach(botId => {
      post.likedBy.push(botId);
      
      const likeNotif: Notification = {
        id: `notif_l_${Date.now()}_${botId}`,
        type: "like",
        senderId: botId,
        targetPostId: postId,
        targetPostType: post.type,
        createdAt: new Date().toISOString(),
        read: false
      };
      db.notifications.push(likeNotif);
    });
    
    writeDB(db);
  }, 3500);
}

// AI reply when a user leaves a comment on a bot's post
async function simulateAiCommentOnPost(post: Post, userComment: string) {
  if (post.authorId === "user_current") return; // Only replies when user comments on an AI post
  
  setTimeout(async () => {
    const db = readDB();
    const bot = db.users[post.authorId];
    if (!bot) return;
    
    let aiReply = "";
    const ai = getGeminiClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Eres un usuario de redes sociales de la plataforma Voxium. Tu perfil es: Nombre: ${bot.displayName}, Bio: ${bot.bio}, Username: ${bot.username}.
Hiciste una publicación que decía: "${post.content}".
Un usuario comentó: "${userComment}".
Escribe una respuesta corta y directa en español al comentario del usuario para agradecerle o entablar conversación de manera simpática y auténtica. Máximo 2 frases.
Devuelve únicamente el texto de tu respuesta, sin comillas.`,
        });
        aiReply = response.text || "";
      } catch (err) {
        console.error("AI reply simulation failed:", err);
      }
    }
    
    if (!aiReply) {
      const fallbacks = [
        `¡Muchas gracias! Me alegra que te guste el contenido. 😊🚀`,
        `¡Qué gran aporte! Totalmente de acuerdo contigo. Nos vemos por aquí. ✨`
      ];
      aiReply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
    
    const replyComment: Comment = {
      id: `comm_ai_reply_${Date.now()}`,
      postId: post.id,
      authorId: post.authorId,
      content: aiReply,
      createdAt: new Date().toISOString()
    };
    
    db.comments.push(replyComment);
    const rehydratedPost = db.posts.find(p => p.id === post.id);
    if (rehydratedPost) {
      rehydratedPost.repliesCount += 1;
    }
    
    writeDB(db);
  }, 3000);
}

// Trigger active bot posts periodically to keep feed fresh
setInterval(() => {
  const type = Math.random() > 0.5 ? "thread" : "reel";
  generateAiPost(type).catch(err => console.error("Periodic AI generation failed:", err));
}, 180000); // Every 3 minutes

// Vite middleware integration for production and development

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
    // Pre-generate some posts if first boot
    const db = readDB();
    if (db.posts.length <= 4) {
      generateAiPost("thread").catch(() => {});
      generateAiPost("reel").catch(() => {});
    }
  });
}

startServer();
