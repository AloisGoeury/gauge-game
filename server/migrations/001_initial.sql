create extension if not exists "pgcrypto";

create table if not exists themes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  left_label text not null,
  right_label text not null,
  created_by_player_name text null,
  is_public boolean not null default false,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  room_code text unique not null,
  status text not null,
  total_rounds integer not null,
  rounds_per_clue_giver integer not null default 3,
  current_round_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  name text not null,
  socket_id text null,
  score integer not null default 0,
  joined_at timestamptz not null default now()
);

create table if not exists rounds (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  round_index integer not null,
  theme_id uuid null references themes(id),
  custom_theme_title text null,
  custom_left_label text null,
  custom_right_label text null,
  clue_giver_player_id uuid references players(id),
  guesser_player_id uuid references players(id),
  target_value integer not null,
  clue text null,
  guess_value integer null,
  points integer null,
  next_ready_player_ids text[] not null default '{}',
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (game_id, round_index)
);

create index if not exists themes_random_pool_idx on themes (is_public, is_approved);
create index if not exists games_room_code_idx on games (room_code);
