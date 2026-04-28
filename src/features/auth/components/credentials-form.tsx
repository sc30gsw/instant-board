import {
  Button,
  FieldError,
  Input,
  InputOTP,
  Label,
  REGEXP_ONLY_DIGITS,
  TextField,
} from "@heroui/react";
import type { AnyFormState } from "@tanstack/react-form";
import { getRouteApi } from "@tanstack/react-router";

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
  isPending: boolean;
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
        {(field) => {
          const errorMessage = getCredentialsFieldErrorMessage(field.state.meta.errors[0]);
          return (
            <div className="flex w-full flex-col gap-2">
              <Label>認証コード</Label>
              <InputOTP
                className="w-full"
                isInvalid={field.state.meta.errors.length > 0}
                maxLength={6}
                name={field.name}
                pattern={REGEXP_ONLY_DIGITS}
                value={field.state.value}
                onBlur={() => field.handleBlur()}
                onChange={field.handleChange}
              >
                <InputOTP.Group>
                  <InputOTP.Slot index={0} />
                  <InputOTP.Slot index={1} />
                  <InputOTP.Slot index={2} />
                </InputOTP.Group>
                <InputOTP.Separator />
                <InputOTP.Group>
                  <InputOTP.Slot index={3} />
                  <InputOTP.Slot index={4} />
                  <InputOTP.Slot index={5} />
                </InputOTP.Group>
              </InputOTP>
              {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
            </div>
          );
        }}
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
