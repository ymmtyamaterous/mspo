import { db } from "@better-t-app/db";
import { category, sport } from "@better-t-app/db/schema/app";
import { ORPCError } from "@orpc/server";
import { asc, count, eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, publicProcedure } from "../index";

function generateId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 24);
}

export const categoriesRouter = {
  list: publicProcedure.handler(async () => {
    const categories = await db.query.category.findMany({
      orderBy: asc(category.sortOrder),
    });
    const sportCounts = await db
      .select({ categoryId: sport.categoryId, cnt: count() })
      .from(sport)
      .where(eq(sport.status, "published"))
      .groupBy(sport.categoryId);

    const countMap = new Map(sportCounts.map((r) => [r.categoryId, r.cnt]));

    return categories.map((cat) => ({
      ...cat,
      sportCount: countMap.get(cat.id) ?? 0,
    }));
  }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        emoji: z.string().min(1),
        description: z.string().optional(),
        sortOrder: z.number().int().default(0),
      }),
    )
    .handler(async ({ input }) => {
      const id = generateId();
      await db.insert(category).values({ id, ...input });
      return db.query.category.findFirst({ where: eq(category.id, id) });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        emoji: z.string().min(1).optional(),
        description: z.string().optional(),
        sortOrder: z.number().int().optional(),
      }),
    )
    .handler(async ({ input }) => {
      const { id, ...rest } = input;
      const existing = await db.query.category.findFirst({
        where: eq(category.id, id),
      });
      if (!existing) throw new ORPCError("NOT_FOUND");
      await db.update(category).set(rest).where(eq(category.id, id));
      return db.query.category.findFirst({ where: eq(category.id, id) });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const existing = await db.query.category.findFirst({
        where: eq(category.id, input.id),
      });
      if (!existing) throw new ORPCError("NOT_FOUND");
      await db.delete(category).where(eq(category.id, input.id));
      return { success: true };
    }),
};
