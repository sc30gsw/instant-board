import { db } from "~/db/instant";

export function useAuth() {
  return db.useAuth();
}
