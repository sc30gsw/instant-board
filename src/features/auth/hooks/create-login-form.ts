import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import { loginFormEmptyValues } from "~/features/auth/schemas/login-schema";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldComponents: {},
  fieldContext,
  formComponents: {},
  formContext,
});

export { loginFormEmptyValues };
