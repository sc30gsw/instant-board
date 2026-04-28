import { Button, FieldError, Input, Label, TextField } from "@heroui/react";
import { useState } from "react";

import { sendMagicCode, signInWithMagicCode } from "~/features/auth/api/auth-client";
import {
  signupWithPasswordServer,
  signinWithPasswordServer,
} from "~/features/auth/api/credential-server";
import { useAppForm } from "~/features/auth/hooks/create-login-form";
import {
  getLoginFormValidationError,
  loginFormEmptyValues,
} from "~/features/auth/schemas/login-schema";
import type { LoginMode, LoginStep } from "~/features/auth/schemas/login-schema";

type Props = {
  mode: LoginMode;
  onModeChange: (mode: LoginMode) => void;
  onSuccess: () => void;
};

export function CredentialsForm({ mode, onModeChange, onSuccess }: Props) {
  const [step, setStep] = useState<LoginStep>("credentials");
  const [serverError, setServerError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const form = useAppForm({
    defaultValues: loginFormEmptyValues,
    validators: {
      onSubmit: ({ value }) => getLoginFormValidationError(step, value, mode),
    },
    onSubmit: async ({ value }) => {
      setServerError(undefined);
      setIsLoading(true);

      if (step === "credentials") {
        try {
          if (mode === "signup") {
            await signupWithPasswordServer({
              data: {
                email: value.email,
                password: value.password,
                username: value.username,
              },
            });
          } else {
            await signinWithPasswordServer({
              data: { email: value.email, password: value.password },
            });
          }

          const codeResult = await sendMagicCode(value.email);
          await codeResult.match({
            err: async (e) => {
              setServerError(e.message);
              setIsLoading(false);
            },
            ok: async () => {
              setStep("magic-code");
              setIsLoading(false);
            },
          });
        } catch (e) {
          setServerError(e instanceof Error ? e.message : "エラーが発生しました");
          setIsLoading(false);
        }
        return;
      }

      // Step 2: メールに届いた6桁コードで実際に認証する
      try {
        const codeResult = await signInWithMagicCode(
          value.email,
          value.code,
          mode === "signup" ? { username: value.username } : undefined,
        );
        await codeResult.match({
          err: async (e) => {
            setServerError(e.message);
            setIsLoading(false);
          },
          ok: async () => {
            onSuccess();
          },
        });
      } catch (e) {
        setServerError(e instanceof Error ? e.message : "エラーが発生しました");
        setIsLoading(false);
      }
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      {step === "credentials" ? (
        <>
          {mode === "signup" && (
            <form.Field name="username">
              {(field) => (
                <TextField
                  className="flex flex-col gap-1"
                  isInvalid={field.state.meta.errors.length > 0}
                  value={field.state.value}
                  onChange={field.handleChange}
                >
                  <Label className="text-sm font-medium">ユーザー名</Label>
                  <Input
                    className="rounded-medium border-default-200 focus:border-primary w-full border px-3 py-2 text-sm outline-none"
                    placeholder="your-username"
                    onBlur={field.handleBlur}
                  />
                  <FieldError className="text-danger text-xs">
                    {field.state.meta.errors[0]}
                  </FieldError>
                </TextField>
              )}
            </form.Field>
          )}

          <form.Field name="email">
            {(field) => (
              <TextField
                className="flex flex-col gap-1"
                isInvalid={field.state.meta.errors.length > 0}
                value={field.state.value}
                onChange={field.handleChange}
              >
                <Label className="text-sm font-medium">メールアドレス</Label>
                <Input
                  className="rounded-medium border-default-200 focus:border-primary w-full border px-3 py-2 text-sm outline-none"
                  placeholder="you@example.com"
                  type="email"
                  onBlur={field.handleBlur}
                />
                <FieldError className="text-danger text-xs">
                  {field.state.meta.errors[0]}
                </FieldError>
              </TextField>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <TextField
                className="flex flex-col gap-1"
                isInvalid={field.state.meta.errors.length > 0}
                value={field.state.value}
                onChange={field.handleChange}
              >
                <Label className="text-sm font-medium">パスワード</Label>
                <Input
                  className="rounded-medium border-default-200 focus:border-primary w-full border px-3 py-2 text-sm outline-none"
                  placeholder="8文字以上"
                  type="password"
                  onBlur={field.handleBlur}
                />
                <FieldError className="text-danger text-xs">
                  {field.state.meta.errors[0]}
                </FieldError>
              </TextField>
            )}
          </form.Field>

          <Button className="w-full" isDisabled={isLoading} type="submit" variant="primary">
            {isLoading ? "処理中..." : mode === "signup" ? "アカウント作成" : "サインイン"}
          </Button>
        </>
      ) : (
        <MagicCodeStep
          email={form.getFieldValue("email")}
          form={form}
          isLoading={isLoading}
          onSuccess={onSuccess}
        />
      )}

      {serverError && <p className="text-danger text-sm">{serverError}</p>}

      {step === "credentials" && (
        <button
          className="text-foreground-500 text-center text-sm hover:underline"
          type="button"
          onClick={() => onModeChange(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin"
            ? "アカウントをお持ちでない方はこちら"
            : "すでにアカウントをお持ちの方はこちら"}
        </button>
      )}
    </form>
  );
}

type MagicCodeStepProps = {
  email: string;
  // biome-ignore lint: form type is complex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  isLoading: boolean;
  onSuccess: () => void;
};

function MagicCodeStep({ email, form, isLoading, onSuccess: _ }: MagicCodeStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-foreground-500 text-sm">
        <strong>{email}</strong>{" "}
        に認証コードを送信しました。メールを確認して6桁のコードを入力してください。
      </p>

      <form.Field name="code">
        {(field: any) => (
          <TextField
            className="flex flex-col gap-1"
            isInvalid={field.state.meta.errors.length > 0}
            value={field.state.value}
            onChange={field.handleChange}
          >
            <Label className="text-sm font-medium">認証コード</Label>
            <Input
              className="rounded-medium border-default-200 focus:border-primary w-full border px-3 py-2 text-sm outline-none"
              maxLength={6}
              placeholder="000000"
              onBlur={field.handleBlur}
            />
            <FieldError className="text-danger text-xs">{field.state.meta.errors[0]}</FieldError>
          </TextField>
        )}
      </form.Field>

      <Button className="w-full" isDisabled={isLoading} type="submit" variant="primary">
        {isLoading ? "処理中..." : "認証コードを確認"}
      </Button>
    </div>
  );
}
