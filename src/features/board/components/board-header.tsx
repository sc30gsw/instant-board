import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import type { User } from "@instantdb/react";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { db } from "~/db/instant";
import { UserMenu } from "~/features/auth/components/user-menu";
import type { BoardWithNotes } from "~/features/board/types/board";

type Props = {
  board: BoardWithNotes;
  currentUsername?: null | string;
  onDeleteBoard: () => void;
  user: User | null;
};

export function BoardHeader({ board, currentUsername, onDeleteBoard, user }: Props) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(board.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const canEdit = user != null && board.owner?.id === user.id;

  useEffect(() => {
    if (isEditingTitle) titleInputRef.current?.focus();
  }, [isEditingTitle]);

  useEffect(() => {
    setTitleInput(board.title);
  }, [board.title]);

  function handleStartEditTitle() {
    if (!canEdit) return;
    setTitleInput(board.title);
    setIsEditingTitle(true);
  }

  async function handleTitleSave() {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== board.title) {
      await db.transact(db.tx.boards[board.id]!.update({ title: trimmed }));
    }
    if (!trimmed) {
      setTitleInput(board.title);
    }
    setIsEditingTitle(false);
  }

  function handleTitleCancel() {
    setTitleInput(board.title);
    setIsEditingTitle(false);
  }

  function handleCopyLink() {
    void navigator.clipboard.writeText(window.location.href);
  }

  return (
    <header className="bg-background/80 sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <Link className="text-foreground-500 text-sm hover:underline" to="/">
          ← ホーム
        </Link>

        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <input
              ref={titleInputRef}
              className="border-foreground-400 rounded border bg-transparent px-2 py-1 text-lg font-semibold outline-none"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleTitleSave();
                if (e.key === "Escape") handleTitleCancel();
              }}
            />
            <Button size="sm" variant="secondary" onPress={() => void handleTitleSave()}>
              保存
            </Button>
            <Button size="sm" variant="ghost" onPress={handleTitleCancel}>
              キャンセル
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">{board.title}</h1>
            {canEdit ? (
              <Button
                isIconOnly
                aria-label="ボード名を編集"
                size="sm"
                variant="ghost"
                onPress={handleStartEditTitle}
              >
                <Icon height={18} icon="mdi:pencil-outline" width={18} />
              </Button>
            ) : null}
          </div>
        )}

        {board.isPublic && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">公開</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {user ? (
          <UserMenu
            email={user.email}
            imageURL={user.imageURL}
            username={currentUsername ?? undefined}
          />
        ) : null}

        <Button className="h-10 px-4" size="sm" variant="outline" onPress={handleCopyLink}>
          リンクをコピー
        </Button>

        {canEdit ? (
          <Button
            className="text-danger h-10 px-4 hover:bg-red-50"
            size="sm"
            variant="outline"
            onPress={onDeleteBoard}
          >
            ボードを削除
          </Button>
        ) : null}

        {user ? null : (
          <Link to="/auth/login">
            <Button className="h-10 px-4" size="sm" variant="primary">
              登録 / ログイン
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
