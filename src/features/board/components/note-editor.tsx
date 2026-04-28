import { Button, FieldError, Label, TextArea, TextField } from "@heroui/react";
import type { AnyFormState } from "@tanstack/react-form";
import { useEffect } from "react";

import { NOTE_COLORS } from "~/features/board/constants/board";
import { useNoteEditForm } from "~/features/board/hooks/use-note-edit-form";
import type { NoteWithAuthor } from "~/features/board/types/board";

type NoteEditorProps = {
  note: Pick<NoteWithAuthor, "color" | "content" | "id">;
  onColorChange: (color: (typeof NOTE_COLORS)[number]) => void;
  onDone: () => void;
};

export function NoteEditor({ note, onDone, onColorChange }: NoteEditorProps) {
  const { form } = useNoteEditForm({ note, onDone });
  const textareaId = `note-editor-${note.id}`;

  useEffect(() => {
    const el = document.getElementById(textareaId);

    if (el instanceof HTMLTextAreaElement) {
      el.focus();
    }
  }, [textareaId]);

  return (
    <div className="flex flex-col gap-2 p-3">
      <form.Field name="content">
        {(field) => (
          <div className="flex flex-col gap-1">
            <TextField
              className="w-full"
              isInvalid={field.state.meta.errors.length > 0}
              name={field.name}
              value={field.state.value}
              onChange={field.handleChange}
            >
              <Label className="sr-only">内容</Label>
              <TextArea
                id={textareaId}
                className="h-28 w-full resize-none rounded bg-white/40 p-1.5 text-sm text-gray-800 outline-none data-[focus-visible=true]:bg-white/55 data-[hovered=true]:bg-white/50"
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  if (e.key === "Escape") onDone();
                }}
                onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
              />
              {field.state.meta.errors.length > 0 ? (
                <FieldError className="text-xs">{String(field.state.meta.errors[0])}</FieldError>
              ) : null}
            </TextField>
          </div>
        )}
      </form.Field>
      <form.Field name="color">
        {(field) => (
          <div className="flex gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
            {NOTE_COLORS.map((c) => (
              <button
                key={c}
                className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: c === field.state.value ? "#374151" : "transparent",
                }}
                type="button"
                onClick={() => {
                  field.handleChange(c);
                  onColorChange(c);
                }}
              />
            ))}
          </div>
        )}
      </form.Field>
      <div className="flex gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
        <Button className="flex-1" size="sm" variant="ghost" onPress={onDone}>
          キャンセル
        </Button>
        <form.Subscribe>
          {(state: AnyFormState) => (
            <Button
              className="flex-1"
              isDisabled={state.isSubmitting}
              size="sm"
              variant="ghost"
              onPress={() => form.handleSubmit()}
            >
              保存
            </Button>
          )}
        </form.Subscribe>
      </div>
    </div>
  );
}
