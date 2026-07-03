import { FormEvent, useEffect, useMemo, useState } from "react";
import type { RoomStatePayload, Round } from "@gauge-game/shared";
import { buildScoreZones } from "@gauge-game/shared";
import { Gauge } from "../components/Gauge.js";
import { PlayerRoleBadge } from "../components/PlayerRoleBadge.js";
import { RoundResult } from "../components/RoundResult.js";
import { ScoreBoard } from "../components/ScoreBoard.js";
import { ThemeCard } from "../components/ThemeCard.js";

export function GamePage({
  state,
  round,
  onSubmitClue,
  onSubmitGuess,
  onNextRound
}: {
  state: RoomStatePayload;
  round: Round;
  onSubmitClue: (clue: string) => void;
  onSubmitGuess: (guessValue: number) => void;
  onNextRound: () => void;
}) {
  const [clue, setClue] = useState("");
  const [guess, setGuess] = useState(500);
  const isClueGiver = state.role === "clueGiver";
  const isGuesser = state.role === "guesser";
  const revealed = round.status === "revealed" || round.status === "complete";
  const readyPlayerIds = round.nextReadyPlayerIds ?? [];
  const hasAcceptedNext = readyPlayerIds.includes(state.playerId);
  const readyCount = readyPlayerIds.length;
  const readyTotal = 2;
  const nextLabel =
    state.game.currentRoundIndex >= state.game.totalRounds - 1 ? "Prêt pour le score final" : "Prêt pour la suite";
  const visibleScoreZones = useMemo(() => {
    if (revealed && round.targetValue !== undefined) return buildScoreZones(round.targetValue);
    return isClueGiver ? state.scoreZones : undefined;
  }, [isClueGiver, revealed, round.targetValue, state.scoreZones]);

  useEffect(() => {
    setClue("");
    setGuess(500);
  }, [round.id]);

  function submitClue(event: FormEvent) {
    event.preventDefault();
    onSubmitClue(clue);
  }

  return (
    <section className="screen game-screen">
      <div className="top-line">
        <PlayerRoleBadge role={state.role} />
        <ScoreBoard game={state.game} />
      </div>
      <ThemeCard theme={round.theme} />
      <Gauge
        leftLabel={round.theme.leftLabel}
        rightLabel={round.theme.rightLabel}
        value={revealed ? round.guessValue ?? guess : guess}
        target={isClueGiver || revealed ? round.targetValue : undefined}
        scoreZones={visibleScoreZones}
        interactive={isGuesser && round.status === "waiting_for_guess"}
        showGuessMarker={isGuesser || revealed}
        onChange={setGuess}
      />
      {isClueGiver ? (
        <form className="panel stack" onSubmit={submitClue}>
          <label>
            Indice
            <input value={clue} onChange={(event) => setClue(event.target.value)} placeholder="Ton indice" />
          </label>
          <button className="primary" disabled={round.status !== "waiting_for_clue"} type="submit">
            Envoyer l'indice
          </button>
        </form>
      ) : null}
      {isGuesser ? (
        <section className="panel stack">
          <p className="clue-box">{round.clue ? round.clue : "En attente de l'indice..."}</p>
          <button className="primary" disabled={round.status !== "waiting_for_guess"} onClick={() => onSubmitGuess(guess)}>
            Valider
          </button>
        </section>
      ) : null}
      <RoundResult round={round} />
      {revealed ? (
        <section className="panel stack">
          <p className="ready-status">
            {readyCount}/{readyTotal} joueurs prêts
          </p>
          <button className="primary tall" disabled={hasAcceptedNext} onClick={onNextRound}>
            {hasAcceptedNext ? "En attente de l'autre joueur" : nextLabel}
          </button>
        </section>
      ) : null}
    </section>
  );
}
