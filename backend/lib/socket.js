let io = null;

// Initialize the socket instance
export const initSocket = (socketInstance) => {
  io = socketInstance;
  console.log("Socket.IO initialized");
};

// Emit to all connected clients
export const emitToAll = (event, data) => {
  if (!io) {
    console.error("Socket.IO not initialized");
    return;
  }
  io.emit(event, data);
};

// Emit to a specific socket
export const emitToSocket = (socketId, event, data) => {
  if (!io) {
    console.error("Socket.IO not initialized");
    return;
  }
  io.to(socketId).emit(event, data);
};

// Get the socket instance
export const getSocket = () => {
  return io;
};
