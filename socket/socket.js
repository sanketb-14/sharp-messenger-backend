import { Server } from "socket.io";
import http from "http";
import express from "express";

export const app = express();
export const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "https://sharp-messenger.vercel.app",
    credentials: true ,
    methods: ["GET", "POST"],
  },
});

// Define userSocketMap
const userSocketMap = {};

const getOnlineUsers = () => Object.keys(userSocketMap);

export const getReceiverSocketId = (receiverId) => {
  console.log(receiverId, "getReceiverSocketId");
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  const userId = socket.handshake.query.userId;

  socket.on("newMessage", (message) => {
    console.log("New message received:", message);
    // Emit the message to all clients in the conversation
    io.to(message.conversationId).emit("newMessage", message);
  });
  if (userId != null) {
    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    if (userId != null) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });

  // Add error handling
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});
