---
title: Path Params
description: Learn how to work with path parameters (dynamic route segments) in TanStack Router.
---

Path parameters capture dynamic segments from URLs and provide them as named variables. They use the `$` prefix followed by a variable name and match content until the next `/` character.

## How path parameters work

Path parameters are defined using the `$` syntax in route paths:

```
File: routes/posts.$postId.tsx
Route: /posts/$postId
Matches: /posts/123, /posts/my-post, etc.
```

> **Good to know:** Path parameters are automatically URL-decoded and available as strings. Validate and convert them as needed (e.g., to numbers).

## Basic path parameters

### Defining path parameters

Create a route file with a path parameter in the filename:

```tsx
// routes/posts.$postId.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/posts/$postId")({
  component: PostPage,
});

function PostPage() {
  const { postId } = Route.useParams();
  return <div>Post {postId}</div>;
}
```

**Common use cases:**

- Blog posts: `/posts/$postId`
- User profiles: `/users/$userId`
- Product pages: `/shop/$productId`

### Accessing path parameters

Use `Route.useParams()` for type-safe parameter access in route components:

```tsx
export const Route = createFileRoute("/posts/$postId")({
  component: PostPage,
});

function PostPage() {
  const { postId } = Route.useParams();
  return <div>Post {postId}</div>;
}
```

### Using parameters in loaders

Access path parameters in loaders through the `params` object:

```tsx
export const Route = createFileRoute("/posts/$postId")({
  loader: async ({ params }) => {
    // params.postId contains the URL segment value
    return fetchPost(params.postId);
  },
  component: PostPage,
});
```

### Validating parameters in beforeLoad

Validate parameter format before loading data:

```tsx
export const Route = createFileRoute("/posts/$postId")({
  beforeLoad: async ({ params }) => {
    // Validate postId format
    z.number().parse(params.postId);
  },
  loader: async ({ params }) => {
    return fetchPost(params.postId);
  },
});
```

> **Good to know:** Always validate path parameters in `beforeLoad` since they come from user input (the URL).

## Accessing parameters outside route components

### Using Route API

Access parameters from any component using the Route API:

```tsx
import { getRouteApi } from "@tanstack/react-router";

const routeApi = getRouteApi("/posts/$postId");

function PostSidebar() {
  const { postId } = routeApi.useParams();
  return <div>Related to post {postId}</div>;
}
```

### Using useParams hook

Use the `useParams` hook with the `from` prop for type safety:

```tsx
import { useParams } from "@tanstack/react-router";

function PostSidebar() {
  // Type-safe with from
  const { postId } = useParams({ from: "/posts/$postId" });
  return <div>Post {postId}</div>;
}
```

> **Good to know:** Always provide the `from` prop when using `useParams` for better type safety and autocomplete.

## Parameter inheritance

Child routes automatically inherit parameters from parent routes:

```tsx
// Parent: /posts/$postId
export const Route = createFileRoute("/posts/$postId")({
  component: PostLayout,
});

function PostLayout() {
  const { postId } = Route.useParams();
  return (
    <div>
      <h1>Post {postId}</h1>
      <Outlet />
    </div>
  );
}

// Child: /posts/$postId/comments
export const Route = createFileRoute("/posts/$postId/comments")({
  beforeLoad: ({ params }) => {
    // postId inherited from parent ✅
    console.log(params.postId);
  },
  component: CommentsPage,
});
```

Child routes can access parent parameters without redefining them.

## Navigation with path parameters

### Object style parameters

Pass parameters as objects when navigating:

```tsx
import { Link } from "@tanstack/react-router";

function PostList() {
  return (
    <Link to="/posts/$postId" params={{ postId: "123" }}>
      View Post 123
    </Link>
  );
}
```

### Function style parameters

Use functions to modify existing parameters while preserving others:

```tsx
function PostNavigation() {
  return (
    <Link
      to="/posts/$postId/edit"
      params={(prev) => ({ ...prev, postId: "456" })}
    >
      Edit Post
    </Link>
  );
}
```

**Use cases:**

- Preserving other route parameters
- Modifying specific parameters while keeping others

### Using useNavigate

Navigate programmatically with path parameters:

```tsx
import { useNavigate } from "@tanstack/react-router";

function PostList() {
  const navigate = useNavigate({ from: "/posts" });

  const handleViewPost = (postId: string) => {
    navigate({
      to: "/posts/$postId",
      params: { postId },
    });
  };

  return <button onClick={() => handleViewPost("123")}>View Post</button>;
}
```

## Optional path parameters

Optional parameters use `{-$paramName}` syntax for flexible URL patterns. They allow routes to work with or without certain path segments.

### Basic optional parameters

```tsx
// routes/posts.{-$category}.tsx
// Matches: /posts and /posts/tech
export const Route = createFileRoute("/posts/{-$category}")({
  component: PostsPage,
});

function PostsPage() {
  const { category } = Route.useParams();
  return <div>{category ? `Posts in ${category}` : "All Posts"}</div>;
}
```

### Multiple optional parameters

```tsx
// routes/posts.{-$category}.{-$slug}.tsx
// Matches: /posts, /posts/tech, /posts/tech/hello-world
export const Route = createFileRoute("/posts/{-$category}/{-$slug}")({
  component: PostPage,
});

function PostPage() {
  const { category, slug } = Route.useParams();

  if (!category) return <div>Select a category</div>;
  if (!slug) return <div>Posts in {category}</div>;

  return (
    <div>
      Post: {slug} in {category}
    </div>
  );
}
```

### Mixed required and optional

Combine required and optional parameters:

```tsx
// routes/users.$id.{-$tab}.tsx
// $id required, $tab optional
export const Route = createFileRoute("/users/$id/{-$tab}")({
  component: UserPage,
});

function UserPage() {
  const { id, tab } = Route.useParams();

  return (
    <div>
      <h1>User {id}</h1>
      {tab && <div>Tab: {tab}</div>}
    </div>
  );
}
```

### Handling optional parameters in loaders

Always handle undefined values for optional parameters:

```tsx
export const Route = createFileRoute("/posts/{-$category}")({
  loader: async ({ params }) => {
    // params.category might be undefined
    return fetchPosts({
      category: params.category, // undefined means "all categories"
    });
  },
});
```

### Navigating with optional parameters

Control which optional parameters to include:

```tsx
function Navigation() {
  return (
    <div>
      {/* Include optional parameter */}
      <Link to="/posts/{-$category}" params={{ category: "tech" }}>
        Tech Posts
      </Link>

      {/* Exclude optional parameter */}
      <Link to="/posts/{-$category}" params={{ category: undefined }}>
        All Posts
      </Link>

      {/* Multiple optional parameters */}
      <Link
        to="/posts/{-$category}/{-$slug}"
        params={{
          category: "tech",
          slug: "react-tips",
        }}
      >
        Specific Post
      </Link>
    </div>
  );
}
```

> **Good to know:** Use optional parameters for flexible routing patterns like language codes, categories, or tabs that may or may not be present in the URL.

## Advanced patterns

### Prefixes and suffixes

Define complex routing patterns with prefixes and suffixes:

```tsx
// Prefix: /posts/post-{$postId}
// Matches: /posts/post-123
export const Route = createFileRoute("/posts/post-{$postId}")({
  component: PostPage,
});

// Suffix: /files/{$fileName}.txt
// Matches: /files/document.txt
export const Route = createFileRoute("/files/{$fileName}.txt")({
  component: FilePage,
});

// Both: /users/user-{$userId}.json
// Matches: /users/user-123.json
export const Route = createFileRoute("/users/user-{$userId}.json")({
  component: UserPage,
});
```

**Features:**

- Prefix patterns: `post-{$id}` matches `post-123`
- Suffix patterns: `{$name}.txt` matches `document.txt`
- Combined patterns: `user-{$id}.json` matches `user-123.json`

### Wildcards

Combine prefixes/suffixes with wildcard routes:

```tsx
// routes/storage.drive-{$driveId}.$.tsx
// Matches: /storage/drive-1/path/to/file
export const Route = createFileRoute("/storage/drive-{$driveId}/$")({
  component: StoragePage,
});

function StoragePage() {
  const { driveId } = Route.useParams();
  const { _splat } = Route.useParams();

  return (
    <div>
      Drive: {driveId}
      Path: /{_splat}
    </div>
  );
}
```

## Internationalization (i18n) patterns

Use optional parameters for clean language routing without affecting URLs.

### Basic i18n setup

```tsx
// routes/{-$locale}.about.tsx
// Matches: /about, /en/about, /fr/about
export const Route = createFileRoute("/{-$locale}/about")({
  component: AboutPage,
});

function AboutPage() {
  const { locale } = Route.useParams();
  const currentLocale = locale || "en";

  const content = {
    en: { title: "About Us" },
    fr: { title: "À Propos" },
    es: { title: "Acerca de" },
  };

  return <h1>{content[currentLocale]?.title}</h1>;
}
```

### Complex i18n patterns

```tsx
// routes/{-$locale}.blog.{-$category}.$slug.tsx
export const Route = createFileRoute("/{-$locale}/blog/{-$category}/$slug")({
  beforeLoad: async ({ params }) => {
    const locale = params.locale || "en";
    const validLocales = ["en", "fr", "es", "de"];

    if (locale && !validLocales.includes(locale)) {
      throw new Error("Invalid locale");
    }

    return { locale };
  },
  loader: async ({ params, context }) => {
    return fetchBlogPost({
      slug: params.slug,
      category: params.category,
      locale: context.locale,
    });
  },
});
```

### Language switching

Create language switchers with optional parameters:

```tsx
function LanguageSwitcher() {
  const languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
  ];

  return (
    <div>
      {languages.map(({ code, name }) => (
        <Link
          key={code}
          to="/{-$locale}/blog/{-$category}/$slug"
          params={(prev) => ({
            ...prev,
            locale: code === "en" ? undefined : code,
          })}
        >
          {name}
        </Link>
      ))}
    </div>
  );
}
```

### SEO for i18n routes

Handle SEO properly for internationalized routes:

```tsx
export const Route = createFileRoute("/{-$locale}/products/$id")({
  head: ({ params, loaderData }) => {
    const locale = params.locale || "en";
    const product = loaderData;

    return {
      title: product.title[locale],
      meta: [
        {
          property: "og:locale",
          content: locale,
        },
      ],
      links: [
        {
          rel: "canonical",
          href: `https://example.com/products/${params.id}`,
        },
        {
          rel: "alternate",
          hreflang: "fr",
          href: `https://example.com/fr/products/${params.id}`,
        },
      ],
    };
  },
});
```

## Configuration

### Allowed characters

Configure which characters are allowed in path parameters:

```tsx
import { createRouter } from "@tanstack/react-router";

const router = createRouter({
  pathParamsAllowedCharacters: ["@", "+"],
});
```

**Supported characters:**

- `;` - Semicolon
- `:` - Colon
- `@` - At symbol
- `&` - Ampersand
- `=` - Equals
- `+` - Plus
- `$` - Dollar
- `,` - Comma

**Use cases:**

- Email addresses in URLs: `/users/@email`
- Special identifiers: `/items/item+123`
- Complex routing patterns

> **Good to know:** By default, path parameters only allow alphanumeric characters and hyphens. Configure additional characters only when needed.

## Common patterns

### User profiles

```tsx
// routes/users.$userId.{-$tab}.tsx
<Link to="/users/$userId/{-$tab}" params={{ userId: "123", tab: "settings" }}>
  User Settings
</Link>
```

### Product catalog

```tsx
// routes/shop.{-$category}.$productId.tsx
<Link
  to="/shop/{-$category}/$productId"
  params={{ category: "electronics", productId: "laptop-123" }}
>
  Laptop
</Link>
```

### File management

```tsx
// routes/files.{$fileName}.{$extension}.tsx
<Link
  to="/files/{$fileName}.{$extension}"
  params={{ fileName: "document", extension: "pdf" }}
>
  View PDF
</Link>
```

### Date-based URLs

```tsx
// routes/{-$year}.{-$month}.{-$day}.tsx
<Link
  to="/{-$year}/{-$month}/{-$day}"
  params={{ year: "2023", month: "12", day: "25" }}
>
  Christmas 2023
</Link>
```

## Best practices

### Use descriptive parameter names

Choose clear, descriptive names for path parameters:

```tsx
// ✅ Good - Descriptive
export const Route = createFileRoute("/users/$userId")({
  // ...
});

// ❌ Bad - Unclear
export const Route = createFileRoute("/users/$id")({
  // ...
});
```

### Always validate parameters

Validate parameter format in `beforeLoad` since they come from user input:

```tsx
// ✅ Good - Validated
export const Route = createFileRoute("/posts/$postId")({
  beforeLoad: async ({ params }) => {
    if (!/^\d+$/.test(params.postId)) {
      throw new Error("Invalid post ID");
    }
  },
});

// ❌ Bad - Not validated
export const Route = createFileRoute("/posts/$postId")({
  loader: async ({ params }) => {
    // Could be anything from the URL!
    return fetchPost(params.postId);
  },
});
```

### Handle undefined optional parameters

Always provide fallbacks for optional parameters:

```tsx
// ✅ Good - Handles undefined
function PostsPage() {
  const { category } = Route.useParams();
  const displayCategory = category || "all";

  return <div>Category: {displayCategory}</div>;
}

// ❌ Bad - Assumes value exists
function PostsPage() {
  const { category } = Route.useParams();
  return <div>Category: {category}</div>; // Could be undefined!
}
```

### Use Route.useParams() for type safety

Always use `Route.useParams()` in route components for type safety:

```tsx
// ✅ Good - Type-safe
function PostPage() {
  const { postId } = Route.useParams();
  return <div>{postId}</div>;
}

// ⚠️ Works but less type-safe
function PostPage() {
  const { postId } = useParams({ strict: false });
  return <div>{postId}</div>;
}
```

### Use `from` prop for type safety

Always provide the `from` prop when using hooks outside route components:

```tsx
// ✅ Good - Type-safe
const { postId } = useParams({ from: "/posts/$postId" });

// ⚠️ Works but less type-safe
const { postId } = useParams({ strict: false });
```

### Consider URL encoding

Configure allowed characters only when necessary:

```tsx
// ✅ Good - Only configure what you need
const router = createRouter({
  pathParamsAllowedCharacters: ["@"], // For email addresses
});

// ❌ Bad - Overly permissive
const router = createRouter({
  pathParamsAllowedCharacters: ["@", "+", "&", "=", "$", ",", ";", ":"],
});
```

### Use optional parameters for i18n

Use optional parameters for clean language URLs:

```tsx
// ✅ Good - Clean URLs
// /about, /en/about, /fr/about
export const Route = createFileRoute("/{-$locale}/about")({
  // ...
});

// ❌ Bad - Always requires locale
// /en/about, /fr/about (no /about)
export const Route = createFileRoute("/$locale/about")({
  // ...
});
```

### Provide proper canonical URLs for i18n

Handle SEO properly for internationalized routes:

```tsx
// ✅ Good - Proper SEO
export const Route = createFileRoute("/{-$locale}/products/$id")({
  head: ({ params }) => ({
    links: [
      {
        rel: "canonical",
        href: `https://example.com/products/${params.id}`,
      },
    ],
  }),
});
```
