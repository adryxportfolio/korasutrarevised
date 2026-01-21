import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyOtpRequest {
  phone: string;
  countryCode: string;
  otp: string;
}

// Hash the OTP for comparison
async function hashOTP(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Generate a cryptographically secure session token
function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, "0")).join("");
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, countryCode, otp }: VerifyOtpRequest = await req.json();

    if (!phone || !countryCode || !otp) {
      return new Response(
        JSON.stringify({ error: "Phone, country code, and OTP are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const otpHash = await hashOTP(otp);

    // Initialize Supabase client with service role for full access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the OTP record
    const { data: otpRecord, error: fetchError } = await supabase
      .from("otp_verifications")
      .select("*")
      .eq("phone", cleanPhone)
      .eq("country_code", countryCode)
      .eq("verified", false)
      .single();

    if (fetchError || !otpRecord) {
      return new Response(
        JSON.stringify({ error: "OTP not found or already verified" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if OTP has expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      await supabase.from("otp_verifications").delete().eq("id", otpRecord.id);
      return new Response(
        JSON.stringify({ error: "OTP has expired. Please request a new one." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      await supabase.from("otp_verifications").delete().eq("id", otpRecord.id);
      return new Response(
        JSON.stringify({ error: "Too many attempts. Please request a new OTP." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the OTP
    if (otpRecord.otp_hash !== otpHash) {
      // Increment attempts
      await supabase
        .from("otp_verifications")
        .update({ attempts: otpRecord.attempts + 1 })
        .eq("id", otpRecord.id);

      return new Response(
        JSON.stringify({ error: "Invalid OTP. Please try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // OTP verified successfully - mark as verified
    await supabase
      .from("otp_verifications")
      .update({ verified: true })
      .eq("id", otpRecord.id);

    // Check if customer exists or create a new one
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", cleanPhone)
      .eq("country_code", countryCode)
      .single();

    let customer;

    if (existingCustomer) {
      // Update existing customer as verified
      const { data: updatedCustomer, error: updateError } = await supabase
        .from("customers")
        .update({ is_verified: true })
        .eq("id", existingCustomer.id)
        .select()
        .single();

      if (updateError) {
        console.error("Failed to update customer:", updateError);
      }
      customer = updatedCustomer || existingCustomer;
    } else {
      // Create new customer
      const { data: newCustomer, error: createError } = await supabase
        .from("customers")
        .insert({
          phone: cleanPhone,
          country_code: countryCode,
          is_verified: true,
        })
        .select()
        .single();

      if (createError) {
        console.error("Failed to create customer:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create customer profile" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      customer = newCustomer;
    }

    // Generate session token and store it server-side
    const sessionToken = generateSessionToken();
    
    // Session expires in 30 days
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Delete any existing sessions for this customer (single session per customer)
    await supabase
      .from("customer_sessions")
      .delete()
      .eq("customer_id", customer.id);

    // Store the new session in the database
    const { error: sessionError } = await supabase
      .from("customer_sessions")
      .insert({
        customer_id: customer.id,
        token: sessionToken,
        expires_at: expiresAt,
      });

    if (sessionError) {
      console.error("Failed to create session:", sessionError);
      return new Response(
        JSON.stringify({ error: "Failed to create session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean up old OTP records
    await supabase.from("otp_verifications").delete().eq("id", otpRecord.id);

    // Also cleanup expired sessions periodically
    try {
      await supabase.rpc("cleanup_expired_sessions");
    } catch (e) {
      // Ignore cleanup errors
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "OTP verified successfully",
        customer: {
          id: customer.id,
          phone: customer.phone,
          countryCode: customer.country_code,
          name: customer.name,
          email: customer.email,
          isVerified: customer.is_verified,
          shopifyCustomerId: customer.shopify_customer_id,
        },
        sessionToken,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in verify-otp:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
