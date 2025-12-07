---
title: useSearch
description: Access validated search parameters (query strings) from the current route with type safety.
---

The `useSearch` hook returns validated search parameters from the current route. It provides type-safe access to URL query parameters based on your route's validation schema.

## Basic usage

### Get search parameters

Access search parameters with type safety:

```tsx
import { useSearch } from "@tanstack/react-router";

function PostsPage() {
  const search = useSearch({ from: "/posts" });
  // search has validated types from route schema

  return <div>Page: {search.page}</div>;
}
```

### Using Route API

For route components, use the Route API for automatic typing:

```tsx
import { getRouteApi } from "@tanstack/react-router";

const routeApi = getRouteApi("/posts");

function PostsComponent() {
  const search = routeApi.useSearch();
  // Automatically typed for this route

  return <div>Filter: {search.filter}</div>;
}
```

> **Good to know:** Always provide the `from` option for better type safety and performance. In route components, use `Route.useSearch()` instead.

### Select specific parameters

Use `select` to extract only the parameters you need:

```tsx
function Component() {
  const page = useSearch({
    from: "/posts",
    select: (search) => search.page,
  });

  return <div>Current page: {page}</div>;
}
```

This prevents unnecessary re-renders when other search parameters change.

## Options

### Loose typing

Get search parameters from any route without strict typing:

```tsx
function Component() {
  // Get search from any route (loose typing)
  const looseSearch = useSearch({ strict: false });

  // Properties might be undefined
  return <div>{looseSearch.page || 1}</div>;
}
```

> **Note:** Avoid `strict: false` when possible. It reduces type safety and makes your code less maintainable.

### No throw

Prevent errors when the route doesn't match:

```tsx
function Component() {
  // Don't throw if no match found
  const search = useSearch({
    from: "/posts",
    shouldThrow: false,
  });

  if (!search) return <div>No search available</div>;

  return <div>Page: {search.page}</div>;
}
```

## Common use cases

### Pagination

Access pagination parameters:

```tsx
function PostsList() {
  const { page, limit } = useSearch({ from: "/posts" });

  const { data } = useQuery({
    queryKey: ["posts", page, limit],
    queryFn: () => fetchPosts({ page, limit }),
  });

  return <div>{/* Render posts */}</div>;
}
```

### Filtering

Access filter parameters:

```tsx
function ProductsPage() {
  const { category, minPrice, maxPrice } = useSearch({
    from: "/products",
  });

  const filteredProducts = products.filter((product) => {
    if (category && product.category !== category) return false;
    if (minPrice && product.price < minPrice) return false;
    if (maxPrice && product.price > maxPrice) return false;
    return true;
  });

  return <div>{/* Render filtered products */}</div>;
}
```

### Search query

Extract a search query parameter:

```tsx
function SearchPage() {
  const query = useSearch({
    from: "/search",
    select: (search) => search.q || "",
  });

  const { data } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchAPI(query),
    enabled: query.length > 0,
  });

  return <div>Results for: {query}</div>;
}
```

### Custom hooks

Create reusable hooks for common search parameter patterns:

```tsx
function useCurrentPage() {
  return useSearch({
    from: "/posts",
    select: (search) => search.page || 1,
  });
}

function useActiveFilters() {
  return useSearch({
    from: "/products",
    select: (search) => ({
      category: search.category,
      priceRange: [search.minPrice, search.maxPrice],
    }),
  });
}

// Usage
function Component() {
  const currentPage = useCurrentPage();
  const filters = useActiveFilters();

  return (
    <div>
      Page {currentPage} with filters: {filters.category}
    </div>
  );
}
```

## Best practices

### Use `from` option

Always provide the `from` option for better type safety and performance:

```tsx
// ✅ Good - Type-safe
const search = useSearch({ from: "/posts" });

// ⚠️ Avoid - Less type-safe
const search = useSearch({ strict: false });
```

### Prefer Route API in route components

Use `Route.useSearch()` in route components for automatic typing:

```tsx
// ✅ Good - In route component
export const Route = createFileRoute("/posts")({
  component: PostsPage,
});

function PostsPage() {
  const search = Route.useSearch();
  return <div>{search.page}</div>;
}

// ⚠️ Works but less convenient
function PostsPage() {
  const search = useSearch({ from: "/posts" });
  return <div>{search.page}</div>;
}
```

### Use `select` for performance

Extract only the parameters you need to prevent unnecessary re-renders:

```tsx
// ❌ Bad - Re-renders when any search param changes
function BadExample() {
  const search = useSearch({ from: "/posts" });
  return <div>{search.page}</div>;
}

// ✅ Good - Only re-renders when page changes
function GoodExample() {
  const page = useSearch({
    from: "/posts",
    select: (search) => search.page,
  });
  return <div>{page}</div>;
}
```

### Handle defaults

Provide fallback values for optional parameters:

```tsx
// ✅ Good - Has default
const page = useSearch({
  from: "/posts",
  select: (search) => search.page || 1,
});

// ❌ Bad - Could be undefined
const page = useSearch({
  from: "/posts",
  select: (search) => search.page,
});
```

## Performance optimization

The `select` option is crucial for performance. It prevents re-renders when unrelated search parameters change:

```tsx
// ❌ Re-renders when any search param changes
function BadExample() {
  const search = useSearch({ from: "/posts" });
  return <div>{search.page}</div>;
}

// ✅ Only re-renders when page changes
function GoodExample() {
  const page = useSearch({
    from: "/posts",
    select: (search) => search.page,
  });
  return <div>{page}</div>;
}
```

**When to use `select`:**
- When you only need specific parameters
- When you want to prevent unnecessary re-renders
- When extracting derived values from search params

**When not to use `select`:**
- When you need all search parameters
- When the selector function is complex (consider memoization)
