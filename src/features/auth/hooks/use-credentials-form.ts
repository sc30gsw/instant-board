import type { AnyFieldMetaBase, AnyFormApi } from "@tanstack/react-form";
import { Result } from "better-result";
import { useState } from "react";

import { sendMagicCode, signInWithMagicCode } from "~/features/auth/api/auth-client";
import {
  signupWithPasswordServer,
  signinWithPasswordServer,
} from "~/features/auth/api/credential-server";
import { useAppForm } from "~/features/auth/hooks/create-login-form";
import { getLoginFormSchema, loginFormEmptyValues } from "~/features/auth/schemas/login-schema";
import type { LoginMode, LoginStep } from "~/features/auth/schemas/login-schema";

type UseCredentialsFormOptions = {
  mode: LoginMode;
  onSuccess: () => void;
};

export function useCredentialsForm({ mode, onSuccess }: UseCredentialsFormOptions) {
  const [step, setStep] = useState<LoginStep>("credentials");
  const validationSchema = getLoginFormSchema(step, mode);

  const form = useAppForm({
    defaultValues: loginFormEmptyValues,
    listeners: {
      onChange: ({ fieldApi }) => {
        if (fieldApi.name === "email" || fieldApi.name === "code") {
          fieldApi.setMeta((prev) => ({
            ...prev,
            errorMap: { ...prev.errorMap, onServer: undefined },
          }));
        }
      },
    },
    validators: {
      onChange: validationSchema,
      onSubmit: validationSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      clearServerFieldErrors(formApi);

      if (step === "credentials") {
        const afterPassword = await Result.tryPromise({
          catch: mapUnknownToError,
          try: async () => {
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
          },
        });

        const afterSend = await afterPassword.andThenAsync(() => sendMagicCode(value.email));

        afterSend.match({
          err: (e) =>
            setServerFieldError(
              formApi,
              "email",
              e instanceof Error ? e.message : "コードの送信に失敗しました。",
            ),
          ok: () => setStep("magic-code"),
        });
        return;
      }

      const signedIn = await signInWithMagicCode(
        value.email,
        value.code,
        mode === "signup" ? { username: value.username } : undefined,
      );

      signedIn.match({
        err: (e) =>
          setServerFieldError(
            formApi,
            "code",
            e instanceof Error ? e.message : "サインインに失敗しました。コードを確認してください。",
          ),
        ok: () => onSuccess(),
      });
    },
  });

  return { form, step } as const;
}

function emptyFieldMetaBase(): AnyFieldMetaBase {
  return {
    isBlurred: false,
    isDirty: false,
    isTouched: false,
    isValidating: false,
    errorMap: {},
    errorSourceMap: {},
  };
}

function clearServerFieldErrors(formApi: AnyFormApi) {
  for (const field of ["email", "code"] as const) {
    formApi.setFieldMeta(field, (prev: AnyFieldMetaBase | undefined) => ({
      ...emptyFieldMetaBase(),
      ...prev,
      errorMap: { ...prev?.errorMap, onServer: undefined },
    }));
  }
}

function setServerFieldError(formApi: AnyFormApi, field: "code" | "email", message: string) {
  formApi.setFieldMeta(field, (prev: AnyFieldMetaBase | undefined) => ({
    ...emptyFieldMetaBase(),
    ...prev,
    errorMap: { ...prev?.errorMap, onServer: message },
  }));
}

function mapUnknownToError(cause: unknown): Error {
  return cause instanceof Error ? cause : new Error(String(cause));
}
