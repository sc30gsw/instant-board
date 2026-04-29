import { db } from "~/db/instant";
import type { Board } from "~/features/board/types/board";

export function useBoard(boardId: Board["id"]) {
  return db.useQuery({
    boards: {
      $: { where: { id: boardId } },
      notes: { author: {} },
      owner: {},
    },
  });
}

export function useBoards() {
  return db.useQuery({
    boards: {
      $: { where: { isPublic: true }, order: { createdAt: "desc" } },
      owner: {},
    },
  });
}
