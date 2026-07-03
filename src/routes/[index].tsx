import { createFileRoute } from "@tanstack/react-router";

import { ServerBrowserPage } from "./index";

export const Route = createFileRoute("/index")({
  head: () => ({
    meta: [
      { title: "SRB2 Server Browser — Servidores online agora" },
      {
        name: "description",
        content:
          "Lista em tempo real dos servidores de Sonic Robo Blast 2 ativos no master server oficial.",
      },
    ],
  }),
  component: ServerBrowserPage,
});