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
  createOrderEndpoint: "/api/create-razorpay-order",
  verifyPaymentEndpoint: "/api/verify-razorpay-payment",
};

const THEME_STORAGE_KEY = "billforge_theme";
const PLAN_PERIOD_DAYS = 30;

const plans = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 0,
    limit: 10,
    label: "Free monthly",
    description: "Use every tool with 10 PDF generations every month.",
  },
  basic: {
    id: "basic",
    name: "Basic",
    price: 49,
    limit: 100,
    label: "Small shop",
    description: "All tools with 100 PDF generations every month.",
  },
  growth: {
    id: "growth",
    name: "Growth",
    price: 99,
    limit: 250,
    label: "Growing business",
    description: "All tools with 250 PDF generations every month.",
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 199,
    limit: null,
    unlimited: true,
    label: "Best value",
    description: "All tools with unlimited PDF generations for 30 days.",
  },
};

const state = {
  docType: "invoice",
  templateStyle: "simple",
  activeTool: "invoice",
  user: null,
  planId: "guest",
  pendingPlanId: "",
  pdfUsed: 0,
  periodStartedAt: "",
  periodEndsAt: "",
  pendingPdfCharge: false,
  deferredInstallPrompt: null,
  calculatorValues: {},
  documents: [],
  customers: [],
  savedItems: [],
  businesses: [],
  activeBusinessId: "",
  taxes: [
    { name: "VAT", rate: 10 },
    { name: "Service Tax", rate: 5 },
  ],
  branding: {
    logo: "",
    signature: "",
    brandColor: "#0f766e",
    footerText: "",
  },
  historySearch: "",
  historyTypeFilter: "all",
  historySort: "updated_desc",
  items: [
    { description: "Landing page design", hsn: "998314", quantity: 1, unit: "Pcs.", rate: 12000 },
    { description: "Social media banner set", hsn: "998361", quantity: 2, unit: "Pcs.", rate: 2500 },
  ],
};

const form = document.querySelector("#documentForm");
const itemsList = document.querySelector("#itemsList");
const previewItems = document.querySelector("#previewItems");
const currency = document.querySelector("#currency");
const savedBusinessSelect = document.querySelector("#savedBusinessSelect");
const savedCustomerSelect = document.querySelector("#savedCustomerSelect");
const savedItemSelect = document.querySelector("#savedItemSelect");
const calculatorTool = document.querySelector("#calculatorTool");
const documentTool = document.querySelector("#documentTool");
const supabaseClient = createSupabaseClient();
let passwordRecoveryReady = false;

function withTimeout(promise, message = "Request timed out. Please try again.", ms = 12000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

function restoreButton(button) {
  if (button) button.disabled = false;
}

function resetLinkParams() {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams((window.location.hash || "").replace(/^#/, ""));
  return {
    code: query.get("code") || hash.get("code") || "",
    tokenHash: query.get("token_hash") || hash.get("token_hash") || "",
    accessToken: query.get("access_token") || hash.get("access_token") || "",
    refreshToken: query.get("refresh_token") || hash.get("refresh_token") || "",
    type: query.get("type") || hash.get("type") || "",
    reset: query.get("reset") || "",
  };
}

function isResetRequest() {
  const params = resetLinkParams();
  return !!(params.reset === "1" || params.code || params.tokenHash || params.accessToken || params.type === "recovery");
}

function resetRedirectUrl() {
  return `${window.location.origin}${window.location.pathname}?reset=1`;
}

async function activateRecoverySession() {
  if (!supabaseClient) return false;
  const params = resetLinkParams();
  if (params.tokenHash) {
    const { error } = await withTimeout(
      supabaseClient.auth.verifyOtp({
        token_hash: params.tokenHash,
        type: "recovery",
      }),
      "Could not activate the reset link. Please request a new password reset email.",
      15000
    );
    if (error) throw error;
    passwordRecoveryReady = true;
    return true;
  }
  if (params.code) {
    const { error } = await withTimeout(
      supabaseClient.auth.exchangeCodeForSession(params.code),
      "Could not activate the reset link. Please request a new password reset email.",
      15000
    );
    if (error) throw error;
    passwordRecoveryReady = true;
    return true;
  }
  if (params.accessToken && params.refreshToken) {
    const { error } = await withTimeout(
      supabaseClient.auth.setSession({
        access_token: params.accessToken,
        refresh_token: params.refreshToken,
      }),
      "Could not activate the reset link. Please request a new password reset email.",
      15000
    );
    if (error) throw error;
    passwordRecoveryReady = true;
    return true;
  }
  return passwordRecoveryReady;
}

const fields = {
  templateStyle: document.querySelector("#templateStyle"),
  businessName: document.querySelector("#businessName"),
  businessEmail: document.querySelector("#businessEmail"),
  businessPhone: document.querySelector("#businessPhone"),
  businessWebsite: document.querySelector("#businessWebsite"),
  businessDetails: document.querySelector("#businessDetails"),
  businessGstin: document.querySelector("#businessGstin"),
  customerName: document.querySelector("#customerName"),
  customerBusinessName: document.querySelector("#customerBusinessName"),
  customerEmail: document.querySelector("#customerEmail"),
  customerDetails: document.querySelector("#customerDetails"),
  customerGstin: document.querySelector("#customerGstin"),
  customerPan: document.querySelector("#customerPan"),
  customerMobile: document.querySelector("#customerMobile"),
  shipToDetails: document.querySelector("#shipToDetails"),
  documentNumber: document.querySelector("#documentNumber"),
  documentDate: document.querySelector("#documentDate"),
  dueDate: document.querySelector("#dueDate"),
  taxSystem: document.querySelector("#taxSystem"),
  taxRate: document.querySelector("#taxRate"),
  taxMode: document.querySelector("#taxMode"),
  placeOfSupply: document.querySelector("#placeOfSupply"),
  reverseCharge: document.querySelector("#reverseCharge"),
  transport: document.querySelector("#transport"),
  vehicleNo: document.querySelector("#vehicleNo"),
  ewayBill: document.querySelector("#ewayBill"),
  discount: document.querySelector("#discount"),
  notes: document.querySelector("#notes"),
  businessLogoUpload: document.querySelector("#businessLogoUpload"),
  signatureUpload: document.querySelector("#signatureUpload"),
  brandColor: document.querySelector("#brandColor"),
  footerText: document.querySelector("#footerText"),
};

const templateOptionsByType = {
  invoice: [
    ["simple", "Simple"],
    ["modern", "Modern"],
    ["tax-invoice", "Tax Invoice"],
    ["gst", "GST invoice"],
  ],
  quotation: [
    ["quotation", "Quotation"],
    ["estimate", "Estimate"],
  ],
  receipt: [["receipt", "Receipt"]],
};

function templateForDocType(docType, selectedTemplate = "") {
  const options = templateOptionsByType[docType] || templateOptionsByType.invoice;
  if (options.some(([value]) => value === selectedTemplate)) return selectedTemplate;
  return options[0][0];
}

function renderTemplateOptions(docType, selectedTemplate = "") {
  const options = templateOptionsByType[docType] || templateOptionsByType.invoice;
  const nextTemplate = templateForDocType(docType, selectedTemplate);
  fields.templateStyle.innerHTML = options
    .map(([value, label]) => `<option value="${value}">${label}</option>`)
    .join("");
  fields.templateStyle.value = nextTemplate;
  return nextTemplate;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

function nonNegativeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(number, 0) : fallback;
}

function clampMinZeroInput(input) {
  if (!input || input.type !== "number" || input.min !== "0" || input.value === "") return;
  const value = Number(input.value);
  if (!Number.isFinite(value) || value < 0) {
    input.value = "0";
  }
}

function money(value) {
  return `${currency.value}${formatNumber(value)}`;
}

function compactMoney(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function normalizeTaxRows(rows = []) {
  return rows
    .map((tax) => ({
      name: String(tax.name || tax.tax_name || "").trim(),
      rate: nonNegativeNumber(tax.rate ?? tax.tax_rate ?? tax.percentage),
    }))
    .filter((tax) => tax.name && tax.rate > 0)
    .slice(0, 6);
}

function readTaxRowsFromEditor() {
  const rows = [...document.querySelectorAll("#taxRowsList .tax-row")].map((row) => ({
    name: row.querySelector("[data-tax-field='name']")?.value || "",
    rate: row.querySelector("[data-tax-field='rate']")?.value || 0,
  }));
  return normalizeTaxRows(rows);
}

function gstPresetTaxes() {
  const taxRate = fields.taxMode.value === "none" || state.docType === "receipt" ? 0 : nonNegativeNumber(fields.taxRate.value);
  if (!taxRate) return [];
  if (fields.taxMode.value === "cgst_sgst") {
    return [
      { name: "CGST", rate: taxRate / 2 },
      { name: "SGST", rate: taxRate / 2 },
    ];
  }
  return [{ name: "IGST", rate: taxRate }];
}

function activeTaxRows() {
  if (state.docType === "receipt") return [];
  if (!fields.taxSystem || fields.taxSystem.value === "none") return [];
  if (fields.taxSystem.value === "gst") return gstPresetTaxes();
  const editedTaxes = readTaxRowsFromEditor();
  state.taxes = editedTaxes.length ? editedTaxes : state.taxes;
  return normalizeTaxRows(state.taxes);
}

function calculateTotals() {
  const subtotal = state.items.reduce((sum, item) => sum + nonNegativeNumber(item.quantity) * nonNegativeNumber(item.rate), 0);
  const discount = nonNegativeNumber(fields.discount.value);
  const taxable = Math.max(subtotal - discount, 0);
  const taxes = activeTaxRows().map((tax) => ({
    ...tax,
    amount: taxable * (tax.rate / 100),
  }));
  const taxTotal = taxes.reduce((sum, tax) => sum + tax.amount, 0);
  return {
    subtotal,
    discount,
    taxable,
    taxes,
    taxTotal,
    total: taxable + taxTotal,
  };
}

function renderTaxRowsEditor(taxes = state.taxes) {
  const target = document.querySelector("#taxRowsList");
  if (!target) return;
  const rows = normalizeTaxRows(taxes).length ? normalizeTaxRows(taxes) : [{ name: "", rate: 0 }];
  target.innerHTML = rows.map((tax, index) => `
    <div class="tax-row">
      <input type="text" aria-label="Tax name" placeholder="Tax name" value="${escapeHtml(tax.name)}" data-tax-index="${index}" data-tax-field="name" />
      <input type="number" min="0" step="0.01" aria-label="Tax percentage" placeholder="%" value="${nonNegativeNumber(tax.rate)}" data-tax-index="${index}" data-tax-field="rate" />
      <button class="remove-btn" type="button" aria-label="Remove tax" data-remove-tax="${index}">×</button>
    </div>
  `).join("");
}

function renderTaxTotalRows(taxes = []) {
  return taxes.map((tax) => `
    <p><span>${escapeHtml(tax.name)} ${compactMoney(tax.rate)}%</span> <strong>${money(tax.amount)}</strong></p>
  `).join("");
}

function renderGenericTaxSummary(taxes = [], taxable = 0) {
  if (!taxes.length) {
    return `<tr><td colspan="7">No taxes applied.</td></tr>`;
  }
  const body = taxes.map((tax) => `
    <tr>
      <td>All items</td>
      <td>${escapeHtml(tax.name)} ${compactMoney(tax.rate)}%</td>
      <td>${money(taxable)}</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>${money(tax.amount)}</td>
    </tr>
  `).join("");
  const totalTax = taxes.reduce((sum, tax) => sum + tax.amount, 0);
  return `${body}
    <tr class="tax-summary-total">
      <td>Total</td>
      <td>${taxes.length} tax${taxes.length === 1 ? "" : "es"}</td>
      <td>${money(taxable)}</td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td>${money(totalTax)}</td>
    </tr>`;
}

function amountToWordsIndian(value) {
  const amount = Math.round(Number(value || 0));
  if (amount === 0) return "Rupees Zero Only";

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function belowHundred(number) {
    if (number < 20) return ones[number];
    return `${tens[Math.floor(number / 10)]} ${ones[number % 10]}`.trim();
  }

  function belowThousand(number) {
    const hundred = Math.floor(number / 100);
    const rest = number % 100;
    return `${hundred ? `${ones[hundred]} Hundred` : ""} ${rest ? belowHundred(rest) : ""}`.trim();
  }

  const crore = Math.floor(amount / 10000000);
  const lakh = Math.floor((amount % 10000000) / 100000);
  const thousand = Math.floor((amount % 100000) / 1000);
  const rest = amount % 1000;
  const parts = [];
  if (crore) parts.push(`${belowThousand(crore)} Crore`);
  if (lakh) parts.push(`${belowThousand(lakh)} Lakh`);
  if (thousand) parts.push(`${belowThousand(thousand)} Thousand`);
  if (rest) parts.push(belowThousand(rest));
  return `Rupees ${parts.join(" ")} Only`;
}

function lineTaxBreakup(item, subtotal, discount, taxRate, taxMode) {
  const amount = nonNegativeNumber(item.quantity) * nonNegativeNumber(item.rate);
  const lineDiscount = subtotal > 0 ? (amount / subtotal) * discount : 0;
  const taxable = Math.max(amount - lineDiscount, 0);
  const tax = taxable * (taxRate / 100);
  return {
    amount,
    taxable,
    cgst: taxMode === "cgst_sgst" ? tax / 2 : 0,
    sgst: taxMode === "cgst_sgst" ? tax / 2 : 0,
    igst: taxMode === "igst" ? tax : 0,
    tax,
    total: taxable + tax,
  };
}

function renderTaxSummary(items, subtotal, discount, taxRate, taxMode) {
  const rows = new Map();
  items.forEach((item) => {
    const key = item.hsn || "-";
    const current = rows.get(key) || { hsn: key, taxable: 0, cgst: 0, sgst: 0, igst: 0, tax: 0 };
    const breakup = lineTaxBreakup(item, subtotal, discount, taxRate, taxMode);
    current.taxable += breakup.taxable;
    current.cgst += breakup.cgst;
    current.sgst += breakup.sgst;
    current.igst += breakup.igst;
    current.tax += breakup.tax;
    rows.set(key, current);
  });
  const values = [...rows.values()];
  const totals = values.reduce((sum, row) => ({
    taxable: sum.taxable + row.taxable,
    cgst: sum.cgst + row.cgst,
    sgst: sum.sgst + row.sgst,
    igst: sum.igst + row.igst,
    tax: sum.tax + row.tax,
  }), { taxable: 0, cgst: 0, sgst: 0, igst: 0, tax: 0 });

  const body = values.map(row => `
    <tr>
      <td>${escapeHtml(row.hsn)}</td>
      <td>${taxRate}%</td>
      <td>${money(row.taxable)}</td>
      <td>${money(row.cgst)}</td>
      <td>${money(row.sgst)}</td>
      <td>${money(row.igst)}</td>
      <td>${money(row.tax)}</td>
    </tr>
  `).join("");

  return `${body}
    <tr class="tax-summary-total">
      <td>Total</td>
      <td>${taxRate}%</td>
      <td>${money(totals.taxable)}</td>
      <td>${money(totals.cgst)}</td>
      <td>${money(totals.sgst)}</td>
      <td>${money(totals.igst)}</td>
      <td>${money(totals.tax)}</td>
    </tr>`;
}

function isSupabaseConfigured() {
  return appConfig.supabaseUrl.includes("supabase.co") && !appConfig.supabaseUrl.includes("YOUR_") && !appConfig.supabaseAnonKey.includes("YOUR_");
}

function createSupabaseClient() {
  if (!isSupabaseConfigured() || !window.supabase) return null;
  return window.supabase.createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: "billforge-auth-session",
    },
  });
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

function formatShortDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function beginMonthlyPeriod(startDate = new Date()) {
  state.periodStartedAt = startDate.toISOString();
  state.periodEndsAt = addDays(startDate, PLAN_PERIOD_DAYS).toISOString();
}

function currentProfileSnapshot() {
  return {
    planId: state.planId,
    pdfUsed: state.pdfUsed,
    periodStartedAt: state.periodStartedAt,
    periodEndsAt: state.periodEndsAt,
  };
}

function applyProfile(profile = {}) {
  state.planId = plans[profile.planId] ? profile.planId : "starter";
  state.pdfUsed = Number(profile.pdfUsed || 0);
  state.periodStartedAt = profile.periodStartedAt || profile.period_started_at || "";
  state.periodEndsAt = profile.periodEndsAt || profile.period_ends_at || "";
}

function refreshMonthlyAccess() {
  const currentPlan = plans[state.planId] || plans.starter;
  let changed = false;

  if (!state.periodStartedAt || !state.periodEndsAt) {
    beginMonthlyPeriod();
    changed = true;
  }

  if (new Date(state.periodEndsAt).getTime() <= Date.now()) {
    if (currentPlan.price > 0) state.planId = "starter";
    state.pdfUsed = 0;
    beginMonthlyPeriod();
    changed = true;
  }

  return changed;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function trackEvent(name, params = {}) {
  if (typeof window.gtag === "function") {
    window.gtag("event", name, {
      event_category: "BillForge",
      ...params,
    });
  }
}

function getPreferredTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
  } catch {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  const themeToggle = document.querySelector("#themeToggleBtn");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  document.documentElement.dataset.theme = nextTheme;
  if (themeMeta) themeMeta.content = nextTheme === "dark" ? "#10151b" : "#0f766e";
  if (themeToggle) {
    const isDark = nextTheme === "dark";
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    themeToggle.setAttribute("title", isDark ? "Switch to light mode" : "Switch to dark mode");
    themeToggle.querySelector("span").textContent = isDark ? "☼" : "☾";
  }
}

function toggleTheme() {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch {
    console.warn("Theme preference could not be saved.");
  }
  applyTheme(nextTheme);
}

function initThemeControls() {
  applyTheme(document.documentElement.dataset.theme || getPreferredTheme());
  document.querySelector("#themeToggleBtn")?.addEventListener("click", toggleTheme);
}

function userStorageKey(name) {
  const email = state.user?.email || "guest";
  return `billforge_${name}_${email}`;
}

function readUserStore(name, fallback = []) {
  try {
    return JSON.parse(localStorage.getItem(userStorageKey(name)) || "null") || fallback;
  } catch {
    return fallback;
  }
}

function writeUserStore(name, value) {
  localStorage.setItem(userStorageKey(name), JSON.stringify(value));
}

function makeId(prefix) {
  const randomPart = window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
  return `${prefix}_${randomPart}`;
}

function docLabel() {
  if (state.docType === "quotation") {
    return (fields.templateStyle?.value || state.templateStyle) === "estimate" ? "Estimate" : "Quotation";
  }
  const labels = {
    invoice: "Invoice",
    receipt: "Receipt",
  };
  return labels[state.docType] || "Document";
}

function renderItemsEditor() {
  itemsList.innerHTML = "";

  state.items.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "item-row";
    row.innerHTML = `
      <input aria-label="Item description" type="text" value="${escapeHtml(item.description)}" data-index="${index}" data-field="description" />
      <input aria-label="HSN or SAC code" type="text" value="${escapeHtml(item.hsn || "")}" data-index="${index}" data-field="hsn" />
      <input aria-label="Quantity" type="number" min="0" step="1" value="${nonNegativeNumber(item.quantity)}" data-index="${index}" data-field="quantity" />
      <input aria-label="Unit" type="text" value="${escapeHtml(item.unit || "Pcs.")}" data-index="${index}" data-field="unit" />
      <input aria-label="Rate" type="number" min="0" step="1" value="${nonNegativeNumber(item.rate)}" data-index="${index}" data-field="rate" />
      <button class="remove-btn" aria-label="Remove item" type="button" data-remove="${index}">×</button>
    `;
    itemsList.appendChild(row);
  });
}

function updatePreview() {
  const typeLabel = docLabel();
  const dueLabel = state.docType === "invoice" ? "Due" : state.docType === "quotation" ? "Valid until" : "Paid on";
  const totals = calculateTotals();
  const taxMode = fields.taxMode.value;
  const taxRate = taxMode === "none" || state.docType === "receipt" ? 0 : nonNegativeNumber(fields.taxRate.value);
  const cgst = totals.taxes.filter(tax => tax.name.toLowerCase() === "cgst").reduce((sum, tax) => sum + tax.amount, 0);
  const sgst = totals.taxes.filter(tax => tax.name.toLowerCase() === "sgst").reduce((sum, tax) => sum + tax.amount, 0);
  const igst = totals.taxes.filter(tax => tax.name.toLowerCase() === "igst").reduce((sum, tax) => sum + tax.amount, 0);
  const isTaxInvoice = fields.templateStyle.value === "tax-invoice";
  const isGstInvoice = fields.templateStyle.value === "gst";
  const useGstTaxTable = (isTaxInvoice || isGstInvoice) && fields.taxSystem?.value === "gst";
  const showTaxDetails = isTaxInvoice || useGstTaxTable;
  const previewType = isTaxInvoice ? "Tax Invoice" : isGstInvoice ? "GST Invoice" : typeLabel;

  state.templateStyle = fields.templateStyle.value || "simple";
  document.querySelector("#previewTitle").textContent = previewType;
  document.querySelector("#previewDocType").textContent = previewType;
  document.querySelector(".doc-watermark").textContent =
    isTaxInvoice ? "TAX" : isGstInvoice ? "GST" : state.docType === "receipt" ? "PAID" : fields.templateStyle.value === "estimate" ? "ESTIMATE" : state.docType === "quotation" ? "QUOTE" : "INVOICE";
  document.querySelector("#dueLabel").textContent = dueLabel;
  document.querySelector("#dateDetailLabel").textContent = state.docType === "receipt" ? "Paid on" : "Due / valid until";
  document.querySelector("#customerLabel").textContent = state.docType === "receipt" ? "Received from" : "Bill to";
  document.querySelector("#printArea").className = `document-preview template-${state.templateStyle}`;
  document.querySelector("#printArea").style.setProperty("--document-brand-color", fields.brandColor?.value || state.branding.brandColor || "#0f766e");
  const logo = state.branding.logo || "";
  const signature = state.branding.signature || "";
  const logoEl = document.querySelector("#previewBusinessLogo");
  const signatureEl = document.querySelector("#previewSignatureImage");
  if (logoEl) {
    logoEl.src = logo;
    logoEl.classList.toggle("hidden", !logo);
  }
  if (signatureEl) {
    signatureEl.src = signature;
    signatureEl.classList.toggle("hidden", !signature);
  }
  document.querySelector("#previewBusinessName").textContent = fields.businessName.value || "Your Business";
  document.querySelector("#previewBusinessDetails").textContent = fields.businessDetails.value;
  document.querySelector("#previewBusinessContact").textContent = [fields.businessEmail?.value, fields.businessPhone?.value].filter(Boolean).join(" · ");
  document.querySelector("#previewBusinessWebsite").textContent = fields.businessWebsite?.value || "";
  document.querySelector("#previewBusinessGstin").textContent = !showTaxDetails && fields.businessGstin.value ? `GSTIN: ${fields.businessGstin.value}` : "";
  document.querySelector("#previewCustomerName").textContent = fields.customerName.value || "Customer";
  document.querySelector("#previewCustomerBusiness").textContent = fields.customerBusinessName?.value || "";
  document.querySelector("#previewCustomerEmail").textContent = fields.customerEmail?.value || "";
  document.querySelector("#previewCustomerDetails").textContent = fields.customerDetails.value;
  document.querySelector("#previewCustomerGstin").textContent = fields.customerGstin.value ? `GSTIN: ${fields.customerGstin.value}` : "";
  document.querySelector("#previewCustomerPan").textContent = fields.customerPan.value ? `Party PAN: ${fields.customerPan.value}` : "";
  document.querySelector("#previewCustomerMobile").textContent = fields.customerMobile.value ? `Party Mobile No: ${fields.customerMobile.value}` : "";
  document.querySelector("#previewNumber").textContent = fields.documentNumber.value || "-";
  document.querySelector("#previewDate").textContent = formatDate(fields.documentDate.value);
  document.querySelector("#previewDueDate").textContent = formatDate(fields.dueDate.value);
  document.querySelector("#previewPlaceOfSupply").textContent = fields.placeOfSupply.value || "-";
  document.querySelector("#previewTaxGstin").textContent = fields.businessGstin.value ? `GSTIN : ${fields.businessGstin.value}` : "GSTIN :";
  document.querySelector("#previewReverseCharge").textContent = fields.reverseCharge.value || "N";
  document.querySelector("#previewTransport").textContent = fields.transport.value || "-";
  document.querySelector("#previewVehicleNo").textContent = fields.vehicleNo.value || "-";
  document.querySelector("#previewEwayBill").textContent = fields.ewayBill.value || "-";
  document.querySelector("#previewShipToName").textContent = fields.customerName.value || "Customer";
  document.querySelector("#previewShipToDetails").textContent = fields.shipToDetails.value || fields.customerDetails.value || "-";
  document.querySelector("#previewShipToGstin").textContent = fields.customerGstin.value ? `GSTIN / UIN: ${fields.customerGstin.value}` : "";
  document.querySelector("#previewNotes").textContent = fields.notes.value;
  document.querySelector("#subtotalValue").textContent = money(totals.subtotal);
  document.querySelector("#discountValue").textContent = money(totals.discount);
  document.querySelector("#taxTotalRows").innerHTML = renderTaxTotalRows(totals.taxes);
  document.querySelector("#cgstValue").textContent = money(cgst);
  document.querySelector("#sgstValue").textContent = money(sgst);
  document.querySelector("#igstValue").textContent = money(igst);
  document.querySelector("#cgstRow").classList.add("hidden");
  document.querySelector("#sgstRow").classList.add("hidden");
  document.querySelector("#igstRow").classList.add("hidden");
  document.querySelector("#totalValue").textContent = money(totals.total);
  document.querySelector("#taxCopyLine").classList.toggle("hidden", !showTaxDetails);
  document.querySelector("#taxTransportGrid").classList.toggle("hidden", !showTaxDetails);
  document.querySelector("#shipToBox").classList.toggle("hidden", !showTaxDetails);
  document.querySelector("#taxSummaryPanel").classList.toggle("hidden", !showTaxDetails && !totals.taxes.length);
  document.querySelector("#signatureGrid").classList.toggle("hidden", !showTaxDetails);
  document.querySelector("#signatureBusinessName").textContent = fields.businessName.value || "Your Business";
  document.querySelectorAll(".tax-only").forEach((row) => row.classList.toggle("hidden", !showTaxDetails));
  document.querySelector("#amountInWords").textContent = amountToWordsIndian(totals.total);
  document.querySelector("#previewFooterText").textContent = fields.footerText?.value || state.branding.footerText || "";

  document.querySelector("#previewTableHead").innerHTML = useGstTaxTable
    ? `
      <th>S.N.</th>
      <th>Description of Goods</th>
      <th>HSN/SAC Code</th>
      <th>Qty.</th>
      <th>Unit</th>
      <th>Price</th>
      <th>CGST Rate</th>
      <th>CGST Amount</th>
      <th>SGST Rate</th>
      <th>SGST Amount</th>
      <th>IGST Rate</th>
      <th>IGST Amount</th>
      <th>Amount</th>
    `
    : `
      <th>Description</th>
      <th>HSN/SAC</th>
      <th>Qty</th>
      <th>Rate</th>
      <th>Amount</th>
    `;

  previewItems.innerHTML = "";
  state.items.forEach((item, index) => {
    const quantity = nonNegativeNumber(item.quantity);
    const rate = nonNegativeNumber(item.rate);
    const amount = quantity * rate;
    const tr = document.createElement("tr");
    if (useGstTaxTable) {
      const breakup = lineTaxBreakup(item, totals.subtotal, totals.discount, taxRate, taxMode);
      const halfRate = taxMode === "cgst_sgst" ? `${compactMoney(taxRate / 2)}%` : "-";
      const igstRate = taxMode === "igst" ? `${compactMoney(taxRate)}%` : "-";
      tr.innerHTML = `
        <td>${index + 1}.</td>
        <td>${escapeHtml(item.description || "Item")}</td>
        <td>${escapeHtml(item.hsn || "-")}</td>
        <td>${quantity}</td>
        <td>${escapeHtml(item.unit || "Pcs.")}</td>
        <td>${money(rate)}</td>
        <td>${halfRate}</td>
        <td>${money(breakup.cgst)}</td>
        <td>${halfRate}</td>
        <td>${money(breakup.sgst)}</td>
        <td>${igstRate}</td>
        <td>${money(breakup.igst)}</td>
        <td>${money(breakup.total)}</td>
      `;
    } else {
      tr.innerHTML = `
        <td>${escapeHtml(item.description || "Item")}</td>
        <td>${escapeHtml(item.hsn || "-")}</td>
        <td>${quantity}</td>
        <td>${money(rate)}</td>
        <td>${money(amount)}</td>
      `;
    }
    previewItems.appendChild(tr);
  });

  document.querySelector("#taxSummaryRows").innerHTML = useGstTaxTable
    ? renderTaxSummary(state.items, totals.subtotal, totals.discount, taxRate, taxMode)
    : renderGenericTaxSummary(totals.taxes, totals.taxable);
}

function setDocType(nextType, preferredTemplate = "") {
  state.docType = nextType;
  const currentTemplate = preferredTemplate || fields.templateStyle.value;
  renderTemplateOptions(nextType, currentTemplate);
  refreshDocumentNumber();
  document.querySelectorAll(".segment").forEach((button) => {
    button.classList.toggle("active", button.dataset.docType === nextType);
  });
  updatePreview();
}

function loadSample() {
  fields.businessName.value = "Quick Supply Co.";
  if (fields.businessEmail) fields.businessEmail.value = "support@quicksupply.example";
  if (fields.businessPhone) fields.businessPhone.value = "+91 91234 56780";
  if (fields.businessWebsite) fields.businessWebsite.value = "https://quicksupply.example";
  fields.businessDetails.value = "Park Street, Kolkata\nsupport@quicksupply.example\n+91 91234 56780";
  fields.businessGstin.value = "19ABCDE1234F1Z8";
  fields.customerName.value = state.docType === "receipt" ? "Green Leaf Cafe" : "Acme Retail";
  if (fields.customerBusinessName) fields.customerBusinessName.value = state.docType === "receipt" ? "Green Leaf Cafe Pvt Ltd" : "Acme Retail LLP";
  if (fields.customerEmail) fields.customerEmail.value = "billing@example.com";
  fields.customerDetails.value = "Attn: Operations Manager\nBengaluru, India";
  fields.customerGstin.value = "29WXYZR5678L1Z2";
  fields.customerPan.value = "ABCDE1234F";
  fields.customerMobile.value = "8250515014";
  fields.shipToDetails.value = "Warehouse Gate 2\nBengaluru, India";
  fields.documentNumber.value = state.docType === "invoice" ? "INV-2026-014" : state.docType === "quotation" ? "EST-2026-014" : "RCT-2026-014";
  if (fields.taxSystem) fields.taxSystem.value = "custom";
  state.taxes = state.docType === "receipt" ? [] : [{ name: "VAT", rate: 10 }, { name: "Service Tax", rate: 5 }];
  renderTaxRowsEditor(state.taxes);
  fields.taxRate.value = state.docType === "receipt" ? "0" : "18";
  fields.taxMode.value = state.docType === "receipt" ? "none" : "igst";
  fields.placeOfSupply.value = "Karnataka";
  fields.reverseCharge.value = "N";
  fields.transport.value = "Road courier";
  fields.vehicleNo.value = "KA01AB1234";
  fields.ewayBill.value = "811695494786";
  fields.discount.value = "250";
  fields.notes.value = state.docType === "receipt" ? "Payment received with thanks." : "Delivery within 3 business days after confirmation. Prices include standard support.";
  state.items = [
    { description: "Printed business documents", hsn: "491199", quantity: 100, unit: "Pcs.", rate: 18 },
    { description: "Design setup", hsn: "998361", quantity: 1, unit: "Pcs.", rate: 1200 },
    { description: "Express delivery", hsn: "996812", quantity: 1, unit: "Job", rate: 350 },
  ];
  renderItemsEditor();
  updatePreview();
}

function showPage(pageName, updateHash = true) {
  const availablePages = ["dashboard", "tools", "pricing", "support", "privacy", "terms", "refund", "login"];
  const seoSections = ["invoice-generator", "receipt-generator", "quotation-generator", "estimate-generator", "gst-invoice-generator"];
  if (seoSections.includes(pageName)) {
    showPage("tools", false);
    if (updateHash && window.location.hash !== `#${pageName}`) {
      window.location.hash = pageName;
    }
    requestAnimationFrame(() => document.querySelector(`#${pageName}`)?.scrollIntoView({ block: "start" }));
    return;
  }

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
  document.querySelector("#loginPanel")?.classList.toggle("hidden", view !== "login");
  document.querySelector("#createPanel")?.classList.toggle("hidden", view !== "create");
  document.querySelector("#forgotPanel")?.classList.toggle("hidden", view !== "forgot");
  document.querySelector("#resetPanel")?.classList.toggle("hidden", view !== "reset");
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
  const savedValues = state.calculatorValues[state.activeTool] || {};
  document.querySelector("#toolCategory").textContent = tool.category;
  document.querySelector("#toolName").textContent = tool.name;
  document.querySelector("#toolDescription").textContent = tool.description;
  document.querySelector("#resultTitle").textContent = tool.name;
  document.querySelector("#calcForm").innerHTML = tool.fields
    .map((field) => {
      const savedValue = savedValues[field.id] ?? field.value;
      if (field.type === "select") {
        return `
          <label>
            ${field.label}
            <select data-calc-field="${field.id}">
              ${field.options.map(([value, label]) => `<option value="${value}" ${String(savedValue) === String(value) ? "selected" : ""}>${label}</option>`).join("")}
            </select>
          </label>
        `;
      }
      return `
        <label>
          ${field.label}
          <input data-calc-field="${field.id}" type="number" step="0.01" value="${savedValue}" />
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
  const values = readCalculatorValues(tool);
  state.calculatorValues[state.activeTool] = values;
  const output = tool.calculate(values);
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
        <article class="pricing-card ${plan.id === "pro" ? "featured" : ""}">
          <p class="eyebrow">${plan.label}</p>
          <h2>${plan.name}</h2>
          <strong>${plan.price === 0 ? "Free" : `₹${plan.price}`}</strong>
          <p class="price-note">${plan.price === 0 ? "per month" : "per month, 30-day access"}</p>
          <p>${plan.description}</p>
          <ul class="plan-list">
            <li>All 10 tools included</li>
            <li>${plan.unlimited ? "Unlimited PDF generations for 30 days" : `${plan.limit} PDF generations monthly`}</li>
            <li>Usage resets every 30 days</li>
            <li>Login required for tracking</li>
          </ul>
          <button class="${plan.price === 0 ? "ghost-btn" : "primary-btn"}" type="button" data-plan-id="${plan.id}">
            ${plan.price === 0 ? "Activate Free" : "Subscribe"}
          </button>
        </article>
      `,
    )
    .join("");
}

function updateAccountUi() {
  refreshMonthlyAccess();
  const plan = plans[state.planId];
  const limit = plan?.limit || 0;
  const used = plan?.unlimited ? state.pdfUsed : Math.min(state.pdfUsed, limit);
  const limitText = plan?.unlimited ? "Unlimited" : limit;
  const percent = plan?.unlimited ? 100 : limit ? Math.min((used / limit) * 100, 100) : 0;
  document.querySelector("#accountStatus").textContent = state.user ? `${state.user.email} · ${used}/${limitText} PDFs` : "Guest";
  document.querySelector("#authNavLink").textContent = state.user ? "Account" : "Login";
  document.querySelector("#primaryActionBtn").textContent = state.user ? "Load Sample" : "Create Account";
  document.querySelector("#currentPlanName").textContent = state.user ? `${plan?.name || "No plan"} Monthly Plan` : "Guest";
  document.querySelector("#accountEmailText").textContent = state.user ? `Logged in as ${state.user.email}` : "Not logged in";
  document.querySelector("#quotaText").textContent = state.user
    ? plan?.unlimited
      ? `${used} PDFs generated. Unlimited access resets on ${formatShortDate(state.periodEndsAt)}.`
      : `${used} of ${limit} monthly PDF generations used. Resets on ${formatShortDate(state.periodEndsAt)}.`
    : "Login to start tracking monthly PDF usage.";
  document.querySelector("#quotaBar").style.width = `${percent}%`;
  document.querySelector("#logoutBtn").classList.toggle("hidden", !state.user);
}

function sendGuestToCreateAccount(planId = "") {
  state.pendingPlanId = planId;
  setAuthView("create");
  showPage("login");
  const plan = plans[planId];
  setAuthMessage(plan ? `Create an account first to choose the ${plan.name} monthly plan.` : "Create an account to start using BillForge.");
}

async function continuePendingPlan() {
  const planId = state.pendingPlanId;
  if (!planId || !plans[planId]) return false;
  state.pendingPlanId = "";
  if (plans[planId].price === 0) {
    await activatePlan(planId);
    return true;
  }
  showPage("pricing");
  setPaymentMessage(`Account ready. Opening payment for ${plans[planId].name} monthly plan...`);
  setTimeout(() => startPayment(planId), 250);
  return true;
}

async function loadProfile() {
  if (!state.user) {
    updateAccountUi();
    await loadWorkspaceData();
    return;
  }

  if (supabaseClient) {
    try {
          const { data, error } = await withTimeout(
            supabaseClient
              .from("profiles")
              .select("*")
              .eq("id", state.user.id)
              .maybeSingle(),
        "Profile loading took too long.",
        6000
      );
      if (!error && data) {
        applyProfile({
          planId: data.plan_id || "starter",
          pdfUsed: data.pdf_used,
          period_started_at: data.period_started_at,
          period_ends_at: data.period_ends_at,
        });
        if (refreshMonthlyAccess()) await saveProfile();
        updateAccountUi();
        await loadWorkspaceData();
        return;
      }
    } catch (error) {
      console.warn("Profile load skipped:", error.message);
    }
  }

  const profile = loadLocalProfile() || { planId: "starter", pdfUsed: 0 };
  applyProfile(profile);
  refreshMonthlyAccess();
  saveLocalProfile(currentProfileSnapshot());
  updateAccountUi();
  await loadWorkspaceData();
}

async function saveProfile() {
  if (!state.user) return;
  refreshMonthlyAccess();
  const profile = currentProfileSnapshot();
  saveLocalProfile(profile);

  if (supabaseClient) {
    const payload = {
      id: state.user.id,
      email: state.user.email,
      plan_id: state.planId,
      pdf_used: state.pdfUsed,
      period_started_at: state.periodStartedAt,
      period_ends_at: state.periodEndsAt,
      updated_at: new Date().toISOString(),
    };
    const legacyPayload = {
      id: payload.id,
      email: payload.email,
      plan_id: payload.plan_id,
      pdf_used: payload.pdf_used,
      updated_at: payload.updated_at,
    };
    const response = await withTimeout(
      supabaseClient.from("profiles").upsert(payload),
      "Profile saving took too long.",
      6000
    ).catch(error => ({ error }));
    if (response?.error) {
      await withTimeout(
        supabaseClient.from("profiles").upsert(legacyPayload),
        "Profile saving took too long.",
        6000
      ).catch(error => console.warn("Profile save skipped:", error.message));
    }
  }
}

function currentDocumentPayload() {
  const totals = calculateTotals();
  return {
    docType: state.docType,
    templateStyle: fields.templateStyle.value,
    businessId: state.activeBusinessId,
    businessName: fields.businessName.value,
    businessEmail: fields.businessEmail?.value || "",
    businessPhone: fields.businessPhone?.value || "",
    businessWebsite: fields.businessWebsite?.value || "",
    businessDetails: fields.businessDetails.value,
    businessGstin: fields.businessGstin.value,
    customerName: fields.customerName.value,
    customerBusinessName: fields.customerBusinessName?.value || "",
    customerEmail: fields.customerEmail?.value || "",
    customerDetails: fields.customerDetails.value,
    customerGstin: fields.customerGstin.value,
    customerPan: fields.customerPan.value,
    customerMobile: fields.customerMobile.value,
    shipToDetails: fields.shipToDetails.value,
    documentNumber: fields.documentNumber.value,
    documentDate: fields.documentDate.value,
    dueDate: fields.dueDate.value,
    currency: currency.value,
    taxSystem: fields.taxSystem?.value || "custom",
    taxRate: fields.taxRate.value,
    taxMode: fields.taxMode.value,
    taxes: totals.taxes.map(({ name, rate, amount }) => ({ name, rate, amount })),
    placeOfSupply: fields.placeOfSupply.value,
    reverseCharge: fields.reverseCharge.value,
    transport: fields.transport.value,
    vehicleNo: fields.vehicleNo.value,
    ewayBill: fields.ewayBill.value,
    discount: fields.discount.value,
    notes: fields.notes.value,
    branding: { ...state.branding },
    status: state.docType === "receipt" ? "Paid" : "Draft",
    amount: totals.total,
    items: state.items.map(item => ({ ...item })),
  };
}

function applyDocumentPayload(payload = {}) {
  state.docType = payload.docType || "invoice";
  const nextTemplate = payload.templateStyle || "simple";
  state.activeBusinessId = payload.businessId || payload.business_id || "";
  fields.businessName.value = payload.businessName || "";
  if (fields.businessEmail) fields.businessEmail.value = payload.businessEmail || "";
  if (fields.businessPhone) fields.businessPhone.value = payload.businessPhone || "";
  if (fields.businessWebsite) fields.businessWebsite.value = payload.businessWebsite || "";
  fields.businessDetails.value = payload.businessDetails || "";
  fields.businessGstin.value = payload.businessGstin || "";
  fields.customerName.value = payload.customerName || "";
  if (fields.customerBusinessName) fields.customerBusinessName.value = payload.customerBusinessName || "";
  if (fields.customerEmail) fields.customerEmail.value = payload.customerEmail || "";
  fields.customerDetails.value = payload.customerDetails || "";
  fields.customerGstin.value = payload.customerGstin || "";
  fields.customerPan.value = payload.customerPan || "";
  fields.customerMobile.value = payload.customerMobile || "";
  fields.shipToDetails.value = payload.shipToDetails || "";
  fields.documentNumber.value = payload.documentNumber || "";
  fields.documentDate.value = payload.documentDate || toDateInputValue(new Date());
  fields.dueDate.value = payload.dueDate || toDateInputValue(addDays(new Date(), 7));
  currency.value = payload.currency || "₹";
  if (fields.taxSystem) fields.taxSystem.value = payload.taxSystem || (payload.taxMode ? "gst" : "custom");
  fields.taxRate.value = payload.taxRate ?? 18;
  fields.taxMode.value = payload.taxMode || "cgst_sgst";
  state.taxes = normalizeTaxRows(payload.taxes || payload.document_taxes || state.taxes);
  if (!state.taxes.length) state.taxes = [{ name: "VAT", rate: 10 }];
  renderTaxRowsEditor(state.taxes);
  fields.placeOfSupply.value = payload.placeOfSupply || "";
  fields.reverseCharge.value = payload.reverseCharge || "N";
  fields.transport.value = payload.transport || "";
  fields.vehicleNo.value = payload.vehicleNo || "";
  fields.ewayBill.value = payload.ewayBill || "";
  fields.discount.value = payload.discount ?? 0;
  fields.notes.value = payload.notes || "";
  state.branding = {
    logo: payload.branding?.logo || payload.logo || "",
    signature: payload.branding?.signature || payload.signature || "",
    brandColor: payload.branding?.brandColor || payload.brandColor || "#0f766e",
    footerText: payload.branding?.footerText || payload.footerText || "",
  };
  if (fields.brandColor) fields.brandColor.value = state.branding.brandColor;
  if (fields.footerText) fields.footerText.value = state.branding.footerText;
  state.items = Array.isArray(payload.items) && payload.items.length
    ? payload.items.map(item => ({
        description: item.description || "",
        hsn: item.hsn || "",
        quantity: nonNegativeNumber(item.quantity),
        unit: item.unit || "Pcs.",
        rate: nonNegativeNumber(item.rate),
        taxRate: nonNegativeNumber(item.taxRate ?? item.tax_rate),
      }))
    : [{ description: "", hsn: "", quantity: 1, unit: "Pcs.", rate: 0 }];
  setDocType(state.docType, nextTemplate);
  if (payload.documentNumber) fields.documentNumber.value = payload.documentNumber;
  renderItemsEditor();
  updatePreview();
}

async function loadWorkspaceData() {
  if (!state.user) {
    state.documents = [];
    state.customers = [];
    state.savedItems = [];
    state.businesses = [];
    state.activeBusinessId = "";
    renderWorkspaceLibrary();
    return;
  }

  state.documents = readUserStore("documents", []);
  state.customers = readUserStore("customers", []);
  state.savedItems = readUserStore("items", []);
  state.businesses = readUserStore("businesses", []);
  state.activeBusinessId = localStorage.getItem(userStorageKey("active_business")) || state.businesses[0]?.id || "";

  if (supabaseClient) {
    try {
      const [documents, customers, savedItems, businesses] = await Promise.all([
        withTimeout(
          supabaseClient.from("documents").select("*").eq("user_id", state.user.id).order("updated_at", { ascending: false }).limit(80),
          "Documents loading took too long.",
          5000
        ).catch(error => ({ error })),
        withTimeout(
          supabaseClient.from("customers").select("*").eq("user_id", state.user.id).order("updated_at", { ascending: false }).limit(80),
          "Customers loading took too long.",
          5000
        ).catch(error => ({ error })),
        withTimeout(
          supabaseClient.from("saved_items").select("*").eq("user_id", state.user.id).order("updated_at", { ascending: false }).limit(120),
          "Items loading took too long.",
          5000
        ).catch(error => ({ error })),
        withTimeout(
          supabaseClient.from("businesses").select("*").eq("user_id", state.user.id).order("updated_at", { ascending: false }).limit(20),
          "Businesses loading took too long.",
          5000
        ).catch(error => ({ error })),
      ]);
      if (!documents.error && Array.isArray(documents.data)) {
        state.documents = documents.data;
        writeUserStore("documents", state.documents);
      }
      if (!customers.error && Array.isArray(customers.data)) {
        state.customers = customers.data;
        writeUserStore("customers", state.customers);
      }
      if (!savedItems.error && Array.isArray(savedItems.data)) {
        state.savedItems = savedItems.data;
        writeUserStore("items", state.savedItems);
      }
      if (!businesses.error && Array.isArray(businesses.data)) {
        state.businesses = businesses.data;
        writeUserStore("businesses", state.businesses);
        if (!state.activeBusinessId && state.businesses[0]) state.activeBusinessId = state.businesses[0].id;
      }
    } catch (error) {
      console.warn("Workspace data loaded from local storage:", error.message);
    }
  }

  localStorage.setItem(userStorageKey("active_business"), state.activeBusinessId || "");
  if (state.activeBusinessId && !fields.businessName.value) applyBusiness(state.activeBusinessId);
  renderWorkspaceLibrary();
}

async function syncTable(table, row) {
  if (!supabaseClient || !state.user) return;
  const response = await withTimeout(
    supabaseClient.from(table).upsert(row),
    `${table} saving took too long.`,
    5000
  ).catch(error => ({ error }));
  if (!response?.error) return;

  const legacyShapes = {
    documents: (({ id, user_id, email, doc_type, title, payload, created_at, updated_at }) => ({ id, user_id, email, doc_type, title, payload, created_at, updated_at }))(row),
    customers: (({ id, user_id, email, name, details, gstin, pan, mobile, ship_to, updated_at }) => ({ id, user_id, email, name, details, gstin, pan, mobile, ship_to, updated_at }))(row),
    saved_items: (({ id, user_id, email, description, hsn, unit, rate, updated_at }) => ({ id, user_id, email, description, hsn, unit, rate, updated_at }))(row),
  };
  if (!legacyShapes[table]) {
    console.warn(`${table} save skipped:`, response.error.message);
    return;
  }
  await withTimeout(
    supabaseClient.from(table).upsert(legacyShapes[table]),
    `${table} legacy saving took too long.`,
    5000
  ).catch(error => console.warn(`${table} legacy save skipped:`, error.message));
}

function renderWorkspaceLibrary() {
  renderBusinessDashboard();
  renderSavedBusinesses();
  renderDocumentHistory();
  renderSavedCustomers();
  renderSavedItems();
  renderQuickLibrarySelects();
}

function currentBusinessRecord(existingId = "") {
  const now = new Date().toISOString();
  return {
    id: existingId || state.activeBusinessId || makeId("biz"),
    user_id: state.user.id,
    email: state.user.email,
    business_name: fields.businessName.value.trim() || "My Business",
    tax_id: fields.businessGstin.value.trim(),
    business_email: fields.businessEmail?.value || "",
    phone: fields.businessPhone?.value || "",
    website: fields.businessWebsite?.value || "",
    address: fields.businessDetails.value || "",
    currency: currency.value,
    logo: state.branding.logo || "",
    signature: state.branding.signature || "",
    brand_color: fields.brandColor?.value || state.branding.brandColor || "#0f766e",
    footer_text: fields.footerText?.value || state.branding.footerText || "",
    default_taxes: normalizeTaxRows(fields.taxSystem?.value === "gst" ? gstPresetTaxes() : readTaxRowsFromEditor()),
    updated_at: now,
  };
}

function applyBusiness(id) {
  const business = state.businesses.find(item => String(item.id) === String(id));
  if (!business) return;
  state.activeBusinessId = business.id;
  localStorage.setItem(userStorageKey("active_business"), business.id);
  fields.businessName.value = business.business_name || business.name || "";
  fields.businessGstin.value = business.tax_id || business.gstin || "";
  if (fields.businessEmail) fields.businessEmail.value = business.business_email || "";
  if (fields.businessPhone) fields.businessPhone.value = business.phone || "";
  if (fields.businessWebsite) fields.businessWebsite.value = business.website || "";
  fields.businessDetails.value = business.address || business.details || "";
  currency.value = business.currency || currency.value || "₹";
  state.branding = {
    logo: business.logo || "",
    signature: business.signature || "",
    brandColor: business.brand_color || "#0f766e",
    footerText: business.footer_text || "",
  };
  if (fields.brandColor) fields.brandColor.value = state.branding.brandColor;
  if (fields.footerText) fields.footerText.value = state.branding.footerText;
  const defaultTaxes = normalizeTaxRows(business.default_taxes || []);
  if (defaultTaxes.length) {
    state.taxes = defaultTaxes;
    if (fields.taxSystem) fields.taxSystem.value = "custom";
    renderTaxRowsEditor(state.taxes);
  }
  renderQuickLibrarySelects();
  updatePreview();
  setAuthMessage(`${business.business_name || "Business"} is now active.`);
}

async function saveBusiness() {
  if (!state.user) {
    sendGuestToCreateAccount();
    setAuthMessage("Login to save business profiles.");
    return;
  }
  const existing = state.businesses.find(business => String(business.id) === String(state.activeBusinessId));
  const record = currentBusinessRecord(existing?.id);
  state.activeBusinessId = record.id;
  state.businesses = [record, ...state.businesses.filter(business => String(business.id) !== String(record.id))].slice(0, 20);
  writeUserStore("businesses", state.businesses);
  localStorage.setItem(userStorageKey("active_business"), state.activeBusinessId);
  renderWorkspaceLibrary();
  await syncTable("businesses", record);
  setAuthMessage("Business profile saved.");
}

function newBusiness() {
  state.activeBusinessId = "";
  localStorage.setItem(userStorageKey("active_business"), "");
  fields.businessName.value = "";
  fields.businessGstin.value = "";
  if (fields.businessEmail) fields.businessEmail.value = "";
  if (fields.businessPhone) fields.businessPhone.value = "";
  if (fields.businessWebsite) fields.businessWebsite.value = "";
  fields.businessDetails.value = "";
  state.branding = { logo: "", signature: "", brandColor: "#0f766e", footerText: "" };
  if (fields.brandColor) fields.brandColor.value = "#0f766e";
  if (fields.footerText) fields.footerText.value = "";
  updatePreview();
  renderQuickLibrarySelects();
  setAuthMessage("Blank business profile ready. Fill details and click Save Business.");
}

async function deleteBusiness() {
  if (!state.activeBusinessId) return;
  const id = state.activeBusinessId;
  state.businesses = state.businesses.filter(business => String(business.id) !== String(id));
  state.activeBusinessId = state.businesses[0]?.id || "";
  writeUserStore("businesses", state.businesses);
  localStorage.setItem(userStorageKey("active_business"), state.activeBusinessId);
  if (state.activeBusinessId) applyBusiness(state.activeBusinessId);
  renderWorkspaceLibrary();
  await deleteRemoteRow("businesses", id);
  setAuthMessage("Business profile removed.");
}

function renderSavedBusinesses() {
  const target = document.querySelector("#savedBusinesses");
  if (!target) return;
  if (!state.user) {
    target.innerHTML = `<p class="empty-state">Login to create business profiles.</p>`;
    return;
  }
  target.innerHTML = state.businesses.length
    ? state.businesses.map(business => `
        <article class="library-card">
          <button class="library-pill" type="button" data-business-id="${business.id}">
            ${escapeHtml(business.business_name || business.name || "Business")}
            <small>${escapeHtml([business.tax_id || "No tax ID", business.currency || "₹"].filter(Boolean).join(" · "))}</small>
          </button>
        </article>
      `).join("")
    : `<p class="empty-state">No businesses yet. Fill the Business section and click Save Business.</p>`;
}

function renderQuickLibrarySelects() {
  if (savedBusinessSelect) {
    savedBusinessSelect.innerHTML = state.user
      ? `<option value="">Select active business</option>${state.businesses.map(business => `<option value="${business.id}" ${String(business.id) === String(state.activeBusinessId) ? "selected" : ""}>${escapeHtml(business.business_name || business.name || "Business")}</option>`).join("")}`
      : `<option value="">Login and create business profiles</option>`;
  }
  if (savedCustomerSelect) {
    savedCustomerSelect.innerHTML = state.user
      ? `<option value="">Select saved customer</option>${state.customers.map(customer => `<option value="${customer.id}">${escapeHtml(customer.name || "Customer")} ${customer.gstin ? `- ${escapeHtml(customer.gstin)}` : ""}</option>`).join("")}`
      : `<option value="">Login and save customers to reuse them</option>`;
  }
  if (savedItemSelect) {
    savedItemSelect.innerHTML = state.user
      ? `<option value="">Add saved item</option>${state.savedItems.map(item => `<option value="${item.id}">${escapeHtml(item.name || item.description || "Item")} - ${escapeHtml(item.unit || "Pcs.")} - ${money(item.price ?? item.rate ?? 0)}</option>`).join("")}`
      : `<option value="">Login and save items to reuse them</option>`;
  }
}

function documentAmount(record) {
  return nonNegativeNumber(record.amount ?? record.payload?.amount ?? record.payload?.total);
}

function renderBusinessDashboard() {
  const metrics = document.querySelector("#dashboardMetrics");
  const recent = document.querySelector("#dashboardRecentDocs");
  if (!metrics || !recent) return;
  const documents = state.documents || [];
  const invoices = documents.filter(doc => (doc.doc_type || doc.payload?.docType) === "invoice");
  const quotations = documents.filter(doc => (doc.doc_type || doc.payload?.docType) === "quotation");
  const receipts = documents.filter(doc => (doc.doc_type || doc.payload?.docType) === "receipt");
  const revenue = receipts.reduce((sum, doc) => sum + documentAmount(doc), 0);
  const activeCustomers = new Set(state.customers.map(customer => customer.name?.toLowerCase()).filter(Boolean)).size;
  const currentPlan = plans[state.planId] || plans.starter;
  metrics.innerHTML = [
    ["Invoices", invoices.length],
    ["Quotations", quotations.length],
    ["Receipts", receipts.length],
    ["Revenue", money(revenue)],
    ["Customers", activeCustomers],
    ["Plan", state.user ? currentPlan.name : "Guest"],
  ].map(([label, value]) => `
    <article class="metric-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </article>
  `).join("");

  const recentDocs = documents.slice(0, 4);
  recent.innerHTML = `
    <div class="section-heading compact-heading">
      <div>
        <p class="eyebrow">Recent work</p>
        <h2>Latest documents</h2>
      </div>
      <a class="text-link" href="#tools" data-page-link="tools">Open history</a>
    </div>
    ${recentDocs.length ? recentDocs.map(doc => `
      <article class="mini-history-row">
        <strong>${escapeHtml(doc.payload?.documentNumber || doc.document_number || doc.title || "Document")}</strong>
        <span>${escapeHtml(doc.payload?.customerName || doc.customer_name || "No customer")} · ${money(documentAmount(doc))}</span>
      </article>
    `).join("") : `<p class="empty-state">No documents yet. Create your first invoice to start the dashboard.</p>`}
  `;
}

function renderDocumentHistory() {
  const target = document.querySelector("#documentHistory");
  if (!target) return;
  if (!state.user) {
    target.innerHTML = `<p class="empty-state">Login to save document history.</p>`;
    return;
  }
  if (!state.documents.length) {
    target.innerHTML = `<p class="empty-state">No saved documents yet. Create a document and click Save Document.</p>`;
    return;
  }
  const query = state.historySearch.trim().toLowerCase();
  const filtered = state.documents
    .filter((document) => {
      const type = document.doc_type || document.payload?.docType || "document";
      if (state.historyTypeFilter !== "all" && type !== state.historyTypeFilter) return false;
      if (!query) return true;
      return [
        document.title,
        document.document_number,
        document.customer_name,
        document.payload?.documentNumber,
        document.payload?.customerName,
        document.payload?.businessName,
      ].filter(Boolean).join(" ").toLowerCase().includes(query);
    })
    .sort((a, b) => {
      if (state.historySort === "amount_desc") return documentAmount(b) - documentAmount(a);
      if (state.historySort === "amount_asc") return documentAmount(a) - documentAmount(b);
      return new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0);
    });
  if (!filtered.length) {
    target.innerHTML = `<p class="empty-state">No documents match your search.</p>`;
    return;
  }
  target.innerHTML = filtered.map((document) => `
    <article class="history-card">
      <div>
        <strong>${escapeHtml(document.payload?.documentNumber || document.document_number || document.title || "Saved document")}</strong>
        <span>${escapeHtml(document.payload?.customerName || document.customer_name || "No customer")} · ${escapeHtml(document.doc_type || document.payload?.docType || "document")} · ${formatDate((document.updated_at || document.created_at || "").slice(0, 10))}</span>
        <small>${escapeHtml(document.status || document.payload?.status || "Draft")} · ${money(documentAmount(document))}</small>
      </div>
      <div class="history-actions">
        <button type="button" data-doc-action="load" data-doc-id="${document.id}">Edit</button>
        <button type="button" data-doc-action="duplicate" data-doc-id="${document.id}">Duplicate</button>
        <button type="button" data-doc-action="download" data-doc-id="${document.id}">Download</button>
        <button type="button" data-doc-action="delete" data-doc-id="${document.id}">Delete</button>
      </div>
    </article>
  `).join("");
}

async function deleteRemoteRow(table, id) {
  if (!supabaseClient || !state.user || !id) return;
  await withTimeout(
    supabaseClient.from(table).delete().eq("id", id).eq("user_id", state.user.id),
    `${table} delete took too long.`,
    5000
  ).catch(error => console.warn(`${table} delete skipped:`, error.message));
}

function findSavedDocument(id) {
  return state.documents.find(document => String(document.id) === String(id));
}

async function handleDocumentAction(action, id) {
  const record = findSavedDocument(id);
  if (!record) return;

  if (action === "load") {
    applyDocumentPayload(record.payload || {});
    showPage("tools");
    setAuthMessage("Saved document loaded for editing.");
    return;
  }

  if (action === "duplicate") {
    applyDocumentPayload(record.payload || {});
    await saveCurrentDocument("duplicate");
    setAuthMessage("Document duplicated.");
    return;
  }

  if (action === "download") {
    applyDocumentPayload(record.payload || {});
    await generatePdf();
    return;
  }

  if (action === "delete") {
    state.documents = state.documents.filter(document => String(document.id) !== String(id));
    writeUserStore("documents", state.documents);
    renderDocumentHistory();
    await deleteRemoteRow("documents", id);
    setAuthMessage("Document removed from history.");
  }
}

function renderSavedCustomers() {
  const target = document.querySelector("#savedCustomers");
  if (!target) return;
  if (!state.user) {
    target.innerHTML = `<p class="empty-state">Login to save customers.</p>`;
    return;
  }
  target.innerHTML = state.customers.length
    ? state.customers.map(customer => `
        <article class="library-card">
          <button class="library-pill" type="button" data-customer-id="${customer.id}">
            ${escapeHtml(customer.name || "Customer")}
            <small>${escapeHtml([customer.gstin || customer.tax_id || "No tax ID", customer.mobile || customer.phone || "", customer.customer_email || ""].filter(Boolean).join(" · "))}</small>
          </button>
          <div class="library-actions">
            <button type="button" data-customer-edit="${customer.id}">Edit</button>
            <button type="button" data-customer-delete="${customer.id}">Delete</button>
          </div>
        </article>
      `).join("")
    : `<p class="empty-state">No saved customers yet.</p>`;
}

async function deleteSavedCustomer(id) {
  state.customers = state.customers.filter(customer => String(customer.id) !== String(id));
  writeUserStore("customers", state.customers);
  renderSavedCustomers();
  renderQuickLibrarySelects();
  await deleteRemoteRow("customers", id);
  setAuthMessage("Customer removed.");
}

function useSavedCustomer(id) {
  const customer = state.customers.find(item => String(item.id) === String(id));
  if (!customer) return;
  fields.customerName.value = customer.name || "";
  if (fields.customerBusinessName) fields.customerBusinessName.value = customer.business_name || "";
  if (fields.customerEmail) fields.customerEmail.value = customer.customer_email || "";
  fields.customerDetails.value = customer.details || "";
  fields.customerGstin.value = customer.gstin || customer.tax_id || "";
  fields.customerPan.value = customer.pan || "";
  fields.customerMobile.value = customer.mobile || customer.phone || "";
  fields.shipToDetails.value = customer.ship_to || "";
  updatePreview();
  setAuthMessage("Customer added to the document.");
}

function editSavedCustomer(id) {
  useSavedCustomer(id);
  document.querySelector("#customerName")?.focus();
  setAuthMessage("Customer loaded. Edit the details, then click Save Customer.");
}

function renderSavedItems() {
  const target = document.querySelector("#savedItems");
  if (!target) return;
  if (!state.user) {
    target.innerHTML = `<p class="empty-state">Login to save items.</p>`;
    return;
  }
  target.innerHTML = state.savedItems.length
    ? state.savedItems.map(item => {
      const itemPrice = item.price ?? item.rate ?? 0;
      const itemMeta = [
        item.hsn || "No HSN",
        item.unit || "Pcs.",
        money(itemPrice),
        item.tax_rate ? `${compactMoney(item.tax_rate)}% tax` : "",
      ].filter(Boolean).join(" · ");
      return `
        <article class="library-card">
          <button class="library-pill" type="button" data-saved-item-id="${item.id}">
            ${escapeHtml(item.name || item.description || "Item")}
            <small>${escapeHtml(itemMeta)}</small>
          </button>
          <div class="library-actions">
            <button type="button" data-saved-item-edit="${item.id}">Edit</button>
            <button type="button" data-saved-item-delete="${item.id}">Delete</button>
          </div>
        </article>
      `;
    }).join("")
    : `<p class="empty-state">No saved items yet.</p>`;
}

async function deleteSavedItem(id) {
  state.savedItems = state.savedItems.filter(item => String(item.id) !== String(id));
  writeUserStore("items", state.savedItems);
  renderSavedItems();
  renderQuickLibrarySelects();
  await deleteRemoteRow("saved_items", id);
  setAuthMessage("Item removed.");
}

function addSavedItem(id) {
  const item = state.savedItems.find(saved => String(saved.id) === String(id));
  if (!item) return;
  state.items.push({
    description: item.name || item.description || "",
    hsn: item.hsn || "",
    quantity: 1,
    unit: item.unit || "Pcs.",
    rate: nonNegativeNumber(item.price ?? item.rate),
    taxRate: nonNegativeNumber(item.tax_rate),
  });
  renderItemsEditor();
  updatePreview();
  setAuthMessage("Saved item added to the document.");
}

function editSavedItem(id) {
  const item = state.savedItems.find(saved => String(saved.id) === String(id));
  if (!item) return;
  state.items = [{
    description: item.name || item.description || "",
    hsn: item.hsn || "",
    quantity: 1,
    unit: item.unit || "Pcs.",
    rate: nonNegativeNumber(item.price ?? item.rate),
    taxRate: nonNegativeNumber(item.tax_rate),
  }];
  renderItemsEditor();
  updatePreview();
  document.querySelector("#itemsList input")?.focus();
  setAuthMessage("Item loaded. Edit it, then click Save Items.");
}

function documentPrefix(docType = state.docType) {
  return { invoice: "INV", quotation: "QUO", receipt: "REC" }[docType] || "DOC";
}

function nextDocumentNumber(docType = state.docType) {
  const year = new Date().getFullYear();
  const prefix = documentPrefix(docType);
  const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`, "i");
  const max = state.documents
    .filter(document => (document.doc_type || document.payload?.docType) === docType)
    .map(document => String(document.payload?.documentNumber || document.document_number || ""))
    .reduce((highest, number) => {
      const match = number.match(pattern);
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
  return `${prefix}-${year}-${String(max + 1).padStart(3, "0")}`;
}

function shouldAutoNumber(value = "") {
  return !value || /^BF-\d+/i.test(value) || /^(INV|QUO|REC)-\d{4}-\d+$/i.test(value);
}

function refreshDocumentNumber(force = false) {
  if (force || shouldAutoNumber(fields.documentNumber.value)) {
    fields.documentNumber.value = nextDocumentNumber(state.docType);
  }
}

async function saveCurrentDocument(reason = "manual") {
  if (!state.user) {
    sendGuestToCreateAccount();
    setAuthMessage("Login to save documents.");
    return null;
  }
  refreshDocumentNumber();
  const payload = currentDocumentPayload();
  const id = makeId("doc");
  const now = new Date().toISOString();
  const title = `${docLabel()} ${payload.documentNumber || now.slice(0, 10)}`;
  const record = {
    id,
    user_id: state.user.id,
    email: state.user.email,
    business_id: payload.businessId || null,
    doc_type: payload.docType,
    document_number: payload.documentNumber,
    document_date: payload.documentDate,
    customer_name: payload.customerName,
    amount: payload.amount,
    status: payload.status,
    title,
    payload,
    created_at: now,
    updated_at: now,
  };
  state.documents = [record, ...state.documents].slice(0, 30);
  writeUserStore("documents", state.documents);
  renderDocumentHistory();
  renderBusinessDashboard();
  await syncTable("documents", record);
  if (reason === "manual") setAuthMessage("Document saved. You can edit, duplicate, or download it again from history.");
  return record;
}

async function saveCustomer() {
  if (!state.user) {
    sendGuestToCreateAccount();
    setAuthMessage("Login to save customers.");
    return;
  }
  const name = fields.customerName.value.trim();
  if (!name) {
    setAuthMessage("Enter a customer name first.");
    return;
  }
  const now = new Date().toISOString();
  const existing = state.customers.find(customer => customer.name.toLowerCase() === name.toLowerCase());
  const record = {
    id: existing?.id || makeId("cust"),
    user_id: state.user.id,
    email: state.user.email,
    name,
    business_name: fields.customerBusinessName?.value || "",
    customer_email: fields.customerEmail?.value || "",
    details: fields.customerDetails.value,
    gstin: fields.customerGstin.value,
    tax_id: fields.customerGstin.value,
    pan: fields.customerPan.value,
    mobile: fields.customerMobile.value,
    phone: fields.customerMobile.value,
    ship_to: fields.shipToDetails.value,
    updated_at: now,
  };
  state.customers = [record, ...state.customers.filter(customer => customer.id !== record.id)].slice(0, 30);
  writeUserStore("customers", state.customers);
  renderSavedCustomers();
  renderQuickLibrarySelects();
  await syncTable("customers", record);
  setAuthMessage("Customer saved.");
}

async function saveItems() {
  if (!state.user) {
    sendGuestToCreateAccount();
    setAuthMessage("Login to save items.");
    return;
  }
  const now = new Date().toISOString();
  const records = state.items
    .filter(item => item.description.trim())
    .map(item => {
      const existing = state.savedItems.find(saved => saved.description.toLowerCase() === item.description.toLowerCase());
      return {
        id: existing?.id || makeId("item"),
        user_id: state.user.id,
        email: state.user.email,
        name: item.description,
        description: item.description,
        hsn: item.hsn || "",
        unit: item.unit || "Pcs.",
        rate: nonNegativeNumber(item.rate),
        price: nonNegativeNumber(item.rate),
        tax_rate: nonNegativeNumber(item.taxRate),
        updated_at: now,
      };
    });
  state.savedItems = [...records, ...state.savedItems.filter(saved => !records.some(record => record.id === saved.id))].slice(0, 40);
  writeUserStore("items", state.savedItems);
  renderSavedItems();
  renderQuickLibrarySelects();
  await Promise.all(records.map(record => syncTable("saved_items", record)));
  setAuthMessage("Items saved.");
}

function readImageFile(input, key) {
  const file = input?.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    setAuthMessage("Please upload an image file.");
    input.value = "";
    return;
  }
  if (file.size > 700 * 1024) {
    setAuthMessage("Image is too large. Use a logo/signature under 700 KB.");
    input.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    state.branding[key] = reader.result;
    updatePreview();
    setAuthMessage(key === "logo" ? "Logo added to this business profile." : "Signature added to this business profile.");
  };
  reader.readAsDataURL(file);
}

function saveDefaultTaxes() {
  const taxes = readTaxRowsFromEditor();
  if (!taxes.length) {
    setAuthMessage("Add at least one tax before saving defaults.");
    return;
  }
  state.taxes = taxes;
  if (state.activeBusinessId) {
    const business = state.businesses.find(item => String(item.id) === String(state.activeBusinessId));
    if (business) {
      business.default_taxes = taxes;
      writeUserStore("businesses", state.businesses);
      syncTable("businesses", business);
    }
  }
  updatePreview();
  setAuthMessage("Default taxes saved for this business.");
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
    const { data: sessionData } = await withTimeout(
      supabaseClient.auth.getSession(),
      "Could not restore login session.",
      6000
    ).catch(() => ({ data: { session: null } }));
    state.user = sessionData?.session?.user || null;
    if (!state.user) {
      const { data } = await withTimeout(
        supabaseClient.auth.getUser(),
        "Could not check logged in user.",
        6000
      ).catch(() => ({ data: { user: null } }));
      state.user = data.user || null;
    }
    if (state.user) {
      await loadProfile();
    } else {
      await loadWorkspaceData();
    }
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        passwordRecoveryReady = true;
        state.user = session?.user || null;
        showPage("login", false);
        setAuthView("reset");
        setAuthMessage("Enter your new password to finish resetting your account.");
        return;
      }
      state.user = session?.user || null;
      if (state.user) {
        await loadProfile();
      } else {
        await loadWorkspaceData();
      }
      updateAccountUi();
    });
  } else {
    const account = localAccount();
    state.user = account?.loggedIn ? { id: account.email, email: account.email } : null;
    if (state.user) {
      await loadProfile();
    } else {
      await loadWorkspaceData();
    }
  }
  updateAccountUi();
}

async function handleCreateAccount(event) {
  event.preventDefault();
  const name = document.querySelector("#createName").value.trim();
  const email = document.querySelector("#createEmail").value.trim();
  const password = document.querySelector("#createPassword").value;
  const submitButton = event.submitter || document.querySelector("#createForm button[type='submit']");

  if (!name || !email || !password) {
    setAuthMessage("Enter name, email, and password.");
    return;
  }
  if (password.length < 6) {
    setAuthMessage("Password must be at least 6 characters.");
    return;
  }

  if (submitButton) submitButton.disabled = true;
  setAuthMessage("Creating account...");

  if (supabaseClient) {
    try {
      await withTimeout(
        supabaseClient.auth.signOut({ scope: "local" }),
        "Session cleanup took too long.",
        3000
      ).catch(() => null);

      const { data, error } = await withTimeout(
        supabaseClient.auth.signUp({
          email,
          password,
          options: { data: { name } },
        }),
        "Account creation is taking too long. Check Supabase Auth settings and try again.",
        8000
      );
      if (error) {
        setAuthMessage(error.message);
        return;
      }

      const looksExisting = data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0;
      setAuthView("login");
      showPage("login");
      document.querySelector("#loginEmail").value = email;
      if (!looksExisting) {
        trackEvent("account_created", { method: "email" });
      }
      setAuthMessage(
        looksExisting
          ? "This email already has an account. Login with the correct password or use forgot password."
          : "Account created. Please login with your email and password."
      );
      return;
    } catch (error) {
      setAuthMessage(error.message || "Could not create account. Please try again.");
      return;
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  } else {
    saveLocalAccount({ name, email, password, loggedIn: false });
    if (submitButton) submitButton.disabled = false;
  }

  setAuthView("login");
  showPage("login");
  trackEvent("account_created", { method: "local_demo" });
  setAuthMessage("Account created. Please login now.");
}

async function handleLogin(event) {
  event.preventDefault();
  const submitButton = event.submitter || document.querySelector("#loginForm button[type='submit']");
  const email = document.querySelector("#loginEmail").value.trim();
  const password = document.querySelector("#loginPassword").value;

  if (!email || !password) {
    setAuthMessage("Enter email and password.");
    return;
  }

  if (submitButton) submitButton.disabled = true;
  setAuthMessage("Logging in...");

  try {
    if (supabaseClient) {
      const { data, error } = await withTimeout(
        supabaseClient.auth.signInWithPassword({ email, password }),
        "Login is taking too long. Check your internet connection and try again.",
        15000
      );
      if (error) {
        setAuthMessage(
          error.message === "Invalid login credentials"
            ? "Invalid login credentials. If this account was just created, check the password or use forgot password."
            : error.message
        );
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
    if (await continuePendingPlan()) return;
    showPage("tools");
    setAuthMessage("Logged in successfully.");
  } catch (error) {
    setAuthMessage(error.message || "Could not login. Please try again.");
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

async function handleForgotPassword(event) {
  event.preventDefault();
  const email = document.querySelector("#forgotEmail").value.trim();
  if (supabaseClient) {
    const { error } = await withTimeout(
      supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: resetRedirectUrl(),
      }),
      "Could not send reset email. Please try again.",
      15000
    );
    if (error) {
      setAuthMessage(error.message);
      return;
    }
    setAuthMessage("Password reset email sent. Open the email link to create a new password.");
  } else {
    setAuthMessage("Demo mode: add Supabase keys to send real password reset emails.");
  }
}

async function handleResetPassword(event) {
  event.preventDefault();
  const submitButton = event.submitter || document.querySelector("#resetForm button[type='submit']");
  const password = document.querySelector("#resetPassword")?.value || "";
  const confirmPassword = document.querySelector("#resetPasswordConfirm")?.value || "";
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
  if (submitButton) submitButton.disabled = true;
  setAuthMessage("Updating password...");

  try {
    const params = resetLinkParams();
    if (params.code || params.tokenHash || params.accessToken) {
      await activateRecoverySession().catch(() => null);
    }

    const { error } = await withTimeout(
      supabaseClient.auth.updateUser({ password }),
      "Password update is taking too long. Please request a new reset link and try again."
    );
    if (error) {
      setAuthMessage(error.message);
      return;
    }
    await withTimeout(supabaseClient.auth.signOut(), "Logout took too long.", 3000).catch(() => null);
    passwordRecoveryReady = false;
    setAuthView("login");
    showPage("login");
    window.history.replaceState({}, document.title, window.location.pathname + "#login");
    setAuthMessage("Password updated. Please login with your new password.");
  } catch (error) {
    setAuthMessage(error.message || "Could not update password. Please request a new reset link.");
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

async function initPasswordResetView() {
  const params = resetLinkParams();
  const hasRecoveryToken = !!(params.code || params.tokenHash || params.type === "recovery" || params.accessToken);
  if (!isResetRequest()) return false;
  showPage("login", false);
  setAuthView("reset");
  setAuthMessage(hasRecoveryToken ? "Enter your new password to finish resetting your account." : "Open the newest reset email link to create a new password.");
  return true;
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
  state.periodStartedAt = "";
  state.periodEndsAt = "";
  updateAccountUi();
  await loadWorkspaceData();
  showPage("login");
  setAuthMessage("Logged out.");
}

async function recordPayment(planId, payment) {
  if (!supabaseClient || !state.user || !payment?.razorpay_payment_id) return;
  const plan = plans[planId];
  await supabaseClient.from("payments").insert({
    user_id: state.user.id,
    email: state.user.email,
    plan_id: planId,
    amount: (plan?.price || 0) * 100,
    razorpay_payment_id: payment.razorpay_payment_id,
    razorpay_order_id: payment.razorpay_order_id || "",
    status: "captured",
  });
}

async function activatePlan(planId, payment = null) {
  const plan = plans[planId];
  if (!state.user) {
    showPage("login");
    setAuthMessage("Please login before choosing a monthly plan.");
    return;
  }
  if (!payment && state.planId === plan.id) {
    const renewalDate = formatShortDate(state.periodEndsAt);
    setAuthMessage(`${plan.name} monthly plan is already active until ${renewalDate}.`);
    setPaymentMessage(`${plan.name} monthly plan is already active until ${renewalDate}.`);
    return;
  }
  state.planId = plan.id;
  state.pdfUsed = 0;
  beginMonthlyPeriod();
  await recordPayment(planId, payment);
  await saveProfile();
  updateAccountUi();
  const paymentId = payment?.razorpay_payment_id || "";
  if (plan.price > 0) {
    trackEvent("plan_purchased", {
      plan_id: plan.id,
      value: plan.price,
      currency: "INR",
      transaction_id: paymentId || makeId("plan"),
    });
    trackEvent("purchase", {
      transaction_id: paymentId || makeId("purchase"),
      value: plan.price,
      currency: "INR",
      items: [{ item_name: `${plan.name} monthly plan`, item_id: plan.id, price: plan.price, quantity: 1 }],
    });
  }
  const activeUntil = formatShortDate(state.periodEndsAt);
  setAuthMessage(paymentId ? `Payment successful: ${paymentId}` : `${plan.name} monthly plan activated until ${activeUntil}.`);
  setPaymentMessage(paymentId ? `${plan.name} monthly plan activated until ${activeUntil}. Payment ID: ${paymentId}` : `${plan.name} monthly plan activated until ${activeUntil}.`);
}

async function startPayment(planId) {
  const plan = plans[planId];
  if (!state.user) {
    sendGuestToCreateAccount(planId);
    setPaymentMessage("Create an account first, then you can choose a monthly plan.");
    return;
  }
  if (plan.price === 0) {
    await activatePlan(planId);
    return;
  }
  if (appConfig.razorpayKeyId.includes("YOUR_") || !window.Razorpay) {
    const message = appConfig.razorpayKeyId.includes("YOUR_")
      ? "Payment is not ready. Add the Razorpay Key ID and Vercel environment variables."
      : "Payment checkout could not load. Refresh and try again, or contact support if it continues.";
    setAuthMessage(message);
    setPaymentMessage(message);
    return;
  }

  setPaymentMessage(`Opening Razorpay for ${plan.name} monthly plan...`);

  try {
    const options = {
      key: appConfig.razorpayKeyId,
      amount: plan.price * 100,
      currency: "INR",
      name: "BillForge",
      description: `${plan.name} monthly plan`,
      prefill: { email: state.user.email },
      handler: async (response) => {
        try {
          const verifyResponse = await fetch(appConfig.verifyPaymentEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verification = await verifyResponse.json().catch(() => ({}));
          if (!verifyResponse.ok || !verification.verified) {
            throw new Error(verification.error || "Payment verification failed.");
          }
          await activatePlan(planId, response);
        } catch (error) {
          const message = `Payment could not be verified: ${error.message}`;
          setAuthMessage(message);
          setPaymentMessage(message);
        }
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
      const order = await orderResponse.json().catch(() => ({}));
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
  if (refreshMonthlyAccess()) {
    await saveProfile();
    updateAccountUi();
  }
  const plan = plans[state.planId];
  if (!plan) {
    showPage("pricing");
    return false;
  }
  if (!plan.unlimited && state.pdfUsed >= plan.limit) {
    showPage("pricing");
    setAuthMessage("Your monthly PDF limit is finished. Choose a higher monthly plan or wait for the next reset.");
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

  state.pdfUsed += 1;
  await saveProfile();
  updateAccountUi();
  setAuthMessage("PDF usage recorded.");
  trackEvent("pdf_generated", {
    doc_type: state.docType,
    template: fields.templateStyle.value,
    plan_id: state.planId,
  });
}

function handleSampleAction() {
  if (!state.user) {
    sendGuestToCreateAccount();
    return;
  }
  loadSample();
}

function initializeDates() {
  const today = new Date();
  fields.documentDate.value = toDateInputValue(today);
  fields.dueDate.value = toDateInputValue(addDays(today, 7));
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => registration.update())
      .catch((error) => {
        console.warn("Service worker registration skipped:", error.message);
      });
  });
}

function isStandalonePwa() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function updateInstallButton() {
  const installButton = document.querySelector("#installPwaBtn");
  if (!installButton) return;
  installButton.classList.toggle("hidden", !state.deferredInstallPrompt || isStandalonePwa());
}

function setupPwaInstallPrompt() {
  const installButton = document.querySelector("#installPwaBtn");
  if (!installButton) return;

  updateInstallButton();

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredInstallPrompt = event;
    updateInstallButton();
  });

  installButton.addEventListener("click", async () => {
    const promptEvent = state.deferredInstallPrompt;
    if (!promptEvent) return;
    promptEvent.prompt();
    const choice = await promptEvent.userChoice.catch(() => null);
    state.deferredInstallPrompt = null;
    updateInstallButton();
    if (choice?.outcome === "accepted") {
      trackEvent("pwa_install_prompt_accepted");
    }
  });

  window.addEventListener("appinstalled", () => {
    state.deferredInstallPrompt = null;
    updateInstallButton();
    trackEvent("pwa_installed");
  });

  window.matchMedia("(display-mode: standalone)").addEventListener?.("change", updateInstallButton);
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
    clampMinZeroInput(input);
    state.items[index][field] = ["description", "hsn", "unit"].includes(field) ? input.value : nonNegativeNumber(input.value);
    updatePreview();
  }
});

itemsList.addEventListener("click", (event) => {
  const removeIndex = event.target.dataset.remove;
  if (removeIndex !== undefined) {
    if (!window.confirm("Remove this item row?")) return;
    state.items.splice(Number(removeIndex), 1);
    if (state.items.length === 0) {
      state.items.push({ description: "", hsn: "", quantity: 1, unit: "Pcs.", rate: 0, taxRate: 0 });
    }
    renderItemsEditor();
    updatePreview();
  }
});

document.querySelector("#addItemBtn").addEventListener("click", () => {
  state.items.push({ description: "", hsn: "", quantity: 1, unit: "Pcs.", rate: 0, taxRate: 0 });
  renderItemsEditor();
  updatePreview();
});

document.querySelector("#addTaxBtn")?.addEventListener("click", () => {
  state.taxes = readTaxRowsFromEditor();
  state.taxes.push({ name: "", rate: 0 });
  renderTaxRowsEditor(state.taxes);
});

document.querySelector("#taxRowsList")?.addEventListener("input", () => {
  state.taxes = readTaxRowsFromEditor();
  updatePreview();
});

document.querySelector("#taxRowsList")?.addEventListener("click", (event) => {
  const removeIndex = event.target.dataset.removeTax;
  if (removeIndex === undefined) return;
  state.taxes = readTaxRowsFromEditor().filter((_, index) => index !== Number(removeIndex));
  if (!state.taxes.length) state.taxes = [{ name: "", rate: 0 }];
  renderTaxRowsEditor(state.taxes);
  updatePreview();
});

document.querySelector("#saveDefaultTaxesBtn")?.addEventListener("click", saveDefaultTaxes);
document.querySelector("#saveBusinessBtn")?.addEventListener("click", saveBusiness);
document.querySelector("#newBusinessBtn")?.addEventListener("click", newBusiness);
document.querySelector("#deleteBusinessBtn")?.addEventListener("click", () => {
  if (window.confirm("Delete this business profile? Existing documents will keep their saved business details.")) deleteBusiness();
});
document.querySelector("#saveDocumentBtn")?.addEventListener("click", () => saveCurrentDocument());
document.querySelector("#saveCustomerBtn")?.addEventListener("click", saveCustomer);
document.querySelector("#saveItemsBtn")?.addEventListener("click", saveItems);

document.querySelector("#documentHistory")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-doc-action]");
  if (!button) return;
  handleDocumentAction(button.dataset.docAction, button.dataset.docId);
});

document.querySelector("#savedBusinesses")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-business-id]");
  if (!button) return;
  applyBusiness(button.dataset.businessId);
});

document.querySelector("#savedCustomers")?.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-customer-delete]");
  if (deleteButton) {
    if (window.confirm("Delete this saved customer?")) deleteSavedCustomer(deleteButton.dataset.customerDelete);
    return;
  }
  const editButton = event.target.closest("[data-customer-edit]");
  if (editButton) {
    editSavedCustomer(editButton.dataset.customerEdit);
    return;
  }
  const button = event.target.closest("[data-customer-id]");
  if (!button) return;
  useSavedCustomer(button.dataset.customerId);
});

document.querySelector("#savedItems")?.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-saved-item-delete]");
  if (deleteButton) {
    if (window.confirm("Delete this saved item?")) deleteSavedItem(deleteButton.dataset.savedItemDelete);
    return;
  }
  const editButton = event.target.closest("[data-saved-item-edit]");
  if (editButton) {
    editSavedItem(editButton.dataset.savedItemEdit);
    return;
  }
  const button = event.target.closest("[data-saved-item-id]");
  if (!button) return;
  addSavedItem(button.dataset.savedItemId);
});

savedCustomerSelect?.addEventListener("change", (event) => {
  if (!event.target.value) return;
  useSavedCustomer(event.target.value);
  event.target.value = "";
});

savedBusinessSelect?.addEventListener("change", (event) => {
  if (!event.target.value) return;
  applyBusiness(event.target.value);
});

savedItemSelect?.addEventListener("change", (event) => {
  if (!event.target.value) return;
  addSavedItem(event.target.value);
  event.target.value = "";
});

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => setTool(button.dataset.docType));
});

document.querySelectorAll(".tool-tab").forEach((button) => {
  button.addEventListener("click", () => setTool(button.dataset.tool));
});

document.querySelector("#calcForm").addEventListener("input", updateCalculator);
document.querySelector("#historySearch")?.addEventListener("input", (event) => {
  state.historySearch = event.target.value;
  renderDocumentHistory();
});
document.querySelector("#historyTypeFilter")?.addEventListener("change", (event) => {
  state.historyTypeFilter = event.target.value;
  renderDocumentHistory();
});
document.querySelector("#historySort")?.addEventListener("change", (event) => {
  state.historySort = event.target.value;
  renderDocumentHistory();
});
fields.businessLogoUpload?.addEventListener("change", (event) => readImageFile(event.target, "logo"));
fields.signatureUpload?.addEventListener("change", (event) => readImageFile(event.target, "signature"));
fields.brandColor?.addEventListener("input", (event) => {
  state.branding.brandColor = event.target.value;
  updatePreview();
});
fields.footerText?.addEventListener("input", (event) => {
  state.branding.footerText = event.target.value;
  updatePreview();
});
initThemeControls();
document.querySelector("#primaryActionBtn").addEventListener("click", handleSampleAction);
document.querySelector("#printBtn").addEventListener("click", generatePdf);
document.querySelector("#printBtnMobile").addEventListener("click", generatePdf);
document.querySelector("#loginForm").addEventListener("submit", handleLogin);
document.querySelector("#createForm").addEventListener("submit", handleCreateAccount);
document.querySelector("#forgotForm").addEventListener("submit", handleForgotPassword);
document.querySelector("#resetForm").addEventListener("submit", handleResetPassword);
document.querySelector("#logoutBtn").addEventListener("click", handleLogout);
form.addEventListener("input", (event) => {
  clampMinZeroInput(event.target);
  updatePreview();
});
fields.templateStyle.addEventListener("change", updatePreview);
window.addEventListener("hashchange", () => {
  if (isResetRequest()) {
    initPasswordResetView();
    return;
  }
  showPage((window.location.hash || "#dashboard").replace("#", ""), false);
});
window.addEventListener("afterprint", confirmPdfGenerated);
setupPwaInstallPrompt();
registerServiceWorker();

renderFeatureCards("#dashboardTools", Object.entries(tools));
renderPricing();
initializeDates();
renderTaxRowsEditor(state.taxes);
renderItemsEditor();
updatePreview();
setTool("invoice");
if (!isResetRequest()) {
  showPage((window.location.hash || "#dashboard").replace("#", ""), false);
}
initializeAuth();
initPasswordResetView();
