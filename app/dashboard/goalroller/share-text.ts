import type { GameMode, Outcome } from "@/lib/goalroller/dice";

export function withMatchLine(
  message: string,
  homeTeam: string,
  awayTeam: string,
): string {
  const home = homeTeam.trim();
  const away = awayTeam.trim();
  const match = home && away ? `${home} vs. ${away}` : home || away;

  return match ? `${match}\n${message}` : message;
}

export function displayOutcomeText(
  mode: GameMode,
  outcome: Outcome,
  duelDrawResult: string,
): string {
  return mode === "duels" && outcome === "X" ? duelDrawResult : outcome;
}
