import type { InstaQLEntity } from "@instantdb/react";

import type { AppSchema } from "~/db/instant-schema";

export type Board = InstaQLEntity<AppSchema, "boards">;
export type NoteWithAuthor = InstaQLEntity<AppSchema, "notes", { author: {} }>;
export type BoardWithNotes = InstaQLEntity<
  AppSchema,
  "boards",
  { owner: {}; notes: { author: {} } }
>;



