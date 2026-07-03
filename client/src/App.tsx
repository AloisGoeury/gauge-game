import { useEffect, useMemo, useState } from "react";
import type { CreateRoomPayload, RoomStatePayload } from "@gauge-game/shared";
import { getCurrentRound } from "@gauge-game/shared";
import { CreateGamePage } from "./pages/CreateGamePage.js";
import { EndPage } from "./pages/EndPage.js";
import { GamePage } from "./pages/GamePage.js";
import { HomePage } from "./pages/HomePage.js";
import { LobbyPage } from "./pages/LobbyPage.js";
import type { ClientSocket } from "./main.js";

type View = "home" | "create" | "lobby" | "game" | "end";

export function App({ socket }: { socket: ClientSocket }) {
  const [view, setView] = useState<View>("home");
  const [state, setState] = useState<RoomStatePayload | null>(null);
  const [error, setError] = useState("");
  const initialRoomCode = useMemo(() => new URLSearchParams(window.location.search).get("room")?.toUpperCase() ?? "", []);
  const currentRound = useMemo(() => (state ? getCurrentRound(state.game) : undefined), [state]);

  useEffect(() => {
    socket.on("room:state", (payload) => {
      setState(payload);
      setError("");
      if (payload.game.status === "lobby") setView("lobby");
      if (payload.game.status === "playing") setView("game");
      if (payload.game.status === "finished") setView("end");
      window.localStorage.setItem(`gauge:${payload.game.roomCode}:playerId`, payload.playerId);
    });
    socket.on("round:reveal", (payload) => {
      setState(payload);
      setView(payload.game.status === "finished" ? "end" : "game");
    });
    socket.on("error", (payload) => setError(payload.message));
    return () => {
      socket.off("room:state");
      socket.off("round:reveal");
      socket.off("error");
    };
  }, [socket]);

  function createRoom(payload: CreateRoomPayload) {
    socket.emit("room:create", payload);
  }

  function joinRoom(roomCode: string, playerName: string) {
    const code = roomCode.toUpperCase().trim();
    socket.emit("room:join", {
      roomCode: code,
      playerName,
      playerId: window.localStorage.getItem(`gauge:${code}:playerId`) || undefined
    });
  }

  return (
    <main className="app-shell">
      {error ? (
        <div className="alert" role="alert">
          {error}
        </div>
      ) : null}

      {view === "home" ? <HomePage initialRoomCode={initialRoomCode} onCreate={() => setView("create")} onJoin={joinRoom} /> : null}
      {view === "create" ? <CreateGamePage onBack={() => setView("home")} onCreate={createRoom} /> : null}
      {view === "lobby" && state ? (
        <LobbyPage
          state={state}
          onStart={(firstClueGiverPlayerId) =>
            socket.emit("game:start", { roomCode: state.game.roomCode, firstClueGiverPlayerId })
          }
        />
      ) : null}
      {view === "game" && state && currentRound ? (
        <GamePage
          state={state}
          round={currentRound}
          onSubmitClue={(clue) => socket.emit("round:submit-clue", { roomCode: state.game.roomCode, clue })}
          onSubmitGuess={(guessValue) => socket.emit("round:submit-guess", { roomCode: state.game.roomCode, guessValue })}
          onNextRound={() => socket.emit("round:next", { roomCode: state.game.roomCode })}
        />
      ) : null}
      {view === "end" && state ? <EndPage state={state} onReplay={() => setView("home")} /> : null}
    </main>
  );
}
