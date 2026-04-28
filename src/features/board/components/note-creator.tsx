import { Button, FieldError, Label, TextField, Textarea } from "@heroui/react";
import { Icon } from "@iconify/react";
import type { AnyFormState } from "@tanstack/react-form";
import { useState } from "react";

import { NOTE_COLORS } from "~/features/board/constants/board";
import { useNoteCreateForm } from "~/features/board/hooks/use-note-create-form";

type Props = {
  boardId: string;
  userId: string;
};

type NoteCreatorPanelProps = {
  boardId: string;
  onClose: () => void;
  userId: string;
};

function NoteCreatorPanel({ boardId, userId, onClose }: NoteCreatorPanelProps) {
  const { form } = useNoteCreateForm({ boardId, userId, onSuccess: onClose });
  const [liveColor, setLiveColor] = useState<string>(NOTE_COLORS[0]);

  return (
    <form
      className="bg-background fixed right-6 bottom-6 flex w-72 flex-col gap-3 rounded-xl p-4 shadow-xl"
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field name="content">
        {(field) => (
          <div className="flex flex-col gap-1">
            <TextField
              className="w-full"
              isInvalid={field.state.meta.errors.length > 0}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            >
              <Label className="sr-only">内容</Label>
              <Textarea
                className="h-32"
                placeholder="アイデアを入力..."
                style={{ backgroundColor: liveColor }}
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
          <div className="flex gap-2">
            {NOTE_COLORS.map((c) => (
              <button
                key={c}
                className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: c === field.state.value ? "#374151" : "transparent",
                }}
                type="button"
                onClick={() => {
                  field.handleChange(c);
                  setLiveColor(c);
                }}
              />
            ))}
          </div>
        )}
      </form.Field>
      <div className="flex gap-2">
        <Button className="flex-1" type="button" variant="ghost" onPress={onClose}>
          キャンセル
        </Button>
        <form.Subscribe>
          {(state: AnyFormState) => (
            <Button
              className="flex-1"
              isDisabled={state.isSubmitting}
              type="submit"
              variant="primary"
            >
              追加
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

export function NoteCreator({ boardId, userId }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <Button
        className="fixed right-6 bottom-6 h-14 rounded-full px-5 text-sm font-medium shadow-lg"
        variant="primary"
        onPress={() => setIsOpen(true)}
      >
        <Icon height={20} icon="mdi:note-plus-outline" width={20} />
        付箋を追加
      </Button>
    );
  }

  return <NoteCreatorPanel boardId={boardId} userId={userId} onClose={() => setIsOpen(false)} />;
}
