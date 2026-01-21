import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-session-token",
};

interface SyncCustomerRequest {
  customerId: string;
  name?: string;
  email?: string;
  address?: {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
  };
}

const SHOPIFY_STORE_DOMAIN = "korasutrarevised-iv76s.myshopify.com";
const SHOPIFY_API_VERSION = "2025-01";

// Validate session token and return customer ID
async function validateSession(
  supabaseUrl: string,
  supabaseServiceKey: string,
  sessionToken: string | null
): Promise<{ customerId: string | null; error: string | null }> {
  if (!sessionToken) {
    return { customerId: null, error: "Session token required" };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: session, error } = await supabase
    .from("customer_sessions")
    .select("customer_id, expires_at")
    .eq("token", sessionToken)
    .single();

  if (error || !session) {
    return { customerId: null, error: "Invalid session token" };
  }

  const sessionData = session as { customer_id: string; expires_at: string };

  if (new Date(sessionData.expires_at) < new Date()) {
    // Clean up expired session
    await supabase.from("customer_sessions").delete().eq("token", sessionToken);
    return { customerId: null, error: "Session expired" };
  }

  return { customerId: sessionData.customer_id, error: null };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerId, name, email, address }: SyncCustomerRequest = await req.json();

    if (!customerId) {
      return new Response(
        JSON.stringify({ error: "Customer ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get session token from headers
    const sessionToken = req.headers.get("x-session-token");

    // Validate session and ensure user can only modify their own data
    const { customerId: authenticatedCustomerId, error: authError } = await validateSession(
      supabaseUrl,
      supabaseServiceKey,
      sessionToken
    );

    if (authError || !authenticatedCustomerId) {
      return new Response(
        JSON.stringify({ error: authError || "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ensure user can only modify their own data
    if (authenticatedCustomerId !== customerId) {
      return new Response(
        JSON.stringify({ error: "Not authorized to modify this customer" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get customer from database
    const { data: customer, error: fetchError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (fetchError || !customer) {
      return new Response(
        JSON.stringify({ error: "Customer not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update customer in Supabase if name or email provided
    if (name || email) {
      const updateData: Record<string, string> = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;

      await supabase
        .from("customers")
        .update(updateData)
        .eq("id", customerId);
    }

    // Save address to Supabase if provided
    if (address) {
      // Set all other addresses as non-default
      await supabase
        .from("customer_addresses")
        .update({ is_default: false })
        .eq("customer_id", customerId);

      // Add new address as default
      await supabase
        .from("customer_addresses")
        .insert({
          customer_id: customerId,
          address_line1: address.address1,
          address_line2: address.address2 || null,
          city: address.city,
          state: address.province,
          postal_code: address.zip,
          country: address.country || "India",
          is_default: true,
        });
    }

    // Get Shopify access token
    const shopifyAccessToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
    if (!shopifyAccessToken) {
      console.error("Shopify access token not configured");
      return new Response(
        JSON.stringify({ error: "Shopify integration not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fullPhone = `${customer.country_code}${customer.phone}`;

    // Check if customer exists in Shopify
    let shopifyCustomerId = customer.shopify_customer_id;

    if (!shopifyCustomerId) {
      // Search for existing customer by phone
      const searchUrl = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers/search.json?query=phone:${encodeURIComponent(fullPhone)}`;
      
      const searchResponse = await fetch(searchUrl, {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken,
          "Content-Type": "application/json",
        },
      });

      const searchResult = await searchResponse.json();
      console.log("Shopify search result:", searchResult);

      if (searchResult.customers && searchResult.customers.length > 0) {
        shopifyCustomerId = searchResult.customers[0].id.toString();
      }
    }

    if (shopifyCustomerId) {
      // Update existing Shopify customer
      const updateUrl = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers/${shopifyCustomerId}.json`;
      
      const updatePayload: any = {
        customer: {
          id: shopifyCustomerId,
          phone: fullPhone,
        },
      };

      if (name) {
        const nameParts = name.split(" ");
        updatePayload.customer.first_name = nameParts[0];
        updatePayload.customer.last_name = nameParts.slice(1).join(" ") || "";
      }

      if (email) {
        updatePayload.customer.email = email;
      }

      if (address) {
        updatePayload.customer.addresses = [{
          address1: address.address1,
          address2: address.address2 || "",
          city: address.city,
          province: address.province,
          zip: address.zip,
          country: address.country || "India",
          phone: fullPhone,
          default: true,
        }];
      }

      const updateResponse = await fetch(updateUrl, {
        method: "PUT",
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      });

      const updateResult = await updateResponse.json();
      console.log("Shopify update result:", updateResult);

      if (updateResult.errors) {
        console.error("Shopify update error:", updateResult.errors);
      }
    } else {
      // Create new Shopify customer
      const createUrl = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers.json`;
      
      const nameParts = (name || "Customer").split(" ");
      const createPayload: any = {
        customer: {
          phone: fullPhone,
          first_name: nameParts[0],
          last_name: nameParts.slice(1).join(" ") || "",
          verified_email: !!email,
          send_email_welcome: false,
        },
      };

      if (email) {
        createPayload.customer.email = email;
      }

      if (address) {
        createPayload.customer.addresses = [{
          address1: address.address1,
          address2: address.address2 || "",
          city: address.city,
          province: address.province,
          zip: address.zip,
          country: address.country || "India",
          phone: fullPhone,
          default: true,
        }];
      }

      const createResponse = await fetch(createUrl, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createPayload),
      });

      const createResult = await createResponse.json();
      console.log("Shopify create result:", createResult);

      if (createResult.customer) {
        shopifyCustomerId = createResult.customer.id.toString();
      } else if (createResult.errors) {
        console.error("Shopify create error:", createResult.errors);
      }
    }

    // Update Supabase with Shopify customer ID
    if (shopifyCustomerId && shopifyCustomerId !== customer.shopify_customer_id) {
      await supabase
        .from("customers")
        .update({ shopify_customer_id: shopifyCustomerId })
        .eq("id", customerId);
    }

    // Get updated customer data
    const { data: updatedCustomer } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    // Get customer addresses
    const { data: addresses } = await supabase
      .from("customer_addresses")
      .select("*")
      .eq("customer_id", customerId)
      .order("is_default", { ascending: false });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Customer synced with Shopify",
        customer: {
          id: updatedCustomer?.id,
          phone: updatedCustomer?.phone,
          countryCode: updatedCustomer?.country_code,
          name: updatedCustomer?.name,
          email: updatedCustomer?.email,
          isVerified: updatedCustomer?.is_verified,
          shopifyCustomerId: updatedCustomer?.shopify_customer_id,
        },
        addresses: addresses?.map(addr => ({
          id: addr.id,
          address1: addr.address_line1,
          address2: addr.address_line2,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postal_code,
          country: addr.country,
          isDefault: addr.is_default,
        })),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in sync-shopify-customer:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
