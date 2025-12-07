import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/sample/link/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Link to=".">
        {({ isActive }) => (
          <div
            style={{
              backgroundColor: isActive ? "red" : "blue",
              padding: "10px",
              borderRadius: "5px",
              width: "150px",
              height: "50px",
            }}
          >
            <span>This Page </span>
            <span>{isActive ? "Active" : "Inactive"}</span>
          </div>
        )}
      </Link>
      <Link to="/">
        {({ isActive }) => (
          <div
            style={{
              backgroundColor: isActive ? "red" : "blue",
              padding: "10px",
              borderRadius: "5px",
              width: "250px",
              height: "50px",
            }}
          >
            <span>Root Page </span>
            <span>{isActive ? "Active" : "Inactive"}</span>
          </div>
        )}
      </Link>
    </div>
  );
}
