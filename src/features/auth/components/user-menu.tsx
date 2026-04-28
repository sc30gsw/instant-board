import { Avatar, Button, Popover } from "@heroui/react";
import { Icon } from "@iconify/react";
import type { InstaQLEntity, User } from "@instantdb/react";
import { useToggle } from "react-use";

import { db } from "~/db/instant";
import type { AppSchema } from "~/db/instant-schema";

export function UserMenu({
  email,
  imageURL,
  username,
}: Pick<User, "email" | "imageURL"> &
  Partial<Pick<InstaQLEntity<AppSchema, "$users">, "username">>) {
  const displayName = username || getEmailLocalPart(email) || "ゲスト";
  const [open, toggle] = useToggle(false);

  return (
    <Popover isOpen={open} onOpenChange={toggle}>
      <Popover.Trigger className="flex h-10 items-center gap-3 rounded-full border border-black/10 bg-black/3 px-2.5 transition-colors hover:bg-black/6">
        <Avatar className="h-8 w-8 shrink-0">
          {imageURL ? <Avatar.Image src={imageURL} /> : null}
          <Avatar.Fallback>{displayName.slice(0, 1)}</Avatar.Fallback>
        </Avatar>
        <span className="max-w-32 truncate text-sm font-medium">{displayName}</span>
        <Icon className="text-foreground-400" height={16} icon="mdi:chevron-down" width={16} />
      </Popover.Trigger>
      <Popover.Content className="z-50" placement="bottom end">
        <Button
          className="text-danger flex min-w-40 items-center gap-2 rounded-2xl border border-red-100 bg-white px-4 py-3 text-left text-sm font-medium shadow-lg transition-colors hover:bg-red-50"
          onPress={() => {
            toggle(false);
            db.auth.signOut();
          }}
        >
          <Icon height={16} icon="mdi:logout-variant" width={16} />
          サインアウト
        </Button>
      </Popover.Content>
    </Popover>
  );
}

function getEmailLocalPart(email?: null | string) {
  if (!email) {
    return null;
  }

  return email.split("@")[0] || email;
}
