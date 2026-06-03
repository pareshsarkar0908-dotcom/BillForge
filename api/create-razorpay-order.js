const plans = {
  basic: { amount: 4900 },
  growth: { amount: 9900 },
  pro: { amount: 19900 },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { planId, email } = req.body || {};
    const plan = plans[planId];

    if (!plan) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({ error: "Razorpay environment variables are missing" });
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
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
        notes: {
          email: email || "",
          planId,
        },
      }),
    });

    const order = await orderResponse.json();
    return res.status(orderResponse.status).json(order);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to create Razorpay order" });
  }
}
