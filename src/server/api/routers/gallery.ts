import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { galleries, galleryImages } from "~/server/db/schema";
import { eq, asc } from "drizzle-orm";

export const galleryRouter = createTRPCRouter({
  // Get all galleries
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(galleries)
      .where(eq(galleries.isPublished, true))
      .orderBy(asc(galleries.displayOrder));
  }),

  // Get single gallery by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const [gallery] = await ctx.db
        .select()
        .from(galleries)
        .where(eq(galleries.slug, input.slug))
        .limit(1);

      return gallery;
    }),

  // Get gallery with images
  getWithImages: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get gallery
      const [gallery] = await ctx.db
        .select()
        .from(galleries)
        .where(eq(galleries.slug, input.slug))
        .limit(1);

      if (!gallery) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Gallery not found",
        });
      }

      // Get images for this gallery
      const images = await ctx.db
        .select()
        .from(galleryImages)
        .where(eq(galleryImages.galleryId, gallery.id))
        .orderBy(asc(galleryImages.displayOrder));

      return {
        ...gallery,
        images,
      };
    }),
});
