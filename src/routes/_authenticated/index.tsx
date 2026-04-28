import { createFileRoute } from "@tanstack/react-router";

import { UserMenu } from "~/features/auth/components/user-menu";
import { useCurrentUserProfile } from "~/features/auth/hooks/use-current-user-profile";
import { BoardListMainContainer } from "~/features/board/components/board-list-main-container";
import { CreateBoardButton } from "~/features/board/components/create-board-button";

export const Route = createFileRoute("/_authenticated/")({
  component: Home,
});

function Home() {
  const { profile, user } = useCurrentUserProfile();

  return (
    <div className="bg-background min-h-screen">
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-xl font-bold">アイデアボード</h1>
          <div className="flex items-center gap-2">
            {user ? (
              <UserMenu email={user.email} imageURL={user.imageURL} username={profile?.username} />
            ) : null}
            <CreateBoardButton
              userId={user?.id ?? ""}
              label="+ 新しいボード"
              className="h-10 px-4"
              size="sm"
            />
          </div>
        </div>
      </header>

      <BoardListMainContainer userId={user?.id ?? ""} />
    </div>
  );
}
