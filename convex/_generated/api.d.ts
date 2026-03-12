/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as EmailServiceOTPPasswordReset from "../EmailServiceOTPPasswordReset.js";
import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as coaches from "../coaches.js";
import type * as exercises from "../exercises.js";
import type * as files from "../files.js";
import type * as fitbot from "../fitbot.js";
import type * as fixImages from "../fixImages.js";
import type * as health from "../health.js";
import type * as http from "../http.js";
import type * as media from "../media.js";
import type * as nutrition from "../nutrition.js";
import type * as plans from "../plans.js";
import type * as profiles from "../profiles.js";
import type * as router from "../router.js";
import type * as sampleData from "../sampleData.js";
import type * as seed10 from "../seed10.js";
import type * as seed11 from "../seed11.js";
import type * as seed12 from "../seed12.js";
import type * as supplements from "../supplements.js";
import type * as translateExercises from "../translateExercises.js";
import type * as userProgress from "../userProgress.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  EmailServiceOTPPasswordReset: typeof EmailServiceOTPPasswordReset;
  admin: typeof admin;
  auth: typeof auth;
  coaches: typeof coaches;
  exercises: typeof exercises;
  files: typeof files;
  fitbot: typeof fitbot;
  fixImages: typeof fixImages;
  health: typeof health;
  http: typeof http;
  media: typeof media;
  nutrition: typeof nutrition;
  plans: typeof plans;
  profiles: typeof profiles;
  router: typeof router;
  sampleData: typeof sampleData;
  seed10: typeof seed10;
  seed11: typeof seed11;
  seed12: typeof seed12;
  supplements: typeof supplements;
  translateExercises: typeof translateExercises;
  userProgress: typeof userProgress;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
