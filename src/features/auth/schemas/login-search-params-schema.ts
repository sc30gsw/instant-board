import * as v from "valibot";

export const defaultLoginSearchParams = {
  mode: "signin",
  returnTo: "",
} as const satisfies Record<string, string>;

export const loginSearchParamsSchema = v.object({
  mode: v.optional(v.picklist(["signin", "signup"] as const), "signin"),
  returnTo: v.optional(v.string()),
});
