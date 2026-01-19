import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendOtpRequest {
  phone: string;
  countryCode: string;
}

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hash the OTP for storage
async function hashOTP(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, countryCode }: SendOtpRequest = await req.json();

    if (!phone || !countryCode) {
      return new Response(
        JSON.stringify({ error: "Phone number and country code are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate phone number format
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fullPhone = `${countryCode}${cleanPhone}`;
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    
    // OTP expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Delete any existing OTPs for this phone number
    await supabase
      .from("otp_verifications")
      .delete()
      .eq("phone", cleanPhone)
      .eq("country_code", countryCode);

    // Store the OTP hash
    const { error: insertError } = await supabase
      .from("otp_verifications")
      .insert({
        phone: cleanPhone,
        country_code: countryCode,
        otp_hash: otpHash,
        expires_at: expiresAt,
        verified: false,
        attempts: 0,
      });

    if (insertError) {
      console.error("Failed to store OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate OTP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send OTP via MSG91
    const msg91AuthKey = Deno.env.get("MSG91_AUTH_KEY");
    const msg91TemplateId = Deno.env.get("MSG91_TEMPLATE_ID");
    const msg91SenderId = Deno.env.get("MSG91_SENDER_ID") || "KORASUTRA";

    if (!msg91AuthKey || !msg91TemplateId) {
      console.error("MSG91 credentials not configured");
      return new Response(
        JSON.stringify({ error: "SMS service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // MSG91 Send OTP API
    const msg91Response = await fetch("https://control.msg91.com/api/v5/otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authkey": msg91AuthKey,
      },
      body: JSON.stringify({
        template_id: msg91TemplateId,
        mobile: fullPhone.replace("+", ""),
        otp: otp,
        sender: msg91SenderId,
        otp_length: 6,
        otp_expiry: 5,
      }),
    });

    const msg91Result = await msg91Response.json();
    console.log("MSG91 response:", msg91Result);

    if (msg91Result.type === "error") {
      console.error("MSG91 error:", msg91Result);
      return new Response(
        JSON.stringify({ error: "Failed to send OTP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "OTP sent successfully",
        expiresIn: 300 // 5 minutes in seconds
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-otp:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
