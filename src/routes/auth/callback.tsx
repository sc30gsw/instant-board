import { Icon } from "@iconify/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { db } from "~/db/instant";

export const Route = createFileRoute("/auth/callback")({
  component: OAuthCallbackPage,
});

function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const codeVerifier = sessionStorage.getItem("pkce_code_verifier") ?? undefined;

    if (!code) {
      setError("認証コードが見つかりませんでした");
      return;
    }

    db.auth
      .exchangeOAuthCode({ code, codeVerifier })
      .then(() => navigate({ to: "/" }))
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "認証に失敗しました");
      });
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-danger">{error}</p>
        <a className="text-sm underline" href="/auth/login">
          ログインページへ戻る
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Icon className="animate-spin" height={32} icon="mdi:loading" width={32} />
    </div>
  );
}
