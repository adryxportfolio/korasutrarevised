import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-session-token",
};

const SHOPIFY_ACCESS_TOKEN = Deno.env.get("SHOPIFY_ACCESS_TOKEN")!;
const SHOPIFY_STORE_DOMAIN = "korasutrarevised-iv76s.myshopify.com";
const SHOPIFY_ADMIN_API_VERSION = "2024-10";

interface ShopifyOrder {
  id: number;
  admin_graphql_api_id: string;
  order_number: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
  financial_status: string;
  fulfillment_status: string | null;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  currency: string;
  cancel_reason: string | null;
  cancelled_at: string | null;
  line_items: Array<{
    id: number;
    title: string;
    quantity: number;
    price: string;
    variant_title: string | null;
    product_id: number;
    sku: string | null;
  }>;
  shipping_address: {
    first_name: string;
    last_name: string;
    address1: string;
    address2: string | null;
    city: string;
    province: string;
    zip: string;
    country: string;
    phone: string | null;
  } | null;
  fulfillments: Array<{
    id: number;
    status: string;
    tracking_number: string | null;
    tracking_url: string | null;
    tracking_company: string | null;
    created_at: string;
  }>;
}

async function getOrdersByPhone(phone: string, countryCode: string): Promise<ShopifyOrder[]> {
  // Format phone for Shopify search (try both with and without country code)
  const formattedPhone = phone.replace(/\D/g, '');
  const fullPhone = `${countryCode}${formattedPhone}`.replace('+', '');
  
  // Search orders by phone
  const searchQueries = [
    `phone:${fullPhone}`,
    `phone:${formattedPhone}`,
    `phone:+${countryCode.replace('+', '')}${formattedPhone}`,
  ];

  const allOrders: ShopifyOrder[] = [];
  const seenOrderIds = new Set<number>();

  for (const query of searchQueries) {
    try {
      const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/orders.json?status=any&limit=50&fields=id,admin_graphql_api_id,order_number,name,email,phone,created_at,updated_at,financial_status,fulfillment_status,total_price,subtotal_price,total_tax,currency,cancel_reason,cancelled_at,line_items,shipping_address,fulfillments`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error(`Shopify API error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const orders = data.orders || [];

      // Filter by phone match
      for (const order of orders) {
        const orderPhone = (order.phone || order.shipping_address?.phone || '').replace(/\D/g, '');
        if (
          !seenOrderIds.has(order.id) && 
          (orderPhone.includes(formattedPhone) || formattedPhone.includes(orderPhone) || orderPhone === fullPhone)
        ) {
          seenOrderIds.add(order.id);
          allOrders.push(order);
        }
      }
    } catch (error) {
      console.error(`Error searching orders:`, error);
    }
  }

  // Sort by created_at descending (newest first)
  allOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  return allOrders;
}

async function getOrdersByEmail(email: string): Promise<ShopifyOrder[]> {
  try {
    const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/orders.json?status=any&email=${encodeURIComponent(email)}&limit=50&fields=id,admin_graphql_api_id,order_number,name,email,phone,created_at,updated_at,financial_status,fulfillment_status,total_price,subtotal_price,total_tax,currency,cancel_reason,cancelled_at,line_items,shipping_address,fulfillments`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Shopify API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.orders || [];
  } catch (error) {
    console.error(`Error fetching orders by email:`, error);
    return [];
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, countryCode, email, customerId } = await req.json();

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

    // Fetch orders from Shopify
    let orders: ShopifyOrder[] = [];

    // Try email first if available
    if (email) {
      orders = await getOrdersByEmail(email);
    }

    // If no orders found by email, try phone
    if (orders.length === 0 && phone && countryCode) {
      orders = await getOrdersByPhone(phone, countryCode);
    }

    // Transform orders for frontend
    const transformedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.name,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      financialStatus: order.financial_status,
      fulfillmentStatus: order.fulfillment_status,
      totalPrice: order.total_price,
      currency: order.currency,
      cancelReason: order.cancel_reason,
      cancelledAt: order.cancelled_at,
      lineItems: order.line_items.map((item) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        variantTitle: item.variant_title,
        sku: item.sku,
      })),
      shippingAddress: order.shipping_address
        ? {
            name: `${order.shipping_address.first_name} ${order.shipping_address.last_name}`,
            address1: order.shipping_address.address1,
            address2: order.shipping_address.address2,
            city: order.shipping_address.city,
            province: order.shipping_address.province,
            zip: order.shipping_address.zip,
            country: order.shipping_address.country,
          }
        : null,
      fulfillments: order.fulfillments.map((f) => ({
        id: f.id,
        status: f.status,
        trackingNumber: f.tracking_number,
        trackingUrl: f.tracking_url,
        trackingCompany: f.tracking_company,
        createdAt: f.created_at,
      })),
      canCancel: !order.cancelled_at && order.fulfillment_status !== 'fulfilled' && order.financial_status !== 'refunded',
    }));

    return new Response(
      JSON.stringify({ success: true, orders: transformedOrders }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-customer-orders:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to fetch orders" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
