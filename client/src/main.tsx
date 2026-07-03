import React from "react";
import ReactDOM from "react-dom/client";
import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@gauge-game/shared";
import { App } from "./App.js";
import "./styles.css";

const socket: ClientSocket = io(import.meta.env.VITE_API_URL || undefined, {
  autoConnect: true,
  transports: ["websocket", "polling"]
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App socket={socket} />
  </React.StrictMode>
);

export type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
