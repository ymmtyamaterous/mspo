import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { adminRouter } from "./admin";
import { categoriesRouter } from "./categories";
import { favoritesRouter } from "./favorites";
import { pickupRouter } from "./pickup";
import { rankingsRouter } from "./rankings";
import { sportsRouter } from "./sports";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  sports: sportsRouter,
  categories: categoriesRouter,
  favorites: favoritesRouter,
  rankings: rankingsRouter,
  pickup: pickupRouter,
  admin: adminRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
