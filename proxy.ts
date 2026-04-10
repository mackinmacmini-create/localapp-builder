import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const protectedRoutes = createRouteMatcher([
  "/refit/dashboard(.*)",
  "/refit/workouts(.*)",
  "/refit/onboarding(.*)",
]);

const proxy = clerkMiddleware(async (auth, req) => {
  if (protectedRoutes(req)) {
    await auth.protect();
  }
});

export default proxy;

export const config = {
  matcher: [
    "/refit(.*)",
  ],
};
