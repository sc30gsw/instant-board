import { id } from "@instantdb/react";

import { db } from "~/db/instant";
import {
  noteCreateFormEmptyValues,
  noteCreateFormSchema,
} from "~/features/board/schemas/note-schema";
import { useAppForm } from "~/lib/forms/create-app-form";

type UseNoteCreateFormOptions = {
  boardId: string;
  onSuccess: () => void;
  userId: string;
};

export function useNoteCreateForm({ boardId, userId, onSuccess }: UseNoteCreateFormOptions) {
  const form = useAppForm({
    defaultValues: noteCreateFormEmptyValues,
    validators: {
      onChange: noteCreateFormSchema,
      onSubmit: noteCreateFormSchema,
    },
    onSubmit: async ({ value }) => {
      const noteId = id();
      await db.transact(
        db.tx.notes[noteId]!
          .update({
            color: value.color,
            content: value.content.trim(),
            createdAt: Date.now(),
            x: 80 + Math.random() * 200,
            y: 80 + Math.random() * 200,
          })
          .link({ author: userId, board: boardId }),
      );
      onSuccess();
    },
  });

  return { form } as const;
}
