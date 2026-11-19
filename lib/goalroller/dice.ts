export const OUTCOMES = ["1", "X", "2"] as const;
export type Outcome = (typeof OUTCOMES)[number];
export type Favorite = "home" | "away";

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

export type QuoteResult =
  | { ok: true; oddsCents: number; die: Die }
  | { ok: false; reason: "format" | "range" };

export function parseFavoriteOdds(value: string): QuoteResult {
  const trimmed = value.trim();
  if (!/^\d{1,2}(?:[.,]\d{1,2})?$/.test(trimmed)) {
    return { ok: false, reason: "format" };
  }

  const [whole, fraction = ""] = trimmed.replace(",", ".").split(".");
  const oddsCents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  const die = DICE.find(
    (candidate) =>
      oddsCents >= candidate.minCents && oddsCents <= candidate.maxCents,
  );

  return die
    ? { ok: true, oddsCents, die }
    : { ok: false, reason: "range" };
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
