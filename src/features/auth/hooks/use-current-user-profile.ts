import { db } from "~/db/instant";
import { useAuth } from "~/features/auth/hooks/use-auth";

export function useCurrentUserProfile() {
  const { user, ...authState } = useAuth();
  const { data, ...queryState } = db.useQuery({
    $users: {
      $: { where: { id: user?.id ?? "" } },
    },
  });

  return {
    ...authState,
    ...queryState,
    profile: data?.$users[0] ?? null,
    user,
  } as const;
}
