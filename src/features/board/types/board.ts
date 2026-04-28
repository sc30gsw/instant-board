import type { InstaQLEntity } from "@instantdb/react";

import type { AppSchema } from "~/db/instant-schema";

export type Board = InstaQLEntity<AppSchema, "boards">;
export type Note = InstaQLEntity<AppSchema, "notes">;
export type NoteWithAuthor = InstaQLEntity<AppSchema, "notes", { author: {} }>;
export type BoardWithNotes = InstaQLEntity<
  AppSchema,
  "boards",
  { owner: {}; notes: { author: {} } }
>;

export const NOTE_COLORS = [
  "#fef08a",
  "#bbf7d0",
  "#bfdbfe",
  "#fecaca",
  "#e9d5ff",
  "#fed7aa",
] as const;

export type NoteColor = (typeof NOTE_COLORS)[number];
