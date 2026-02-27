"use server";

import { adminSupabase } from "@/lib/admin";

export type FeatureRequestState = {
  success?: boolean;
  error?: string;
};

export async function submitFeatureRequest(prevState: FeatureRequestState, formData: FormData): Promise<FeatureRequestState> {
  const userName = formData.get("user_name") as string;
  const details = formData.get("details") as string;
  const honeypot = formData.get("website") as string; // Hidden field for bot detection

  // 1. Bot check
  if (honeypot) {
    return { success: true }; // Silently ignore bot submissions
  }

  // 2. Validation
  if (!userName || userName.length > 50) {
    return { error: "Please provide a name under 50 characters." };
  }

  if (!details || details.length < 10 || details.length > 1000) {
    return { error: "Please provide details between 10 and 1000 characters." };
  }

  try {
    // 3. Secure Insertion (using service_role client)
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
