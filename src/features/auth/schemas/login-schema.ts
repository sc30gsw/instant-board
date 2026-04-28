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

const loginFormSchema = v.object({
  code: magicCodeSchema,
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
});

export type LoginFormValue = v.InferOutput<typeof loginFormSchema>;

const passthroughStringSchema = v.string();

export const signinCredentialsSchema = v.object({
  code: passthroughStringSchema,
  email: emailSchema,
  password: passwordSchema,
  username: passthroughStringSchema,
});

export const signupCredentialsSchema = v.object({
  code: passthroughStringSchema,
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
});

const magicCodeStepSchema = v.object({
  code: magicCodeSchema,
  email: passthroughStringSchema,
  password: passthroughStringSchema,
  username: passthroughStringSchema,
});

export function getLoginFormSchema(step: LoginStep, mode: LoginMode) {
  if (step === "magic-code") {
    return magicCodeStepSchema;
  }

  return mode === "signup" ? signupCredentialsSchema : signinCredentialsSchema;
}

export const loginFormEmptyValues = {
  code: "",
  email: "",
  password: "",
  username: "",
} satisfies LoginFormValue;
