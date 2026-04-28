import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { id } from "@instantdb/react";
import { useState } from "react";

import { db } from "~/db/instant";
import { NOTE_COLORS } from "~/features/board/constants/board";

type Props = {
  boardId: string;
  userId: string;
};

export function NoteCreator({ boardId, userId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [color, setColor] = useState<string>(NOTE_COLORS[0]);

  function handleCreate() {
    if (!content.trim()) return;
    const noteId = id();
    db.transact(
      db.tx.notes[noteId]!.update({
        color,
        content: content.trim(),
        createdAt: Date.now(),
        x: 80 + Math.random() * 200,
        y: 80 + Math.random() * 200,
      }).link({ author: userId, board: boardId }),
    );
    setContent("");
    setIsOpen(false);
  }

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

  return (
    <div className="bg-background fixed right-6 bottom-6 flex w-72 flex-col gap-3 rounded-xl p-4 shadow-xl">
      <textarea
        className="h-32 w-full resize-none rounded-lg p-2 text-sm outline-none"
        placeholder="アイデアを入力..."
        style={{ backgroundColor: color }}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex gap-2">
        {NOTE_COLORS.map((c) => (
          <button
            key={c}
            className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              backgroundColor: c,
              borderColor: c === color ? "#374151" : "transparent",
            }}
            type="button"
            onClick={() => setColor(c)}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <Button className="flex-1" variant="ghost" onPress={() => setIsOpen(false)}>
          キャンセル
        </Button>
        <Button className="flex-1" variant="primary" onPress={handleCreate}>
          追加
        </Button>
      </div>
    </div>
  );
}
