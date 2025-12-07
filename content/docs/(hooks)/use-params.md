---
title: useParams
description: Access path parameters from the current route with type safety.
---

The `useParams` hook returns path parameters from the current route and its parent routes. It provides type-safe access to dynamic URL segments defined with the `$` syntax.

## Basic usage

### Get all parameters

Access all path parameters with type safety:

```tsx
import { useParams } from "@tanstack/react-router";

function PostPage() {
  const params = useParams({ from: "/posts/$postId" });
  // params has type-safe access to postId

  return <div>Post ID: {params.postId}</div>;
}
```

### Using Route API

For route components, use the Route API for automatic typing:

```tsx
import { getRouteApi } from "@tanstack/react-router";

const routeApi = getRouteApi("/posts/$postId");

function PostComponent() {
  const params = routeApi.useParams();
  // Automatically typed for this route

  return <div>Post: {params.postId}</div>;
}
```

> **Good to know:** Always provide the `from` option for better type safety and performance. In route components, use `Route.useParams()` instead.

### Select specific parameters

Use `select` to extract only the parameters you need:

```tsx
function Component() {
  const postId = useParams({
    from: "/posts/$postId",
    select: (params) => params.postId,
  });

  return <div>Post ID: {postId}</div>;
}
```

This prevents unnecessary re-renders when other parameters change.

## Options

### Loose typing

Get parameters from any route without strict typing:

```tsx
function Component() {
  // Get params from any route (loose typing)
  const looseParams = useParams({ strict: false });

  // postId might be undefined
  return <div>{looseParams.postId || "No post ID"}</div>;
}
```

> **Note:** Avoid `strict: false` when possible. It reduces type safety and makes your code less maintainable.

### No throw

Prevent errors when the route doesn't match:

```tsx
function Component() {
  // Don't throw if no match found
  const params = useParams({
    from: "/posts/$postId",
    shouldThrow: false,
  });

  if (!params) return <div>No params available</div>;

  return <div>Post: {params.postId}</div>;
}
```

## Common use cases

### Nested routes

Access parameters from nested routes:

```tsx
// Parent route: /users/$userId
// Child route: /users/$userId/posts/$postId

function UserPostComponent() {
  const params = useParams({
    from: "/users/$userId/posts/$postId",
  });

  // Access both userId and postId
  return (
    <div>
      User: {params.userId}
      Post: {params.postId}
    </div>
  );
}
```

### Conditional rendering

Use parameters to conditionally render content:

```tsx
function PostComponent() {
  const hasId = useParams({
    from: "/posts/$postId",
    select: (params) => Boolean(params.postId),
  });

  if (!hasId) return <div>No post selected</div>;

  return <PostContent />;
}
```

### Custom hooks

Create reusable hooks for common parameter patterns:

```tsx
function usePostId() {
  return useParams({
    from: "/posts/$postId",
    select: (params) => params.postId,
  });
}

function useCurrentUser() {
  return useParams({
    from: "/users/$userId",
    select: (params) => params.userId,
  });
}

// Usage
function Component() {
  const postId = usePostId();
  const userId = useCurrentUser();

  return (
    <div>
      User {userId} viewing post {postId}
    </div>
  );
}
```

### Parameter validation

Validate parameters before using them:

```tsx
function PostPage() {
  const postId = useParams({
    from: "/posts/$postId",
    select: (params) => params.postId,
  });

  useEffect(() => {
    if (!postId || !/^\d+$/.test(postId)) {
      // Handle invalid postId
      console.error("Invalid post ID");
    }
  }, [postId]);

  return <div>Post {postId}</div>;
}
```

## Best practices

### Use `from` option

Always provide the `from` option for better type safety and performance:

```tsx
// ✅ Good - Type-safe
const params = useParams({ from: "/posts/$postId" });

// ⚠️ Avoid - Less type-safe
const params = useParams({ strict: false });
```

### Prefer Route API in route components

Use `Route.useParams()` in route components for automatic typing:

```tsx
// ✅ Good - In route component
export const Route = createFileRoute("/posts/$postId")({
  component: PostPage,
});

function PostPage() {
  const params = Route.useParams();
  return <div>{params.postId}</div>;
}

// ⚠️ Works but less convenient
function PostPage() {
  const params = useParams({ from: "/posts/$postId" });
  return <div>{params.postId}</div>;
}
```

### Use `select` for performance

Extract only the parameters you need to prevent unnecessary re-renders:

```tsx
// ❌ Bad - Re-renders when any param changes
function BadExample() {
  const params = useParams({ from: "/posts/$postId" });
  return <div>{params.postId}</div>;
}

// ✅ Good - Only re-renders when postId changes
function GoodExample() {
  const postId = useParams({
    from: "/posts/$postId",
    select: (params) => params.postId,
  });
  return <div>{postId}</div>;
}
```

### Handle undefined values

Always handle undefined when using `strict: false` or `shouldThrow: false`:

```tsx
// ✅ Good - Handles undefined
function Component() {
  const params = useParams({
    from: "/posts/$postId",
    shouldThrow: false,
  });

  if (!params) return <div>No params available</div>;
  return <div>{params.postId}</div>;
}

// ❌ Bad - Assumes params exists
function Component() {
  const params = useParams({
    from: "/posts/$postId",
    shouldThrow: false,
  });
  return <div>{params.postId}</div>; // Could be undefined!
}
```

## Performance optimization

The `select` option is crucial for performance. It prevents re-renders when unrelated parameters change:

```tsx
// ❌ Re-renders when any param changes
function BadExample() {
  const params = useParams({ from: "/posts/$postId" });
  return <div>{params.postId}</div>;
}

// ✅ Only re-renders when postId changes
function GoodExample() {
  const postId = useParams({
    from: "/posts/$postId",
    select: (params) => params.postId,
  });
  return <div>{postId}</div>;
}
```

**When to use `select`:**
- When you only need specific parameters
- When you want to prevent unnecessary re-renders
- When extracting derived values from parameters

**When not to use `select`:**
- When you need all parameters
- When the selector function is complex (consider memoization)
