import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import type { User } from "@instantdb/react";
import { Link } from "@tanstack/react-router";
import { useTransition } from "react";

import { db } from "~/db/instant";
import { CreateBoardButton } from "~/features/board/components/create-board-button";
import { useBoards } from "~/features/board/hooks/use-board";
import type { Board } from "~/features/board/types/board";

export function BoardListMainContainer({ userId }: Record<"userId", User["id"]>) {
  const { data, isLoading, error } = useBoards();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Icon className="animate-spin" height={32} icon="mdi:loading" width={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-danger">ボードの読み込みに失敗しました</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <Icon className="text-foreground-300" height={64} icon="mdi:bulletin-board" width={64} />
        <p className="text-foreground-500">まだ公開ボードがありません</p>
        <CreateBoardButton userId={userId} label="最初のボードを作成する" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      {data.boards.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Icon className="text-foreground-300" height={64} icon="mdi:bulletin-board" width={64} />
          <p className="text-foreground-500">まだ公開ボードがありません</p>
          <CreateBoardButton userId={userId} label="最初のボードを作成する" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.boards.map((board) => (
            <div key={board.id} className="rounded-xl border p-4 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <Link
                  className="min-w-0 flex-1"
                  params={{ boardId: board.id }}
                  to="/board/$boardId"
                >
                  <h2 className="truncate font-medium">{board.title}</h2>
                  {board.owner?.username && (
                    <p className="text-foreground-400 mt-1 text-xs">@{board.owner.username}</p>
                  )}
                </Link>
                {userId === board.owner?.id ? <BoardDeleteButton boardId={board.id} /> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function BoardDeleteButton({ boardId }: Record<"boardId", Board["id"]>) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      className="text-danger hover:bg-danger/10"
      isDisabled={isPending}
      isIconOnly
      aria-label="ボードを削除"
      size="sm"
      variant="ghost"
      onPress={() =>
        startTransition(async () => {
          const confirmed = window.confirm("このボードを削除しますか？");
          if (!confirmed) {
            return;
          }

          await db.transact(db.tx.boards[boardId]!.delete());
        })
      }
    >
      <Icon height={18} icon="mdi:trash-can-outline" width={18} />
    </Button>
  );
}
