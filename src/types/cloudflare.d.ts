import type { R2Bucket } from "@cloudflare/workers-types";

declare global {
  interface CloudflareEnv {
    R2_BUCKET: R2Bucket;
  }
}
