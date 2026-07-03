export function PlayerRoleBadge({ role }: { role: "clueGiver" | "guesser" | "waiting" | "spectator" }) {
  const label = {
    clueGiver: "Tu fais deviner",
    guesser: "Tu devines",
    waiting: "En attente",
    spectator: "Spectateur"
  }[role];
  return <span className={`role-badge role-${role}`}>{label}</span>;
}
