import { Button, Input } from "@heroui/react";
import type { AnyFormState } from "@tanstack/react-form";
import { getRouteApi } from "@tanstack/react-router";
import type { useTransition } from "react";

import { useCredentialsForm } from "~/features/auth/hooks/use-credentials-form";
import type { LoginFormValue } from "~/features/auth/schemas/login-schema";

function getCredentialsFieldErrorMessage(error: unknown) {
  if (!error) {
    return null;
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return null;
}

const routeApi = getRouteApi("/auth/login");

type CredentialsFormProps = {
  isPending: ReturnType<typeof useTransition>[0];
  onSuccess: () => void;
};

export function CredentialsForm({ isPending, onSuccess }: CredentialsFormProps) {
  const { mode } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const { form, step } = useCredentialsForm({ mode, onSuccess });

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
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium" htmlFor="username">
                    ユーザー名
                  </label>
                  <Input
                    id="username"
                    aria-invalid={field.state.meta.errors.length > 0}
                    className="rounded-medium border-default-200 focus:border-primary w-full border px-3 py-2 text-sm outline-none"
                    placeholder="your-username"
                    disabled={isPending}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <p className="text-danger text-xs">
                    {getCredentialsFieldErrorMessage(field.state.meta.errors[0])}
                  </p>
                </div>
              )}
            </form.Field>
          )}

          <form.Field name="email">
            {(field) => (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" htmlFor="email">
                  メールアドレス
                </label>
                <Input
                  id="email"
                  aria-invalid={field.state.meta.errors.length > 0}
                  className="rounded-medium border-default-200 focus:border-primary w-full border px-3 py-2 text-sm outline-none"
                  placeholder="you@example.com"
                  type="email"
                  disabled={isPending}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <p className="text-danger text-xs">
                  {getCredentialsFieldErrorMessage(field.state.meta.errors[0])}
                </p>
              </div>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" htmlFor="password">
                  パスワード
                </label>
                <Input
                  id="password"
                  aria-invalid={field.state.meta.errors.length > 0}
                  className="rounded-medium border-default-200 focus:border-primary w-full border px-3 py-2 text-sm outline-none"
                  placeholder="8文字以上"
                  type="password"
                  disabled={isPending}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <p className="text-danger text-xs">
                  {getCredentialsFieldErrorMessage(field.state.meta.errors[0])}
                </p>
              </div>
            )}
          </form.Field>

          <form.Subscribe>
            {(state: AnyFormState) => (
              <Button
                className="w-full"
                disabled={isPending || state.isSubmitting}
                type="submit"
                variant="primary"
              >
                {state.isSubmitting
                  ? "処理中..."
                  : mode === "signup"
                    ? "アカウント作成"
                    : "サインイン"}
              </Button>
            )}
          </form.Subscribe>
        </>
      ) : (
        <MagicCodeStep email={form.getFieldValue("email")} form={form} />
      )}

      {step === "credentials" && (
        <button
          className="text-foreground-500 text-center text-sm hover:underline"
          type="button"
          disabled={isPending}
          onClick={() => navigate({ search: { mode: mode === "signin" ? "signup" : "signin" } })}
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
  email: LoginFormValue["email"];
  form: ReturnType<typeof useCredentialsForm>["form"];
};

function MagicCodeStep({ email, form }: MagicCodeStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-foreground-500 text-sm">
        <strong>{email}</strong>{" "}
        に認証コードを送信しました。メールを確認して6桁のコードを入力してください。
      </p>

      <form.Field name="code">
        {(field: any) => (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="code">
              認証コード
            </label>
            <Input
              id="code"
              aria-invalid={field.state.meta.errors.length > 0}
              className="rounded-medium border-default-200 focus:border-primary w-full border px-3 py-2 text-sm outline-none"
              maxLength={6}
              placeholder="000000"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            <p className="text-danger text-xs">
              {getCredentialsFieldErrorMessage(field.state.meta.errors[0])}
            </p>
          </div>
        )}
      </form.Field>

      <form.Subscribe>
        {(state: AnyFormState) => (
          <Button
            className="w-full"
            isDisabled={state.isSubmitting}
            type="submit"
            variant="primary"
          >
            {state.isSubmitting ? "処理中..." : "認証コードを確認"}
          </Button>
        )}
      </form.Subscribe>
    </div>
  );
}
