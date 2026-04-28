import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { getRouteApi } from "@tanstack/react-router";
import { useTransition } from "react";

import { CredentialsForm } from "~/features/auth/components/credentials-form";
import { GoogleSignInButton } from "~/features/auth/components/google-sign-in-button";
import { useGuestSignIn } from "~/features/auth/hooks/use-guest-sign-in";

const routeApi = getRouteApi("/auth/login");

export function LoginFormsContainer() {
  const navigate = routeApi.useNavigate();
  const { returnTo } = routeApi.useSearch();
  const { signInAsGuest } = useGuestSignIn();

  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-large bg-content1 shadow-small flex flex-col gap-4 p-6">
      <CredentialsForm
        isPending={isPending}
        onSuccess={() => {
          navigate({ replace: true, to: returnTo || "/" });
        }}
      />

      <div className="flex items-center gap-2">
        <hr className="border-divider flex-1" />
        <span className="text-foreground-400 text-xs">または</span>
        <hr className="border-divider flex-1" />
      </div>

      <GoogleSignInButton isPending={isPending} />

      <Button
        isDisabled={isPending}
        className="w-full"
        variant="ghost"
        onPress={() =>
          startTransition(async () => {
            const result = await signInAsGuest();

            result.match({
              err: async () => {},
              ok: async () => navigate({ to: returnTo || "/" }),
            });
          })
        }
      >
        <Icon icon="mdi:account-outline" />
        ゲストとして始める
      </Button>
    </div>
  );
}
