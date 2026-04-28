import { Avatar, Button, Popover } from "@heroui/react";
import { Icon } from "@iconify/react";
import type { InstaQLEntity, User } from "@instantdb/react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useToggle } from "react-use";

import { db } from "~/db/instant";
import type { AppSchema } from "~/db/instant-schema";

export function UserMenu({
  email,
  isGuest,
  imageURL,
  username,
}: Pick<User, "email" | "imageURL" | "isGuest"> &
  Partial<Pick<InstaQLEntity<AppSchema, "$users">, "username">>) {
  const displayName = username || getEmailLocalPart(email) || "ゲスト";
  const [open, toggle] = useToggle(false);
  const location = useLocation();
  const navigate = useNavigate();

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
      <Popover.Content className="z-50 flex flex-col gap-2 p-2" placement="bottom end">
        {isGuest ? (
          <Button
            className="justify-start"
            variant="ghost"
            onPress={() => {
              toggle(false);
              navigate({
                search: { mode: "signup", returnTo: location.pathname },
                to: "/auth/login",
              });
            }}
          >
            <Icon height={16} icon="mdi:account-arrow-up" width={16} />
            アカウント作成
          </Button>
        ) : null}
        <Button
          className="text-danger justify-start"
          variant="ghost"
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
