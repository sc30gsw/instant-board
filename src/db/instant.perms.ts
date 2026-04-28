import type { InstantRules } from "@instantdb/react";

const rules = {
  $users: {
    allow: {
      create: "true",
      delete: "false",
      update: "false",
      view: "auth.id == data.id",
    },
  },
  //! クライアントから userCredentials には一切アクセスさせない。
  //! 全操作は Admin SDK (Server Function) 経由のみ。
  userCredentials: {
    allow: {
      create: "false",
      delete: "false",
      update: "false",
      view: "false",
    },
  },
  attrs: {
    allow: {
      create: "false",
    },
  },
  boards: {
    allow: {
      create: "auth.id != null",
      delete: "auth.id != null && auth.id in data.ref('owner.id')",
      update: "auth.id != null && auth.id in data.ref('owner.id')",
      view: "data.isPublic == true || (auth.id != null && auth.id in data.ref('owner.id'))",
    },
  },
  notes: {
    allow: {
      create: "auth.id != null",
      delete: "auth.id != null && auth.id in data.ref('author.id')",
      update: "auth.id != null && auth.id in data.ref('author.id')",
      //? board.isPublic はリストを返すので [0] で取り出す
      view: "data.ref('board.isPublic')[0] == true || (auth.id != null && auth.id in data.ref('board.owner.id'))",
    },
  },
} satisfies InstantRules;

export default rules;
