import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // QR codes for the WhatsApp invite are fetched unoptimized; no Image
    // Optimization binding is configured on the Worker.
    unoptimized: true,
  },
};

// Makes Cloudflare bindings available to `next dev` via getCloudflareContext().
// Dev only: `next build` must not spin up workerd.
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

export default nextConfig;
