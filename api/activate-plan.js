import crypto from "node:crypto";

const ALLOWED_PLANS = ["starter", "professional", "business"];

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planId } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing payment fields" });
  }
  if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) {
    return res.status(400).json({ error: "Invalid userId" });
  }
  if (!planId || !ALLOWED_PLANS.includes(planId)) {
    return res.status(400).json({ error: "Invalid planId" });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest();
  const received = Buffer.from(razorpay_signature, "hex");

  let verified = false;
  try {
    verified = expected.length === received.length && crypto.timingSafeEqual(expected, received);
  } catch {
    verified = false;
  }

  if (!verified) {
    return res.status(400).json({ error: "Payment signature invalid" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  const now = new Date().toISOString();
  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const response = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
    method: "PATCH",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      plan_id: planId,
      pdf_used: 0,
      period_started_at: now,
      period_ends_at: periodEnd,
      updated_at: now,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    return res.status(502).json({ error: "Failed to activate plan", detail: text });
  }

  return res.status(200).json({ ok: true, planId });
}
