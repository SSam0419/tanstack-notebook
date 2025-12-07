---
title: Search Params
description: Learn how to work with search params (query strings) in TanStack Router with type safety and validation.
---

TanStack Router treats search params as **structured JSON data** rather than simple string key-value pairs. It automatically converts URL search strings to typed objects and back, providing type safety through validation schemas.

## How search params work

TanStack Router automatically serializes and deserializes search params:

```tsx
// This navigation...
<Link
  to="/shop"
  search={{
    pageIndex: 3,
    includeCategories: ["electronics", "gifts"],
    sortBy: "price",
    desc: true,
  }}
>
  Shop
</Link>

// Creates this URL:
// /shop?pageIndex=3&includeCategories=%5B%22electronics%22%2C%22gifts%22%5D&sortBy=price&desc=true

// Which parses back to:
{
  "pageIndex": 3,
  "includeCategories": ["electronics", "gifts"],
  "sortBy": "price",
  "desc": true
}
```

**Key features:**

- **JSON serialization** for complex data structures
- **Type validation** at route boundaries
- **Inheritance** from parent to child routes
- **Type safety** with TypeScript
- **Framework integration** with validation libraries (Zod, Valibot, etc.)

> **Good to know:** First-level params remain URLSearchParams compliant, while nested structures are JSON-serialized. Numbers and booleans are preserved as proper types.

## Reading search params

### In route components

Access validated search params using `Route.useSearch()`:

```tsx
// routes/shop.products.tsx
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";

const productSearchSchema = z.object({
  page: z.number().default(1),
  filter: z.string().default(""),
  sort: z.enum(["newest", "oldest", "price"]).default("newest"),
});

export const Route = createFileRoute("/shop/products")({
  validateSearch: zodValidator(productSearchSchema),
  component: ProductList,
});

function ProductList() {
  const { page, filter, sort } = Route.useSearch();

  return (
    <div>
      <p>Page: {page}</p>
      <p>Filter: {filter}</p>
      <p>Sort: {sort}</p>
    </div>
  );
}
```

### Outside route components

**Using Route API:**

```tsx
import { getRouteApi } from "@tanstack/react-router";

const routeApi = getRouteApi("/shop/products");

function ProductSidebar() {
  const { page, filter, sort } = routeApi.useSearch();

  return <div>Current page: {page}</div>;
}
```

**Using useSearch hook:**

```tsx
import { useSearch } from "@tanstack/react-router";

function ProductSidebar() {
  // Type-safe with from
  const search = useSearch({ from: "/shop/products" });

  // Loose typing (not recommended)
  const search = useSearch({ strict: false });

  return <div>...</div>;
}
```

> **Good to know:** Always use the `from` prop with `useSearch` for better type safety and autocomplete.

### In loaders

Use `loaderDeps` to access search params in loaders:

```tsx
export const Route = createFileRoute("/posts")({
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ deps: { search } }) => {
    return fetchPosts({
      page: search.page,
      filter: search.filter,
    });
  },
});
```

## Writing search params

### Using Link component

Update search params when navigating:

```tsx
function ProductList() {
  return (
    <div>
      {/* Update specific params */}
      <Link
        from="/shop/products"
        search={(prev) => ({ ...prev, page: prev.page + 1 })}
      >
        Next Page
      </Link>

      {/* Set new search params */}
      <Link
        to="/shop/products"
        search={{ page: 1, filter: "electronics", sort: "price" }}
      >
        Electronics
      </Link>

      {/* Update current route search */}
      <Link to="." search={(prev) => ({ ...prev, sort: "newest" })}>
        Sort by Newest
      </Link>
    </div>
  );
}
```

**Generic components across routes:**

```tsx
// For all routes (if page is in root route)
function PageSelector() {
  return (
    <Link to="." search={(prev) => ({ ...prev, page: prev.page + 1 })}>
      Next Page
    </Link>
  );
}

// For specific route subtree
function PostPageSelector() {
  return (
    <Link
      from="/posts"
      search={(prev) => ({ ...prev, page: prev.page + 1 })}
    >
      Next Page
    </Link>
  );
}
```

### Using useNavigate hook

Update search params programmatically:

```tsx
import { useNavigate } from "@tanstack/react-router";

function ProductList() {
  const navigate = useNavigate({ from: "/shop/products" });

  const handleNextPage = () => {
    navigate({
      search: (prev) => ({ ...prev, page: prev.page + 1 }),
    });
  };

  const handleFilter = (filter: string) => {
    navigate({
      search: (prev) => ({ ...prev, filter, page: 1 }),
    });
  };

  return (
    <div>
      <button onClick={handleNextPage}>Next Page</button>
      <button onClick={() => handleFilter("electronics")}>
        Filter Electronics
      </button>
    </div>
  );
}
```

### Using router.navigate

Navigate from anywhere with access to the router instance:

```tsx
import { router } from "./router";

// Navigate from anywhere
router.navigate({
  to: "/shop/products",
  search: { page: 1, filter: "gifts" },
});
```

### Using Navigate component

Redirect with search params:

```tsx
import { Navigate } from "@tanstack/react-router";

function RedirectToFirstPage() {
  return (
    <Navigate
      to="/shop/products"
      search={(prev) => ({ ...prev, page: 1 })}
    />
  );
}
```

## Validating search params

Search params come from user input (the URL), so you should always validate them. TanStack Router supports multiple validation approaches.

### Basic validation

Use a validation function to validate and type search params:

```tsx
// routes/shop.products.tsx
type ProductSearchSortOptions = "newest" | "oldest" | "price";

type ProductSearch = {
  page: number;
  filter: string;
  sort: ProductSearchSortOptions;
};

export const Route = createFileRoute("/shop/products")({
  validateSearch: (search: Record<string, unknown>): ProductSearch => {
    return {
      page: Number(search?.page ?? 1),
      filter: (search.filter as string) || "",
      sort: (search.sort as ProductSearchSortOptions) || "newest",
    };
  },
});
```

### Validation with Zod

Zod is the recommended validation library for TanStack Router. Use the `@tanstack/zod-adapter` for better type inference.

**Basic Zod validation:**

```tsx
import { z } from "zod";

const productSearchSchema = z.object({
  page: z.number().catch(1),
  filter: z.string().catch(""),
  sort: z.enum(["newest", "oldest", "price"]).catch("newest"),
});

export const Route = createFileRoute("/shop/products")({
  validateSearch: productSearchSchema,
});
```

**Zod with adapter (recommended):**

```tsx
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";

const productSearchSchema = z.object({
  page: z.number().default(1),
  filter: z.string().default(""),
  sort: z.enum(["newest", "oldest", "price"]).default("newest"),
});

export const Route = createFileRoute("/shop/products")({
  validateSearch: zodValidator(productSearchSchema),
});

// Now this works without requiring search params:
<Link to="/shop/products" />
```

**Zod with fallback:**

```tsx
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";

const productSearchSchema = z.object({
  page: fallback(z.number(), 1).default(1),
  filter: fallback(z.string(), "").default(""),
  sort: fallback(z.enum(["newest", "oldest", "price"]), "newest").default(
    "newest"
  ),
});

export const Route = createFileRoute("/shop/products")({
  validateSearch: zodValidator(productSearchSchema),
});
```

### Other validation libraries

TanStack Router supports multiple validation libraries:

**Valibot:**

```tsx
import * as v from "valibot";

const productSearchSchema = v.object({
  page: v.optional(v.fallback(v.number(), 1), 1),
  filter: v.optional(v.fallback(v.string(), ""), ""),
  sort: v.optional(
    v.fallback(v.picklist(["newest", "oldest", "price"]), "newest"),
    "newest"
  ),
});

export const Route = createFileRoute("/shop/products")({
  validateSearch: productSearchSchema,
});
```

**ArkType:**

```tsx
import { type } from "arktype";

const productSearchSchema = type({
  page: "number = 1",
  filter: 'string = ""',
  sort: '"newest" | "oldest" | "price" = "newest"',
});

export const Route = createFileRoute("/shop/products")({
  validateSearch: productSearchSchema,
});
```

**Effect/Schema:**

```tsx
import { Schema as S } from "effect";

const productSearchSchema = S.standardSchemaV1(
  S.Struct({
    page: S.NumberFromString.pipe(
      S.optional,
      S.withDefaults({
        constructor: () => 1,
        decoding: () => 1,
      })
    ),
    filter: S.String.pipe(
      S.optional,
      S.withDefaults({
        constructor: () => "",
        decoding: () => "",
      })
    ),
    sort: S.Literal("newest", "oldest", "price").pipe(
      S.optional,
      S.withDefaults({
        constructor: () => "newest" as const,
        decoding: () => "newest" as const,
      })
    ),
  })
);

export const Route = createFileRoute("/shop/products")({
  validateSearch: productSearchSchema,
});
```

> **Good to know:** Use validation adapters (like `zodValidator`) for better type inference and default value handling.

## Search param inheritance

Child routes automatically inherit parent search params and their types:

```tsx
// Parent: /shop/products
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";

const productSearchSchema = z.object({
  page: z.number().default(1),
  filter: z.string().default(""),
});

export const Route = createFileRoute("/shop/products")({
  validateSearch: zodValidator(productSearchSchema),
});

// Child: /shop/products/$productId
export const Route = createFileRoute("/shop/products/$productId")({
  beforeLoad: ({ search }) => {
    // search has ProductSearch type from parent ✅
    console.log(search.page, search.filter);
  },
});
```

Child routes can access parent search params without redefining them. This is useful for shared pagination, filtering, or sorting across a route tree.

## Search middlewares

Middlewares transform search params before href generation and after validation. They're useful for:

- Retaining specific params across navigation
- Stripping default values from URLs
- Custom transformation logic

### Retain search params

Keep specific search params across all navigation:

```tsx
import { retainSearchParams } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";

const searchSchema = z.object({
  theme: z.string().optional(),
  user: z.string().optional(),
  page: z.number().default(1),
});

export const Route = createRootRoute({
  validateSearch: zodValidator(searchSchema),
  search: {
    middlewares: [retainSearchParams(["theme", "user"])],
  },
});
```

Now `theme` and `user` will persist across all navigation, even when navigating to routes that don't define them.

### Strip default values

Remove search params that match default values to keep URLs clean:

```tsx
import { stripSearchParams } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";

const searchSchema = z.object({
  page: z.number().default(1),
  sort: z.enum(["newest", "oldest", "price"]).default("newest"),
});

const defaultValues = {
  page: 1,
  sort: "newest",
};

export const Route = createFileRoute("/posts")({
  validateSearch: zodValidator(searchSchema),
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
});
```

URLs will only include search params when they differ from defaults.

### Custom middleware

Create custom middleware for transformation logic:

```tsx
export const Route = createRootRoute({
  validateSearch: zodValidator(searchSchema),
  search: {
    middlewares: [
      ({ search, next }) => {
        const result = next(search);
        return {
          rootValue: search.rootValue,
          ...result,
        };
      },
    ],
  },
});
```

### Chaining middlewares

Combine multiple middlewares:

```tsx
export const Route = createFileRoute("/search")({
  validateSearch: zodValidator(searchSchema),
  search: {
    middlewares: [
      retainSearchParams(["theme", "user"]),
      stripSearchParams({ page: 1, sort: "newest" }),
    ],
  },
});
```

Middlewares run in order, so you can chain transformations.

## Common patterns

### Pagination

```tsx
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";

const paginationSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
});

export const Route = createFileRoute("/posts")({
  validateSearch: zodValidator(paginationSchema),
  component: PostList,
});

function PostList() {
  const { page, limit } = Route.useSearch();

  return (
    <div>
      <Link search={(prev) => ({ ...prev, page: prev.page + 1 })}>
        Next
      </Link>
    </div>
  );
}
```

### Filtering and sorting

```tsx
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";

const filterSchema = z.object({
  category: z.string().optional(),
  sort: z.enum(["name", "date", "price"]).default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export const Route = createFileRoute("/products")({
  validateSearch: zodValidator(filterSchema),
  component: ProductList,
});

function ProductList() {
  const { category, sort, order } = Route.useSearch();

  return (
    <div>
      <Link search={{ category: "electronics", sort: "price" }}>
        Electronics by Price
      </Link>
    </div>
  );
}
```

### Search with debouncing

```tsx
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

function SearchInput() {
  const navigate = useNavigate({ from: "/search" });
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate({ search: (prev) => ({ ...prev, q: query }) });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, navigate]);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

## Best practices

### Always validate search params

Search params come from user input (the URL), so always validate them:

```tsx
// ✅ Good - Validated
export const Route = createFileRoute("/products")({
  validateSearch: zodValidator(productSearchSchema),
});

// ❌ Bad - Not validated
export const Route = createFileRoute("/products")({
  // No validation - unsafe!
});
```

### Use validation adapters

Use adapters (like `zodValidator`) for better type inference and default value handling:

```tsx
// ✅ Good - Using adapter
import { zodValidator } from "@tanstack/zod-adapter";

export const Route = createFileRoute("/products")({
  validateSearch: zodValidator(productSearchSchema),
});

// ⚠️ Works but less type-safe
export const Route = createFileRoute("/products")({
  validateSearch: productSearchSchema,
});
```

### Provide sensible defaults

Use `.default()` or `.catch()` for graceful error handling:

```tsx
// ✅ Good - Has defaults
const schema = z.object({
  page: z.number().default(1),
  sort: z.enum(["newest", "oldest"]).default("newest"),
});

// ❌ Bad - No defaults, will error if missing
const schema = z.object({
  page: z.number(),
  sort: z.enum(["newest", "oldest"]),
});
```

### Leverage inheritance

Define common search params in parent routes:

```tsx
// ✅ Good - Define in parent, inherit in children
// Parent route
export const Route = createFileRoute("/shop")({
  validateSearch: zodValidator(paginationSchema),
});

// Child route inherits pagination
export const Route = createFileRoute("/shop/products")({
  // Automatically has page, limit from parent
});
```

### Use `from` prop for type safety

Always provide the `from` prop when using navigation hooks:

```tsx
// ✅ Good - Type-safe
const navigate = useNavigate({ from: "/shop/products" });
const search = useSearch({ from: "/shop/products" });

// ⚠️ Works but less type-safe
const navigate = useNavigate();
const search = useSearch({ strict: false });
```

### Consider performance

Complex objects have serialization costs. Keep search params simple:

```tsx
// ✅ Good - Simple structure
search={{ page: 1, filter: "electronics" }}

// ⚠️ Avoid - Complex nested structures
search={{
  filters: {
    categories: ["electronics", "gifts"],
    priceRange: { min: 0, max: 100 },
  },
}}
```

### Use middlewares for common patterns

Use middlewares for patterns like retaining or stripping params:

```tsx
// ✅ Good - Middleware handles it
search: {
  middlewares: [retainSearchParams(["theme"])],
}

// ⚠️ Avoid - Manual handling everywhere
// Would need to manually add theme to every navigation
```
