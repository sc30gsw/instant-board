import type { AnyFieldMetaBase, AnyFormApi } from "@tanstack/react-form";
import { Result } from "better-result";

import { sendMagicCode, signInWithMagicCode } from "~/features/auth/api/auth-client";
import {
  signupWithPasswordServer,
  signinWithPasswordServer,
} from "~/features/auth/api/credential-server";
import { getLoginFormSchema, loginFormEmptyValues } from "~/features/auth/schemas/login-schema";
import type { LoginMode, LoginStep } from "~/features/auth/schemas/login-schema";
import { useAppForm } from "~/lib/forms/create-app-form";

type UseCredentialsFormOptions = {
  mode: LoginMode;
  onSuccess: () => void;
  step: LoginStep;
  setStep: (step: LoginStep) => void;
};

export function useCredentialsForm({ mode, onSuccess, step, setStep }: UseCredentialsFormOptions) {
  const validationSchema = getLoginFormSchema(step, mode);

  const form = useAppForm({
    defaultValues: loginFormEmptyValues,
    listeners: {
      onChange: ({ formApi, fieldApi }) => {
        if (fieldApi.name === "email" || fieldApi.name === "code" || fieldApi.name === "username") {
          fieldApi.setMeta((prev) => ({
            ...prev,
            errorMap: { ...prev.errorMap, onServer: undefined },
          }));
        }
        
        if (fieldApi.name === "password") {
          formApi.setFieldMeta("email", (prev: AnyFieldMetaBase | undefined) => ({
            ...emptyFieldMetaBase(),
            ...prev,
            errorMap: { ...prev?.errorMap, onServer: undefined },
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
          err: (e: Error) => {
            const userNamePrefix = "USERNAME_TAKEN:";

            if (e.message.startsWith(userNamePrefix)) {
              setServerFieldError(formApi, "username", e.message.slice(userNamePrefix.length));
            } else {
              setServerFieldError(formApi, "email", e.message);
            }
          },
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
        err: (e: Error) => setServerFieldError(formApi, "code", e.message),
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
  for (const field of ["email", "code", "username"] as const) {
    formApi.setFieldMeta(field, (prev: AnyFieldMetaBase | undefined) => ({
      ...emptyFieldMetaBase(),
      ...prev,
      errorMap: { ...prev?.errorMap, onServer: undefined },
    }));
  }
}

function setServerFieldError(
  formApi: AnyFormApi,
  field: "code" | "email" | "username",
  message: string,
) {
  formApi.setFieldMeta(field, (prev: AnyFieldMetaBase | undefined) => ({
    ...emptyFieldMetaBase(),
    ...prev,
    errorMap: { ...prev?.errorMap, onServer: message },
  }));
}

function mapUnknownToError(cause: unknown): Error {
  return cause instanceof Error ? cause : new Error(String(cause));
}
