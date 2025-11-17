import { Server } from "socket.io";

let io = null;

export function initWebsocket(server) {
  io = new Server(server, {
    cors: { origin: "*" },
  });
  console.log("⚡ WebSocket initialized");
  return io;
}

export function getIO() {
  return io;
}
