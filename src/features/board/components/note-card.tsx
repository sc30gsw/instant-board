import { useEffect, useRef, useState } from "react";

import { db } from "~/db/instant";
import { NOTE_COLORS } from "~/features/board/constants/board";
import type { NoteWithAuthor } from "~/features/board/types/board";

type Props = {
  currentUserId?: string;
  note: NoteWithAuthor;
};

export function NoteCard({ note, currentUserId }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [editColor, setEditColor] = useState(note.color);
  const dragOffset = useRef({ x: 0, y: 0 });
  const editRef = useRef<HTMLTextAreaElement>(null);

  const canEdit = currentUserId != null && note.author?.id === currentUserId;

  useEffect(() => {
    if (isEditing) editRef.current?.focus();
  }, [isEditing]);

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
    setEditContent(note.content);
    setEditColor(note.color);
    setIsEditing(true);
  }

  function handleSave() {
    if (!editContent.trim()) return;
    db.transact(db.tx.notes[note.id]!.update({ color: editColor, content: editContent.trim() }));
    setIsEditing(false);
  }

  function handleDelete() {
    db.transact(db.tx.notes[note.id]!.delete());
  }

  return (
    <div
      className="absolute rounded-lg shadow-md select-none"
      style={{
        backgroundColor: isEditing ? editColor : note.color,
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
        <div className="flex flex-col gap-2 p-3">
          <textarea
            ref={editRef}
            className="h-28 w-full resize-none rounded bg-white/40 p-1.5 text-sm text-gray-800 outline-none"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsEditing(false);
            }}
            onPointerDown={(e) => e.stopPropagation()}
          />
          <div className="flex gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
            {NOTE_COLORS.map((c) => (
              <button
                key={c}
                className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: c === editColor ? "#374151" : "transparent",
                }}
                type="button"
                onClick={() => setEditColor(c)}
              />
            ))}
          </div>
          <div className="flex gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
            <button
              className="flex-1 rounded py-1 text-xs text-gray-600 hover:bg-black/10"
              type="button"
              onClick={() => setIsEditing(false)}
            >
              キャンセル
            </button>
            <button
              className="flex-1 rounded bg-gray-800/20 py-1 text-xs font-medium text-gray-800 hover:bg-gray-800/30"
              type="button"
              onClick={handleSave}
            >
              保存
            </button>
          </div>
        </div>
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
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>
              <button
                className="rounded p-0.5 text-gray-500 hover:bg-black/10 hover:text-red-600"
                title="削除"
                type="button"
                onClick={handleDelete}
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
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
