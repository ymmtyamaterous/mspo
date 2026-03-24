import { db } from "@better-t-app/db";
import { sport } from "@better-t-app/db/schema/app";
import { ORPCError } from "@orpc/server";
import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure } from "../index";


export const adminRouter = {
  submissions: {
    list: adminProcedure
      .input(
        z.object({
          status: z.enum(["pending", "published", "rejected"]).default("pending"),
          page: z.number().int().positive().default(1),
          limit: z.number().int().positive().max(100).default(20),
        }),
      )
      .handler(async ({ input }) => {
        const { status, page, limit } = input;
        const offset = (page - 1) * limit;
        const [items, totalResult] = await Promise.all([
          db.query.sport.findMany({
            where: eq(sport.status, status),
            orderBy: [desc(sport.createdAt)],
            limit,
            offset,
            with: {
              category: true,
              tags: true,
              submittedBy: { columns: { id: true, name: true, email: true } },
            },
          }),
          db
            .select({ total: count() })
            .from(sport)
            .where(eq(sport.status, status)),
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

    approve: adminProcedure
      .input(z.object({ sportId: z.string() }))
      .handler(async ({ input }) => {
        const existing = await db.query.sport.findFirst({
          where: eq(sport.id, input.sportId),
        });
        if (!existing) throw new ORPCError("NOT_FOUND");
        await db
          .update(sport)
          .set({ status: "published", rejectionReason: null })
          .where(eq(sport.id, input.sportId));
        return { success: true };
      }),

    reject: adminProcedure
      .input(z.object({ sportId: z.string(), reason: z.string().optional() }))
      .handler(async ({ input }) => {
        const existing = await db.query.sport.findFirst({
          where: eq(sport.id, input.sportId),
        });
        if (!existing) throw new ORPCError("NOT_FOUND");
        await db
          .update(sport)
          .set({ status: "rejected", rejectionReason: input.reason ?? null })
          .where(eq(sport.id, input.sportId));
        return { success: true };
      }),
  },
};
