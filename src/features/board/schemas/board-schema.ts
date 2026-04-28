import * as v from "valibot";

export const boardTitleFormSchema = v.object({ title: v.pipe(
  v.string(),
  v.trim(),
  v.minLength(1, "タイトルを入力してください"),
  v.maxLength(100, "タイトルは100文字以下で入力してください"),
) });

export type BoardTitleFormValue = v.InferOutput<typeof boardTitleFormSchema>;
