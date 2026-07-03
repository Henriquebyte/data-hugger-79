import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/index")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/index") {
      throw redirect({ to: "/" });
    }

    throw notFound();
  },
});