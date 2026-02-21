import { env } from "~/env";

/** Base URL for Supabase Storage public objects */
export const STORAGE_BASE = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`;

/** Build a full public URL for an asset in the Assetts bucket */
export function assetUrl(path: string) {
  return `${STORAGE_BASE}/Assetts/${path}`;
}
