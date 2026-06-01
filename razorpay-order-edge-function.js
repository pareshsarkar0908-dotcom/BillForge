// Supabase Edge Function example for creating Razorpay orders.
// Deploy as an Edge Function, then put its URL in script.js appConfig.createOrderEndpoint.
//
// Required secrets:
// RAZORPAY_KEY_ID
// RAZORPAY_KEY_SECRET

const plans = {
  basic: { amount: 4900 },
  growth: { amount: 9900 },
  pro: { amount: 19900 },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { planId, email } = await req.json();
  const plan = plans[planId];
  if (!plan) {
    return Response.json({ error: "Invalid plan" }, { status: 400 });
  }

  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
  const auth = btoa(`${keyId}:${keySecret}`);

  const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: plan.amount,
      currency: "INR",
      receipt: `billforge_${planId}_${Date.now()}`,
      notes: { email, planId },
    }),
  });

  const order = await orderResponse.json();
  return Response.json(order, {
    status: orderResponse.status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    },
  });
});
