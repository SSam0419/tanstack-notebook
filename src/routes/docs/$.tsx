import { createFileRoute, notFound } from "@tanstack/react-router";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { createServerFn } from "@tanstack/react-start";
import { source } from "@/lib/source";
import browserCollections from "fumadocs-mdx:collections/browser";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { baseOptions } from "@/lib/layout.shared";

export const Route = createFileRoute("/docs/$")({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/") ?? [];
    const data = await loader({ data: slugs });
    await clientLoader.preload(data.path);
    return data;
  },
});

const loader = createServerFn({
  method: "GET",
})
  .inputValidator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) throw notFound();

    return {
      tree: source.pageTree as object,
      path: page.path,
    };
  });

const clientLoader = browserCollections.docs.createClientLoader({
  component({ toc, frontmatter, default: MDX }) {
    return (
      <DocsPage toc={toc}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <DocsBody>
          <MDX
            components={{
              ...defaultMdxComponents,
            }}
          />
        </DocsBody>
      </DocsPage>
    );
  },
});

function Page() {
  const data = Route.useLoaderData();
  const Content = clientLoader.getComponent(data.path);

  return (
    <DocsLayout
      {...baseOptions()}
      tree={{
        name: "docs",
        children: [
          {
            name: "Introduction",
            type: "page",
            url: "/docs",
          },
          {
            name: "Basics",
            type: "separator",
          },
          {
            name: "Layouts and Pages",
            type: "page",
            url: "/docs/basic-routing",
          },
          {
            name: "Path Params",
            type: "page",
            url: "/docs/path-params",
          },
          {
            name: "Navigation",
            type: "page",
            url: "/docs/navigation",
          },
          {
            name: "Search Params",
            type: "page",
            url: "/docs/search-params",
          },

          { name: "Hooks", type: "separator" },
          { name: "useNavigate", type: "page", url: "/docs/use-navigate" },
          { name: "useParams", type: "page", url: "/docs/use-params" },
          { name: "useSearch", type: "page", url: "/docs/use-search" },
          { name: "useLocation", type: "page", url: "/docs/use-location" },

          { name: "Usage", type: "separator" },
          { name: "Pagination", type: "page", url: "/docs/pagination" },
        ],
      }}
      sidebar={{
        collapsible: false,
      }}
    >
      <Content />
    </DocsLayout>
  );
}
