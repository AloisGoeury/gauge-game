import "dotenv/config";
import pg from "pg";
import type { CustomThemeInput, Game, Round, Theme } from "@gauge-game/shared";

const { Pool } = pg;

export const dbEnabled = Boolean(process.env.DATABASE_URL) && process.env.DISABLE_DB !== "true";

export const pool = dbEnabled ? new Pool({ connectionString: process.env.DATABASE_URL }) : undefined;

const fallbackThemes: Theme[] = [
  { id: "seed-1", title: "Un plat", leftLabel: "nul", rightLabel: "excellent", isPublic: true, isApproved: true },
  { id: "seed-2", title: "Un objet", leftLabel: "très court", rightLabel: "très long", isPublic: true, isApproved: true },
  { id: "seed-3", title: "Une activité", leftLabel: "reposante", rightLabel: "épuisante", isPublic: true, isApproved: true },
  { id: "seed-4", title: "Un film", leftLabel: "oubliable", rightLabel: "chef-d'oeuvre", isPublic: true, isApproved: true }
];

export async function getApprovedPublicThemes(): Promise<Theme[]> {
  if (!pool) return fallbackThemes;
  const result = await pool.query(
    `select id, title, left_label, right_label, created_by_player_name, is_public, is_approved, created_at, updated_at
     from themes
     where is_public = true and is_approved = true
     order by random()
     limit 50`
  );
  return result.rows.map(themeRowToTheme);
}

export async function saveCustomThemes(inputs: CustomThemeInput[], playerName: string): Promise<Theme[]> {
  const themes = inputs.map((input, index) => ({
    id: crypto.randomUUID(),
    title: input.title,
    leftLabel: input.leftLabel,
    rightLabel: input.rightLabel,
    createdByPlayerName: playerName,
    isPublic: input.allowPublic,
    isApproved: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    index
  }));

  if (!pool) return themes;

  for (const theme of themes) {
    if (!theme.isPublic) continue;
    await pool.query(
      `insert into themes (id, title, left_label, right_label, created_by_player_name, is_public, is_approved)
       values ($1, $2, $3, $4, $5, true, false)`,
      [theme.id, theme.title, theme.leftLabel, theme.rightLabel, playerName]
    );
  }
  return themes;
}

export async function persistGameSnapshot(game?: Game): Promise<void> {
  if (!pool || !game) return;
  await pool.query(
    `insert into games (id, room_code, status, total_rounds, rounds_per_clue_giver, current_round_index)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (room_code) do update set
       status = excluded.status,
       total_rounds = excluded.total_rounds,
       rounds_per_clue_giver = excluded.rounds_per_clue_giver,
       current_round_index = excluded.current_round_index,
       updated_at = now()`,
    [game.id, game.roomCode, game.status, game.totalRounds, game.roundsPerClueGiver, game.currentRoundIndex]
  );

  for (const player of game.players) {
    await pool.query(
      `insert into players (id, game_id, name, score)
       values ($1, $2, $3, $4)
       on conflict (id) do update set
         name = excluded.name,
         score = excluded.score`,
      [player.id, game.id, player.name, player.score]
    );
  }

  for (const round of game.rounds) {
    await persistRound(game.id, round);
  }
}

async function persistRound(gameId: string, round: Round): Promise<void> {
  if (!pool) return;
  const themeId = isUuid(round.theme.id) ? round.theme.id : null;
  await pool.query(
    `insert into rounds (
       id, game_id, round_index, theme_id, custom_theme_title, custom_left_label, custom_right_label,
       clue_giver_player_id, guesser_player_id, target_value, clue, guess_value, points, next_ready_player_ids, status
     )
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     on conflict (game_id, round_index) do update set
       theme_id = excluded.theme_id,
       custom_theme_title = excluded.custom_theme_title,
       custom_left_label = excluded.custom_left_label,
       custom_right_label = excluded.custom_right_label,
       clue_giver_player_id = excluded.clue_giver_player_id,
       guesser_player_id = excluded.guesser_player_id,
       target_value = excluded.target_value,
       clue = excluded.clue,
       guess_value = excluded.guess_value,
       points = excluded.points,
       next_ready_player_ids = excluded.next_ready_player_ids,
       status = excluded.status,
       updated_at = now()`,
    [
      round.id,
      gameId,
      round.index,
      themeId,
      themeId ? null : round.theme.title,
      themeId ? null : round.theme.leftLabel,
      themeId ? null : round.theme.rightLabel,
      round.clueGiverPlayerId,
      round.guesserPlayerId,
      round.targetValue ?? 0,
      round.clue,
      round.guessValue,
      round.points,
      round.nextReadyPlayerIds ?? [],
      round.status
    ]
  );
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function themeRowToTheme(row: {
  id: string;
  title: string;
  left_label: string;
  right_label: string;
  created_by_player_name: string | null;
  is_public: boolean;
  is_approved: boolean;
  created_at?: Date;
  updated_at?: Date;
}): Theme {
  return {
    id: row.id,
    title: row.title,
    leftLabel: row.left_label,
    rightLabel: row.right_label,
    createdByPlayerName: row.created_by_player_name,
    isPublic: row.is_public,
    isApproved: row.is_approved,
    createdAt: row.created_at?.toISOString(),
    updatedAt: row.updated_at?.toISOString()
  };
}
