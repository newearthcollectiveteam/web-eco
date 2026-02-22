import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import * as fs from "fs";
import * as path from "path";

interface ScannedRoute {
  path: string;
  type: "page" | "api";
  access: "public" | "admin";
}

function scanAppDir(dir: string, basePath = ""): ScannedRoute[] {
  const routes: ScannedRoute[] = [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return routes;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      // Check for page.tsx or route.ts
      if (entry.name === "page.tsx" || entry.name === "page.ts") {
        const routePath = basePath || "/";
        routes.push({
          path: routePath,
          type: "page",
          access: routePath.startsWith("/admin") ? "admin" : "public",
        });
      }
      if (entry.name === "route.ts" || entry.name === "route.tsx") {
        const routePath = basePath || "/";
        routes.push({
          path: routePath,
          type: "api",
          access: routePath.startsWith("/admin") ? "admin" : "public",
        });
      }
      continue;
    }

    // Skip internal Next.js dirs
    if (entry.name.startsWith("_")) continue;

    // Handle route groups: (site) -> strip parens from path
    const segment = entry.name;
    if (segment.startsWith("(") && segment.endsWith(")")) {
      // Route group — don't add to path
      routes.push(
        ...scanAppDir(path.join(dir, entry.name), basePath)
      );
      continue;
    }

    // Dynamic segments: [slug] -> [slug]
    routes.push(
      ...scanAppDir(
        path.join(dir, entry.name),
        `${basePath}/${segment}`
      )
    );
  }

  return routes;
}

export const ecosystemRouter = createTRPCRouter({
  scanRoutes: protectedProcedure.query(() => {
    const appDir = path.join(process.cwd(), "src", "app");
    return scanAppDir(appDir);
  }),
});
