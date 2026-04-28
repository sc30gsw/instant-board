import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { id } from "@instantdb/react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { db } from "~/db/instant";
import { CurrentUserMenu } from "~/features/auth/components/current-user-chip";
import { useCurrentUserProfile } from "~/features/auth/hooks/use-current-user-profile";
import { useBoards } from "~/features/board/hooks/use-board";

export const Route = createFileRoute("/_authenticated/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { profile, user } = useCurrentUserProfile();
  const { data } = useBoards();

  const boards = data?.boards ?? [];

  async function handleCreateBoard() {
    if (!user?.id) return;

    const boardId = id();
    await db.transact(
      db.tx.boards[boardId]!.update({
        createdAt: Date.now(),
        isPublic: true,
        title: "新しいボード",
      }).link({ owner: user.id }),
    );
    void navigate({ to: "/board/$boardId", params: { boardId } });
  }

  async function handleDeleteBoard(boardId: string) {
    const confirmed = window.confirm("このボードを削除しますか？");
    if (!confirmed) return;

    await db.transact(db.tx.boards[boardId]!.delete());
  }

  return (
    <div className="bg-background min-h-screen">
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-xl font-bold">アイデアボード</h1>
          <div className="flex items-center gap-2">
            {user ? (
              <CurrentUserMenu
                email={user.email}
                imageUrl={user.imageURL}
                username={profile?.username}
              />
            ) : null}
            <Button
              className="h-10 px-4"
              size="sm"
              variant="primary"
              onPress={() => void handleCreateBoard()}
            >
              + 新しいボード
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {boards.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <Icon
              className="text-foreground-300"
              height={64}
              icon="mdi:bulletin-board"
              width={64}
            />
            <p className="text-foreground-500">まだ公開ボードがありません</p>
            <Button variant="primary" onPress={() => void handleCreateBoard()}>
              最初のボードを作成する
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <div
                key={board.id}
                className="rounded-xl border p-4 transition-shadow hover:shadow-md"
              >
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
                  {user?.id === board.owner?.id ? (
                    <Button
                      className="text-danger hover:bg-danger/10"
                      isIconOnly
                      aria-label="ボードを削除"
                      size="sm"
                      variant="ghost"
                      onPress={() => void handleDeleteBoard(board.id)}
                    >
                      <Icon height={18} icon="mdi:trash-can-outline" width={18} />
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
