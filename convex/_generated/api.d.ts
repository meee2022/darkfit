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
import type * as aiCoach from "../aiCoach.js";
import type * as aiPlans from "../aiPlans.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as coaches from "../coaches.js";
import type * as exercises from "../exercises.js";
import type * as fasting from "../fasting.js";
import type * as files from "../files.js";
import type * as fitbot from "../fitbot.js";
import type * as fixImages from "../fixImages.js";
import type * as gamification from "../gamification.js";
import type * as health from "../health.js";
import type * as http from "../http.js";
import type * as media from "../media.js";
import type * as messages from "../messages.js";
import type * as migrateFoods from "../migrateFoods.js";
import type * as nutrition from "../nutrition.js";
import type * as plans from "../plans.js";
import type * as profiles from "../profiles.js";
import type * as regionSettings from "../regionSettings.js";
import type * as router from "../router.js";
import type * as sampleData from "../sampleData.js";
import type * as seed10 from "../seed10.js";
import type * as seed11 from "../seed11.js";
import type * as seed12 from "../seed12.js";
import type * as seedFoods from "../seedFoods.js";
import type * as social from "../social.js";
import type * as supplements from "../supplements.js";
import type * as translateExercises from "../translateExercises.js";
import type * as userDeletion from "../userDeletion.js";
import type * as userProgress from "../userProgress.js";
import type * as workout from "../workout.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  EmailServiceOTPPasswordReset: typeof EmailServiceOTPPasswordReset;
  admin: typeof admin;
  aiCoach: typeof aiCoach;
  aiPlans: typeof aiPlans;
  analytics: typeof analytics;
  auth: typeof auth;
  coaches: typeof coaches;
  exercises: typeof exercises;
  fasting: typeof fasting;
  files: typeof files;
  fitbot: typeof fitbot;
  fixImages: typeof fixImages;
  gamification: typeof gamification;
  health: typeof health;
  http: typeof http;
  media: typeof media;
  messages: typeof messages;
  migrateFoods: typeof migrateFoods;
  nutrition: typeof nutrition;
  plans: typeof plans;
  profiles: typeof profiles;
  regionSettings: typeof regionSettings;
  router: typeof router;
  sampleData: typeof sampleData;
  seed10: typeof seed10;
  seed11: typeof seed11;
  seed12: typeof seed12;
  seedFoods: typeof seedFoods;
  social: typeof social;
  supplements: typeof supplements;
  translateExercises: typeof translateExercises;
  userDeletion: typeof userDeletion;
  userProgress: typeof userProgress;
  workout: typeof workout;
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
