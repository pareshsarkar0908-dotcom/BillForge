const PLAN_LIMITS = {
  starter: 5,
  professional: 50,
  business: Infinity,
};

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = req.body || {};
  if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) {
    return res.status(400).json({ error: "Invalid userId" });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };

  const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=plan_id,pdf_used,period_ends_at`, {
    headers,
  });
  if (!profileRes.ok) {
    return res.status(502).json({ error: "Could not fetch profile" });
  }

  const profiles = await profileRes.json();
  if (!profiles.length) {
    return res.status(404).json({ error: "Profile not found" });
  }

  const { plan_id, pdf_used, period_ends_at } = profiles[0];
  const limit = PLAN_LIMITS[plan_id] ?? 0;

  if (period_ends_at && new Date(period_ends_at) < new Date()) {
    return res.status(403).json({ error: "Monthly period expired. Please renew your plan." });
  }

  if (limit !== Infinity && pdf_used >= limit) {
    return res.status(403).json({ error: "Monthly PDF limit reached. Upgrade your plan." });
  }

  const patchRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({ pdf_used: pdf_used + 1, updated_at: new Date().toISOString() }),
  });

  if (!patchRes.ok) {
    return res.status(502).json({ error: "Failed to record PDF usage" });
  }

  return res.status(200).json({ ok: true, pdf_used: pdf_used + 1, limit });
}
