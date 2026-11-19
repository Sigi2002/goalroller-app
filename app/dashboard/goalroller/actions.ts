"use server";

import { db } from "@/db";
import { goalrollerActivations } from "@/db/schema";
import { requireActiveUser } from "@/lib/authz";
import { hasPlan } from "@/lib/entitlements/manage";
import { GOALROLLER_PRODUCT_KEY } from "@/lib/goalroller/config";

export async function recordFirstSuccessfulRoll(): Promise<
  { ok: true } | { ok: false; reason: "notEntitled" }
> {
  const session = await requireActiveUser();
  if (!(await hasPlan(session.user.id, GOALROLLER_PRODUCT_KEY))) {
    return { ok: false, reason: "notEntitled" };
  }

  await db
    .insert(goalrollerActivations)
    .values({ memberId: session.user.id })
    .onConflictDoNothing({ target: goalrollerActivations.memberId });

  return { ok: true };
}
