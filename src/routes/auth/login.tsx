import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { createFileRoute, stripSearchParams, useNavigate } from "@tanstack/react-router";
import { valibotValidator } from "@tanstack/valibot-adapter";
import { useEffect } from "react";
import * as v from "valibot";

import { db } from "~/db/instant";
import { CredentialsForm } from "~/features/auth/components/credentials-form";
import { GoogleSignInButton } from "~/features/auth/components/google-sign-in-button";
import { useGuestSignIn } from "~/features/auth/hooks/use-guest-sign-in";
import type { LoginMode } from "~/features/auth/schemas/login-schema";

const defaultLoginSearchParams = {
  mode: "signin",
  returnTo: "",
} as const satisfies Record<string, string>;

const loginSearchParamsSchema = v.object({
  mode: v.optional(v.picklist(["signin", "signup"] as const), "signin"),
  returnTo: v.optional(v.string()),
});

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
  const navigate = useNavigate();

  useEffect(() => {
    void navigate({ replace: true, to: returnTo || "/" });
  }, [navigate, returnTo]);

  return null;
}

function LoginForms() {
  const { mode, returnTo } = Route.useSearch();
  const navigate = useNavigate();
  const { signInAsGuest } = useGuestSignIn();

  function handleModeChange(newMode: LoginMode) {
    void navigate({ to: "/auth/login", search: { mode: newMode, returnTo: returnTo ?? "" } });
  }

  function handleSuccess() {
    void navigate({ replace: true, to: returnTo || "/" });
  }

  async function handleGuestSignIn() {
    const result = await signInAsGuest();
    result.match({
      err: async () => {},
      ok: async () => navigate({ to: returnTo || "/" }),
    });
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {mode === "signin" ? "サインイン" : "アカウント作成"}
          </h1>
          <p className="text-foreground-500 mt-1 text-sm">アイデアボードへようこそ</p>
        </div>

        <div className="rounded-large bg-content1 shadow-small flex flex-col gap-4 p-6">
          <CredentialsForm mode={mode} onModeChange={handleModeChange} onSuccess={handleSuccess} />

          <div className="flex items-center gap-2">
            <hr className="border-divider flex-1" />
            <span className="text-foreground-400 text-xs">または</span>
            <hr className="border-divider flex-1" />
          </div>

          <GoogleSignInButton />

          <Button className="w-full" variant="ghost" onPress={handleGuestSignIn}>
            <Icon icon="mdi:account-outline" />
            ゲストとして始める
          </Button>
        </div>
      </div>
    </div>
  );
}
