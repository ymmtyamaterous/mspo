import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      session: context.session,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);

const requireAdmin = requireAuth.concat(
  o.middleware(async ({ context, next }) => {
    const user = context.session?.user as { role?: string } | undefined;
    if (user?.role !== "admin") {
      throw new ORPCError("FORBIDDEN");
    }
    return next({ context: { session: context.session! } });
  }),
);

export const adminProcedure = publicProcedure.use(requireAdmin);
