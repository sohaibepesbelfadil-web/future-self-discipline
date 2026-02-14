import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AppleTokenPayload {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string; // stable subject (Apple unique user ID)
  email?: string;
  email_verified?: string;
  nonce?: string;
}

/** Fetch Apple's public keys and verify the ID token */
async function verifyAppleIdToken(idToken: string, clientId: string): Promise<AppleTokenPayload> {
  // Decode header to get kid
  const [headerB64] = idToken.split(".");
  const header = JSON.parse(atob(headerB64.replace(/-/g, "+").replace(/_/g, "/")));
  const kid = header.kid;

  // Fetch Apple's public keys
  const res = await fetch("https://appleid.apple.com/auth/keys");
  if (!res.ok) throw new Error("Failed to fetch Apple public keys");
  const { keys } = await res.json();

  const jwk = keys.find((k: { kid: string }) => k.kid === kid);
  if (!jwk) throw new Error("No matching Apple public key found");

  // Import the key
  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );

  // Verify signature
  const parts = idToken.split(".");
  const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const signature = Uint8Array.from(
    atob(parts[2].replace(/-/g, "+").replace(/_/g, "/")),
    (c) => c.charCodeAt(0)
  );

  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, data);
  if (!valid) throw new Error("Invalid Apple ID token signature");

  // Decode payload
  const payload: AppleTokenPayload = JSON.parse(
    atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
  );

  // Validate claims
  if (payload.iss !== "https://appleid.apple.com") throw new Error("Invalid issuer");
  if (payload.aud !== clientId) throw new Error("Invalid audience");
  if (payload.exp * 1000 < Date.now()) throw new Error("Token expired");

  return payload;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { id_token } = await req.json();
    if (!id_token) {
      return new Response(JSON.stringify({ error: "Missing id_token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clientId = Deno.env.get("APPLE_CLIENT_ID");
    if (!clientId) {
      return new Response(JSON.stringify({ error: "Apple client ID not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Verify the Apple ID token
    const payload = await verifyAppleIdToken(id_token, clientId);
    const appleSubject = payload.sub;
    const appleEmail = payload.email || null;

    // 2. Use service role to manage users
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 3. Check if identity exists by stable subject
    const { data: existingIdentity } = await supabaseAdmin
      .from("user_identities")
      .select("user_id")
      .eq("provider", "apple")
      .eq("provider_subject", appleSubject)
      .maybeSingle();

    let userId: string;

    if (existingIdentity) {
      // Subject found → authenticate that user
      userId = existingIdentity.user_id;

      // Update email snapshot if provided
      if (appleEmail) {
        await supabaseAdmin
          .from("user_identities")
          .update({ email_snapshot: appleEmail })
          .eq("provider", "apple")
          .eq("provider_subject", appleSubject);
      }
    } else if (appleEmail) {
      // No subject match, but email provided → check for existing account
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("user_id")
        .eq("email", appleEmail)
        .maybeSingle();

      if (existingProfile) {
        // Link this Apple subject to the existing account
        userId = existingProfile.user_id;
        await supabaseAdmin.from("user_identities").insert({
          user_id: userId,
          provider: "apple",
          provider_subject: appleSubject,
          email_snapshot: appleEmail,
        });
      } else {
        // Create a new user
        const tempPassword = crypto.randomUUID();
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: appleEmail,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { provider: "apple", apple_sub: appleSubject },
        });

        if (createError || !newUser.user) {
          throw new Error(`Failed to create user: ${createError?.message}`);
        }

        userId = newUser.user.id;

        // Link Apple identity
        await supabaseAdmin.from("user_identities").insert({
          user_id: userId,
          provider: "apple",
          provider_subject: appleSubject,
          email_snapshot: appleEmail,
        });
      }
    } else {
      // No subject match, no email → create user with generated email
      const generatedEmail = `apple_${appleSubject.substring(0, 8)}@private.apple.com`;
      const tempPassword = crypto.randomUUID();

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: generatedEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { provider: "apple", apple_sub: appleSubject },
      });

      if (createError || !newUser.user) {
        throw new Error(`Failed to create user: ${createError?.message}`);
      }

      userId = newUser.user.id;

      await supabaseAdmin.from("user_identities").insert({
        user_id: userId,
        provider: "apple",
        provider_subject: appleSubject,
      });
    }

    // 4. Generate a session token for the user
    // Use admin.generateLink to create a magic link token, then return it
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: (await supabaseAdmin.auth.admin.getUserById(userId)).data.user?.email || "",
    });

    if (linkError || !linkData) {
      throw new Error(`Failed to generate session: ${linkError?.message}`);
    }

    // Extract the token from the link
    const url = new URL(linkData.properties.action_link);
    const token = url.searchParams.get("token") || url.hash?.replace("#", "");

    return new Response(
      JSON.stringify({
        token: linkData.properties.hashed_token,
        type: "magiclink",
        redirect_to: "/dashboard",
        user_id: userId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Apple auth error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
