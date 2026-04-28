import { Icon } from "@iconify/react";
import { cn } from "@lightsound/cn/tw-merge";
import type { useTransition } from "react";

import { db } from "~/db/instant";

export function GoogleSignInButton({
  isPending,
}: Record<"isPending", ReturnType<typeof useTransition>[0]>) {
  const url = db.auth.createAuthorizationURL({
    clientName: import.meta.env.VITE_INSTANT_GOOGLE_CLIENT_NAME ?? "google",
    redirectURL: window.location.href,
  });

  return (
    <a
      href={url}
      aria-disabled={isPending}
      className={cn(
        "bg-background button w-full border hover:opacity-80",
        isPending && "pointer-events-none opacity-50",
      )}
    >
      <Icon height={20} icon="mdi:google" width={20} />
      <span>Google でサインイン</span>
    </a>
  );
}
