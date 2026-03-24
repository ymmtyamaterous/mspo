import { db } from "@better-t-app/db";
import { pickup, pickupSideCard, sport } from "@better-t-app/db/schema/app";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, publicProcedure } from "../index";

function generateId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 24);
}

export const pickupRouter = {
  getCurrent: publicProcedure.handler(async () => {
    const current = await db.query.pickup.findFirst({
      where: eq(pickup.isActive, true),
      with: {
        mainSport: {
          with: { category: true, tags: true },
        },
        sideCards: {
          with: {
            sport: {
              with: { category: true, tags: true },
            },
          },
          orderBy: (sc, { asc }) => [asc(sc.sortOrder)],
        },
      },
    });

    if (!current) return null;

    return {
      main: {
        ...current.mainSport,
        tags: current.mainSport.tags.map((t) => t.tag),
      },
      sideCards: current.sideCards.map((sc) => ({
        ...sc.sport,
        tags: sc.sport.tags.map((t) => t.tag),
        label: sc.label,
      })),
    };
  }),

  set: adminProcedure
    .input(
      z.object({
        mainSportId: z.string(),
        sideCards: z.array(
          z.object({
            sportId: z.string(),
            label: z.enum(["注目", "急上昇", "新着"]),
          }),
        ),
      }),
    )
    .handler(async ({ input, context }) => {
      // 既存のアクティブなピックアップを無効化
      await db
        .update(pickup)
        .set({ isActive: false })
        .where(eq(pickup.isActive, true));

      const mainSport = await db.query.sport.findFirst({
        where: eq(sport.id, input.mainSportId),
      });
      if (!mainSport) throw new ORPCError("NOT_FOUND");

      const pickupId = generateId();
      await db.insert(pickup).values({
        id: pickupId,
        mainSportId: input.mainSportId,
        isActive: true,
        createdById: context.session.user.id,
      });

      if (input.sideCards.length > 0) {
        await db.insert(pickupSideCard).values(
          input.sideCards.map((sc, idx) => ({
            id: generateId(),
            pickupId,
            sportId: sc.sportId,
            label: sc.label,
            sortOrder: idx,
          })),
        );
      }

      return { success: true };
    }),
};
