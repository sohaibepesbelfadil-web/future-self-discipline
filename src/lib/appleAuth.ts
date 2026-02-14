import { supabase } from "@/integrations/supabase/client";

/**
 * Initiates Apple Sign In using AppleJS inline.
 * Works on iOS, Android (via Despia), and Web.
 */
export async function signInWithApple(): Promise<{ success: boolean; error?: string }> {
  try {
    // AppleJS must be loaded in index.html
    const AppleID = (window as any).AppleID;
    if (!AppleID) {
      return { success: false, error: "AppleJS not loaded" };
    }

    // Request Apple credential
    const response = await AppleID.auth.signIn();
    const idToken = response.authorization?.id_token;

    if (!idToken) {
      return { success: false, error: "No ID token received from Apple" };
    }

    // Send to our custom edge function
    const { data, error } = await supabase.functions.invoke("apple-auth", {
      body: { id_token: idToken },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data?.token) {
      // Verify the OTP/magic link token to establish a session
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: data.token,
        type: "magiclink",
      });

      if (verifyError) {
        return { success: false, error: verifyError.message };
      }

      return { success: true };
    }

    return { success: false, error: "No session token returned" };
  } catch (err) {
    console.error("Apple Sign In error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Apple Sign In failed",
    };
  }
}

/**
 * Initialize AppleJS configuration.
 * Call this once on app load.
 */
export function initAppleJS(clientId: string, redirectURI: string) {
  const AppleID = (window as any).AppleID;
  if (!AppleID) return;

  AppleID.auth.init({
    clientId,
    scope: "name email",
    redirectURI,
    usePopup: true,
  });
}
