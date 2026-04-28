import { Icon } from "@iconify/react";
import type { User } from "@instantdb/react";
import { cn } from "@lightsound/cn/tw-merge";
import { useRef, useState, type ComponentProps } from "react";
import { useToggle } from "react-use";

import { db } from "~/db/instant";
import { NoteEditor } from "~/features/board/components/note-editor";
import type { NOTE_COLORS } from "~/features/board/constants/board";
import type { NoteWithAuthor } from "~/features/board/types/board";

type NoteCardProps = {
  currentUserId?: User["id"];
  note: NoteWithAuthor;
};

export function NoteCard({ note, currentUserId }: NoteCardProps) {
  const [isDragging, toggleIsDragging] = useToggle(false);
  const [isEditing, toggleIsEditing] = useToggle(false);
  const [editingColor, setEditingColor] = useState<(typeof NOTE_COLORS)[number]>(
    note.color as (typeof NOTE_COLORS)[number],
  );

  const dragOffset = useRef({ x: 0, y: 0 });

  const handlePointerDown: ComponentProps<"div">["onPointerDown"] = (e) => {
    if (isEditing) {
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    toggleIsDragging(true);
    dragOffset.current = { x: e.clientX - note.x, y: e.clientY - note.y };
  };

  const handlePointerMove: ComponentProps<"div">["onPointerMove"] = (e) => {
    if (!isDragging) {
      return;
    }

    db.transact(
      db.tx.notes[note.id]!.update({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      }),
    );
  };

  const canEdit = currentUserId && note.author?.id === currentUserId;

  return (
    <div
      className={cn(
        "absolute rounded-lg shadow-md select-none",
        isEditing
          ? `z-40 w-56 cursor-default bg-${editingColor}`
          : `w-48 cursor-grab bg-${note.color}`,
        isDragging ? "z-50 cursor-grabbing" : !isEditing ? "z-1 cursor-grab" : null,
      )}
      //? left/top は実値(px)なので className だけでは表現できない
      style={{
        left: note.x,
        top: note.y,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={() => toggleIsDragging(false)}
    >
      {isEditing ? (
        <NoteEditor
          note={note}
          onColorChange={(color) => setEditingColor(color)}
          onDone={() => toggleIsEditing(false)}
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
                onClick={() => {
                  setEditingColor(note.color as (typeof NOTE_COLORS)[number]);
                  toggleIsEditing(true);
                }}
              >
                <Icon className="h-3.5 w-3.5" icon="mdi:pencil-outline" />
              </button>
              <button
                className="rounded p-0.5 text-gray-500 hover:bg-black/10 hover:text-red-600"
                title="削除"
                type="button"
                onClick={() => db.transact(db.tx.notes[note.id]!.delete())}
              >
                <Icon className="h-3.5 w-3.5" icon="mdi:trash-can-outline" />
              </button>
            </div>
          )}
          <p className="min-h-16 text-sm wrap-break-word whitespace-pre-wrap text-gray-800">
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
