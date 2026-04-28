import { Result } from "better-result";

import { db } from "~/db/instant";

export function sendMagicCode(email: string) {
  return Result.tryPromise({
    catch: (e) => e as Error,
    try: () => db.auth.sendMagicCode({ email }),
  });
}

export function signInWithMagicCode(
  email: string,
  code: string,
  extraFields?: { username?: string },
) {
  return Result.tryPromise({
    catch: (e) => e as Error,
    try: () =>
      db.auth.signInWithMagicCode({
        code,
        email,
        ...(extraFields ? { extraFields } : {}),
      }),
  });
}
