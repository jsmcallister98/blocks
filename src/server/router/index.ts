// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { blockRouter } from "./block";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("block.", blockRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
