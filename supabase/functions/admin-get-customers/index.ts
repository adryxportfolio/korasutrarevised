import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
};

const SHOPIFY_STORE_DOMAIN = Deno.env.get("SHOPIFY_STORE_DOMAIN") || "korasutra.myshopify.com";
const SHOPIFY_ACCESS_TOKEN = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
const SHOPIFY_API_VERSION = "2025-07";

async function validateAdminToken(supabase: any, token: string | null) {
  if (!token) return null;
  const { data } = await supabase
    .from("admin_sessions")
    .select("admin_id, expires_at")
    .eq("token", token)
    .single();
  if (!data) return null;
  if (new Date(data.expires_at) < new Date()) {
    await supabase.from("admin_sessions").delete().eq("token", token);
    return null;
  }
  return data;
}

async function getShopifyOrdersByPhone(phone: string, countryCode: string) {
  if (!SHOPIFY_ACCESS_TOKEN) return [];
  
  const cleanPhone = phone.replace(/\D/g, "");
  const formats = [
    `${countryCode}${cleanPhone}`,
    `+${countryCode.replace("+", "")}${cleanPhone}`,
    cleanPhone,
  ];

  const allOrders: any[] = [];
  const seen = new Set<string>();

  for (const fmt of formats) {
    const query = `phone:${fmt}`;
    const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/orders.json?status=any&query=${encodeURIComponent(query)}&limit=10`;
    
    try {
      const res = await fetch(url, {
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN!,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) continue;
      const data = await res.json();
      for (const order of data.orders || []) {
        if (!seen.has(order.id.toString())) {
          seen.add(order.id.toString());
          allOrders.push(order);
        }
      }
    } catch { continue; }
  }

  return allOrders;
}

async function getShopifyOrdersByEmail(email: string) {
  if (!SHOPIFY_ACCESS_TOKEN || !email) return [];
  
  const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/orders.json?status=any&email=${encodeURIComponent(email)}&limit=10`;
  
  try {
    const res = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN!,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.orders || [];
  } catch { return []; }
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const adminToken = req.headers.get("x-admin-token");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const session = await validateAdminToken(supabase, adminToken);
    if (!session) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch all customers from Supabase
    const { data: customers, error } = await supabase
      .from("customers")
      .select("id, phone, country_code, name, email, is_verified, shopify_customer_id, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch customers" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For each customer, fetch their Shopify orders
    const customersWithOrders = await Promise.all(
      (customers || []).map(async (customer) => {
        let orders: any[] = [];
        
        // Try by email first (more accurate), then by phone
        if (customer.email) {
          orders = await getShopifyOrdersByEmail(customer.email);
        }
        
        if (orders.length === 0) {
          orders = await getShopifyOrdersByPhone(customer.phone, customer.country_code);
        }

        const transformedOrders = orders.map((order: any) => ({
          id: order.id,
          name: order.name,
          financialStatus: order.financial_status,
          fulfillmentStatus: order.fulfillment_status,
          totalPrice: order.total_price,
          currency: order.currency,
          createdAt: order.created_at,
          lineItems: (order.line_items || []).slice(0, 3).map((item: any) => ({
            title: item.title,
            quantity: item.quantity,
            price: item.price,
          })),
        }));

        return {
          id: customer.id,
          phone: customer.phone,
          countryCode: customer.country_code,
          name: customer.name,
          email: customer.email,
          isVerified: customer.is_verified,
          shopifyCustomerId: customer.shopify_customer_id,
          createdAt: customer.created_at,
          lastActivity: customer.updated_at,
          orders: transformedOrders,
          totalOrders: transformedOrders.length,
          totalSpent: transformedOrders.reduce((sum: number, o: any) => sum + parseFloat(o.totalPrice || "0"), 0),
        };
      })
    );

    return new Response(
      JSON.stringify({ success: true, customers: customersWithOrders, total: customersWithOrders.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
