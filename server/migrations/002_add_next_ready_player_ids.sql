alter table rounds
add column if not exists next_ready_player_ids text[] not null default '{}';
