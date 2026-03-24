import type { AppRouterClient } from "@better-t-app/api/routers/index";
import { Toaster } from "@better-t-app/ui/components/sonner";
import { createORPCClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useState } from "react";

import { Footer } from "@/components/footer";
import { NavBar } from "@/components/nav-bar";
import { link, orpc } from "@/utils/orpc";

import "../index.css";

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "MinorSports — マイナースポーツ図鑑",
      },
      {
        name: "description",
        content: "世界中のマイナースポーツを探索しよう",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  const [client] = useState<AppRouterClient>(() => createORPCClient(link));
  const [orpcUtils] = useState(() => createTanstackQueryUtils(client));

  return (
    <>
      <HeadContent />
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--paper)" }}>
        <NavBar />
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
        <Footer />
      </div>
      <Toaster richColors />
      <ReactQueryDevtools buttonPosition="bottom-left" />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
