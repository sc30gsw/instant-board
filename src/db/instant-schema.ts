import { i } from "@instantdb/react";

export const schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed(),
      username: i.string().optional().indexed(),
    }),
    // Custom Auth 用。passwordHash は Admin SDK 経由のみアクセス可。
    // perms で view/create/update/delete = "false" に設定済み。
    userCredentials: i.entity({
      createdAt: i.date().indexed(),
      passwordHash: i.string(),
    }),
    boards: i.entity({
      createdAt: i.date().indexed(),
      isPublic: i.boolean().indexed(),
      title: i.string().indexed(),
    }),
    notes: i.entity({
      color: i.string().indexed(),
      content: i.string(),
      createdAt: i.date().indexed(),
      x: i.number(),
      y: i.number(),
    }),
  },
  links: {
    boardNotes: {
      forward: { has: "one", label: "board", on: "notes" },
      reverse: { has: "many", label: "notes", on: "boards" },
    },
    boardOwner: {
      forward: { has: "one", label: "owner", on: "boards" },
      reverse: { has: "many", label: "boards", on: "$users" },
    },
    noteAuthor: {
      forward: { has: "one", label: "author", on: "notes" },
      reverse: { has: "many", label: "notes", on: "$users" },
    },
    userCredential: {
      forward: { has: "one", label: "user", on: "userCredentials" },
      reverse: { has: "one", label: "credential", on: "$users" },
    },
  },
});

export type AppSchema = typeof schema;

export default schema;
