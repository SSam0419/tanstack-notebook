---
title: Layouts and Pages
description: Learn how to create layouts and pages in TanStack Router using file-based routing.
---

TanStack Router uses **file-system based routing**, meaning you can use files and folders to define routes. You can organize routes using either flat file structures or nested folders — both approaches work identically.

## The root layout

Every TanStack Router application requires a root layout. Create it by adding `__root.tsx` at the root of your `routes` directory.

```tsx
// routes/__root.tsx
import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => <Outlet />,
});
```

The root layout wraps all routes in your application. It's the only required layout file.

> **Good to know:** In TanStack Router, you use `<Outlet />` instead of `{children}` to render child routes. This is different from Next.js.

## Creating pages

Pages are React components that render at specific routes. You can create pages using `index.tsx` files or standalone route files.

### Index pages

Create an index page by adding `index.tsx` to your `routes` directory:

```tsx
// routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return <div>Welcome to my app</div>;
}
```

This creates a route at `/` that renders the `HomePage` component.

> **Note:** Make sure your dev server is running (`npm run dev` or `bun dev`) when creating new routes.

### Standalone pages

Create standalone pages by adding files that don't have child routes:

```tsx
// routes/about.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return <div>About us</div>;
}
```

This creates a route at `/about`.

> **Note:** If you want `about.tsx` to have child routes later, you'll need to add `<Outlet />` to render them. See the [Creating layouts](#creating-layouts) section below.

## Creating layouts

Layouts are UI structures that are **shared** between multiple pages. They wrap child routes and persist across navigation.

To create a layout, add a file that will have child routes and use the `<Outlet />` component to render child pages.

```tsx
// routes/blog.tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({
  component: BlogLayout,
});

function BlogLayout() {
  return (
    <div>
      <nav>
        <h1>Blog</h1>
      </nav>
      <Outlet />
    </div>
  );
}
```

The `<Outlet />` component renders the child route's component. Without it, child routes won't render.

## The `<Outlet />` component

The `<Outlet />` component is essential for layouts. It renders the matched child route's component.

### Why it's required

**Without `<Outlet />`** in a layout:

- Child routes **will not render at all**
- You'll see layout content but no page content
- Navigation works, but pages appear blank

**With `<Outlet />`** in a layout:

- Child routes render properly inside the layout
- Layout wraps all child pages
- Everything works as expected

### Common mistake

```tsx
// ❌ Wrong - Missing <Outlet />
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutLayout,
});

function AboutLayout() {
  return (
    <div>
      <h1>About Us</h1>
      <nav>...</nav>
      {/* Child routes won't appear anywhere! */}
    </div>
  );
}

// ✅ Correct - Includes <Outlet />
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutLayout,
});

function AboutLayout() {
  return (
    <div>
      <h1>About Us</h1>
      <nav>...</nav>
      <Outlet /> {/* Child routes render here */}
    </div>
  );
}
```

> **⚠️ Important:** Every layout file that has child routes **must** include `<Outlet />`, otherwise child routes won't render!

## Creating nested routes

Nested routes are routes composed of multiple URL segments. For example, `/blog/post-1` has three segments:

- `/` (Root)
- `blog` (Segment)
- `post-1` (Leaf)

In TanStack Router, you can create nested routes using **dot notation** or **folders**.

### Using dot notation

Create nested routes by separating segments with dots:

```tsx
// routes/blog.tsx (Layout)
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({
  component: BlogLayout,
});

function BlogLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
```

```tsx
// routes/blog.index.tsx (Page at /blog)
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <ul>
      <li>Post 1</li>
      <li>Post 2</li>
      <li>Post 3</li>
    </ul>
  );
}
```

```tsx
// routes/blog.post.tsx (Page at /blog/post)
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/blog/post")({
  component: BlogPost,
});

function BlogPost() {
  return <div>Blog post content</div>;
}
```

This creates:

- `/blog` → `blog.index.tsx` wrapped by `blog.tsx`
- `/blog/post` → `blog.post.tsx` wrapped by `blog.tsx`

### Using folders

You can also use folders to create nested routes, which is equivalent to dot notation:

```bash
routes/
└── blog/
    ├── route.tsx    # Layout (equivalent to blog.tsx)
    ├── index.tsx    # Page at /blog (equivalent to blog.index.tsx)
    └── post.tsx     # Page at /blog/post (equivalent to blog.post.tsx)
```

Both approaches produce identical routes:

- `/blog` → `blog.index.tsx` or `blog/index.tsx`
- `/blog/post` → `blog.post.tsx` or `blog/post.tsx`

> **Good to know:** Use folders when you have 3+ child routes for better organization. Use dot notation for simpler, flatter structures.

## Nesting layouts

Layouts automatically nest based on the file hierarchy. Parent layouts wrap child layouts via the `<Outlet />` component.

For example, with a root layout and a blog layout:

```tsx
// routes/__root.tsx
import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <html>
      <body>
        <header>My App</header>
        <Outlet />
      </body>
    </html>
  );
}
```

```tsx
// routes/blog.tsx
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({
  component: BlogLayout,
});

function BlogLayout() {
  return (
    <section>
      <nav>
        <Link to="/blog">All Posts</Link>
        <Link to="/blog/post">Latest Post</Link>
      </nav>
      <Outlet />
    </section>
  );
}
```

**Visual representation:**

```
__root.tsx
└── <RootLayout>
    └── <Outlet />
        └── blog.tsx
            └── <BlogLayout>
                └── <Outlet />
                    └── blog.index.tsx
                        └── <BlogIndex />
```

The root layout wraps the blog layout, which wraps the blog pages.

## Pathless layouts

Pathless layouts use the `_` prefix and wrap child routes **without** adding a path segment to the URL. They're useful for:

- Shared UI that doesn't affect URLs
- Authentication checks
- Common logic across routes

### Example: Dashboard layout

```tsx
// routes/_dashboard.tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
```

```tsx
// routes/_dashboard.index.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/")({
  component: Dashboard,
});

function Dashboard() {
  return <h1>Dashboard</h1>;
}
```

**Resulting routes:**

- `/` → Shows `_dashboard.index.tsx` wrapped by `_dashboard.tsx` (NOT `/dashboard`)
- `/settings` → Shows `_dashboard.settings.tsx` wrapped by `_dashboard.tsx` (NOT `/dashboard/settings`)

The layout wraps the routes, but "dashboard" doesn't appear in the URL.

### Example: Auth layout

A common pattern is using pathless layouts for authentication pages:

```tsx
// routes/_auth.tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="auth-container">
      <Outlet />
    </div>
  );
}
```

```tsx
// routes/_auth.login.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/login")({
  component: LoginPage,
});

function LoginPage() {
  return <form>...</form>;
}
```

This creates `/login` (not `/auth/login`) wrapped by the auth layout.

> **Good to know:** Use pathless layouts when you want to share layout/logic across routes without affecting URLs. Common patterns: `_auth.tsx` for login/register pages, `_dashboard.tsx` for authenticated pages.

## File naming conventions

TanStack Router uses specific file naming patterns to determine route behavior:

| File Pattern         | Type          | URL Effect        | Purpose                           |
| -------------------- | ------------- | ----------------- | --------------------------------- |
| `__root.tsx`         | Layout        | None              | Root layout that wraps everything |
| `index.tsx`          | Page          | Creates route     | Page component                    |
| `route.tsx`          | Layout        | Creates route     | Layout wrapper (inside folders)   |
| `filename.tsx`       | Layout / Page | Adds `/filename`  | Regular layout (adds URL segment) |
| `filename.index.tsx` | Page          | Renders in parent | Page content for layout           |
| `_filename.tsx`      | Layout        | None              | Pathless layout (no URL segment)  |

## Complete example

Here's a comprehensive example combining all patterns:

```bash
routes/
├── __root.tsx
├── index.tsx
│
├── blog.tsx                        # Layout with path
├── blog.index.tsx
├── blog.post.tsx
│
├── _dashboard.tsx                 # Pathless layout
├── _dashboard.index.tsx
├── _dashboard.settings.tsx
│
├── _auth.tsx                      # Pathless layout with folder
├── _auth/
│   ├── index.tsx
│   ├── login.tsx
│   └── register.tsx
│
└── app/                           # Folder-based organization
    ├── route.tsx
    ├── index.tsx
    └── settings.tsx
```

**Resulting routes:**

```bash
/                    → index.tsx
/blog                → blog.index.tsx (wrapped by blog.tsx)
/blog/post           → blog.post.tsx (wrapped by blog.tsx)
/                    → _dashboard.index.tsx (wrapped by _dashboard.tsx)
/settings            → _dashboard.settings.tsx (wrapped by _dashboard.tsx)
/                    → _auth/index.tsx (wrapped by _auth.tsx)
/login               → _auth/login.tsx (wrapped by _auth.tsx)
/register            → _auth/register.tsx (wrapped by _auth.tsx)
/app                 → app/index.tsx (wrapped by app/route.tsx)
/app/settings        → app/settings.tsx (wrapped by app/route.tsx)
```

## Best practices

### When to use pages vs layouts

**Use pages (`index.tsx`, `filename.tsx`) when:**

- Creating a simple page without child routes
- The component doesn't need to wrap other routes

**Use layouts (`filename.tsx` with `<Outlet />`) when:**

- You need to share UI across multiple pages
- You want to persist state across navigation
- You need to wrap child routes

### Choosing between dot notation and folders

**Use dot notation when:**

- You have 1-2 child routes
- You prefer a flatter file structure
- Routes are simple and don't need organization

**Use folders when:**

- You have 3+ child routes
- You want better organization
- You need to group related files together

### When to use pathless layouts

**Use pathless layouts (`_filename.tsx`) when:**

- You want to share layout/logic without affecting URLs
- You need authentication checks across routes
- You want to group routes that share common UI

**Use regular layouts (`filename.tsx`) when:**

- The layout should appear in the URL structure
- You want `/section` to be a valid route

### Always include `<Outlet />` in layouts

If a layout file has child routes, it **must** include `<Outlet />`. Without it, child routes won't render.

```tsx
// ✅ Good - Layout with <Outlet />
function BlogLayout() {
  return (
    <div>
      <nav>...</nav>
      <Outlet />
    </div>
  );
}

// ❌ Bad - Missing <Outlet />
function BlogLayout() {
  return (
    <div>
      <nav>...</nav>
      {/* Child routes won't render! */}
    </div>
  );
}
```

## Quick checklist

When creating a new route section:

- [ ] Is this a simple page? → Create `filename.tsx` or `section.index.tsx`
- [ ] Do you need a layout? → Create `section.tsx` or `_section.tsx`
- [ ] Does the layout have child routes? → Add `<Outlet />` to the layout
- [ ] Do you want `/section` to be accessible? → Create `section.index.tsx`
- [ ] Want cleaner organization? → Use folders for 3+ child routes
- [ ] Need invisible wrapper? → Use `_` prefix for pathless layout
