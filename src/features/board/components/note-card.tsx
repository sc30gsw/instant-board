import { Button, FieldError, Label, TextField, Textarea } from "@heroui/react";
import { Icon } from "@iconify/react";
import type { AnyFormState } from "@tanstack/react-form";
import { useEffect, useRef, useState } from "react";

import { db } from "~/db/instant";
import { NOTE_COLORS } from "~/features/board/constants/board";
import { useNoteEditForm } from "~/features/board/hooks/use-note-edit-form";
import type { NoteWithAuthor } from "~/features/board/types/board";

type Props = {
  currentUserId?: string;
  note: NoteWithAuthor;
};

type NoteEditorProps = {
  note: Pick<NoteWithAuthor, "color" | "content" | "id">;
  onColorChange: (color: string) => void;
  onDone: () => void;
};

function NoteEditor({ note, onDone, onColorChange }: NoteEditorProps) {
  const { form } = useNoteEditForm({ note, onDone });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

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
              onPointerDown={(e) => e.stopPropagation()}
              onChange={(e) => field.handleChange(e.target.value)}
            >
              <Label className="sr-only">内容</Label>
              <Textarea
                ref={textareaRef}
                className="h-28"
                classNames={{
                  input:
                    "text-sm text-gray-800 !bg-white/40 data-[hovered=true]:!bg-white/50 data-[focus=true]:!bg-white/55",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") onDone();
                }}
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
              onPress={() => void form.handleSubmit()}
            >
              保存
            </Button>
          )}
        </form.Subscribe>
      </div>
    </div>
  );
}

export function NoteCard({ note, currentUserId }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingColor, setEditingColor] = useState(note.color);
  const dragOffset = useRef({ x: 0, y: 0 });

  const canEdit = currentUserId != null && note.author?.id === currentUserId;

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (isEditing) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - note.x, y: e.clientY - note.y };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    db.transact(
      db.tx.notes[note.id]!.update({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      }),
    );
  }

  function handlePointerUp() {
    setIsDragging(false);
  }

  function handleStartEdit() {
    setEditingColor(note.color);
    setIsEditing(true);
  }

  function handleDelete() {
    db.transact(db.tx.notes[note.id]!.delete());
  }

  return (
    <div
      className="absolute rounded-lg shadow-md select-none"
      style={{
        backgroundColor: isEditing ? editingColor : note.color,
        cursor: isEditing ? "default" : isDragging ? "grabbing" : "grab",
        left: note.x,
        top: note.y,
        width: isEditing ? "14rem" : "12rem",
        zIndex: isEditing ? 40 : isDragging ? 50 : 1,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {isEditing ? (
        <NoteEditor
          note={note}
          onColorChange={setEditingColor}
          onDone={() => setIsEditing(false)}
        />
      ) : (
        <div className="group relative p-3">
          {canEdit && (
            <div
              className="absolute top-1.5 right-1.5 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button
                className="rounded p-0.5 text-gray-500 hover:bg-black/10 hover:text-gray-800"
                title="編集"
                type="button"
                onClick={handleStartEdit}
              >
                <Icon className="h-3.5 w-3.5" icon="mdi:pencil-outline" />
              </button>
              <button
                className="rounded p-0.5 text-gray-500 hover:bg-black/10 hover:text-red-600"
                title="削除"
                type="button"
                onClick={handleDelete}
              >
                <Icon className="h-3.5 w-3.5" icon="mdi:trash-can-outline" />
              </button>
            </div>
          )}
          <p className="min-h-[4rem] text-sm break-words whitespace-pre-wrap text-gray-800">
            {note.content}
          </p>
          {note.author?.username && (
            <p className="mt-2 text-right text-xs text-gray-500">@{note.author.username}</p>
          )}
        </div>
      )}
    </div>
  );
}
