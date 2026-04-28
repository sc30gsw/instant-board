import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import type { User } from "@instantdb/react";
import type { AnyFormState } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { UserMenu } from "~/features/auth/components/user-menu";
import { useBoardTitleForm } from "~/features/board/hooks/use-board-title-form";
import type { BoardWithNotes } from "~/features/board/types/board";

type Props = {
  board: BoardWithNotes;
  currentUsername?: null | string;
  onDeleteBoard: () => void;
  user: User | null;
};

type BoardTitleEditorProps = {
  board: Pick<BoardWithNotes, "id" | "title">;
  onDone: () => void;
};

function BoardTitleEditor({ board, onDone }: BoardTitleEditorProps) {
  const { form } = useBoardTitleForm({ board, onDone });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <div className="flex items-center gap-2">
        <form.Field name="title">
          {(field) => (
            <div className="flex flex-col">
              <input
                ref={inputRef}
                className="border-foreground-400 rounded border bg-transparent px-2 py-1 text-lg font-semibold outline-none"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") onDone();
                }}
              />
              {field.state.meta.errors.length > 0 && (
                <span className="text-danger text-xs">
                  {field.state.meta.errors[0]?.toString()}
                </span>
              )}
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

export function BoardHeader({ board, currentUsername, onDeleteBoard, user }: Props) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const canEdit = user != null && board.owner?.id === user.id;

  function handleStartEditTitle() {
    if (!canEdit) return;
    setIsEditingTitle(true);
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
          <BoardTitleEditor board={board} onDone={() => setIsEditingTitle(false)} />
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
            isGuest={user.isGuest}
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
