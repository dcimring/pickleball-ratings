import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

/**
 * OpenNext → Cloudflare Workers.
 *
 * ISR pages (rankings, player profiles, sitemap: `revalidate = 3600`) are
 * cached in the R2 bucket bound as NEXT_INC_CACHE_R2_BUCKET in wrangler.jsonc.
 * Create it once with: npx wrangler r2 bucket create caymandink-cache
 */
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
