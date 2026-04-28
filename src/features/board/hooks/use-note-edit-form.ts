import * as v from "valibot";

import { db } from "~/db/instant";
import { noteColorSchema, noteEditFormSchema } from "~/features/board/schemas/note-schema";
import { NOTE_COLORS } from "~/features/board/types/board";
import type { NoteWithAuthor } from "~/features/board/types/board";
import { useAppForm } from "~/lib/forms/create-app-form";

type UseNoteEditFormOptions = {
  note: Pick<NoteWithAuthor, "color" | "content" | "id">;
  onDone: () => void;
};

export function useNoteEditForm({ note, onDone }: UseNoteEditFormOptions) {
  const safeColor = v.is(noteColorSchema, note.color) ? note.color : NOTE_COLORS[0];

  const form = useAppForm({
    defaultValues: {
      color: safeColor,
      content: note.content,
    },
    validators: {
      onChange: noteEditFormSchema,
      onSubmit: noteEditFormSchema,
    },
    onSubmit: async ({ value }) => {
      await db.transact(
        db.tx.notes[note.id]!.update({
          color: value.color,
          content: value.content.trim(),
        }),
      );
      onDone();
    },
  });

  return { form } as const;
}
