---
title: URL-Based Pagination
description: Handle pagination state in URLs with TanStack Router
---


### How URL Pagination Works

Store pagination state in URL search parameters for shareable, bookmarkable, and refreshable pagination. TanStack Router's search param system provides type-safe pagination state management.

### Basic Pagination Setup

#### Route Configuration

```tsx
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'

const paginationSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(20),
})

export const Route = createFileRoute('/posts')({
  validateSearch: zodValidator(paginationSchema.optional()),
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ deps: { search } }) => {
    return fetchPosts({
      page: search.page,
      limit: search.limit,
    })
  },
  component: PostsList,
})
```

#### Basic Pagination Component

```tsx
function PostsList() {
  const { page, limit } = Route.useSearch()
  const { posts, totalPages } = Route.useLoaderData()
  const navigate = useNavigate({ from: '/posts' })

  const goToPage = (newPage: number) => {
    navigate({
      to: ".",
      search: (prev) => ({ ...prev, page: newPage }),
    })
  }

  return (
    <div>
      {posts.map(post => <PostCard key={post.id} post={post} />)}
      
      <div className="pagination">
        <button 
          disabled={page === 1}
          onClick={() => goToPage(page - 1)}
        >
          Previous
        </button>
        
        <span>Page {page} of {totalPages}</span>
        
        <button 
          disabled={page === totalPages}
          onClick={() => goToPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}
```

#### Infinite Scroll with URL State

```tsx
const infiniteSchema = z.object({
  limit: z.number().default(20),
  cursor: z.string().optional(),
})

function InfinitePostsList() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/posts' })
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts', search],
    queryFn: ({ pageParam }) => fetchPosts({
      limit: search.limit,
      cursor: pageParam,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  // Update URL when loading more
  const loadMore = () => {
    if (hasNextPage) {
      const nextCursor = data?.pages[data.pages.length - 1]?.nextCursor
      if (nextCursor) {
        navigate({
          search: (prev) => ({ ...prev, cursor: nextCursor }),
        })
      }
      fetchNextPage()
    }
  }

  return (
    <div>
      {data?.pages.map(page => 
        page.posts.map(post => <PostCard key={post.id} post={post} />)
      )}
      
      {hasNextPage && (
        <button onClick={loadMore} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}
```
