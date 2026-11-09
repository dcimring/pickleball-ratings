"use server";

import { headers } from "next/headers";
import { adminSupabase } from "@/lib/admin";

export type FeatureRequestState = {
  success?: boolean;
  error?: string;
};

// Per-isolate sliding-window rate limit. Worker isolates don't share
// this map, so it's a soft cap — enough to stop casual abuse of a public action.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const submissionLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (submissionLog.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    submissionLog.set(ip, recent);
    return true;
  }
  recent.push(now);
  submissionLog.set(ip, recent);
  // Keep the map from growing unboundedly
  if (submissionLog.size > 1000) {
    for (const [key, times] of submissionLog) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) submissionLog.delete(key);
    }
  }
  return false;
}

async function clientIp(): Promise<string> {
  const requestHeaders = await headers();
  return (
    requestHeaders.get("cf-connecting-ip") ||
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

/** Stored alongside feature requests, marked so they're easy to find. */
export async function submitRemovalRequest(prevState: FeatureRequestState, formData: FormData): Promise<FeatureRequestState> {
  const playerName = ((formData.get("player_name") as string) ?? "").trim();
  const contact = ((formData.get("contact") as string) ?? "").trim();
  const note = ((formData.get("note") as string) ?? "").trim();

  if (formData.get("website")) {
    return { success: true }; // Silently ignore bot submissions
  }

  if (isRateLimited(await clientIp())) {
    return { error: "Too many submissions. Please try again later." };
  }

  if (!playerName || playerName.length > 50) {
    return { error: "Please provide a player name under 50 characters." };
  }

  if (contact.length < 5 || contact.length > 120) {
    return { error: "Please provide an email address or WhatsApp number." };
  }

  if (note.length > 500) {
    return { error: "Please keep the note under 500 characters." };
  }

  try {
    const { error } = await adminSupabase
      .schema('pickleball_ratings')
      .from('feature_requests')
      .insert([
        {
          user_name: playerName,
          details: `[REMOVAL REQUEST] Contact: ${contact}${note ? ` | Note: ${note}` : ""}`,
        },
      ]);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    console.error("Removal Request Error:", err);
    return { error: "Failed to send your request. Please try again later." };
  }
}

export async function submitFeatureRequest(prevState: FeatureRequestState, formData: FormData): Promise<FeatureRequestState> {
  const userName = formData.get("user_name") as string;
  const details = formData.get("details") as string;
  const honeypot = formData.get("website") as string; // Hidden field for bot detection

  // 1. Bot check
  if (honeypot) {
    return { success: true }; // Silently ignore bot submissions
  }

  // 2. Rate limit by IP
  if (isRateLimited(await clientIp())) {
    return { error: "Too many submissions. Please try again later." };
  }

  // 3. Validation
  if (!userName || userName.length > 50) {
    return { error: "Please provide a name under 50 characters." };
  }

  if (!details || details.length < 10 || details.length > 1000) {
    return { error: "Please provide details between 10 and 1000 characters." };
  }

  try {
    // 4. Secure Insertion (using service_role client)
    const { error } = await adminSupabase
      .schema('pickleball_ratings')
      .from('feature_requests')
      .insert([
        { 
          user_name: userName.trim(), 
          details: details.trim() 
        }
      ]);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    console.error("Feature Request Error:", err);
    return { error: "Failed to submit request. Please try again later." };
  }
}
