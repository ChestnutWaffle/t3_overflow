import { z } from "zod";

export const userMetadataSchema = z.object({
  creationTime: z.string().optional(),
  lastSignInTime: z.string().optional(),
});

export const userInfoSchema = z.object({
  displayName: z.string().nullable(),
  email: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  photoURL: z.string().nullable(),
  providerId: z.string(),
  uid: z.string(),
});

const ParsedToken = z.object({
  exp: z.string().optional(),
  sub: z.string().optional(),
  auth_time: z.string().optional(),
  iat: z.string().optional(),
  firebase: z
    .object({
      sign_in_provider: z.string().optional(),
      sign_in_second_factor: z.string().optional(),
      identities: z.record(z.string(), z.string()),
    })
    .optional(),
});

const IdTokenResult = z.object({
  authTime: z.string(),
  expirationTime: z.string(),
  issuedAtTime: z.string(),
  signInProvider: z.string().nullable(),
  signInSecondFactor: z.string().nullable(),
  token: z.string(),
  claims: ParsedToken,
});

export const userSchema = userInfoSchema.extend({
  emailVerified: z.boolean(),
  isAnonymous: z.boolean(),
  metadata: userMetadataSchema,
  providerData: z.array(userInfoSchema),
  refreshToken: z.string(),
  tenantId: z.string().nullable(),
  delete: z.function().args().returns(z.promise(z.void())),
  getIdToken: z
    .function()
    .args(z.boolean().optional())
    .returns(z.promise(z.string())),
  getIdTokenResult: z
    .function()
    .args(z.boolean().optional())
    .returns(z.promise(IdTokenResult)),
  reload: z.function().args().returns(z.promise(z.void())),
  toJSON: z.function().returns(z.object({})),
});
