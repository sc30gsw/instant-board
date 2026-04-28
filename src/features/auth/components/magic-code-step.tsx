import { Button, FieldError, InputOTP, Label, REGEXP_ONLY_DIGITS } from "@heroui/react";
import type { AnyFormState } from "@tanstack/react-form";
import { useEffect, useState, useTransition } from "react";

import { sendMagicCode } from "~/features/auth/api/auth-client";
import { getCredentialsFieldErrorMessage } from "~/features/auth/components/credentials-form";
import type { useCredentialsForm } from "~/features/auth/hooks/use-credentials-form";
import type { LoginFormValue } from "~/features/auth/schemas/login-schema";

type MagicCodeStepProps = {
  email: LoginFormValue["email"];
  form: ReturnType<typeof useCredentialsForm>["form"];
  isPending: ReturnType<typeof useTransition>[0];
};

export function MagicCodeStep({ email, form, isPending }: MagicCodeStepProps) {
  const [isResending, startTransition] = useTransition();

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
                isDisabled={isPending || isResending}
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
          <div className="flex flex-col gap-2">
            <CodeSendButton
              form={form}
              isSubmitting={state.isSubmitting}
              isPending={isPending}
              isResending={isResending}
              startTransition={startTransition}
            />
          </div>
        )}
      </form.Subscribe>
    </div>
  );
}

const RESEND_COOLDOWN_SECONDS = 30;

type CodeSendButtonProps = {
  form: ReturnType<typeof useCredentialsForm>["form"];
  isSubmitting: AnyFormState["isSubmitting"];
  isPending: ReturnType<typeof useTransition>[0];
  isResending: ReturnType<typeof useTransition>[0];
  startTransition: ReturnType<typeof useTransition>[1];
};

function CodeSendButton({
  form,
  isSubmitting,
  isPending,
  isResending,
  startTransition,
}: CodeSendButtonProps) {
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  return (
    <>
      <Button
        className="w-full"
        isDisabled={isPending || isSubmitting || isResending}
        type="submit"
        variant="primary"
      >
        {isSubmitting ? "処理中..." : "認証コードを確認"}
      </Button>
      <Button
        className="w-full"
        isDisabled={isPending || isSubmitting || isResending || cooldown > 0}
        type="button"
        variant="ghost"
        onPress={() => {
          startTransition(async () => {
            setResendError(null);
            setCooldown(RESEND_COOLDOWN_SECONDS);

            const result = await sendMagicCode(form.getFieldValue("email"));

            result.match({
              err: (e) => setResendError(e.message || "コードの再送に失敗しました。"),
              ok: () => {},
            });
          });
        }}
      >
        {cooldown > 0 ? `再送（${cooldown}秒）` : "コードを再送"}
      </Button>
      {resendError ? (
        <p className="text-danger text-xs" role="alert">
          {resendError}
        </p>
      ) : null}
    </>
  );
}
