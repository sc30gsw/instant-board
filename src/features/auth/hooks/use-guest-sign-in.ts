import { Result } from "better-result";

import { db } from "~/db/instant";

export function useGuestSignIn() {
  async function signInAsGuest() {
    return Result.tryPromise({
      catch: (e) => e as Error,
      try: () => db.auth.signInAsGuest(),
    });
  }

  return { signInAsGuest };
}
