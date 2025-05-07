require("dotenv").config();

let io = null;

module.exports = {
  init: (server) => {
    io = require('socket.io')(server, {
      cors: {
        origin: process.env.socket_url,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      socket.on("join_conversation", (conversationId) => {
        socket.join(conversationId.toString());
        console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
      });

      socket.on("leave_conversation", (conversationId) => {
        socket.leave(conversationId.toString());
        console.log(`Socket ${socket.id} left conversation ${conversationId}`);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });
  },

  getIO: () => {
    if (!io) throw new Error("Socket.IO not initialized");
    return io;
  }
};
