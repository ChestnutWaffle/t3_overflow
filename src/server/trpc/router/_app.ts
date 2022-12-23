import { homeRouter } from "./home/index";
import { answerRouter } from "./answer";
import { router } from "../trpc";
import { authRouter } from "./auth";
import { exampleRouter } from "./example";
import { mockRouter } from "./mock";
import { questionRouter } from "./question";
import { usersRouter } from "./users";
import { tagsRouter } from "./tags";

export const appRouter = router({
  example: exampleRouter,
  mock: mockRouter,
  auth: authRouter,
  question: questionRouter,
  answer: answerRouter,
  home: homeRouter,
  users: usersRouter,
  tags: tagsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
