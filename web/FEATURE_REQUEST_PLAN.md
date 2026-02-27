# Feature Request Implementation Plan (Secure Server-Side)

This document outlines the architecture for the "Feature Request" system on **dinkdash.xyz**.

---

## 🏗 Architecture

### 1. Database Layer (Supabase)
- **Schema**: `pickleball_ratings`
- **Table**: `feature_requests`
- **Columns**:
  - `id`: UUID (Primary Key, Default: `gen_random_uuid()`)
  - `user_name`: TEXT
  - `details`: TEXT
  - `created_at`: TIMESTAMPTZ (Default: `now()`)
- **Security**: 
  - RLS Enabled.
  - **No Public Policies**: Access is restricted to the `service_role` only. This ensures the database remains "read-only" for all public API keys.

### 2. Logic Layer (Next.js Server Actions)
- **Environment**: Secure Vercel server-side execution.
- **Client**: A dedicated `adminSupabase` client using the `SUPABASE_SERVICE_ROLE_KEY`.
- **Validation (Spam Prevention)**:
  - `user_name`: Required, max 50 characters.
  - `details`: Required, min 10 characters, max 1000 characters.
  - **Honeypot**: A hidden form field that, if filled, causes the request to be silently ignored (bots typically fill all fields).
  - **Server-side Sanitization**: Basic stripping of HTML tags to prevent XSS.

### 3. Frontend Layer (React/Framer Motion)
- **UI State**: Integration into the existing SPA `activeView` state.
- **Feedback**:
  - `loading`: Visual spinner/pulse on the submit button.
  - `success`: A custom "celebration" state with an automatic redirect back to Rankings.
  - `error`: Clear inline messaging for validation failures.

---

## 🚀 Execution Steps
1. Execute SQL migration in Supabase.
2. Create `web/src/lib/admin.ts` for the secure client.
3. Create `web/src/app/actions.ts` for the submission logic.
4. Update `web/src/app/page.tsx` to include the new view and navigation.
