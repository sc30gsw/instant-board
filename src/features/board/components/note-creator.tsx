import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import type { User } from "@instantdb/react";
import { useToggle } from "react-use";

import { NoteCreatorPanel } from "~/features/board/components/note-creator-panel";
import type { Board } from "~/features/board/types/board";

type NoteCreatorProps = {
  boardId: Board["id"];
  userId: User["id"];
};

export function NoteCreator({ boardId, userId }: NoteCreatorProps) {
  const [isOpen, toggle] = useToggle(false);

  if (!isOpen) {
    return (
      <Button
        className="fixed right-6 bottom-6 h-14 rounded-full px-5 text-sm font-medium shadow-lg"
        variant="primary"
        onPress={() => toggle(true)}
      >
        <Icon height={20} icon="mdi:note-plus-outline" width={20} />
        付箋を追加
      </Button>
    );
  }

  return <NoteCreatorPanel boardId={boardId} userId={userId} onClose={() => toggle(false)} />;
}
