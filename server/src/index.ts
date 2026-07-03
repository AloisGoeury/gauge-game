import "dotenv/config";
import express from "express";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@gauge-game/shared";
import {
  createRoom,
  disconnectSocket,
  getSocketLink,
  joinRoom,
  nextRound,
  registerSocket,
  startGame,
  statesForRoom,
  submitClue,
  submitGuess
} from "./gameStore.js";

const app = express();
const server = http.createServer(app);
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || clientUrl);
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Vary", "Origin");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "gauge-game" });
});

if (process.env.NODE_ENV === "production") {
  const clientDist = path.resolve(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: true
  }
});

io.on("connection", (socket) => {
  socket.on("room:create", async (payload) => {
    await handle(socket, async () => {
      const state = await createRoom(payload);
      socket.join(state.game.roomCode);
      registerSocket(socket.id, state.game.roomCode, state.playerId);
      socket.emit("room:state", state);
    });
  });

  socket.on("room:join", (payload) => {
    void handle(socket, async () => {
      const state = joinRoom(payload);
      socket.join(state.game.roomCode);
      registerSocket(socket.id, state.game.roomCode, state.playerId);
      emitRoomStates(state.game.roomCode);
    });
  });

  socket.on("game:start", (payload) => {
    void handle(socket, async () => {
      const playerId = playerIdForSocket(socket.id);
      const states = await startGame(payload, playerId);
      emitStates(payload.roomCode, states);
    });
  });

  socket.on("round:submit-clue", (payload) => {
    void handle(socket, async () => {
      const states = submitClue(payload, playerIdForSocket(socket.id));
      emitStates(payload.roomCode, states);
    });
  });

  socket.on("round:submit-guess", (payload) => {
    void handle(socket, async () => {
      const states = submitGuess(payload, playerIdForSocket(socket.id));
      emitStates(payload.roomCode, states, true);
    });
  });

  socket.on("round:next", (payload) => {
    void handle(socket, async () => {
      const states = nextRound(payload, playerIdForSocket(socket.id));
      emitStates(payload.roomCode, states);
    });
  });

  socket.on("disconnect", () => {
    const link = disconnectSocket(socket.id);
    if (!link) return;
    socket.to(link.roomCode).emit("player:disconnect", { playerId: link.playerId });
    emitRoomStates(link.roomCode);
  });
});

server.listen(port, host, () => {
  console.log(`Gauge Game server listening on http://${host}:${port}`);
});

async function handle(socket: Parameters<Parameters<typeof io.on>[1]>[0], fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    socket.emit("error", { message });
  }
}

function playerIdForSocket(socketId: string): string {
  const link = getSocketLink(socketId);
  if (link) return link.playerId;
  throw new Error("Joueur introuvable.");
}

function emitRoomStates(roomCode: string): void {
  emitStates(roomCode, statesForRoom(roomCode));
}

function emitStates(roomCode: string, states: ReturnType<typeof statesForRoom>, reveal = false): void {
  const sockets = [...io.sockets.sockets.values()].filter((socket) => socket.rooms.has(roomCode));
  for (const socket of sockets) {
    const link = getSocketLink(socket.id);
    const state = states.find((candidate) => candidate.playerId === link?.playerId);
    if (!state) continue;
    const event = reveal ? "round:reveal" : "room:state";
    socket.emit(event, state);
  }
}
