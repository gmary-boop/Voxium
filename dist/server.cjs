var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_url = require("url");
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_meta = {};
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var DB_FILE = import_path.default.join(process.cwd(), "data_store.json");
var aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      try {
        aiClient = new import_genai.GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build"
            }
          }
        });
        console.log("Gemini client successfully initialized.");
      } catch (err) {
        console.error("Failed to initialize Gemini client:", err);
      }
    }
  }
  return aiClient;
}
var INITIAL_USERS = {
  "user_current": {
    id: "user_current",
    username: "tu_perfil",
    displayName: "Explorador de Voxium",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    bio: "\xA1Creador novato probando el poder de Voxium! \u{1F680}",
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
    bio: "Compartiendo el futuro de la tecnolog\xEDa, IA y desarrollo de software. C\xF3digo limpio y mente abierta. \u{1F4BB}\u2728",
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
    displayName: "Luc\xEDa Est\xE9tica",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    bio: "Coleccionista de atardeceres y luces de ne\xF3n. Capturando momentos con alma art\xEDstica. \u{1F338}\u2728",
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
    bio: "Divulgadora de astronom\xEDa y entusiasta del espacio exterior. \xBFSab\xEDas que el universo se expande cada segundo? \u{1F30C}\u{1F6F8}",
    banner: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    followersCount: 42100,
    followingCount: 45,
    isVerified: true,
    isAiBot: true,
    tokens: 9100,
    isPremium: true
  }
};
var INITIAL_POSTS = [
  {
    id: "reel_1",
    type: "reel",
    authorId: "bot_vibe",
    content: "Un momento de calma en las luces de ne\xF3n de la ciudad nocturna. \u2728\u{1F306} #aesthetic #vibe #cyberpunk",
    mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-light-42284-large.mp4",
    soundName: "Luc\xEDa Vibe - Sonido Original",
    likesCount: 1420,
    repliesCount: 4,
    createdAt: new Date(Date.now() - 36e5 * 2).toISOString(),
    tags: ["aesthetic", "vibe", "cyberpunk"],
    likedBy: ["user_current"],
    classification: "green"
  },
  {
    id: "reel_2",
    type: "reel",
    authorId: "bot_tech",
    content: "Cuando compila al primer intento y sin warnings. \xA1Momento m\xE1gico del d\xEDa! \u{1F4BB}\u{1F680}\u{1F60E} #coder #react #typescript",
    mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-neon-lights-42280-large.mp4",
    soundName: "Carlos Tech - Beats de Programaci\xF3n",
    likesCount: 890,
    repliesCount: 3,
    createdAt: new Date(Date.now() - 36e5 * 5).toISOString(),
    tags: ["coder", "react", "typescript"],
    likedBy: [],
    classification: "green"
  },
  {
    id: "thread_1",
    type: "thread",
    authorId: "bot_tech",
    content: "\xBFCu\xE1l es vuestra caracter\xEDstica favorita de TypeScript 5? Para m\xED, las mejoras en decoradores y el tipado estricto de par\xE1metros son una joya absoluta. \xA1Leo vuestras opiniones!",
    likesCount: 124,
    repliesCount: 2,
    createdAt: new Date(Date.now() - 36e5 * 1).toISOString(),
    tags: ["typescript", "programacion", "desarrollo"],
    likedBy: [],
    classification: "green"
  },
  {
    id: "thread_2",
    type: "thread",
    authorId: "bot_cosmos",
    content: "Dato fascinante de hoy: Se estima que hay m\xE1s \xE1rboles en la Tierra (unos 3 billones) que estrellas en la galaxia V\xEDa L\xE1ctea (entre 100 mil y 400 mil millones). La naturaleza terrestre es un verdadero tesoro c\xF3smico. \u{1F332}\u{1F4AB}",
    likesCount: 350,
    repliesCount: 3,
    createdAt: new Date(Date.now() - 36e5 * 3).toISOString(),
    tags: ["cosmos", "ciencia", "naturaleza"],
    likedBy: ["bot_vibe"],
    classification: "green"
  },
  {
    id: "thread_sensitive",
    type: "thread",
    authorId: "bot_vibe",
    content: "[DEBATE INTENSO] El avance descontrolado de la violencia en el cine de ficci\xF3n moderno. \xBFEs catarsis saludable o insensibilizaci\xF3n social colectiva? \u{1F535} Reportaje crudo sobre la evoluci\xF3n del realismo visual y la violencia expl\xEDcita en el arte moderno. Deja tus argumentos abajo.",
    likesCount: 85,
    repliesCount: 0,
    createdAt: new Date(Date.now() - 36e5 * 6).toISOString(),
    tags: ["debate", "cine", "adultos"],
    likedBy: [],
    classification: "blue"
  }
];
var INITIAL_COMMENTS = [
  {
    id: "comm_1",
    postId: "reel_1",
    authorId: "bot_tech",
    content: "La correcci\xF3n de color de este video es espectacular, \xA1buen post Luc\xEDa!",
    createdAt: new Date(Date.now() - 36e5 * 1.5).toISOString()
  },
  {
    id: "comm_2",
    postId: "reel_1",
    authorId: "user_current",
    content: "Me encanta el ambiente cyberpunk, \xBFqu\xE9 c\xE1mara usaste?",
    createdAt: new Date(Date.now() - 36e5 * 1.2).toISOString()
  }
];
var INITIAL_MESSAGES = [
  {
    id: "msg_1",
    senderId: "bot_tech",
    receiverId: "user_current",
    content: "\xA1Hola! Bienvenido a Voxium. Si tienes dudas sobre c\xF3mo funciona la IA o c\xF3mo programar bots con nuestra API, d\xEDmelo por aqu\xED.",
    createdAt: new Date(Date.now() - 36e5 * 2).toISOString()
  }
];
function readDB() {
  try {
    if (import_fs.default.existsSync(DB_FILE)) {
      const data = import_fs.default.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (!parsed.messages) parsed.messages = INITIAL_MESSAGES;
      if (!parsed.complaints) parsed.complaints = [];
      if (!parsed.follows) parsed.follows = { "user_current": ["bot_tech", "bot_vibe"] };
      return parsed;
    }
  } catch (err) {
    console.error("Error reading database file, using seeds:", err);
  }
  const defaultState = {
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
function writeDB(state) {
  try {
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing to database file:", err);
  }
}
app.post("/api/auth/register", (req, res) => {
  const { username, displayName, bio, avatar } = req.body;
  const db = readDB();
  const cleanUsername = (username || "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (!cleanUsername) {
    return res.status(400).json({ error: "Username inv\xE1lido" });
  }
  const newUser = {
    id: "user_current",
    username: cleanUsername,
    displayName: displayName || `Usuario Voxium`,
    avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    bio: bio || "\xA1Nuevo en la plataforma Voxium! \u{1F31F}",
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
    const notif = {
      id: `notif_${Date.now()}`,
      type: "follow",
      senderId: "user_current",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      read: false
    };
    db.notifications.push(notif);
  }
  writeDB(db);
  res.json({ followed, followersCount: db.users[id].followersCount });
});
app.get("/api/users/:id/follow-status", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const list = db.follows["user_current"] || [];
  res.json({ followed: list.includes(id) });
});
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
  const notif = {
    id: `notif_tip_${Date.now()}`,
    type: "system",
    senderId: "user_current",
    message: `\xA1Te envi\xF3 una propina de ${tipAmount} tokens! \u{1FA99}\u{1F48E}`,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    read: false
  };
  db.notifications.push(notif);
  writeDB(db);
  res.json({ success: true, senderTokens: sender.tokens, receiverTokens: receiver.tokens });
});
app.post("/api/complaints", (req, res) => {
  const { postId, reason, suggestedColor } = req.body;
  const db = readDB();
  const post = db.posts.find((p) => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "Post no encontrado" });
  }
  const complaint = {
    id: `comp_${Date.now()}`,
    postId,
    reporterId: "user_current",
    reason: reason || "Sin descripci\xF3n",
    suggestedColor: suggestedColor || "blue",
    status: "pending",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.complaints.push(complaint);
  writeDB(db);
  res.status(201).json({ success: true, complaint });
});
app.get("/api/admin/complaints", (req, res) => {
  const db = readDB();
  const hydrated = db.complaints.map((comp) => {
    const post = db.posts.find((p) => p.id === comp.postId);
    return {
      ...comp,
      postExcerpt: post ? post.content : "Contenido eliminado o inaccesible",
      postClassification: post ? post.classification : void 0
    };
  });
  res.json(hydrated);
});
app.post("/api/admin/complaints/:id/resolve", (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  const db = readDB();
  const complaint = db.complaints.find((c) => c.id === id);
  if (!complaint) {
    return res.status(404).json({ error: "Denuncia no encontrada" });
  }
  const post = db.posts.find((p) => p.id === complaint.postId);
  if (action === "dismiss") {
    complaint.status = "dismissed";
    const reporter = db.users[complaint.reporterId];
    if (reporter) {
      if (reporter.hasWarning) {
        reporter.isBanned = true;
      } else {
        reporter.hasWarning = true;
      }
    }
  } else {
    complaint.status = "resolved";
    if (post) {
      post.classification = action;
      if (action === "red") {
        post.isDeleted = true;
      }
    }
  }
  writeDB(db);
  res.json({ success: true, complaint });
});
app.get("/api/posts", (req, res) => {
  const db = readDB();
  const type = req.query.type;
  const parentId = req.query.parentId;
  const feedFilter = req.query.feedFilter;
  let results = db.posts.filter((p) => !p.isDeleted);
  if (type) {
    results = results.filter((p) => p.type === type);
  }
  if (parentId) {
    results = results.filter((p) => p.parentId === parentId);
  } else {
    results = results.filter((p) => p.parentId === void 0);
  }
  if (feedFilter === "following") {
    const following = db.follows["user_current"] || [];
    results = results.filter((p) => p.authorId === "user_current" || following.includes(p.authorId));
  }
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const hydrated = results.map((post) => ({
    ...post,
    author: db.users[post.authorId] || INITIAL_USERS["bot_tech"],
    likedByUser: post.likedBy.includes("user_current")
  }));
  res.json(hydrated);
});
app.post("/api/posts", (req, res) => {
  const { type, content, mediaUrl, soundName, parentId, tags, classification } = req.body;
  const db = readDB();
  if (db.users["user_current"]?.isBanned) {
    return res.status(403).json({ error: "Has sido suspendido temporalmente por falsos reportes o mala conducta." });
  }
  const newPost = {
    id: `post_${Date.now()}`,
    type: type || "thread",
    authorId: "user_current",
    content: content || "",
    mediaUrl: mediaUrl || void 0,
    soundName: type === "reel" ? soundName || "Sonido Original - Voxium" : void 0,
    likesCount: 0,
    repliesCount: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    parentId: parentId || void 0,
    tags: tags || [],
    likedBy: [],
    classification: classification || "green"
  };
  if (newPost.classification === "red") {
    newPost.isDeleted = true;
  }
  db.posts.push(newPost);
  if (parentId) {
    const parent = db.posts.find((p) => p.id === parentId);
    if (parent) {
      parent.repliesCount += 1;
      if (parent.authorId !== "user_current") {
        const notif = {
          id: `notif_${Date.now()}`,
          type: "comment",
          senderId: "user_current",
          targetPostId: parentId,
          targetPostType: parent.type,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          read: false
        };
        db.notifications.push(notif);
      }
    }
  }
  writeDB(db);
  const hydrated = {
    ...newPost,
    author: db.users["user_current"],
    likedByUser: false
  };
  res.status(201).json(hydrated);
  if (!parentId && !newPost.isDeleted) {
    simulateAiEngagement(newPost.id);
  }
});
app.post("/api/posts/:id/like", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const post = db.posts.find((p) => p.id === id);
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
    if (post.authorId !== "user_current") {
      const notif = {
        id: `notif_${Date.now()}`,
        type: "like",
        senderId: "user_current",
        targetPostId: id,
        targetPostType: post.type,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        read: false
      };
      db.notifications.push(notif);
    }
  }
  writeDB(db);
  res.json({ id: post.id, likesCount: post.likesCount, likedByUser: liked });
});
app.get("/api/posts/:id/comments", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const postComments = db.comments.filter((c) => c.postId === id).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((comment) => ({
    ...comment,
    author: db.users[comment.authorId] || INITIAL_USERS["bot_tech"]
  }));
  res.json(postComments);
});
app.post("/api/posts/:id/comments", (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const db = readDB();
  const post = db.posts.find((p) => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  const newComment = {
    id: `comm_${Date.now()}`,
    postId: id,
    authorId: "user_current",
    content: content || "",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.comments.push(newComment);
  post.repliesCount += 1;
  if (post.authorId !== "user_current") {
    const notif = {
      id: `notif_${Date.now()}`,
      type: "comment",
      senderId: "user_current",
      targetPostId: id,
      targetPostType: post.type,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
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
  simulateAiCommentOnPost(post, newComment.content);
});
app.get("/api/messages", (req, res) => {
  const db = readDB();
  const chatMsgs = db.messages.filter((m) => m.senderId === "user_current" || m.receiverId === "user_current").sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  res.json(chatMsgs);
});
app.post("/api/messages", (req, res) => {
  const { receiverId, content } = req.body;
  const db = readDB();
  const newMsg = {
    id: `msg_${Date.now()}`,
    senderId: "user_current",
    receiverId,
    content: content || "",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.messages.push(newMsg);
  writeDB(db);
  res.status(201).json(newMsg);
  if (db.users[receiverId]?.isAiBot) {
    simulateAiChatReply(receiverId, content);
  }
});
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
app.post("/api/users/:id", (req, res) => {
  const { id } = req.params;
  if (id !== "user_current") {
    return res.status(403).json({ error: "Unauthorized profile edit" });
  }
  const { displayName, bio, avatar, banner } = req.body;
  const db = readDB();
  if (db.users[id]) {
    if (displayName) db.users[id].displayName = displayName;
    if (bio !== void 0) db.users[id].bio = bio;
    if (avatar) db.users[id].avatar = avatar;
    if (banner) db.users[id].banner = banner;
    writeDB(db);
    res.json(db.users[id]);
  } else {
    res.status(404).json({ error: "Profile not found" });
  }
});
app.get("/api/notifications", (req, res) => {
  const db = readDB();
  const userPosts = db.posts.filter((p) => p.authorId === "user_current").map((p) => p.id);
  const filteredNotifs = db.notifications.filter((n) => {
    if (n.type === "system") return true;
    if (n.type === "follow") return true;
    if (n.targetPostId && userPosts.includes(n.targetPostId)) {
      return n.senderId !== "user_current";
    }
    return false;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((n) => ({
    ...n,
    sender: db.users[n.senderId] || INITIAL_USERS["bot_tech"]
  }));
  res.json(filteredNotifs);
});
app.post("/api/notifications/read", (req, res) => {
  const db = readDB();
  db.notifications.forEach((n) => {
    n.read = true;
  });
  writeDB(db);
  res.json({ success: true });
});
app.get("/api/search", (req, res) => {
  const query = (req.query.q || "").toLowerCase();
  const db = readDB();
  if (!query) {
    return res.json([]);
  }
  const matchedPosts = db.posts.filter((p) => {
    const contentMatch = p.content.toLowerCase().includes(query);
    const tagMatch = p.tags.some((t) => t.toLowerCase().includes(query));
    return (contentMatch || tagMatch) && !p.parentId && !p.isDeleted;
  });
  const hydrated = matchedPosts.map((post) => ({
    ...post,
    author: db.users[post.authorId] || INITIAL_USERS["bot_tech"],
    likedByUser: post.likedBy.includes("user_current")
  }));
  res.json(hydrated);
});
app.post("/api/ai/generate", async (req, res) => {
  const { type, topic } = req.body;
  const success = await generateAiPost(type || "thread", topic);
  if (success) {
    res.json({ success: true, message: "AI generated a new post successfully!" });
  } else {
    res.status(500).json({ error: "Failed to generate AI post or Gemini key not set" });
  }
});
async function generateAiPost(type, topic) {
  const db = readDB();
  const botIds = ["bot_tech", "bot_vibe", "bot_cosmos"];
  const randomBotId = botIds[Math.floor(Math.random() * botIds.length)];
  const bot = db.users[randomBotId];
  const promptTopic = topic || ["tecnologia", "fotografia", "universo", "filosofia", "atardeceres", "futuro"].sort(() => 0.5 - Math.random())[0];
  let generatedContent = "";
  let mediaUrl = void 0;
  let soundName = void 0;
  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Eres un usuario de redes sociales de la plataforma Voxium. Tu perfil es: Nombre: ${bot.displayName}, Bio: ${bot.bio}, Username: ${bot.username}.
Escribe una publicaci\xF3n de tipo ${type} sobre el tema "${promptTopic}" en espa\xF1ol. Debe sonar sumamente natural, amigable, e incluir emojis y hashtags relevantes (m\xE1ximo 3 hashtags).
Si el tipo es "reel", escribe el comentario que acompa\xF1a al video corto.
Devuelve \xFAnicamente el texto de la publicaci\xF3n, sin comentarios adicionales de tu parte ni comillas.`
      });
      generatedContent = response.text || "";
    } catch (err) {
      console.error("Gemini failed, using fallback generator:", err);
    }
  }
  if (!generatedContent) {
    const fallbacks = {
      "bot_tech": [
        "\xBFSab\xEDan que React 19 trae grandes optimizaciones autom\xE1ticas? Adi\xF3s a preocuparnos tanto por memorizaciones manuales. \xA1Qu\xE9 gran momento para ser frontend! \u{1F4BB}\u2728 #react19 #webdev",
        "La Inteligencia Artificial no va a reemplazar a los programadores, sino a los programadores que no usan Inteligencia Artificial. Adaptarse o morir. \u{1F916}\u{1F4A1} #ai #techlife"
      ],
      "bot_vibe": [
        "Un caf\xE9 por la ma\xF1ana, buena m\xFAsica de fondo y la luz del sol entrando por la ventana. No se necesita nada m\xE1s para ser feliz hoy. \u{1F338}\u2615 #peaceful #cozyvibe",
        "Perderse en las calles iluminadas por carteles de ne\xF3n por la noche es mi terapia favorita. La ciudad tiene un latido \xFAnico. \u{1F306}\u2728 #neonlight #urbanphotography"
      ],
      "bot_cosmos": [
        "La estrella m\xE1s grande conocida, UY Scuti, es tan gigante que si la pusi\xE9ramos en el centro del sistema solar, engullir\xEDa todo hasta m\xE1s all\xE1 de la \xF3rbita de J\xFApiter. \xA1Nuestra escala es min\xFAscula! \u{1F30C}\u{1F31F} #astronomy #universe",
        "A veces nos olvidamos de que estamos viajando por el espacio a bordo de una roca gigante a 107.000 km/h. \xA1Buen viaje espacial hoy, tripulantes! \u{1F30D}\u{1F6F0}\uFE0F #earth #cosmos"
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
  const hashTags = (generatedContent.match(/#\w+/g) || []).map((t) => t.replace("#", ""));
  const newPost = {
    id: `post_ai_${Date.now()}`,
    type,
    authorId: randomBotId,
    content: generatedContent,
    mediaUrl,
    soundName,
    likesCount: Math.floor(Math.random() * 20) + 5,
    repliesCount: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    tags: hashTags,
    likedBy: [],
    classification: "green"
  };
  db.posts.push(newPost);
  writeDB(db);
  return true;
}
function simulateAiChatReply(botId, userMessage) {
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
Est\xE1s en un chat privado de Voxium hablando con tu amigo. Te acaba de enviar el mensaje privado: "${userMessage}".
Escribe una respuesta corta, amigable y sumamente conversacional que responda a su inquietud. Mant\xE9n la respuesta por debajo de las 3 frases, s\xE9 fresco e incluye alg\xFAn emoji.
Devuelve \xFAnicamente el texto de tu mensaje de respuesta, sin comillas.`
        });
        reply = response.text || "";
      } catch (err) {
        console.error("AI chat failed:", err);
      }
    }
    if (!reply) {
      const standardReplies = [
        "\xA1Qu\xE9 bueno leerte por aqu\xED! \u{1F604} Justo estaba pensando en crear nuevo contenido para Voxium.",
        "Totalmente. \xA1Oye, cu\xE9ntame m\xE1s sobre lo que est\xE1s programando o planeando para estos d\xEDas! \u{1F680}",
        "Me encanta tu vibra. Sigamos conectados. \u2728\u{1F338}"
      ];
      reply = standardReplies[Math.floor(Math.random() * standardReplies.length)];
    }
    const replyMsg = {
      id: `msg_ai_${Date.now()}`,
      senderId: botId,
      receiverId: "user_current",
      content: reply,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.messages.push(replyMsg);
    writeDB(db);
  }, 2500);
}
async function simulateAiEngagement(postId) {
  setTimeout(async () => {
    const db = readDB();
    const post = db.posts.find((p) => p.id === postId);
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
Mira la publicaci\xF3n del usuario: "${post.content}".
Escribe un comentario o respuesta corta e informal en espa\xF1ol que encaje perfectamente con tu personalidad. S\xE9 simp\xE1tico, ingenioso o curioso. No excedas las 2 frases.
Devuelve \xFAnicamente el texto de tu respuesta, sin comillas.`
          });
          replyContent = response.text || "";
        } catch (err) {
          console.error("AI comment simulator failed:", err);
        }
      }
      if (!replyContent) {
        const fallbacks = {
          "bot_tech": [
            "\xA1Tremendo post! Concuerdo totalmente con lo que dices aqu\xED. \u{1F680}\u{1F4BB}",
            "Interesante perspectiva. Me quedo pensando en c\xF3mo se aplicar\xE1 esto en el futuro."
          ],
          "bot_vibe": [
            "Qu\xE9 bonita vibra transmite este post, me alegr\xF3 el d\xEDa leerlo. \u2728\u{1F338}",
            "Totalmente de acuerdo, la est\xE9tica y el mensaje son geniales."
          ],
          "bot_cosmos": [
            "Esto me recuerda a las leyes de la f\xEDsica c\xF3smica: \xA1todo fluye perfectamente! \u{1F30C}\u{1F6F0}\uFE0F",
            "\xA1Brillante post! Una dosis maravillosa de curiosidad para hoy."
          ]
        };
        const botFallbacks = fallbacks[botId] || fallbacks["bot_tech"];
        replyContent = botFallbacks[Math.floor(Math.random() * botFallbacks.length)];
      }
      const commentId = `comm_ai_${Date.now()}_${botId}`;
      const newComment = {
        id: commentId,
        postId,
        authorId: botId,
        content: replyContent,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.comments.push(newComment);
      post.repliesCount += 1;
      const notif = {
        id: `notif_${Date.now()}_${botId}`,
        type: "comment",
        senderId: botId,
        targetPostId: postId,
        targetPostType: post.type,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        read: false
      };
      db.notifications.push(notif);
    }
    post.likesCount += Math.floor(Math.random() * 5) + 2;
    selectedBots.forEach((botId) => {
      post.likedBy.push(botId);
      const likeNotif = {
        id: `notif_l_${Date.now()}_${botId}`,
        type: "like",
        senderId: botId,
        targetPostId: postId,
        targetPostType: post.type,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        read: false
      };
      db.notifications.push(likeNotif);
    });
    writeDB(db);
  }, 3500);
}
async function simulateAiCommentOnPost(post, userComment) {
  if (post.authorId === "user_current") return;
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
Hiciste una publicaci\xF3n que dec\xEDa: "${post.content}".
Un usuario coment\xF3: "${userComment}".
Escribe una respuesta corta y directa en espa\xF1ol al comentario del usuario para agradecerle o entablar conversaci\xF3n de manera simp\xE1tica y aut\xE9ntica. M\xE1ximo 2 frases.
Devuelve \xFAnicamente el texto de tu respuesta, sin comillas.`
        });
        aiReply = response.text || "";
      } catch (err) {
        console.error("AI reply simulation failed:", err);
      }
    }
    if (!aiReply) {
      const fallbacks = [
        `\xA1Muchas gracias! Me alegra que te guste el contenido. \u{1F60A}\u{1F680}`,
        `\xA1Qu\xE9 gran aporte! Totalmente de acuerdo contigo. Nos vemos por aqu\xED. \u2728`
      ];
      aiReply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
    const replyComment = {
      id: `comm_ai_reply_${Date.now()}`,
      postId: post.id,
      authorId: post.authorId,
      content: aiReply,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.comments.push(replyComment);
    const rehydratedPost = db.posts.find((p) => p.id === post.id);
    if (rehydratedPost) {
      rehydratedPost.repliesCount += 1;
    }
    writeDB(db);
  }, 3e3);
}
setInterval(() => {
  const type = Math.random() > 0.5 ? "thread" : "reel";
  generateAiPost(type).catch((err) => console.error("Periodic AI generation failed:", err));
}, 18e4);
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
    const db = readDB();
    if (db.posts.length <= 4) {
      generateAiPost("thread").catch(() => {
      });
      generateAiPost("reel").catch(() => {
      });
    }
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
