const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const pingServer = require("./cron");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message");
const dns = require("dns");

// Load environment variables (supports root .env or server-level env on deployment platforms)
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : null,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, '')) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback allow to avoid unexpected CORS blocks across dynamic preview deployments
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(morgan("dev"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/trips", require("./routes/tripRoutes"));
app.use("/api/itineraries", require("./routes/itineraryRoutes"));
app.use("/api/cities", require("./routes/cityRoutes"));
app.use("/api/activities", require("./routes/activityRoutes"));
app.use("/api/budget", require("./routes/budgetRoutes"));
app.use("/api/checklists", require("./routes/checklistRoutes"));
app.use("/api/notes", require("./routes/notesRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));

dns.setServers(["8.8.8.8", "8.8.4.4"]);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

const io = new Server(server, {
  cors: corsOptions,
});

io.on("connection", (socket) => {
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
  });

  socket.on("send_message", async (data) => {
    try {
      const { chatId, senderId, content } = data;
      const message = await Message.create({ chatId, senderId, content });
      const populatedMessage = await message.populate(
        "senderId",
        "firstName lastName profilePhoto",
      );
      const Chat = require("./models/Chat");
      await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });
      io.to(chatId).emit("receive_message", populatedMessage);
    } catch (error) {
      console.error("Socket send_message error:", error);
    }
  });

  socket.on("typing", ({ chatId, isTyping }) => {
    socket.to(chatId).emit("user_typing", isTyping);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Traveloop server running on port ${PORT}`);
  pingServer();
});
