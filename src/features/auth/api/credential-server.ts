import { id } from "@instantdb/react";
import { createServerFn } from "@tanstack/react-start";
import bcrypt from "bcryptjs";
import * as v from "valibot";

import { adminDb } from "~/db/instant-admin";
import {
  signinCredentialsSchema,
  signupCredentialsSchema,
} from "~/features/auth/schemas/login-schema";

export const signupWithPasswordServer = createServerFn({ method: "POST" })
  .inputValidator((data) => v.parse(v.omit(signupCredentialsSchema, ["code"]), data))
  .handler(async ({ data }) => {
    const existing = await adminDb.query({
      $users: { $: { where: { or: [{ email: data.email }, { username: data.username }] } } },
    });

    if (existing.$users.some((u) => u.email === data.email)) {
      throw new Error("サインアップに失敗しました");
    }

    if (existing.$users.some((u) => u.username === data.username)) {
      throw new Error("USERNAME_TAKEN:そのユーザー名はすでに使われています");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    //? マジックコード経由でユーザーを作り、extraFields で username を一度に設定する。
    //? （createToken は主に sign-in 用; 新規行の用意には Custom magic codes 側が適する）
    const { code } = await adminDb.auth.generateMagicCode(data.email);
    const { user, created } = await adminDb.auth.checkMagicCode(data.email, code, {
      extraFields: { username: data.username },
    });

    if (!created || !user.id) {
      throw new Error("サインアップに失敗しました");
    }

    const credId = id();

    await adminDb.transact([
      adminDb.tx.userCredentials[credId]!.update({ createdAt: Date.now(), passwordHash }).link({
        user: user.id,
      }),
    ]);

    return { ok: true };
  });

const INVALID_PASSWORD_HASH = "$2b$12$invalid";

export const signinWithPasswordServer = createServerFn({ method: "POST" })
  .inputValidator((data) => v.parse(v.pick(signinCredentialsSchema, ["email", "password"]), data))
  .handler(async ({ data }) => {
    const result = await adminDb.query({
      $users: {
        $: { where: { email: data.email } },
        credential: {},
      },
    });

    const user = result.$users[0];

    const credential = user?.credential;
    const storedHash = credential?.passwordHash ?? "";
    const isValid = await bcrypt.compare(data.password, storedHash || INVALID_PASSWORD_HASH);

    if (!user || !storedHash || !isValid) {
      throw new Error("メールアドレスまたはパスワードが正しくありません");
    }

    return { ok: true };
  });
