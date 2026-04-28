import { Icon } from "@iconify/react";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { valibotValidator } from "@tanstack/valibot-adapter";
import { useEffect } from "react";

import { db } from "~/db/instant";
import { LoginFormsContainer } from "~/features/auth/components/login-forms-container";
import {
  defaultLoginSearchParams,
  loginSearchParamsSchema,
} from "~/features/auth/schemas/login-search-params-schema";

export const Route = createFileRoute("/auth/login")({
  validateSearch: valibotValidator(loginSearchParamsSchema),
  search: {
    middlewares: [stripSearchParams(defaultLoginSearchParams)],
  },
  component: LoginPage,
});

function LoginPage() {
  const { isLoading } = db.useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Icon className="animate-spin" height={32} icon="mdi:loading" width={32} />
      </div>
    );
  }

  return (
    <>
      <db.SignedIn>
        <SignedInRedirect />
      </db.SignedIn>
      <db.SignedOut>
        <LoginForms />
      </db.SignedOut>
    </>
  );
}

function SignedInRedirect() {
  const { returnTo } = Route.useSearch();
  const navigate = Route.useNavigate();

  useEffect(() => {
    navigate({ replace: true, to: returnTo || "/" });
  }, [navigate, returnTo]);

  return null;
}

function LoginForms() {
  const { mode } = Route.useSearch();

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {mode === "signin" ? "サインイン" : "アカウント作成"}
          </h1>
          <p className="text-foreground-500 mt-1 text-sm">アイデアボードへようこそ</p>
        </div>

        <LoginFormsContainer />
      </div>
    </div>
  );
}
