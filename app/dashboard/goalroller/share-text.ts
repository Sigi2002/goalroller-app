import type {
  DuelFavoritePosition,
  Favorite,
  GameMode,
  Outcome,
} from "@/lib/goalroller/dice";

export function favoriteLabelForShare(
  mode: GameMode,
  favorite: Favorite,
  duelFavoritePosition: DuelFavoritePosition,
  homeTeam: string,
  awayTeam: string,
  labels: { home: string; away: string },
): string {
  if (mode === "duels") return duelFavoritePosition;

  const team = favorite === "home" ? homeTeam.trim() : awayTeam.trim();
  return team || (favorite === "home" ? labels.home : labels.away);
}

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
