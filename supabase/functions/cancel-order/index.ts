import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-session-token",
};

const SHOPIFY_ACCESS_TOKEN = Deno.env.get("SHOPIFY_ACCESS_TOKEN")!;
const SHOPIFY_STORE_DOMAIN = "korasutrarevised-iv76s.myshopify.com";
const SHOPIFY_ADMIN_API_VERSION = "2024-10";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, reason } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ success: false, error: "Order ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate session token
    const sessionToken = req.headers.get("x-session-token");
    if (!sessionToken) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify session in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: session, error: sessionError } = await supabase
      .from("customer_sessions")
      .select("*")
      .eq("token", sessionToken)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: "Session expired" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // First, get the order to verify it can be cancelled
    const getOrderUrl = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/orders/${orderId}.json`;
    
    const getOrderResponse = await fetch(getOrderUrl, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    });

    if (!getOrderResponse.ok) {
      const errorText = await getOrderResponse.text();
      console.error("Failed to fetch order:", errorText);
      return new Response(
        JSON.stringify({ success: false, error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orderData = await getOrderResponse.json();
    const order = orderData.order;

    // Check if order can be cancelled
    if (order.cancelled_at) {
      return new Response(
        JSON.stringify({ success: false, error: "Order is already cancelled" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (order.fulfillment_status === 'fulfilled') {
      return new Response(
        JSON.stringify({ success: false, error: "Cannot cancel fulfilled orders. Please contact support for returns." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cancel the order
    const cancelUrl = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/orders/${orderId}/cancel.json`;
    
    const cancelBody: Record<string, unknown> = {};
    if (reason) {
      // Valid reasons: customer, fraud, inventory, declined, other
      cancelBody.reason = reason === 'changed_mind' ? 'customer' : 
                          reason === 'found_cheaper' ? 'customer' :
                          reason === 'wrong_item' ? 'customer' : 'other';
      cancelBody.email = true; // Send cancellation email to customer
    }

    const cancelResponse = await fetch(cancelUrl, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cancelBody),
    });

    if (!cancelResponse.ok) {
      const errorText = await cancelResponse.text();
      console.error("Failed to cancel order:", errorText);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to cancel order. Please contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cancelData = await cancelResponse.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Order cancelled successfully",
        order: {
          id: cancelData.order.id,
          orderNumber: cancelData.order.name,
          cancelledAt: cancelData.order.cancelled_at,
          cancelReason: cancelData.order.cancel_reason,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in cancel-order:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to cancel order" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
