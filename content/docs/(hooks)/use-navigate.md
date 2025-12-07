---
title: useNavigate
description: Navigate programmatically in TanStack Router for side effects like form submissions and API responses.
---

The `useNavigate` hook returns a `navigate` function for programmatic navigation. Use it for navigation triggered by side effects like form submissions, API responses, or event handlers—not for user clicks (use `<Link>` instead).

## Basic usage

### Get navigate function

Get the navigate function for programmatic navigation:

```tsx
import { useNavigate } from "@tanstack/react-router";

function Component() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({ to: "/posts" });
  };

  return <button onClick={handleClick}>Go to Posts</button>;
}
```

### With `from` option

Provide the `from` option for better type safety:

```tsx
function PostsPage() {
  const navigate = useNavigate({ from: "/posts" });

  const handlePageChange = (page: number) => {
    navigate({ search: { page } });
  };

  return <button onClick={() => handlePageChange(2)}>Page 2</button>;
}
```

> **Good to know:** Always provide the `from` option when possible for better type safety and autocomplete.

## Navigation options

### Path navigation

Navigate to routes with path parameters:

```tsx
function Component() {
  const navigate = useNavigate();

  const goToPost = (postId: string) => {
    navigate({
      to: "/posts/$postId",
      params: { postId },
    });
  };

  return <button onClick={() => goToPost("123")}>View Post</button>;
}
```

### Search parameters

Update search parameters:

```tsx
function SearchForm() {
  const navigate = useNavigate({ from: "/search" });

  const handleSubmit = (query: string) => {
    navigate({
      search: { q: query, page: 1 },
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        handleSubmit(formData.get("query") as string);
      }}
    >
      <input name="query" />
      <button type="submit">Search</button>
    </form>
  );
}
```

### Hash and state

Navigate with hash fragments and state:

```tsx
function Component() {
  const navigate = useNavigate();

  const scrollToSection = () => {
    navigate({
      to: "/docs",
      hash: "getting-started",
    });
  };

  const navigateWithState = () => {
    navigate({
      to: "/profile",
      state: { from: "dashboard" },
    });
  };

  return (
    <div>
      <button onClick={scrollToSection}>Go to Section</button>
      <button onClick={navigateWithState}>Profile</button>
    </div>
  );
}
```

### Replace vs push

Control whether to replace or push history entries:

```tsx
function Component() {
  const navigate = useNavigate();

  const redirect = () => {
    // Replace current history entry (no back button)
    navigate({
      to: "/login",
      replace: true,
    });
  };

  const pushNew = () => {
    // Add new history entry (default)
    navigate({
      to: "/posts",
      replace: false, // or omit
    });
  };

  return (
    <div>
      <button onClick={redirect}>Redirect</button>
      <button onClick={pushNew}>Navigate</button>
    </div>
  );
}
```

> **Good to know:** Use `replace: true` for redirects (like after login). Use `replace: false` (default) for regular navigation.

## Common use cases

### Form submission

Navigate after successful form submission:

```tsx
function CreatePostForm() {
  const navigate = useNavigate();

  const handleSubmit = async (formData: FormData) => {
    try {
      const response = await createPost(formData);
      navigate({
        to: "/posts/$postId",
        params: { postId: response.id },
      });
    } catch (error) {
      // Handle error
      console.error("Failed to create post:", error);
    }
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

### Authentication flow

Redirect after login or logout:

```tsx
function LoginForm() {
  const navigate = useNavigate();

  const handleLogin = async (credentials: Credentials) => {
    try {
      await login(credentials);
      navigate({ to: "/dashboard" });
    } catch (error) {
      setError("Invalid credentials");
    }
  };

  return <form onSubmit={handleLogin}>{/* Login form */}</form>;
}
```

### Pagination

Update search parameters for pagination:

```tsx
function PostsList() {
  const navigate = useNavigate({ from: "/posts" });
  const { page } = useSearch({ from: "/posts" });

  const goToPage = (newPage: number) => {
    navigate({
      search: (prev) => ({ ...prev, page: newPage }),
    });
  };

  return (
    <div>
      <button onClick={() => goToPage(page - 1)}>Previous</button>
      <span>Page {page}</span>
      <button onClick={() => goToPage(page + 1)}>Next</button>
    </div>
  );
}
```

## Advanced options

### Function-style parameters

Use functions to modify existing parameters:

```tsx
function Component() {
  const navigate = useNavigate({ from: "/posts/$postId" });

  const updateFilters = (category: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        category,
        page: 1, // Reset page when changing filters
      }),
    });
  };

  return (
    <button onClick={() => updateFilters("tech")}>Tech Posts</button>
  );
}
```

### Navigation with promise

`navigate` returns a promise that resolves when navigation completes:

```tsx
function Component() {
  const navigate = useNavigate();

  const handleAsyncNavigation = async () => {
    try {
      await navigate({ to: "/posts" });
      console.log("Navigation completed");
    } catch (error) {
      console.error("Navigation failed:", error);
    }
  };

  return <button onClick={handleAsyncNavigation}>Navigate</button>;
}
```

## Best practices

### Use for side effects, not user clicks

Use `useNavigate` for programmatic navigation, not for clickable UI elements:

```tsx
// ✅ Good - Form submission
const handleSubmit = async () => {
  await saveData();
  navigate({ to: "/success" });
};

// ❌ Bad - Use <Link> instead
<button onClick={() => navigate({ to: "/posts" })}>Posts</button>
```

### Prefer Link for UI

Use `<Link>` for clickable elements:

```tsx
// ✅ Good - User interaction
<Link to="/posts">View Posts</Link>

// ❌ Bad - Should use <Link>
<button onClick={() => navigate({ to: "/posts" })}>View Posts</button>
```

### Specify `from` option

Always provide the `from` option for better type safety:

```tsx
// ✅ Good - Type-safe
const navigate = useNavigate({ from: "/posts" });

// ⚠️ Works but less type-safe
const navigate = useNavigate();
```

### Handle navigation errors

Wrap navigation in try/catch for async operations:

```tsx
// ✅ Good - Handles errors
const handleNavigation = async () => {
  try {
    await navigate({ to: "/posts" });
  } catch (error) {
    console.error("Navigation failed:", error);
  }
};

// ❌ Bad - No error handling
const handleNavigation = () => {
  navigate({ to: "/posts" });
};
```

### Use replace wisely

Use `replace: true` for redirects, not regular navigation:

```tsx
// ✅ Good - Redirect after login
const handleLogin = async () => {
  await login();
  navigate({ to: "/dashboard", replace: true });
};

// ❌ Bad - Regular navigation shouldn't replace
const handleClick = () => {
  navigate({ to: "/posts", replace: true });
};
```

## Common patterns

### Success redirect

Redirect after successful operation:

```tsx
const handleSubmit = async (data) => {
  await saveData(data);
  navigate({ to: "/success" });
};
```

### Conditional navigation

Navigate based on conditions:

```tsx
const handleAction = () => {
  if (user.isAuthenticated) {
    navigate({ to: "/dashboard" });
  } else {
    navigate({ to: "/login" });
  }
};
```

### Back navigation

Navigate to parent route:

```tsx
const goBack = () => {
  navigate({ to: ".." });
};
```

### Reset scroll position

Reset scroll position on navigation:

```tsx
const navigateToTop = () => {
  navigate({
    to: "/posts",
    resetScroll: true,
  });
};
```
