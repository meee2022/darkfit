// convex/auth.config.ts
const SITE_URL =
  process.env.CONVEX_SITE_URL ||
  process.env.SITE_URL ||
  "http://localhost:5173";

export default {
  providers: [
    {
      domain: SITE_URL,
      applicationID: "convex",
    },
  ],
};
