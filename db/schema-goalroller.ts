// Copyright (c) 2026 Digistore24 Inc, St. Petersburg, USA
// SPDX-License-Identifier: MIT

import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "./schema-core";

export const goalrollerActivations = pgTable("goalroller_activations", {
  memberId: text("member_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  firstRolledAt: timestamp("first_rolled_at", {
    mode: "date",
    withTimezone: false,
  })
    .notNull()
    .defaultNow(),
});
