export const OUTCOMES = ["1", "X", "2"] as const;
export type Outcome = (typeof OUTCOMES)[number];
export type Favorite = "home" | "away";
export type DuelFavoritePosition = "A" | "B";
export type GameMode = "football" | "duels";
export type OddsRange = { minCents: number; maxCents: number };
type DieOddsRange = OddsRange & { dieId: DieId };

export const DICE = [
  {
    id: "yellow",
    minCents: 125,
    maxCents: 144,
    color: "#f3c742",
    textColor: "#201700",
    faces: ["1", "1", "1", "1", "1", "1", "1", "1", "1", "X", "X", "2"],
  },
  {
    id: "green",
    minCents: 145,
    maxCents: 164,
    color: "#287a3d",
    textColor: "#ffffff",
    faces: ["1", "1", "1", "1", "1", "1", "1", "1", "X", "X", "2", "2"],
  },
  {
    id: "red",
    minCents: 165,
    maxCents: 189,
    color: "#c62828",
    textColor: "#ffffff",
    faces: ["1", "1", "1", "1", "1", "1", "1", "X", "X", "X", "2", "2"],
  },
  {
    id: "blue",
    minCents: 190,
    maxCents: 219,
    color: "#2457c5",
    textColor: "#ffffff",
    faces: ["1", "1", "1", "1", "1", "1", "X", "X", "X", "2", "2", "2"],
  },
  {
    id: "black",
    minCents: 220,
    maxCents: 290,
    color: "#191919",
    textColor: "#ffffff",
    faces: ["1", "1", "1", "1", "1", "X", "X", "X", "2", "2", "2", "2"],
  },
] as const;

export type Die = (typeof DICE)[number];
export type DieId = Die["id"];

const DUEL_RANGES = [
  { dieId: "yellow", minCents: 119, maxCents: 131 },
  { dieId: "green", minCents: 132, maxCents: 149 },
  { dieId: "red", minCents: 150, maxCents: 172 },
  { dieId: "blue", minCents: 173, maxCents: 199 },
] as const satisfies readonly DieOddsRange[];

const FOOTBALL_RANGES: readonly DieOddsRange[] = DICE.map((die) => ({
  dieId: die.id,
  minCents: die.minCents,
  maxCents: die.maxCents,
}));

export type QuoteResult =
  | { ok: true; oddsCents: number; die: Die; range: OddsRange }
  | { ok: false; reason: "format" }
  | {
      ok: false;
      reason: "range";
      minCents: number;
      maxCents: number;
    };

export function diceForMode(mode: GameMode): readonly Die[] {
  return mode === "duels" ? DICE.slice(0, 4) : DICE;
}

export function parseFavoriteOdds(
  value: string,
  mode: GameMode = "football",
): QuoteResult {
  const trimmed = value.trim();
  if (!/^\d{1,2}(?:[.,]\d{1,2})?$/.test(trimmed)) {
    return { ok: false, reason: "format" };
  }

  const [whole, fraction = ""] = trimmed.replace(",", ".").split(".");
  const oddsCents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  const ranges = mode === "duels" ? DUEL_RANGES : FOOTBALL_RANGES;
  const firstRange = ranges[0];
  const lastRange = ranges[ranges.length - 1];
  const range = ranges.find(
    (candidate) =>
      oddsCents >= candidate.minCents && oddsCents <= candidate.maxCents,
  );

  if (!range) {
    return {
      ok: false,
      reason: "range",
      minCents: firstRange.minCents,
      maxCents: lastRange.maxCents,
    };
  }

  const die = DICE.find((candidate) => candidate.id === range.dieId);
  if (!die || !diceForMode(mode).some((candidate) => candidate.id === die.id)) {
    throw new Error(`No ${mode} die is configured for quote range`);
  }

  return {
    ok: true,
    oddsCents,
    die,
    range: { minCents: range.minCents, maxCents: range.maxCents },
  };
}

export function faceCounts(die: Die): Record<Outcome, number> {
  return {
    "1": die.faces.filter((face) => face === "1").length,
    X: die.faces.filter((face) => face === "X").length,
    "2": die.faces.filter((face) => face === "2").length,
  };
}

export function tipForOutcome(
  outcome: Outcome,
  favorite: Favorite,
): { tip: Outcome; awayNotice: "favoriteWins" | "favoriteLoses" | null } {
  if (favorite === "home" || outcome === "X") {
    return { tip: outcome, awayNotice: null };
  }

  return outcome === "1"
    ? { tip: "2", awayNotice: "favoriteWins" }
    : { tip: "1", awayNotice: "favoriteLoses" };
}

export function duelTipForOutcome(
  outcome: Outcome,
  favoritePosition: DuelFavoritePosition,
): { tip: "1" | "2"; verdict: "favoriteWin" | "underdogWin" } {
  const favoriteTip = favoritePosition === "A" ? "1" : "2";
  const underdogTip = favoritePosition === "A" ? "2" : "1";

  return outcome === "2"
    ? { tip: underdogTip, verdict: "underdogWin" }
    : { tip: favoriteTip, verdict: "favoriteWin" };
}
