import { Result } from "better-result";

import { db } from "~/db/instant";

export function useGuestSignIn() {
  const signInAsGuest = async () => {
    return Result.tryPromise({
      catch: (e) => (e instanceof Error ? e : new Error(String(e))),
      try: () => db.auth.signInAsGuest(),
    });
  };

  return { signInAsGuest } as const;
}
