import { db } from "~/db/instant";
import { boardTitleFormSchema } from "~/features/board/schemas/board-schema";
import type { BoardWithNotes } from "~/features/board/types/board";
import { useAppForm } from "~/lib/forms/create-app-form";

type UseBoardTitleFormOptions = {
  board: Pick<BoardWithNotes, "id" | "title">;
  onDone: () => void;
};

export function useBoardTitleForm({ board, onDone }: UseBoardTitleFormOptions) {
  const form = useAppForm({
    defaultValues: { title: board.title },
    validators: {
      onChange: boardTitleFormSchema,
      onSubmit: boardTitleFormSchema,
    },
    onSubmit: async ({ value }) => {
      const trimmed = value.title.trim();
      if (trimmed && trimmed !== board.title) {
        await db.transact(db.tx.boards[board.id]!.update({ title: trimmed }));
      }
      onDone();
    },
  });

  return { form } as const;
}
