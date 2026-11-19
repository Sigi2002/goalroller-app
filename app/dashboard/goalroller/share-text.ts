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
