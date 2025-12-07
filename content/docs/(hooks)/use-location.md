---
title: useLocation
description: Access current location information including pathname, search params, hash, and other URL data.
---

The `useLocation` hook returns the current location object containing pathname, search params, hash, and other URL information. It's useful for tracking, conditional rendering, and building navigation UI.

## Basic usage

### Get complete location

Access all location information:

```tsx
import { useLocation } from "@tanstack/react-router";

function Component() {
  const location = useLocation();

  console.log(location.pathname); // '/blog/posts'
  console.log(location.search); // { page: 1, filter: 'tech' }
  console.log(location.hash); // 'section-1'

  return <div>Current path: {location.pathname}</div>;
}
```

**Location object properties:**

- `pathname` - The path portion of the URL
- `search` - Validated search parameters object
- `hash` - The hash portion of the URL (without `#`)
- `state` - History state object
- `href` - The complete URL

### Select specific data

Use `select` to extract only the parts you need:

```tsx
function Component() {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  const searchParams = useLocation({
    select: (location) => location.search,
  });

  return (
    <div>
      Path: {pathname}
      <br />
      Search: {JSON.stringify(searchParams)}
    </div>
  );
}
```

This prevents unnecessary re-renders when other location properties change.

## Common use cases

### Page tracking

Track page views for analytics:

```tsx
function PageTracker() {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  useEffect(() => {
    analytics.track("page_view", { path: pathname });
  }, [pathname]);

  return null;
}
```

### Conditional rendering

Render different UI based on the current path:

```tsx
function Navigation() {
  const isAuthPage = useLocation({
    select: (location) => location.pathname.startsWith("/auth"),
  });

  if (isAuthPage) return <SimpleNav />;
  return <MainNav />;
}
```

### Breadcrumbs

Build breadcrumb navigation from the pathname:

```tsx
function Breadcrumbs() {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav>
      <Link to="/">Home</Link>
      {segments.map((segment, index) => {
        const path = "/" + segments.slice(0, index + 1).join("/");
        return (
          <span key={path}>
            {" > "}
            <Link to={path}>{segment}</Link>
          </span>
        );
      })}
    </nav>
  );
}
```

### Custom hooks

Create reusable hooks for common location patterns:

```tsx
function useCurrentSection() {
  return useLocation({
    select: (location) => location.pathname.split("/")[1] || "home",
  });
}

function useQueryParam(key: string) {
  return useLocation({
    select: (location) => location.search[key],
  });
}

// Usage
function Component() {
  const section = useCurrentSection();
  const theme = useQueryParam("theme");

  return <div data-section={section} data-theme={theme} />;
}
```

### Hash-based navigation

Track hash changes for scroll-to-section functionality:

```tsx
function HashTracker() {
  const hash = useLocation({
    select: (location) => location.hash,
  });

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash]);

  return null;
}
```

## Best practices

### Use `select` for performance

Only subscribe to the location data you need:

```tsx
// ❌ Re-renders on any location change
function BadExample() {
  const location = useLocation();
  return <div>{location.pathname}</div>;
}

// ✅ Only re-renders when pathname changes
function GoodExample() {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });
  return <div>{pathname}</div>;
}
```

### Memoize complex selectors

For complex selectors, use `useMemo` to prevent unnecessary recalculations:

```tsx
import { useMemo } from "react";

function Component() {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  const segments = useMemo(
    () => pathname.split("/").filter(Boolean),
    [pathname]
  );

  return <div>{segments.join(" > ")}</div>;
}
```

### Create custom hooks

Extract location logic into reusable hooks:

```tsx
// ✅ Good - Reusable hook
function useIsRoute(path: string) {
  return useLocation({
    select: (location) => location.pathname === path,
  });
}

// Usage
function Component() {
  const isHome = useIsRoute("/");
  return isHome ? <HomeContent /> : <OtherContent />;
}
```

### Handle undefined values

Location might be undefined initially, so handle it gracefully:

```tsx
// ✅ Good - Handles undefined
function Component() {
  const pathname = useLocation({
    select: (location) => location?.pathname,
  });

  if (!pathname) return <div>Loading...</div>;
  return <div>{pathname}</div>;
}
```

## Performance optimization

The `select` option is crucial for performance. It prevents re-renders when unrelated location properties change:

```tsx
// ❌ Re-renders on any location change
function BadExample() {
  const location = useLocation();
  return <div>{location.pathname}</div>;
}

// ✅ Only re-renders when pathname changes
function GoodExample() {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });
  return <div>{pathname}</div>;
}
```

**When to use `select`:**

- When you only need specific location properties
- When you want to prevent unnecessary re-renders
- When extracting derived values from location

**When not to use `select`:**

- When you need multiple location properties
- When the selector function is complex (consider memoization)
