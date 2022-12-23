import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import type {
  MockData,
  MutatedQuestionData,
} from "../../../types/defined-types";
import { filepath, getJsonFrom } from "../../../utils/mockUtils";
import { getDateString } from "@utils/index";

export const mockRouter = router({
  mockHome: publicProcedure
    .input(z.object({ page: z.number() }).nullish())
    .query(async ({ input }) => {
      const data: MockData = await getJsonFrom(filepath);
      if (input?.page) {
        return {
          total_pages: Math.ceil(data.length / 20),
          posts: data
            .filter((item, index) => {
              return (
                index < input?.page * 20 && index >= (input?.page - 1) * 20
              );
            })
            .map((item) => {
              return {
                user: {
                  id: item.user.id,
                  fullname: `${item.user.firstname} ${item.user.lastname}`,
                  photo_URL: item.user.photo_URL,
                  username: item.user.username,
                },
                post: {
                  id: item.post.id,
                  title: item.post.title,
                  createdAt: getDateString(item.post.createdAt),
                },
              };
            }),
        };
      }
    }),

  questionId: publicProcedure
    .input(z.object({ questionId: z.number() }))
    .query(async ({ input }) => {
      const data: MockData = await getJsonFrom(filepath);

      const result = data.filter(({ post }) => {
        return post.id === input.questionId;
      })[0];

      if (!result) return;

      const response: MutatedQuestionData = [
        {
          user: { ...result.user },
          post: {
            content: result.post.content,
            id: result.post.id,
            title: result.post.title,
            createdAt: getDateString(result.post.createdAt),
            updatedAt: getDateString(result.post.updatedAt),
            replies:
              result.post.replies?.map((reply) => {
                return {
                  ...reply,
                  createdAt: getDateString(reply.createdAt),
                  updatedAt: getDateString(reply.updatedAt),
                };
              }) || [],
          },
        },
        {
          answers:
            result.post.answers.map((answer) => {
              return {
                user: answer.user,
                post: {
                  ...answer,
                  createdAt: getDateString(answer.createdAt),
                  updatedAt: getDateString(answer.updatedAt),
                  replies:
                    answer.replies?.map((reply) => {
                      return {
                        ...reply,
                        createdAt: getDateString(reply.createdAt),
                        updatedAt: getDateString(reply.updatedAt),
                      };
                    }) || [],
                },
              };
            }) || [],
        },
      ];
      return response;
    }),

  usersListPage: publicProcedure
    .input(
      z.object({
        page: z.number(),
        filter: z.string().nullish(),
        tab: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const fullData: MockData = await getJsonFrom(filepath);

      const data = fullData.filter((item, itemIndex) => {
        return (
          itemIndex >= (input?.page - 1) * 56 && itemIndex < input?.page * 56
        );
      });

      const users = data.map((dataItem) => {
        return dataItem.user;
      });

      const total_pages = Math.ceil(fullData.length / 56);

      return { users, total_pages };
    }),

  userPage: publicProcedure
    .input(z.object({ uid: z.string(), username: z.string() }))
    .query(async ({ input }) => {
      const fullData: MockData = await getJsonFrom(filepath);

      const user = fullData.find((data) => {
        return (
          data.user.id === input?.uid && data.user.username === input?.username
        );
      });

      return user;
    }),
});
