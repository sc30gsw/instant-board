import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import type { InstaQLEntity, User } from "@instantdb/react";
import { Link } from "@tanstack/react-router";
import { useToggle } from "react-use";

import type { AppSchema } from "~/db/instant-schema";
import { UserMenu } from "~/features/auth/components/user-menu";
import { BoardTitleEditor } from "~/features/board/components/board-title-editor";
import { DeleteBoardButton } from "~/features/board/components/delete-board-button";
import type { BoardWithNotes } from "~/features/board/types/board";

function BoardTitleEditorWrapper({
  board,
  canEdit,
}: Pick<BoardHeaderProps, "board"> & Record<"canEdit", boolean | null>) {
  const [isEditingTitle, toggle] = useToggle(false);

  return isEditingTitle ? (
    <BoardTitleEditor board={board} onDone={() => toggle(false)} />
  ) : (
    <div className="flex items-center gap-2">
      <h1 className="text-lg font-semibold">{board.title}</h1>
      {canEdit ? (
        <Button
          isIconOnly
          aria-label="ボード名を編集"
          size="sm"
          variant="ghost"
          onPress={() => toggle(true)}
        >
          <Icon height={18} icon="mdi:pencil-outline" width={18} />
        </Button>
      ) : null}
    </div>
  );
}

type BoardHeaderProps = {
  board: BoardWithNotes;
  currentUsername?: InstaQLEntity<AppSchema, "$users">["username"];
  user: User | null;
};

export function BoardHeader({ board, currentUsername, user }: BoardHeaderProps) {
  const canEdit = user && board.owner?.id === user.id;

  return (
    <header className="bg-background/80 sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <Link className="text-foreground-500 text-sm hover:underline" to="/">
          ← ホーム
        </Link>

        <BoardTitleEditorWrapper board={board} canEdit={canEdit} />

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

        <Button
          className="h-10 px-4"
          size="sm"
          variant="outline"
          onPress={() => navigator.clipboard.writeText(window.location.href)}
        >
          リンクをコピー
        </Button>

        {canEdit ? <DeleteBoardButton boardId={board.id} /> : null}

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
