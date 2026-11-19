import type { DieId, Outcome } from "@/lib/goalroller/dice";

type RollImageAsset = {
  dieId: DieId;
  outcome: Outcome;
  path: string;
  width: number;
  height: number;
};

export type GoalrollerRollImageUrls = Partial<
  Record<DieId, Partial<Record<Outcome, string>>>
>;

export function goalrollerPreviewImageFor(
  dieId: DieId | null,
  outcome: Outcome | null,
): { dieId: DieId; outcome: Outcome } | null {
  return dieId ? { dieId, outcome: outcome ?? "1" } : null;
}

export const GOALROLLER_ROLL_IMAGE_ASSETS = [
  {
    dieId: "yellow",
    outcome: "1",
    path: "goalroller/goalroller-gelb-1.png",
    width: 338,
    height: 404,
  },
  {
    dieId: "yellow",
    outcome: "X",
    path: "goalroller/goalroller-gelb-x.png",
    width: 339,
    height: 386,
  },
  {
    dieId: "yellow",
    outcome: "2",
    path: "goalroller/goalroller-gelb-2.png",
    width: 338,
    height: 375,
  },
  {
    dieId: "green",
    outcome: "1",
    path: "goalroller/goalroller-gruen-1.png",
    width: 596,
    height: 586,
  },
  {
    dieId: "green",
    outcome: "X",
    path: "goalroller/goalroller-gruen-x.png",
    width: 494,
    height: 512,
  },
  {
    dieId: "green",
    outcome: "2",
    path: "goalroller/goalroller-gruen-2.png",
    width: 630,
    height: 648,
  },
  {
    dieId: "red",
    outcome: "1",
    path: "goalroller/goalroller-rot-1.png",
    width: 511,
    height: 522,
  },
  {
    dieId: "red",
    outcome: "X",
    path: "goalroller/goalroller-rot-x.png",
    width: 547,
    height: 578,
  },
  {
    dieId: "red",
    outcome: "2",
    path: "goalroller/goalroller-rot-2.png",
    width: 880,
    height: 861,
  },
  {
    dieId: "blue",
    outcome: "1",
    path: "goalroller/goalroller-blau-1.png",
    width: 604,
    height: 623,
  },
  {
    dieId: "blue",
    outcome: "X",
    path: "goalroller/goalroller-blau-x.png",
    width: 528,
    height: 555,
  },
  {
    dieId: "blue",
    outcome: "2",
    path: "goalroller/goalroller-blau-2.png",
    width: 571,
    height: 630,
  },
  {
    dieId: "black",
    outcome: "1",
    path: "goalroller/goalroller-schwarz-1.png",
    width: 930,
    height: 930,
  },
  {
    dieId: "black",
    outcome: "X",
    path: "goalroller/goalroller-schwarz-x.png",
    width: 501,
    height: 508,
  },
  {
    dieId: "black",
    outcome: "2",
    path: "goalroller/goalroller-schwarz-2.png",
    width: 993,
    height: 1004,
  },
] as const satisfies readonly RollImageAsset[];

export function goalrollerRollImageAssetFor(
  dieId: DieId,
  outcome: Outcome,
): (typeof GOALROLLER_ROLL_IMAGE_ASSETS)[number] | null {
  return (
    GOALROLLER_ROLL_IMAGE_ASSETS.find(
      (asset) => asset.dieId === dieId && asset.outcome === outcome,
    ) ?? null
  );
}

export function goalrollerRollImagePath(
  dieId: DieId,
  outcome: Outcome,
): string | null {
  return goalrollerRollImageAssetFor(dieId, outcome)?.path ?? null;
}
