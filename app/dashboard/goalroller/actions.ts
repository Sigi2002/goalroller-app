"use server";

import { requireActiveUser } from "@/lib/authz";

export async function recordFirstSuccessfulRoll(): Promise<
  { ok: true } | { ok: false; reason: "notEntitled" }
> {
  // Für Freundes-Test ohne Login: Guard bleibt für Build-Check aktiv,
  // der Aufruf selbst ist in ui.tsx übersprungen.
  await requireActiveUser();
  return { ok: true };
}