import { db } from "@better-t-app/db";
import {
  sport,
  sportTag,
} from "@better-t-app/db/schema/app";
import { ORPCError } from "@orpc/server";
import { and, asc, count, desc, eq, like, or, sql } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, publicProcedure } from "../index";

// ID生成 (簡易 nanoid-like)
function generateId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 24);
}

const sportInputSchema = z.object({
  name: z.string().min(1).max(100),
  nameEn: z.string().max(100).optional(),
  description: z.string().min(1).max(2000),
  rules: z.string().optional(),
  history: z.string().optional(),
  originCountry: z.string().optional(),
  foundedYear: z.number().int().optional(),
  playerCount: z.string().optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  categoryId: z.string().min(1),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
});

export const sportsRouter = {
  list: publicProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(20),
        categoryId: z.string().optional(),
        search: z.string().optional(),
        sortBy: z.enum(["createdAt", "viewCount", "popularity"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        status: z.enum(["pending", "published", "rejected"]).default("published"),
      }),
    )
    .handler(async ({ input }) => {
      const { page, limit, categoryId, search, sortBy, sortOrder, status } = input;
      const offset = (page - 1) * limit;

      const conditions = [eq(sport.status, status)];
      if (categoryId) conditions.push(eq(sport.categoryId, categoryId));
      if (search) {
        conditions.push(
          or(
            like(sport.name, `%${search}%`),
            like(sport.description, `%${search}%`),
            like(sport.originCountry, `%${search}%`),
          )!,
        );
      }

      const orderCol =
        sortBy === "viewCount"
          ? sport.viewCount
          : sortBy === "popularity"
            ? sport.viewCount
            : sport.createdAt;
      const order = sortOrder === "asc" ? asc(orderCol) : desc(orderCol);

      const [items, totalResult] = await Promise.all([
        db.query.sport.findMany({
          where: and(...conditions),
          orderBy: order,
          limit,
          offset,
          with: { category: true, tags: true },
        }),
        db
          .select({ total: count() })
          .from(sport)
          .where(and(...conditions)),
      ]);

      return {
        items: items.map((s) => ({
          ...s,
          tags: s.tags.map((t) => t.tag),
        })),
        total: totalResult[0]?.total ?? 0,
        page,
        limit,
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const item = await db.query.sport.findFirst({
        where: eq(sport.id, input.id),
        with: {
          category: true,
          tags: true,
          submittedBy: {
            columns: { id: true, name: true },
          },
        },
      });
      if (!item) throw new ORPCError("NOT_FOUND");

      // 閲覧数インクリメント（fire-and-forget）
      db.update(sport)
        .set({ viewCount: sql`${sport.viewCount} + 1` })
        .where(eq(sport.id, input.id))
        .execute()
        .catch(() => {});

      return {
        ...item,
        tags: item.tags.map((t) => t.tag),
      };
    }),

  getRandom: publicProcedure.handler(async () => {
    const items = await db.query.sport.findMany({
      where: eq(sport.status, "published"),
      orderBy: sql`RANDOM()`,
      limit: 1,
      with: { category: true, tags: true },
    });
    if (!items[0]) throw new ORPCError("NOT_FOUND");
    return {
      ...items[0],
      tags: items[0].tags.map((t) => t.tag),
    };
  }),

  create: protectedProcedure
    .input(sportInputSchema)
    .handler(async ({ input, context }) => {
      const id = generateId();
      const { tags, ...rest } = input;
      await db.insert(sport).values({
        id,
        ...rest,
        submittedById: context.session.user.id,
        status: "pending",
      });
      if (tags && tags.length > 0) {
        await db.insert(sportTag).values(
          tags.map((tag) => ({ id: generateId(), sportId: id, tag })),
        );
      }
      const created = await db.query.sport.findFirst({
        where: eq(sport.id, id),
        with: { category: true, tags: true },
      });
      return { ...created!, tags: created!.tags.map((t) => t.tag) };
    }),

  update: protectedProcedure
    .input(sportInputSchema.partial().extend({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const { id, tags, ...rest } = input;
      const existing = await db.query.sport.findFirst({
        where: eq(sport.id, id),
      });
      if (!existing) throw new ORPCError("NOT_FOUND");

      const user = context.session.user as { id: string; role?: string };
      if (existing.submittedById !== user.id && user.role !== "admin") {
        throw new ORPCError("FORBIDDEN");
      }

      await db.update(sport).set(rest).where(eq(sport.id, id));

      if (tags !== undefined) {
        await db.delete(sportTag).where(eq(sportTag.sportId, id));
        if (tags.length > 0) {
          await db.insert(sportTag).values(
            tags.map((tag) => ({ id: generateId(), sportId: id, tag })),
          );
        }
      }

      const updated = await db.query.sport.findFirst({
        where: eq(sport.id, id),
        with: { category: true, tags: true },
      });
      return { ...updated!, tags: updated!.tags.map((t) => t.tag) };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const existing = await db.query.sport.findFirst({
        where: eq(sport.id, input.id),
      });
      if (!existing) throw new ORPCError("NOT_FOUND");

      const user = context.session.user as { id: string; role?: string };
      if (existing.submittedById !== user.id && user.role !== "admin") {
        throw new ORPCError("FORBIDDEN");
      }

      await db.delete(sport).where(eq(sport.id, input.id));
      return { success: true };
    }),
};
