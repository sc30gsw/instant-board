import { Result } from "better-result";

import { db } from "~/db/instant";
import type { LoginFormValue } from "~/features/auth/schemas/login-schema";

export function sendMagicCode(email: LoginFormValue["email"]) {
  return Result.tryPromise({
    catch: (e) => e as Error,
    try: () => db.auth.sendMagicCode({ email }),
  });
}

export function signInWithMagicCode(
  email: LoginFormValue["email"],
  code: LoginFormValue["code"],
  extraFields?: Partial<Pick<LoginFormValue, "username">>,
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
