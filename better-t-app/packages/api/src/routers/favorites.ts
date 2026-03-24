import { db } from "@better-t-app/db";
import { favorite, sport } from "@better-t-app/db/schema/app";
import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";

function generateId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 24);
}

export const favoritesRouter = {
  list: protectedProcedure.handler(async ({ context }) => {
    const favorites = await db.query.favorite.findMany({
      where: eq(favorite.userId, context.session.user.id),
      with: {
        sport: {
          with: { category: true, tags: true },
        },
      },
      orderBy: (f, { desc }) => [desc(f.createdAt)],
    });
    return favorites.map((f) => ({
      ...f.sport,
      tags: f.sport.tags.map((t) => t.tag),
    }));
  }),

  add: protectedProcedure
    .input(z.object({ sportId: z.string() }))
    .handler(async ({ input, context }) => {
      const sportItem = await db.query.sport.findFirst({
        where: eq(sport.id, input.sportId),
      });
      if (!sportItem) throw new ORPCError("NOT_FOUND");

      await db
        .insert(favorite)
        .values({
          id: generateId(),
          userId: context.session.user.id,
          sportId: input.sportId,
        })
        .onConflictDoNothing();
      return { success: true };
    }),

  remove: protectedProcedure
    .input(z.object({ sportId: z.string() }))
    .handler(async ({ input, context }) => {
      await db
        .delete(favorite)
        .where(
          and(
            eq(favorite.userId, context.session.user.id),
            eq(favorite.sportId, input.sportId),
          ),
        );
      return { success: true };
    }),

  isFavorited: protectedProcedure
    .input(z.object({ sportId: z.string() }))
    .handler(async ({ input, context }) => {
      const f = await db.query.favorite.findFirst({
        where: and(
          eq(favorite.userId, context.session.user.id),
          eq(favorite.sportId, input.sportId),
        ),
      });
      return { isFavorited: !!f };
    }),
};
