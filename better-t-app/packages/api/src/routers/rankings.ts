import { db } from "@better-t-app/db";
import { favorite, sport } from "@better-t-app/db/schema/app";
import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "../index";

export const rankingsRouter = {
  get: publicProcedure
    .input(
      z.object({
        type: z.enum(["viewCount", "favorites"]),
        limit: z.number().int().positive().max(100).default(20),
        categoryId: z.string().optional(),
      }),
    )
    .handler(async ({ input }) => {
      const { type, limit, categoryId } = input;

      if (type === "viewCount") {
        const conditions = [eq(sport.status, "published")];
        if (categoryId) conditions.push(eq(sport.categoryId, categoryId));

        const items = await db.query.sport.findMany({
          where: (s, { and, eq }) => {
            const conds = [eq(s.status, "published")];
            if (categoryId) conds.push(eq(s.categoryId, categoryId));
            return and(...conds);
          },
          orderBy: [desc(sport.viewCount)],
          limit,
          with: { category: true, tags: true },
        });

        return items.map((item, idx) => ({
          ...item,
          tags: item.tags.map((t) => t.tag),
          rank: idx + 1,
          score: item.viewCount,
        }));
      } else {
        // favorites ランキング
        const favCounts = await db
          .select({ sportId: favorite.sportId, cnt: count() })
          .from(favorite)
          .groupBy(favorite.sportId)
          .orderBy(desc(count()))
          .limit(limit);

        const sportIds = favCounts.map((r) => r.sportId);
        if (sportIds.length === 0) return [];

        const sports = await db.query.sport.findMany({
          where: (s, { and, eq, inArray }) => {
            const conds = [
              eq(s.status, "published"),
              inArray(s.id, sportIds),
            ];
            if (categoryId) conds.push(eq(s.categoryId, categoryId));
            return and(...conds);
          },
          with: { category: true, tags: true },
        });

        const countMap = new Map(favCounts.map((r) => [r.sportId, r.cnt]));
        const sorted = sports.sort(
          (a, b) => (countMap.get(b.id) ?? 0) - (countMap.get(a.id) ?? 0),
        );

        return sorted.map((item, idx) => ({
          ...item,
          tags: item.tags.map((t) => t.tag),
          rank: idx + 1,
          score: countMap.get(item.id) ?? 0,
        }));
      }
    }),
};
