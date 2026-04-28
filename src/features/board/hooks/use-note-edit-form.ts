import { db } from "~/db/instant";
import { NOTE_COLORS } from "~/features/board/constants/board";
import { noteFormSchema } from "~/features/board/schemas/note-schema";
import type { NoteWithAuthor } from "~/features/board/types/board";
import { useAppForm } from "~/lib/forms/create-app-form";

type NoteColor = (typeof NOTE_COLORS)[number];

type UseNoteEditFormOptions = {
  note: Pick<NoteWithAuthor, "color" | "content" | "id">;
  onDone: () => void;
};

export function useNoteEditForm({ note, onDone }: UseNoteEditFormOptions) {
  const safeColor = (NOTE_COLORS.find((c) => c === note.color) ?? NOTE_COLORS[0]) as NoteColor;

  const form = useAppForm({
    defaultValues: {
      color: safeColor as string,
      content: note.content as string,
    },
    validators: {
      onChange: noteFormSchema,
      onSubmit: noteFormSchema,
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
