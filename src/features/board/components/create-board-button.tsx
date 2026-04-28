import { Button, type ButtonProps } from "@heroui/react";
import { id, type User } from "@instantdb/react";
import { useNavigate } from "@tanstack/react-router";
import { useTransition } from "react";

import { db } from "~/db/instant";

type CreateBoardButtonProps = {
  userId: User["id"];
  label: string;
  className?: string;
} & ButtonProps;

export function CreateBoardButton({ userId, label, className, ...props }: CreateBoardButtonProps) {
  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();

  return (
    <Button
      className={className}
      isDisabled={isPending}
      size={props.size}
      variant="primary"
      onPress={() =>
        startTransition(async () => {
          const boardId = id();

          await db.transact(
            db.tx.boards[boardId]!.update({
              createdAt: Date.now(),
              isPublic: true,
              title: "新しいボード",
            }).link({ owner: userId }),
          );

          navigate({ to: "/board/$boardId", params: { boardId } });
        })
      }
    >
      {label}
    </Button>
  );
}
