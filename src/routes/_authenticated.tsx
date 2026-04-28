import { Icon } from "@iconify/react";
import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { db } from "~/db/instant";

export const Route = createFileRoute("/_authenticated")({
  component: AuthGate,
});

function AuthGate() {
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
        <Outlet />
      </db.SignedIn>
      <db.SignedOut>
        <RedirectToLogin />
      </db.SignedOut>
    </>
  );
}

function RedirectToLogin() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    void navigate({
      replace: true,
      search: { returnTo: location.pathname },
      to: "/auth/login",
    });
  }, [navigate, location.pathname]);

  return null;
}
