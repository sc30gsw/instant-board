import * as v from "valibot";

export const emailSchema = v.pipe(v.string(), v.email("有効なメールアドレスを入力してください"));

export const passwordSchema = v.pipe(
  v.string(),
  v.minLength(8, "パスワードは8文字以上で入力してください"),
);

export const usernameSchema = v.pipe(
  v.string(),
  v.minLength(2, "ユーザー名は2文字以上で入力してください"),
  v.maxLength(32, "ユーザー名は32文字以下で入力してください"),
);

const magicCodeSchema = v.pipe(v.string(), v.length(6, "認証コードは6桁で入力してください"));

export type LoginMode = "signin" | "signup";
export type LoginStep = "credentials" | "magic-code";

export type LoginFormValue = {
  email: v.InferOutput<typeof emailSchema>;
  password: v.InferOutput<typeof passwordSchema>;
  username?: v.InferOutput<typeof usernameSchema>;
  code: v.InferOutput<typeof magicCodeSchema>;
};

export function getLoginFormValidationError(
  step: LoginStep,
  value: LoginFormValue,
  mode: LoginMode,
) {
  if (step === "credentials") {
    const fields: Record<string, string | undefined> = {};

    const emailResult = v.safeParse(emailSchema, value.email);

    if (!emailResult.success) {
      fields["email"] = emailResult.issues[0]?.message;
    }

    const passwordResult = v.safeParse(passwordSchema, value.password);

    if (!passwordResult.success) {
      fields["password"] = passwordResult.issues[0]?.message;
    }

    if (mode === "signup") {
      const usernameResult = v.safeParse(usernameSchema, value.username);

      if (!usernameResult.success) {
        fields["username"] = usernameResult.issues[0]?.message;
      }
    }

    return Object.keys(fields).length > 0 ? { fields } : undefined;
  }

  const codeResult = v.safeParse(magicCodeSchema, value.code);

  if (!codeResult.success) {
    return { fields: { code: codeResult.issues[0]?.message } };
  }

  return undefined;
}

export const loginFormEmptyValues = {
  code: "",
  email: "",
  password: "",
  username: "",
} as const satisfies LoginFormValue;
