---
description: Bulletproof React features/* layout, ~ alias, feature inter-dependencies
globs: ["src/**/*.{ts,tsx}"]
alwaysApply: true
---

# Project Structure

> This rule extends [CODING_GUIDELINES.md](../CODING_GUIDELINES.md) §プロジェクト構造.

## Feature layout

```
src/
├── features/          # Business logic — one module per domain
│   └── [feature]/
│       ├── api/       # InstantDB query wrappers / server functions
│       ├── components/
│       ├── hooks/
│       ├── schemas/   # Valibot schemas
│       └── types/     # Type definitions
├── db/                # InstantDB schema, perms, client init
│   ├── instant-schema.ts
│   ├── instant.perms.ts
│   ├── instant.ts          # client init (browser)
│   └── instant-admin.ts    # admin init (server-only)
├── routes/            # TanStack Router file-based routing (minimal logic)
├── lib/
│   └── utils.ts       # cn helper
└── styles.css
```

`src/components/`, `src/hooks/`, `src/utils/` are created on demand when something is genuinely shared across features.

## `~` alias (relative paths forbidden)

> Also enforced by PostToolUse hook in `.claude/settings.json`

```typescript
// CORRECT
import { useProducts } from "~/features/products/hooks/use-products";
import type { Product } from "~/features/products/types/product";

// WRONG: relative paths — forbidden even within the same directory
import { useProducts } from "../hooks/use-products";
import { helper } from "./helper";
```

## Feature inter-dependencies forbidden

```typescript
// WRONG: feature importing directly from another feature
// src/features/orders/components/order-form.tsx
import { UserSelect } from "~/features/users/components/user-select";

// CORRECT: extract to src/components/
import { UserSelect } from "~/components/user-select";
```

## Routes exception

Route files (`src/routes/**/*.tsx`) use `export const Route = createFileRoute(...)`. The oxlint `no-default-export` rule is overridden for this path in `vite.config.ts`.

```typescript
// src/routes/products.tsx — named export is sufficient, no default export needed
export const Route = createFileRoute("/products")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(getProductsOptions({ query: { limit: 20 } })),
  component: ProductsPage,
});
```
