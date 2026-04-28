import { Button, FieldError, Input, Label, TextField } from "@heroui/react";
import type { AnyFormState } from "@tanstack/react-form";
import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { MagicCodeStep } from "~/features/auth/components/magic-code-step";
import { useCredentialsForm } from "~/features/auth/hooks/use-credentials-form";
import type { LoginStep } from "~/features/auth/schemas/login-schema";

export function getCredentialsFieldErrorMessage(error: unknown) {
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
  isPending: boolean;
  onSuccess: () => void;
  onStepChange?: (step: LoginStep) => void;
};

export function CredentialsForm({ isPending, onSuccess, onStepChange }: CredentialsFormProps) {
  const { mode } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const [step, setStep] = useState<LoginStep>("credentials");
  const { form } = useCredentialsForm({ mode, onSuccess, step, setStep });

  useEffect(() => {
    onStepChange?.(step);
  }, [onStepChange, step]);

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
              {(field) => {
                const errorMessage = getCredentialsFieldErrorMessage(field.state.meta.errors[0]);
                return (
                  <TextField
                    fullWidth
                    isDisabled={isPending}
                    isInvalid={field.state.meta.errors.length > 0}
                    name={field.name}
                    value={field.state.value}
                    onBlur={() => field.handleBlur()}
                    onChange={field.handleChange}
                  >
                    <Label>ユーザー名</Label>
                    <Input placeholder="your-username" />
                    {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
                  </TextField>
                );
              }}
            </form.Field>
          )}

          <form.Field name="email">
            {(field) => {
              const errorMessage = getCredentialsFieldErrorMessage(field.state.meta.errors[0]);
              return (
                <TextField
                  fullWidth
                  isDisabled={isPending}
                  isInvalid={field.state.meta.errors.length > 0}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={() => field.handleBlur()}
                  onChange={field.handleChange}
                >
                  <Label>メールアドレス</Label>
                  <Input inputMode="email" placeholder="you@example.com" />
                  {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
                </TextField>
              );
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const errorMessage = getCredentialsFieldErrorMessage(field.state.meta.errors[0]);
              return (
                <TextField
                  fullWidth
                  isDisabled={isPending}
                  isInvalid={field.state.meta.errors.length > 0}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={() => field.handleBlur()}
                  onChange={field.handleChange}
                >
                  <Label>パスワード</Label>
                  <Input placeholder="8文字以上" />
                  {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
                </TextField>
              );
            }}
          </form.Field>

          <form.Subscribe>
            {(state: AnyFormState) => (
              <Button
                className="w-full"
                isDisabled={isPending || state.isSubmitting}
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
        <MagicCodeStep email={form.getFieldValue("email")} form={form} isPending={isPending} />
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
