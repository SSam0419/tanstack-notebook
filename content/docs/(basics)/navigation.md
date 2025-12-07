---
title: Navigation
description: Learn how to navigate between routes in TanStack Router using Link, useNavigate, and other navigation methods.
---

TanStack Router provides multiple ways to navigate between routes. All navigation is **relative**—you navigate **from** one route **to** another. Every navigation API uses:

- `from` - The origin route path (optional, defaults to root `/`)
- `to` - The destination route path

## Link component `<Link/>`

The `<Link>` component is the primary way to navigate in TanStack Router. Use it for most user-triggered navigation.

### Basic navigation

```tsx
import { Link } from "@tanstack/react-router";

// Navigate to a route
<Link to="/about">About</Link>;
```

### Dynamic routes with parameters

When navigating to routes with path parameters, provide the `params` prop:

```tsx
<Link to="/blog/post/$postId" params={{ postId: "my-first-blog-post" }}>
  Read Post
</Link>
```

### Relative navigation

You can navigate relative to the current route using relative paths:

```tsx
// From /blog/post/123
<Link
  from="/blog/post/$postId"
  to="../categories"
>
  Categories
</Link>

// Special relative paths
<Link to=".">Reload current route</Link>
<Link to="..">Go to parent route</Link>
```

### Search parameters

Add or update search parameters (query strings) in the URL:

```tsx
// Add search parameters
<Link
  to="/search"
  search={{ query: 'tanstack', page: 1 }}
>
  Search
</Link>

// Update existing search parameters
<Link
  to="."
  search={(prev) => ({ ...prev, page: prev.page + 1 })}
>
  Next Page
</Link>
```

## Using the useNavigate hook

Use the `useNavigate` hook for programmatic navigation triggered by side effects, such as:

- Form submissions
- API responses
- Event handlers
- Conditional redirects

```tsx
import { useNavigate } from "@tanstack/react-router";

function CreatePost() {
  const navigate = useNavigate({ from: "/posts/$postId" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/posts", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const { id: postId } = await response.json();
      navigate({ to: "/posts/$postId", params: { postId } });
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Navigate component `<Navigate/>`

The `<Navigate>` component performs immediate redirects when a component mounts. This is useful for:

- Conditional redirects based on authentication
- Redirecting after route validation
- Client-side redirects

```tsx
import { Navigate } from "@tanstack/react-router";

function ProtectedRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Dashboard />;
}
```

> **Note:** `<Navigate>` is client-side only. For server-side redirects, handle them in your server code.

## Using router.navigate

Access navigation from anywhere you have the router instance. This is useful for:

- Utility functions
- Global event handlers
- Navigation outside React components

```tsx
import { router } from "./router";

// Navigate from anywhere
router.navigate({ to: "/dashboard" });
```

## Optional parameters

Optional parameters use the `{-$paramName}` syntax, allowing routes to work with or without certain path segments.

```tsx
// Navigate with optional parameter included
<Link
  to="/posts/{-$category}"
  params={{ category: 'tech' }}
>
  Tech Posts
</Link>

// Remove optional parameter (goes to /posts)
<Link
  to="/posts/{-$category}"
  params={{ category: undefined }}
>
  All Posts
</Link>

// Inherit current parameters (keeps existing category)
<Link
  to="/posts/{-$category}"
  params={{}}
>
  Current Category
</Link>

// Function-style parameter updates
<Link
  to="/posts/{-$category}"
  params={(prev) => ({ ...prev, category: 'news' })}
>
  News Articles
</Link>
```

## Active link states

The `<Link>` component provides several ways to handle active states for navigation items.

### Using render props

Access the active state directly through render props:

```tsx
<Link to="/blog/post">
  {({ isActive }) => (
    <span className={isActive ? "active" : "inactive"}>My Blog Post</span>
  )}
</Link>
```

### Using activeProps and inactiveProps

Apply different props based on active state:

```tsx
<Link
  to="/dashboard"
  activeProps={{
    style: { fontWeight: "bold" },
    className: "active-link",
  }}
  inactiveProps={{
    className: "inactive-link",
  }}
  activeOptions={{
    exact: true, // Match exactly (no children)
    includeHash: false, // Include hash in matching
    includeSearch: true, // Include search params in matching
  }}
>
  Dashboard
</Link>
```

### Using data-status attribute

The component automatically adds `data-status="active"` when the link is active, allowing you to style it with CSS:

```tsx
<Link to="/about" className="nav-link">
  About
</Link>

/* CSS */
.nav-link[data-status="active"] {
  font-weight: bold;
}
```

## Route preloading

Improve perceived performance by preloading routes before users click. This reduces the delay when navigating to preloaded routes.

```tsx
<Link
  to="/blog/post/$postId"
  params={{ postId: "123" }}
  preload="intent" // Preload on hover/touch
  preloadDelay={100} // Delay before preloading (ms)
>
  Blog Post
</Link>
```

**Preload options:**

- `"intent"` - Preload when user hovers or touches the link
- `"render"` - Preload when the link is rendered
- `false` - Disable preloading (default)

## Route matching

Check if specific routes are currently matched to conditionally render UI or trigger side effects.

### Using useMatchRoute hook

Use the hook to programmatically check route matches:

```tsx
import { useMatchRoute } from "@tanstack/react-router";

function Navigation() {
  const matchRoute = useMatchRoute();

  useEffect(() => {
    if (matchRoute({ to: "/users", pending: true })) {
      console.log("Users route is matched and pending");
    }
  }, [matchRoute]);

  return <Link to="/users">Users</Link>;
}
```

### Using MatchRoute component

Render content conditionally based on route matching:

```tsx
import { MatchRoute } from "@tanstack/react-router";

function Navigation() {
  return (
    <Link to="/users">
      Users
      <MatchRoute to="/users" pending>
        <Spinner />
      </MatchRoute>
    </Link>
  );
}

// With function children
<MatchRoute to="/users" pending>
  {(match) => <Spinner show={match} />}
</MatchRoute>;
```

## Navigation options

All navigation APIs accept a consistent set of options:

```tsx
interface NavigateOptions {
  from?: string; // Origin route (for type safety)
  to: string; // Destination route
  params?: object | function; // Path parameters
  search?: object | function; // Query parameters
  hash?: string | function; // URL hash
  state?: object | function; // History state
  replace?: boolean; // Replace vs push history entry
  resetScroll?: boolean; // Reset scroll position on navigation
  hashScrollIntoView?: boolean; // Scroll to hash element
  viewTransition?: boolean; // Enable browser view transitions
  ignoreBlocker?: boolean; // Ignore navigation blockers
  reloadDocument?: boolean; // Force full page reload
  href?: string; // External navigation URL
}
```

### Common options

**Replace history entry:**

```tsx
// Replace current history entry instead of adding new one
<Link to="/login" replace>
  Login
</Link>
```

**Reset scroll position:**

```tsx
// Reset scroll to top on navigation
<Link to="/about" resetScroll>
  About
</Link>
```

**View transitions:**

```tsx
// Enable browser view transitions API
<Link to="/blog" viewTransition>
  Blog
</Link>
```

## Type safety

TanStack Router provides full TypeScript support with compile-time validation:

- Auto-completion for route paths
- Type checking for path parameters
- Compile-time validation of navigation options
- IntelliSense for search params and route structure

```tsx
// TypeScript enforces correct parameter types
<Link
  to="/users/$userId/posts/$postId"
  params={{
    userId: "123", // Required and type-checked
    postId: "456", // Required and type-checked
  }}
>
  User Post
</Link>
```

## Best practices

### Use Link for user interactions

Always use `<Link>` for user-triggered navigation. It provides better accessibility, keyboard navigation, and browser features like right-click and cmd+click.

```tsx
// ✅ Good
<Link to="/about">About</Link>

// ❌ Avoid
<button onClick={() => navigate({ to: "/about" })}>About</button>
```

### Use useNavigate for side effects

Use `useNavigate` for programmatic navigation triggered by side effects like form submissions or API responses.

```tsx
// ✅ Good
const navigate = useNavigate();
const handleSubmit = async () => {
  await createPost();
  navigate({ to: "/posts" });
};
```

### Provide from route when possible

Providing the `from` route improves type safety and enables better auto-completion in TypeScript.

```tsx
// ✅ Good - Better type safety
const navigate = useNavigate({ from: "/posts/$postId" });

// ⚠️ Works but less type-safe
const navigate = useNavigate();
```

### Use relative navigation

Relative navigation is more maintainable when refactoring routes and provides better type safety.

```tsx
// ✅ Good - Relative navigation
<Link from="/blog/post/$postId" to="../categories">
  Categories
</Link>

// ⚠️ Works but less maintainable
<Link to="/blog/categories">Categories</Link>
```

### Leverage preloading

Use `preload="intent"` on frequently accessed links to improve perceived performance.

```tsx
// ✅ Good - Preload on hover
<Link to="/dashboard" preload="intent">
  Dashboard
</Link>
```

### Handle server redirects on server

Don't use client navigation for initial page redirects. Handle them server-side for better SEO and performance.

```tsx
// ✅ Good - Server-side redirect
// In your server code
if (!user) {
  return redirect("/login");
}

// ❌ Avoid - Client-side redirect for initial load
function Page() {
  if (!user) {
    return <Navigate to="/login" />;
  }
}
```
