import { type inferAsyncReturnType } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { adminAuth } from "@utils/firebase/admin";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Replace this with an object if you want to pass things to createContextInner
 */
type CreateContextOptions = {
  req: NextApiRequest;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res: NextApiResponse<any>;
};

/** Use this helper for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://beta.create.t3.gg/en/usage/trpc#-servertrpccontextts
 **/
export const createContextInner = async ({
  req,
  res,
}: CreateContextOptions) => {
  async function getUserFromHeader() {
    const authorization = req.headers.authorization;
    if (!authorization) return null;

    const token = authorization.split(" ")[1];
    if (!token) return null;

    const decodedIdToken = await adminAuth.verifyIdToken(token);
    if (!decodedIdToken) return null;

    return decodedIdToken;
  }

  const session = await getUserFromHeader();
  return {
    req,
    res,
    session,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async ({ req, res }: CreateNextContextOptions) => {
  return await createContextInner({ req, res });
};

export type Context = inferAsyncReturnType<typeof createContext>;
