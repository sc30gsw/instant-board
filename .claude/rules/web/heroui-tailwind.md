---
description: HeroUI v3 + Tailwind v4 coexistence — default to HeroUI components, cn() for layout wrappers
globs: ["src/**/*.tsx"]
alwaysApply: true
---

# HeroUI + Tailwind Coexistence

## Default: HeroUI first

Use HeroUI components and props before reaching for Tailwind utilities.

```tsx
// CORRECT: HeroUI props
<Button color="primary" size="sm">
  送信
</Button>

// WRONG: Tailwind overriding HeroUI props that already exist
<Button className="bg-blue-600 text-sm">
  送信
</Button>
```

## `cn()` boundary

Use `cn()` (from `@lightsound/cn/tw-merge`) to compose Tailwind classes on **wrapper / layout elements** around HeroUI components. Do NOT use Tailwind to override HeroUI component internals.

```tsx
import { cn } from "@lightsound/cn/tw-merge";

// CORRECT: Tailwind for layout wrapper, HeroUI for the component
export function FormSection({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("flex flex-col gap-4", className)}>{children}</section>;
}

// WRONG: fighting HeroUI internals with arbitrary Tailwind selectors
<Button className="[&_.heroui-button-label]:text-red-500">...</Button>;
```

## Icons

Use `@heroui/icons` exclusively. Do not install `@tabler/icons-react` or other icon libraries.

```tsx
import { EyeIcon, EyeSlashIcon } from "@heroui/icons";
```

## Related skills

- `frontend-design` — design patterns for this app
