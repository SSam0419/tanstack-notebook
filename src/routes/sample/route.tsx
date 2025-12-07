import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/sample")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <nav>
        <Link to="/docs/$">Back to Docs</Link>
        <h1>Samples</h1>
      </nav>
      <Outlet />
    </div>
  );
}
