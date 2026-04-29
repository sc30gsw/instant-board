import * as v from "valibot";

import { NOTE_COLORS } from "~/features/board/constants/board";

export const noteFormSchema = v.object({
  color: v.picklist(NOTE_COLORS),
  content: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, "内容を入力してください"),
    v.maxLength(500, "内容は500文字以下で入力してください"),
  ),
});

type NoteFormValue = v.InferOutput<typeof noteFormSchema>;

// ? as const satisfies だと color が常に NOTE_COLORS[0] に狭まるため
// ? picklistの6種の型を期待しているuseNoteCreateFormと衝突する
export const noteCreateFormEmptyValues: NoteFormValue = {
  color: NOTE_COLORS[0],
  content: "",
};
