import { id, type User } from "@instantdb/react";

import { db } from "~/db/instant";
import { noteCreateFormEmptyValues, noteFormSchema } from "~/features/board/schemas/note-schema";
import type { Board } from "~/features/board/types/board";
import { useAppForm } from "~/lib/forms/create-app-form";

type UseNoteCreateFormOptions = {
  boardId: Board["id"];
  onSuccess: () => void;
  userId: User["id"];
};

export function useNoteCreateForm({ boardId, userId, onSuccess }: UseNoteCreateFormOptions) {
  const form = useAppForm({
    defaultValues: noteCreateFormEmptyValues,
    validators: {
      onChange: noteFormSchema,
      onSubmit: noteFormSchema,
    },
    onSubmit: async ({ value }) => {
      const noteId = id();

      await db.transact(
        db.tx.notes[noteId]!.update({
          color: value.color,
          content: value.content.trim(),
          createdAt: Date.now(),
          x: 80 + Math.random() * 200,
          y: 80 + Math.random() * 200,
        }).link({ author: userId, board: boardId }),
      );
      onSuccess();
    },
  });

  return { form } as const;
}
