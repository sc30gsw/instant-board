import { Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";

import { db } from "~/db/instant";

type Props = {
  email?: null | string;
  imageUrl?: null | string;
  username?: null | string;
};

export function CurrentUserMenu({ email, imageUrl, username }: Props) {
  const displayName = username || getEmailLocalPart(email) || "ゲスト";
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
        className="flex h-10 items-center gap-3 rounded-full border border-black/10 bg-black/[0.03] px-2.5 transition-colors hover:bg-black/[0.06]"
        type="button"
        onClick={() => setIsOpen((open) => !open)}
      >
        <Avatar className="h-8 w-8 shrink-0">
          {imageUrl ? <Avatar.Image src={imageUrl} /> : null}
          <Avatar.Fallback>{displayName.slice(0, 1)}</Avatar.Fallback>
        </Avatar>
        <span className="max-w-32 truncate text-sm font-medium">{displayName}</span>
        <Icon className="text-foreground-400" height={16} icon="mdi:chevron-down" width={16} />
      </button>

      {isOpen ? (
        <button
          className="text-danger absolute top-full right-0 mt-2 flex min-w-40 items-center gap-2 rounded-2xl border border-red-100 bg-white px-4 py-3 text-left text-sm font-medium shadow-lg transition-colors hover:bg-red-50"
          type="button"
          onClick={() => {
            setIsOpen(false);
            void db.auth.signOut();
          }}
        >
          <Icon height={16} icon="mdi:logout-variant" width={16} />
          サインアウト
        </button>
      ) : null}
    </div>
  );
}

function getEmailLocalPart(email?: null | string) {
  if (!email) return null;
  return email.split("@")[0] || email;
}
