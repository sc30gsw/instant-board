import { db } from "~/db/instant";

export function useBoard(boardId: string) {
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
