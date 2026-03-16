import { postRouter } from "~/server/api/routers/post";
import { galleryRouter } from "~/server/api/routers/gallery";
import { adminRouter } from "~/server/api/routers/admin";
import { crmRouter } from "~/server/api/routers/crm";
import { questionnaireRouter } from "~/server/api/routers/questionnaire";
import { analyticsRouter } from "~/server/api/routers/analytics";
import { authRouter } from "~/server/api/routers/auth";
import { teamRouter } from "~/server/api/routers/team";
import { ecosystemRouter } from "~/server/api/routers/ecosystem";
import { tasksRouter } from "~/server/api/routers/tasks";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  gallery: galleryRouter,
  admin: adminRouter,
  crm: crmRouter,
  questionnaire: questionnaireRouter,
  analytics: analyticsRouter,
  auth: authRouter,
  team: teamRouter,
  ecosystem: ecosystemRouter,
  tasks: tasksRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
