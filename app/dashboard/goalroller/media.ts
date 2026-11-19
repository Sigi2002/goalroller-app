import { inArray } from "drizzle-orm";

import { db } from "@/db";
import { media } from "@/db/schema";
import { mayAccess, type Viewer } from "@/lib/media/manage";
import { mediaUrlFor } from "@/lib/media/url";

import {
  GOALROLLER_ROLL_IMAGE_ASSETS,
  type GoalrollerRollImageUrls,
} from "./roll-images";

export async function goalrollerRollImageUrlsFor(
  viewer: Viewer,
): Promise<GoalrollerRollImageUrls> {
  const storageKeys = GOALROLLER_ROLL_IMAGE_ASSETS.map(
    (asset) => `content/${asset.path}`,
  );
  const rows = await db
    .select()
    .from(media)
    .where(inArray(media.storageKey, storageKeys));
  const rowsByKey = new Map(rows.map((row) => [row.storageKey, row]));
  const imageUrls: GoalrollerRollImageUrls = {};

  for (const asset of GOALROLLER_ROLL_IMAGE_ASSETS) {
    const row = rowsByKey.get(`content/${asset.path}`);
    if (!row || !(await mayAccess(row, viewer))) continue;

    const dieUrls = imageUrls[asset.dieId] ?? {};
    dieUrls[asset.outcome] = mediaUrlFor(row);
    imageUrls[asset.dieId] = dieUrls;
  }

  return imageUrls;
}
