import * as v from "valibot";

import { NOTE_COLORS } from "~/features/board/constants/board";

export const noteFormSchema = v.object({
  color: v.pipe(v.string(), v.picklist(NOTE_COLORS)),
  content: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, "内容を入力してください"),
    v.maxLength(500, "内容は500文字以下で入力してください"),
  ),
});

type NoteFormValue = v.InferOutput<typeof noteFormSchema>;

export const noteCreateFormEmptyValues = {
  color: NOTE_COLORS[0],
  content: "",
} as const satisfies NoteFormValue;
