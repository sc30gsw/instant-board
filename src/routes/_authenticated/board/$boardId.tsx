import { Icon } from "@iconify/react";
import { createFileRoute } from "@tanstack/react-router";

import { useCurrentUserProfile } from "~/features/auth/hooks/use-current-user-profile";
import { BoardHeader } from "~/features/board/components/board-header";
import { NoteCard } from "~/features/board/components/note-card";
import { NoteCreator } from "~/features/board/components/note-creator";
import { useBoard } from "~/features/board/hooks/use-board";

export const Route = createFileRoute("/_authenticated/board/$boardId")({
  component: BoardPage,
});

function BoardPage() {
  const { boardId } = Route.useParams();
  const { profile, user } = useCurrentUserProfile();
  const { data, isLoading, error } = useBoard(boardId);

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

  const board = data?.boards?.[0];

  if (!board) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-danger">ボードが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <BoardHeader board={board} currentUsername={profile?.username} user={user ?? null} />

      <div className="relative flex-1 overflow-hidden">
        {board.notes?.map((note) => (
          <NoteCard key={note.id} currentUserId={user?.id} note={note} />
        ))}

        {user && <NoteCreator boardId={boardId} userId={user.id} />}
      </div>
    </div>
  );
}
