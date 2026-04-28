import { Button } from "@heroui/react";
import { useNavigate } from "@tanstack/react-router";
import { useTransition } from "react";

import { db } from "~/db/instant";
import type { Board } from "~/features/board/types/board";

export function DeleteBoardButton({ boardId }: Record<"boardId", Board["id"]>) {
  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();

  return (
    <Button
      className="text-danger h-10 px-4 hover:bg-red-50"
      isDisabled={isPending}
      size="sm"
      variant="outline"
      onPress={() => {
        const confirmed = window.confirm("このボードを削除しますか？");

        if (!confirmed) {
          return;
        }

        startTransition(async () => {
          await db.transact(db.tx.boards[boardId]!.delete());
          navigate({ to: "/" });
        });
      }}
    >
      ボードを削除
    </Button>
  );
}
