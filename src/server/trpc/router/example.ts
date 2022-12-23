import { z } from "zod";

import { router, publicProcedure, protectedProcedure } from "../trpc";

export const exampleRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),

  ask: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      return {
        message: `Hello ${input?.name ?? "world"}`,
      };
    }),

  print: protectedProcedure.mutation(({ ctx }) => {
    const session = ctx.session;

    return session;
  }),
});
