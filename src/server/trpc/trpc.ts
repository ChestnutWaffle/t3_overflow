import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

import { type Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;

export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session?.uid) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not authorized",
    });
  }
  return next();
});

export const protectedProcedure = t.procedure.use(isAuthed);
