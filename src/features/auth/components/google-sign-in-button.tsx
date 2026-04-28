import { Icon } from "@iconify/react";
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
      disabled={isPending}
      className="button button-outline bg-background inline-flex w-full items-center justify-center gap-2 rounded-full border hover:opacity-80 disabled:opacity-50"
    >
      <Icon height={20} icon="mdi:google" width={20} />
      <span>Google でサインイン</span>
    </a>
  );
}
