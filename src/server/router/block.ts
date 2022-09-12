// src/server/router/block.ts

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const blockRouter = createRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      try {
        return await ctx.prisma.block.findMany({
          select: {
            name: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      } catch (error) {
        console.log("error", error);
      }
    },
  })
  .middleware(async ({ ctx, next }) => {
    // Any queries or mutations after this middleware will
    // raise an error unless there is a current session
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .mutation("postBlock", {
    input: z.object({
      name: z.string(),
    }),
    async resolve({ ctx, input }) {
      try {
        await ctx.prisma.block.create({
          data: {
            name: input.name,
          },
        });
      } catch (error) {
        console.log(error);
      }
    },
  });
