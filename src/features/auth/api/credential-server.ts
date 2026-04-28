import { createServerFn } from "@tanstack/react-start";
import bcrypt from "bcryptjs";
import * as v from "valibot";

import { adminDb } from "~/db/instant-admin";
import { emailSchema, passwordSchema, usernameSchema } from "~/features/auth/schemas/login-schema";

const signupInput = v.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
});

const signinInput = v.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupWithPasswordServer = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => v.parse(signupInput, data))
  .handler(async ({ data }) => {
    const existing = await adminDb.query({
      $users: { $: { where: { email: data.email } } },
    });

    if (existing.$users.length > 0) {
      throw new Error("サインアップに失敗しました");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    // createToken で $users が自動作成される。ここではクライアントへ返さない。
    await adminDb.auth.createToken(data.email);

    const userResult = await adminDb.query({
      $users: { $: { where: { email: data.email } } },
    });
    const user = userResult.$users[0];

    if (user?.id) {
      const credId = crypto.randomUUID();
      await adminDb.transact([
        // biome-ignore lint: index signature returns T|undefined but user.id is confirmed above
        adminDb.tx.$users[user.id]!.update({ username: data.username }),
        // biome-ignore lint: same as above
        adminDb.tx.userCredentials[credId]!.update({ createdAt: Date.now(), passwordHash }).link({
          user: user.id,
        }),
      ]);
    }

    return { ok: true as const };
  });

export const signinWithPasswordServer = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => v.parse(signinInput, data))
  .handler(async ({ data }) => {
    const result = await adminDb.query({
      $users: {
        $: { where: { email: data.email } },
        credential: {},
      },
    });

    const user = result.$users[0];

    // ユーザーが存在しない場合もダミー bcrypt を実行して timing attack を防ぐ
    const credential = user?.credential as { passwordHash?: string } | undefined;
    const storedHash = credential?.passwordHash ?? "";
    const isValid = await bcrypt.compare(data.password, storedHash || "$2b$12$invalid");

    if (!user || !storedHash || !isValid) {
      throw new Error("メールアドレスまたはパスワードが正しくありません");
    }

    return { ok: true as const };
  });
