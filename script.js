const tools = {
  invoice: {
    type: "document",
    docType: "invoice",
    name: "Invoice Generator",
    badge: "Document",
    description: "Create invoices with customer details, tax, discount, item rows, and PDF saving.",
  },
  quotation: {
    type: "document",
    docType: "quotation",
    name: "Quotation/Estimate Generator",
    badge: "Document",
    description: "Prepare estimates and quotations with valid-until dates and itemized pricing.",
  },
  receipt: {
    type: "document",
    docType: "receipt",
    name: "Receipt Generator",
    badge: "Document",
    description: "Create clean payment receipts for customers after a sale or service.",
  },
  gst: {
    type: "calculator",
    name: "GST Calculator",
    category: "Tax",
    badge: "Calculator",
    description: "Calculate GST amount, base price, and final amount for inclusive or exclusive pricing.",
    fields: [
      { id: "amount", label: "Amount", value: 10000 },
      { id: "rate", label: "GST rate %", value: 18 },
      { id: "mode", label: "Price type", type: "select", options: [["exclusive", "GST extra"], ["inclusive", "GST included"]] },
    ],
    calculate(values) {
      const amount = values.amount;
      const rate = values.rate / 100;
      const base = values.mode === "inclusive" ? amount / (1 + rate) : amount;
      const gst = values.mode === "inclusive" ? amount - base : amount * rate;
      const total = values.mode === "inclusive" ? amount : amount + gst;
      return {
        results: [
          ["Base amount", money(base)],
          ["GST amount", money(gst)],
          ["Final amount", money(total)],
        ],
        insight: `GST is calculated at ${values.rate}% using ${values.mode === "inclusive" ? "inclusive" : "exclusive"} pricing.`,
      };
    },
  },
  margin: {
    type: "calculator",
    name: "Profit Margin Calculator",
    category: "Profit",
    badge: "Calculator",
    description: "Check profit, margin, and markup from cost price and selling price.",
    fields: [
      { id: "cost", label: "Cost price", value: 650 },
      { id: "selling", label: "Selling price", value: 999 },
    ],
    calculate(values) {
      const profit = values.selling - values.cost;
      const margin = values.selling ? (profit / values.selling) * 100 : 0;
      const markup = values.cost ? (profit / values.cost) * 100 : 0;
      return {
        results: [
          ["Profit", money(profit)],
          ["Margin", `${formatNumber(margin)}%`],
          ["Markup", `${formatNumber(markup)}%`],
        ],
        insight: profit >= 0 ? "Selling price is above cost." : "Selling price is below cost. Increase price or reduce cost.",
      };
    },
  },
  "break-even": {
    type: "calculator",
    name: "Break-Even Calculator",
    category: "Planning",
    badge: "Calculator",
    description: "Find how many units you need to sell to cover fixed costs.",
    fields: [
      { id: "fixed", label: "Fixed costs", value: 50000 },
      { id: "price", label: "Selling price per unit", value: 500 },
      { id: "variable", label: "Variable cost per unit", value: 260 },
    ],
    calculate(values) {
      const contribution = values.price - values.variable;
      const units = contribution > 0 ? Math.ceil(values.fixed / contribution) : 0;
      return {
        results: [
          ["Contribution/unit", money(contribution)],
          ["Break-even units", units.toLocaleString("en-IN")],
          ["Break-even sales", money(units * values.price)],
        ],
        insight: contribution > 0 ? "Each sale contributes toward fixed costs." : "Variable cost must be lower than selling price.",
      };
    },
  },
  roi: {
    type: "calculator",
    name: "ROI Calculator",
    category: "Investment",
    badge: "Calculator",
    description: "Measure return on investment from money invested and final return.",
    fields: [
      { id: "investment", label: "Investment", value: 25000 },
      { id: "return", label: "Return amount", value: 36000 },
    ],
    calculate(values) {
      const gain = values.return - values.investment;
      const roi = values.investment ? (gain / values.investment) * 100 : 0;
      const multiple = values.investment ? values.return / values.investment : 0;
      return {
        results: [
          ["Net gain", money(gain)],
          ["ROI", `${formatNumber(roi)}%`],
          ["Return multiple", `${formatNumber(multiple)}x`],
        ],
        insight: gain >= 0 ? "This investment is showing a positive return." : "This investment is currently negative.",
      };
    },
  },
  "cash-flow": {
    type: "calculator",
    name: "Cash Flow Tracker",
    category: "Cash",
    badge: "Tracker",
    description: "Track opening cash, cash coming in, cash going out, and closing cash.",
    fields: [
      { id: "opening", label: "Opening cash", value: 18000 },
      { id: "cashIn", label: "Cash in", value: 42000 },
      { id: "cashOut", label: "Cash out", value: 31500 },
    ],
    calculate(values) {
      const net = values.cashIn - values.cashOut;
      const closing = values.opening + net;
      return {
        results: [
          ["Net cash flow", money(net)],
          ["Closing cash", money(closing)],
          ["Cash status", closing >= values.opening ? "Improved" : "Reduced"],
        ],
        insight: net >= 0 ? "Cash increased during this period." : "Cash reduced during this period.",
      };
    },
  },
  expense: {
    type: "calculator",
    name: "Expense Tracker",
    category: "Expenses",
    badge: "Tracker",
    description: "Track income, expenses, and profit for a small business in a clear monthly view.",
    fields: [
      { id: "income", label: "Monthly income", value: 74500 },
      { id: "stock", label: "Stock expense", value: 18500 },
      { id: "rent", label: "Rent expense", value: 12000 },
      { id: "other", label: "Other expense", value: 12350 },
    ],
    calculate(values) {
      const expense = values.stock + values.rent + values.other;
      const profit = values.income - expense;
      const ratio = values.income ? (expense / values.income) * 100 : 0;
      return {
        results: [
          ["Total expenses", money(expense)],
          ["Estimated profit", money(profit)],
          ["Expense ratio", `${formatNumber(ratio)}%`],
        ],
        insight: profit >= 0 ? "Income is higher than expenses." : "Expenses are higher than income.",
      };
    },
  },
  tax: {
    type: "calculator",
    name: "Tax Calculator",
    category: "Tax",
    badge: "Calculator",
    description: "Estimate tax from income, deductions, and tax rate.",
    fields: [
      { id: "income", label: "Income", value: 600000 },
      { id: "deductions", label: "Deductions", value: 50000 },
      { id: "rate", label: "Tax rate %", value: 10 },
    ],
    calculate(values) {
      const taxable = Math.max(values.income - values.deductions, 0);
      const tax = taxable * (values.rate / 100);
      const afterTax = values.income - tax;
      return {
        results: [
          ["Taxable income", money(taxable)],
          ["Estimated tax", money(tax)],
          ["After-tax income", money(afterTax)],
        ],
        insight: "This is a simple estimate. Real tax rules can include slabs, cess, exemptions, and local rules.",
      };
    },
  },
};

const appConfig = {
  supabaseUrl: "https://fhujjvzvxuoavvrfagig.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZodWpqdnp2eHVvYXZ2cmZhZ2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTM2MTksImV4cCI6MjA5NTg2OTYxOX0.bkTCR0b5Jr2nCjyKZJBLHuqsWOPvQ2vY2RoD0JS7KKw",
  razorpayKeyId: "rzp_live_SvxaS8NNrTTmVP",
  // Production note: create Razorpay orders on a secure backend or Supabase Edge Function.
  createOrderEndpoint: "/api/create-razorpay-order",
};

const plans = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 0,
    limit: 5,
    label: "Free for first-time users",
    description: "Login and use every tool with 5 PDF generations.",
  },
  basic: {
    id: "basic",
    name: "Basic",
    price: 49,
    limit: 90,
    label: "Small shop",
    description: "All tools with 90 PDF generations.",
  },
  growth: {
    id: "growth",
    name: "Growth",
    price: 99,
    limit: 190,
    label: "Growing business",
    description: "All tools with 190 PDF generations.",
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 199,
    limit: 280,
    label: "High usage",
    description: "All tools with 280 PDF generations.",
  },
};

const state = {
  docType: "invoice",
  activeTool: "invoice",
  user: null,
  planId: "guest",
  pdfUsed: 0,
  pendingPdfCharge: false,
  items: [
    { description: "Landing page design", quantity: 1, rate: 12000 },
    { description: "Social media banner set", quantity: 2, rate: 2500 },
  ],
};

const form = document.querySelector("#documentForm");
const itemsList = document.querySelector("#itemsList");
const previewItems = document.querySelector("#previewItems");
const currency = document.querySelector("#currency");
const calculatorTool = document.querySelector("#calculatorTool");
const documentTool = document.querySelector("#documentTool");
const supabaseClient = createSupabaseClient();

const fields = {
  businessName: document.querySelector("#businessName"),
  businessDetails: document.querySelector("#businessDetails"),
  customerName: document.querySelector("#customerName"),
  customerDetails: document.querySelector("#customerDetails"),
  documentNumber: document.querySelector("#documentNumber"),
  documentDate: document.querySelector("#documentDate"),
  dueDate: document.querySelector("#dueDate"),
  taxRate: document.querySelector("#taxRate"),
  discount: document.querySelector("#discount"),
  notes: document.querySelector("#notes"),
};

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function money(value) {
  return `${currency.value}${formatNumber(value)}`;
}

function isSupabaseConfigured() {
  return appConfig.supabaseUrl.includes("supabase.co") && !appConfig.supabaseUrl.includes("YOUR_") && !appConfig.supabaseAnonKey.includes("YOUR_");
}

function createSupabaseClient() {
  if (!isSupabaseConfigured() || !window.supabase) return null;
  return window.supabase.createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey);
}

function localAccount() {
  return JSON.parse(localStorage.getItem("billforge_account") || "null");
}

function saveLocalAccount(account) {
  localStorage.setItem("billforge_account", JSON.stringify(account));
}

function profileKey() {
  return state.user?.email ? `billforge_profile_${state.user.email}` : "billforge_profile_guest";
}

function loadLocalProfile() {
  return JSON.parse(localStorage.getItem(profileKey()) || "null");
}

function saveLocalProfile(profile) {
  localStorage.setItem(profileKey(), JSON.stringify(profile));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function docLabel() {
  const labels = {
    invoice: "Invoice",
    quotation: "Quotation / Estimate",
    receipt: "Receipt",
  };
  return labels[state.docType];
}

function renderItemsEditor() {
  itemsList.innerHTML = "";

  state.items.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "item-row";
    row.innerHTML = `
      <input aria-label="Item description" type="text" value="${escapeHtml(item.description)}" data-index="${index}" data-field="description" />
      <input aria-label="Quantity" type="number" min="0" step="1" value="${item.quantity}" data-index="${index}" data-field="quantity" />
      <input aria-label="Rate" type="number" min="0" step="1" value="${item.rate}" data-index="${index}" data-field="rate" />
      <button class="remove-btn" aria-label="Remove item" type="button" data-remove="${index}">×</button>
    `;
    itemsList.appendChild(row);
  });
}

function updatePreview() {
  const typeLabel = docLabel();
  const dueLabel = state.docType === "invoice" ? "Due" : state.docType === "quotation" ? "Valid until" : "Paid on";
  const subtotal = state.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0), 0);
  const discount = Number(fields.discount.value || 0);
  const taxable = Math.max(subtotal - discount, 0);
  const tax = state.docType === "receipt" ? 0 : taxable * (Number(fields.taxRate.value || 0) / 100);
  const total = taxable + tax;

  document.querySelector("#previewTitle").textContent = typeLabel;
  document.querySelector("#previewDocType").textContent = typeLabel;
  document.querySelector("#dueLabel").textContent = dueLabel;
  document.querySelector("#dateDetailLabel").textContent = state.docType === "receipt" ? "Paid on" : "Due / valid until";
  document.querySelector("#customerLabel").textContent = state.docType === "receipt" ? "Received from" : "Bill to";
  document.querySelector("#previewBusinessName").textContent = fields.businessName.value || "Your Business";
  document.querySelector("#previewBusinessDetails").textContent = fields.businessDetails.value;
  document.querySelector("#previewCustomerName").textContent = fields.customerName.value || "Customer";
  document.querySelector("#previewCustomerDetails").textContent = fields.customerDetails.value;
  document.querySelector("#previewNumber").textContent = fields.documentNumber.value || "-";
  document.querySelector("#previewDate").textContent = formatDate(fields.documentDate.value);
  document.querySelector("#previewDueDate").textContent = formatDate(fields.dueDate.value);
  document.querySelector("#previewNotes").textContent = fields.notes.value;
  document.querySelector("#subtotalValue").textContent = money(subtotal);
  document.querySelector("#discountValue").textContent = money(discount);
  document.querySelector("#taxValue").textContent = money(tax);
  document.querySelector("#totalValue").textContent = money(total);

  previewItems.innerHTML = "";
  state.items.forEach((item) => {
    const amount = Number(item.quantity || 0) * Number(item.rate || 0);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(item.description || "Item")}</td>
      <td>${Number(item.quantity || 0)}</td>
      <td>${money(item.rate)}</td>
      <td>${money(amount)}</td>
    `;
    previewItems.appendChild(tr);
  });
}

function setDocType(nextType) {
  state.docType = nextType;
  document.querySelectorAll(".segment").forEach((button) => {
    button.classList.toggle("active", button.dataset.docType === nextType);
  });
  updatePreview();
}

function loadSample() {
  fields.businessName.value = "Quick Supply Co.";
  fields.businessDetails.value = "Park Street, Kolkata\nsupport@quicksupply.example\n+91 91234 56780";
  fields.customerName.value = state.docType === "receipt" ? "Green Leaf Cafe" : "Acme Retail";
  fields.customerDetails.value = "Attn: Operations Manager\nBengaluru, India";
  fields.documentNumber.value = state.docType === "invoice" ? "INV-2026-014" : state.docType === "quotation" ? "EST-2026-014" : "RCT-2026-014";
  fields.taxRate.value = state.docType === "receipt" ? "0" : "18";
  fields.discount.value = "250";
  fields.notes.value = state.docType === "receipt" ? "Payment received with thanks." : "Delivery within 3 business days after confirmation. Prices include standard support.";
  state.items = [
    { description: "Printed business documents", quantity: 100, rate: 18 },
    { description: "Design setup", quantity: 1, rate: 1200 },
    { description: "Express delivery", quantity: 1, rate: 350 },
  ];
  renderItemsEditor();
  updatePreview();
}

function showPage(pageName, updateHash = true) {
  const availablePages = ["dashboard", "tools", "pricing", "support", "privacy", "terms", "refund", "login"];
  const nextPage = availablePages.includes(pageName) ? pageName : "dashboard";
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.toggle("active", page.dataset.page === nextPage);
  });
  document.querySelectorAll("[data-page-link]").forEach((link) => {
    link.classList.toggle("active", link.dataset.pageLink === nextPage);
  });
  if (updateHash && window.location.hash !== `#${nextPage}`) {
    window.location.hash = nextPage;
  }
}

function setAuthView(view) {
  document.querySelector("#loginPanel").classList.toggle("hidden", view !== "login");
  document.querySelector("#createPanel").classList.toggle("hidden", view !== "create");
  document.querySelector("#forgotPanel").classList.toggle("hidden", view !== "forgot");
  document.querySelector("#resetPanel").classList.toggle("hidden", view !== "reset");
}

function setTool(toolKey) {
  const tool = tools[toolKey] || tools.invoice;
  state.activeTool = toolKey;
  const isDocument = tool.type === "document";
  documentTool.classList.toggle("hidden", !isDocument);
  calculatorTool.classList.toggle("hidden", isDocument);
  document.querySelectorAll(".tool-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.tool === toolKey);
  });

  if (isDocument) {
    setDocType(tool.docType);
    return;
  }

  renderCalculator(tool);
}

function renderCalculator(tool) {
  document.querySelector("#toolCategory").textContent = tool.category;
  document.querySelector("#toolName").textContent = tool.name;
  document.querySelector("#toolDescription").textContent = tool.description;
  document.querySelector("#resultTitle").textContent = tool.name;
  document.querySelector("#calcForm").innerHTML = tool.fields
    .map((field) => {
      if (field.type === "select") {
        return `
          <label>
            ${field.label}
            <select data-calc-field="${field.id}">
              ${field.options.map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}
            </select>
          </label>
        `;
      }
      return `
        <label>
          ${field.label}
          <input data-calc-field="${field.id}" type="number" step="0.01" value="${field.value}" />
        </label>
      `;
    })
    .join("");
  updateCalculator();
}

function readCalculatorValues(tool) {
  return Object.fromEntries(
    tool.fields.map((field) => {
      const input = document.querySelector(`[data-calc-field="${field.id}"]`);
      return [field.id, field.type === "select" ? input.value : Number(input.value || 0)];
    }),
  );
}

function updateCalculator() {
  const tool = tools[state.activeTool];
  if (!tool || tool.type !== "calculator") return;
  const output = tool.calculate(readCalculatorValues(tool));
  document.querySelector("#resultGrid").innerHTML = output.results
    .map(([label, value]) => `<div class="result-card"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
  document.querySelector("#insightBox").textContent = output.insight;
}

function renderFeatureCards(target, entries) {
  document.querySelector(target).innerHTML = entries
    .map(
      ([key, tool]) => `
        <article class="feature-card">
          <div>
            <span class="feature-badge">${tool.badge}</span>
            <h3>${tool.name}</h3>
            <p>${tool.description}</p>
          </div>
          <button type="button" data-open-tool="${key}">Open</button>
        </article>
      `,
    )
    .join("");
}

function renderPricing() {
  document.querySelector("#pricingCards").innerHTML = Object.values(plans)
    .map(
      (plan) => `
        <article class="pricing-card ${plan.id === "growth" ? "featured" : ""}">
          <p class="eyebrow">${plan.label}</p>
          <h2>${plan.name}</h2>
          <strong>${plan.price === 0 ? "Free" : `₹${plan.price}`}</strong>
          <p>${plan.description}</p>
          <ul class="plan-list">
            <li>All 10 tools included</li>
            <li>${plan.limit} PDF generations</li>
            <li>Login required</li>
          </ul>
          <button class="${plan.price === 0 ? "ghost-btn" : "primary-btn"}" type="button" data-plan-id="${plan.id}">
            ${plan.price === 0 ? "Activate Free" : "Pay with Razorpay"}
          </button>
        </article>
      `,
    )
    .join("");
}

function updateAccountUi() {
  const plan = plans[state.planId];
  const limit = plan?.limit || 0;
  const used = Math.min(state.pdfUsed, limit);
  const percent = limit ? Math.min((used / limit) * 100, 100) : 0;
  document.querySelector("#accountStatus").textContent = state.user ? `${state.user.email} · ${used}/${limit} PDFs` : "Guest";
  document.querySelector("#authNavLink").textContent = state.user ? "Account" : "Login";
  document.querySelector("#sampleBtn").textContent = state.user ? "Load Sample" : "Create Account";
  document.querySelector("#currentPlanName").textContent = state.user ? `${plan?.name || "No plan"} Package` : "Guest";
  document.querySelector("#accountEmailText").textContent = state.user ? `Logged in as ${state.user.email}` : "Not logged in";
  document.querySelector("#quotaText").textContent = state.user ? `${used} of ${limit} PDF generations used.` : "Login to start tracking PDF usage.";
  document.querySelector("#quotaBar").style.width = `${percent}%`;
}

async function loadProfile() {
  if (!state.user) {
    updateAccountUi();
    return;
  }

  if (supabaseClient) {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("plan_id,pdf_used")
      .eq("id", state.user.id)
      .single();
    if (!error && data) {
      state.planId = data.plan_id || "starter";
      state.pdfUsed = Number(data.pdf_used || 0);
      updateAccountUi();
      return;
    }
  }

  const profile = loadLocalProfile() || { planId: "starter", pdfUsed: 0 };
  state.planId = profile.planId;
  state.pdfUsed = Number(profile.pdfUsed || 0);
  saveLocalProfile(profile);
  updateAccountUi();
}

async function saveProfile() {
  if (!state.user) return;
  const profile = { planId: state.planId, pdfUsed: state.pdfUsed };
  saveLocalProfile(profile);

  if (supabaseClient) {
    await supabaseClient.from("profiles").upsert({
      id: state.user.id,
      email: state.user.email,
      plan_id: state.planId,
      pdf_used: state.pdfUsed,
      updated_at: new Date().toISOString(),
    });
  }
}

function setAuthMessage(message) {
  document.querySelector("#authMessage").textContent = message;
}

function setPaymentMessage(message) {
  const paymentMessage = document.querySelector("#paymentMessage");
  if (paymentMessage) paymentMessage.textContent = message;
}

async function initializeAuth() {
  if (supabaseClient) {
    const { data } = await supabaseClient.auth.getUser();
    state.user = data.user || null;
    if (state.user) await loadProfile();
    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      state.user = session?.user || null;
      await loadProfile();
    });
  } else {
    const account = localAccount();
    state.user = account?.loggedIn ? { id: account.email, email: account.email } : null;
    if (state.user) await loadProfile();
  }
  updateAccountUi();
}

async function handleCreateAccount(event) {
  event.preventDefault();
  const name = document.querySelector("#createName").value.trim();
  const email = document.querySelector("#createEmail").value.trim();
  const password = document.querySelector("#createPassword").value;

  if (supabaseClient) {
    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      setAuthMessage(error.message);
      return;
    }
  } else {
    saveLocalAccount({ name, email, password, loggedIn: false });
  }

  setAuthView("login");
  showPage("login");
  setAuthMessage("Account created. Please login now.");
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.querySelector("#loginEmail").value.trim();
  const password = document.querySelector("#loginPassword").value;

  if (supabaseClient) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthMessage(error.message);
      return;
    }
    state.user = data.user;
  } else {
    const account = localAccount();
    if (!account || account.email !== email || account.password !== password) {
      setAuthMessage("Demo login failed. Create an account first, or add Supabase keys.");
      return;
    }
    account.loggedIn = true;
    saveLocalAccount(account);
    state.user = { id: email, email };
  }

  await loadProfile();
  showPage("tools");
  setAuthMessage("Logged in successfully.");
}

async function handleForgotPassword(event) {
  event.preventDefault();
  const email = document.querySelector("#forgotEmail").value.trim();
  if (supabaseClient) {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname + "?reset=1",
    });
    setAuthMessage(error ? error.message : "Password reset link sent. Open the email and set a new password.");
  } else {
    setAuthMessage("Demo mode: add Supabase keys to send real password reset emails.");
  }
}

async function handleResetPassword(event) {
  event.preventDefault();
  const password = document.querySelector("#resetPassword").value;
  const confirmPassword = document.querySelector("#resetPasswordConfirm").value;
  if (password.length < 6) {
    setAuthMessage("Password must be at least 6 characters.");
    return;
  }
  if (password !== confirmPassword) {
    setAuthMessage("Both password fields must match.");
    return;
  }
  if (!supabaseClient) {
    setAuthMessage("Supabase is not connected.");
    return;
  }
  const { error } = await supabaseClient.auth.updateUser({ password });
  if (error) {
    setAuthMessage(error.message);
    return;
  }
  await supabaseClient.auth.signOut();
  setAuthView("login");
  showPage("login");
  window.history.replaceState({}, document.title, window.location.pathname + "#login");
  setAuthMessage("Password updated. Please login with your new password.");
}

function initPasswordResetView() {
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash || "";
  const isRecovery = params.get("reset") === "1" || hash.includes("type=recovery") || hash.includes("access_token=");
  if (!isRecovery) return;
  showPage("login", false);
  setAuthView("reset");
  setAuthMessage("Enter your new password to finish resetting your account.");
}

async function handleLogout() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  } else {
    const account = localAccount();
    if (account) saveLocalAccount({ ...account, loggedIn: false });
  }
  state.user = null;
  state.planId = "guest";
  state.pdfUsed = 0;
  updateAccountUi();
  showPage("login");
  setAuthMessage("Logged out.");
}

async function activatePlan(planId, paymentId = "") {
  const plan = plans[planId];
  if (!state.user) {
    showPage("login");
    setAuthMessage("Please login before choosing a package.");
    return;
  }
  state.planId = plan.id;
  state.pdfUsed = 0;
  await saveProfile();
  updateAccountUi();
  setAuthMessage(paymentId ? `Payment successful: ${paymentId}` : `${plan.name} package activated.`);
  setPaymentMessage(paymentId ? `${plan.name} package activated. Payment ID: ${paymentId}` : `${plan.name} package activated.`);
}

async function startPayment(planId) {
  const plan = plans[planId];
  if (!state.user) {
    showPage("login");
    setAuthMessage("Please login before payment.");
    setPaymentMessage("Please login before choosing a paid package.");
    return;
  }
  if (plan.price === 0) {
    await activatePlan(planId);
    return;
  }
  if (!window.Razorpay || appConfig.razorpayKeyId.includes("YOUR_")) {
    const message = "Payment is not ready. Add Razorpay Key ID in script.js and environment variables in Vercel.";
    setAuthMessage(message);
    setPaymentMessage(message);
    return;
  }

  setPaymentMessage(`Opening Razorpay for ${plan.name} package...`);

  try {
    const options = {
      key: appConfig.razorpayKeyId,
      amount: plan.price * 100,
      currency: "INR",
      name: "BillForge",
      description: `${plan.name} package`,
      prefill: { email: state.user.email },
      handler: async (response) => {
        await activatePlan(planId, response.razorpay_payment_id);
      },
      modal: {
        ondismiss: () => setPaymentMessage("Payment was closed before completion."),
      },
      theme: { color: "#0f766e" },
    };

    if (appConfig.createOrderEndpoint) {
      const orderResponse = await fetch(appConfig.createOrderEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, amount: plan.price * 100, email: state.user.email }),
      });
      const order = await orderResponse.json();
      if (!orderResponse.ok || !order.id) {
        throw new Error(order.error || "Razorpay order could not be created.");
      }
      options.order_id = order.id;
    }

    new window.Razorpay(options).open();
  } catch (error) {
    const message = `Payment could not start: ${error.message}`;
    setAuthMessage(message);
    setPaymentMessage(message);
  }
}

async function canGeneratePdf() {
  if (!state.user) {
    showPage("login");
    setAuthMessage("Please login to generate PDFs.");
    return false;
  }
  const plan = plans[state.planId];
  if (!plan) {
    showPage("pricing");
    return false;
  }
  if (state.pdfUsed >= plan.limit) {
    showPage("pricing");
    setAuthMessage("Your PDF limit is finished. Choose another package.");
    return false;
  }
  return true;
}

async function generatePdf() {
  const allowed = await canGeneratePdf();
  if (!allowed) return;
  state.pendingPdfCharge = true;
  window.print();
}

async function confirmPdfGenerated() {
  if (!state.pendingPdfCharge) return;
  state.pendingPdfCharge = false;

  const saved = window.confirm("Did the PDF save or print successfully?");
  if (!saved) return;

  state.pdfUsed += 1;
  await saveProfile();
  updateAccountUi();
}

function handleSampleAction() {
  if (!state.user) {
    setAuthView("create");
    showPage("login");
    setAuthMessage("Create an account to start using BillForge.");
    return;
  }
  loadSample();
}

function initializeDates() {
  const today = new Date();
  fields.documentDate.value = toDateInputValue(today);
  fields.dueDate.value = toDateInputValue(addDays(today, 7));
}

document.addEventListener("click", (event) => {
  const pageLink = event.target.closest("[data-page-link]");
  if (pageLink) {
    event.preventDefault();
    showPage(pageLink.dataset.pageLink);
  }

  const openTool = event.target.closest("[data-open-tool]");
  if (openTool) {
    showPage("tools");
    setTool(openTool.dataset.openTool);
  }

  const authView = event.target.closest("[data-auth-view]");
  if (authView) {
    setAuthView(authView.dataset.authView);
  }

  const planButton = event.target.closest("[data-plan-id]");
  if (planButton) {
    startPayment(planButton.dataset.planId);
  }
});

itemsList.addEventListener("input", (event) => {
  const input = event.target;
  const index = Number(input.dataset.index);
  const field = input.dataset.field;
  if (!Number.isNaN(index) && field) {
    state.items[index][field] = field === "description" ? input.value : Number(input.value);
    updatePreview();
  }
});

itemsList.addEventListener("click", (event) => {
  const removeIndex = event.target.dataset.remove;
  if (removeIndex !== undefined) {
    state.items.splice(Number(removeIndex), 1);
    if (state.items.length === 0) {
      state.items.push({ description: "", quantity: 1, rate: 0 });
    }
    renderItemsEditor();
    updatePreview();
  }
});

document.querySelector("#addItemBtn").addEventListener("click", () => {
  state.items.push({ description: "", quantity: 1, rate: 0 });
  renderItemsEditor();
  updatePreview();
});

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => setTool(button.dataset.docType));
});

document.querySelectorAll(".tool-tab").forEach((button) => {
  button.addEventListener("click", () => setTool(button.dataset.tool));
});

document.querySelector("#calcForm").addEventListener("input", updateCalculator);
document.querySelector("#sampleBtn").addEventListener("click", handleSampleAction);
document.querySelector("#printBtn").addEventListener("click", generatePdf);
document.querySelector("#printBtnMobile").addEventListener("click", generatePdf);
document.querySelector("#loginForm").addEventListener("submit", handleLogin);
document.querySelector("#createForm").addEventListener("submit", handleCreateAccount);
document.querySelector("#forgotForm").addEventListener("submit", handleForgotPassword);
document.querySelector("#resetForm").addEventListener("submit", handleResetPassword);
document.querySelector("#logoutBtn").addEventListener("click", handleLogout);
form.addEventListener("input", updatePreview);
window.addEventListener("hashchange", () => showPage((window.location.hash || "#dashboard").replace("#", ""), false));
window.addEventListener("afterprint", confirmPdfGenerated);

renderFeatureCards("#dashboardTools", Object.entries(tools));
renderPricing();
initializeDates();
renderItemsEditor();
updatePreview();
setTool("invoice");
showPage((window.location.hash || "#dashboard").replace("#", ""), false);
initializeAuth();
initPasswordResetView();
