require("dotenv").config();
const jwt = require("jsonwebtoken");

const connectedUsers = new Map();
let io = null;

function broadcastOnlineUsers() {
  const onlineUserIds = Array.from(connectedUsers.keys());
  io.emit("online_users", { userIds: onlineUserIds });
}

module.exports = {
  init: (server) => {
    io = require("socket.io")(server, {
      cors: {
        origin: process.env.socket_url,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));

      try {
        const decoded = jwt.verify(token, process.env.jwtSecret);
        socket.userId = decoded.id;
        next();
      } catch (err) {
        return next(new Error("Invalid token"));
      }
    });

    io.on("connection", (socket) => {
      const userId = socket.userId;
      if (!userId) return socket.disconnect();
       
      const isFirstConnection = !connectedUsers.has(userId);
      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, new Set());
      }

      connectedUsers.get(userId).add(socket.id);

      if (isFirstConnection) {
        io.emit("user_status", { userId, status: "online" });
      }

      broadcastOnlineUsers();

      socket.on("join_conversation", (conversationId) => {
        socket.join(conversationId.toString());
      });
      

      socket.on("typing", ({ conversationId }) => {
        socket.to(conversationId.toString()).emit("set_typing", { conversationId });
      });
      
    
      socket.on("stop_typing", ({ conversationId }) => {
        if (!conversationId) return;
        socket.to(conversationId.toString()).emit("set_stop_typing", { conversationId });
      });

      socket.on("leave_conversation", (conversationId) => {
        socket.leave(conversationId.toString());
      });

      socket.on("disconnect", () => {     
        const userSockets = connectedUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
      
          if (userSockets.size === 0) {
            setTimeout(() => {
              const currentSockets = connectedUsers.get(userId);
              if (!currentSockets || currentSockets.size === 0) {
                connectedUsers.delete(userId);
                io.emit("user_status", { userId, status: "offline" });
                broadcastOnlineUsers();
              }
            }, 1000);
          }
        }
      });
      
    });

    return io;
  },

  getIO: () => {
    if (!io) throw new Error("Socket.IO not initialized");
    return io;
  },
};
