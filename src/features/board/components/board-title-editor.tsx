import { Button, FieldError, Input, Label, TextField } from "@heroui/react";
import type { AnyFormState } from "@tanstack/react-form";
import { useEffect } from "react";

import { useBoardTitleForm } from "~/features/board/hooks/use-board-title-form";
import type { BoardWithNotes } from "~/features/board/types/board";

type BoardTitleEditorProps = {
  board: Pick<BoardWithNotes, "id" | "title">;
  onDone: () => void;
};

export function BoardTitleEditor({ board, onDone }: BoardTitleEditorProps) {
  const { form } = useBoardTitleForm({ board, onDone });
  const inputId = `board-title-${board.id}`;

  useEffect(() => {
    const el = document.getElementById(inputId);

    if (el instanceof HTMLInputElement) {
      el.focus();
    }
  }, [inputId]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="flex items-center gap-2">
        <form.Field name="title">
          {(field) => (
            <div className="flex flex-col">
              <TextField
                isInvalid={field.state.meta.errors.length > 0}
                name={field.name}
                value={field.state.value}
                onChange={field.handleChange}
              >
                <Label className="sr-only">ボード名</Label>
                <Input
                  id={inputId}
                  className="border-foreground-400 rounded border bg-transparent px-2 py-1 text-lg font-semibold outline-none"
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Escape") onDone();
                  }}
                />
                {field.state.meta.errors.length > 0 ? (
                  <FieldError className="text-xs">
                    {field.state.meta.errors[0]?.toString()}
                  </FieldError>
                ) : null}
              </TextField>
            </div>
          )}
        </form.Field>
        <form.Subscribe>
          {(state: AnyFormState) => (
            <Button isDisabled={state.isSubmitting} size="sm" type="submit" variant="secondary">
              保存
            </Button>
          )}
        </form.Subscribe>
        <Button size="sm" type="button" variant="ghost" onPress={onDone}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
