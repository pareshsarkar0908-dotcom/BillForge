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
  templateStyle: "simple",
  activeTool: "invoice",
  user: null,
  planId: "guest",
  pendingPlanId: "",
  pdfUsed: 0,
  pendingPdfCharge: false,
  deferredInstallPrompt: null,
  calculatorValues: {},
  documents: [],
  customers: [],
  savedItems: [],
  items: [
    { description: "Landing page design", hsn: "998314", quantity: 1, unit: "Pcs.", rate: 12000 },
    { description: "Social media banner set", hsn: "998361", quantity: 2, unit: "Pcs.", rate: 2500 },
  ],
};

const form = document.querySelector("#documentForm");
const itemsList = document.querySelector("#itemsList");
const previewItems = document.querySelector("#previewItems");
const currency = document.querySelector("#currency");
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
  businessDetails: document.querySelector("#businessDetails"),
  businessGstin: document.querySelector("#businessGstin"),
  customerName: document.querySelector("#customerName"),
  customerDetails: document.querySelector("#customerDetails"),
  customerGstin: document.querySelector("#customerGstin"),
  customerPan: document.querySelector("#customerPan"),
  customerMobile: document.querySelector("#customerMobile"),
  shipToDetails: document.querySelector("#shipToDetails"),
  documentNumber: document.querySelector("#documentNumber"),
  documentDate: document.querySelector("#documentDate"),
  dueDate: document.querySelector("#dueDate"),
  taxRate: document.querySelector("#taxRate"),
  taxMode: document.querySelector("#taxMode"),
  placeOfSupply: document.querySelector("#placeOfSupply"),
  reverseCharge: document.querySelector("#reverseCharge"),
  transport: document.querySelector("#transport"),
  vehicleNo: document.querySelector("#vehicleNo"),
  ewayBill: document.querySelector("#ewayBill"),
  discount: document.querySelector("#discount"),
  notes: document.querySelector("#notes"),
};

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
  const subtotal = state.items.reduce((sum, item) => sum + nonNegativeNumber(item.quantity) * nonNegativeNumber(item.rate), 0);
  const discount = nonNegativeNumber(fields.discount.value);
  const taxable = Math.max(subtotal - discount, 0);
  const taxMode = fields.taxMode.value;
  const taxRate = taxMode === "none" || state.docType === "receipt" ? 0 : nonNegativeNumber(fields.taxRate.value);
  const tax = taxable * (taxRate / 100);
  const cgst = taxMode === "cgst_sgst" ? tax / 2 : 0;
  const sgst = taxMode === "cgst_sgst" ? tax / 2 : 0;
  const igst = taxMode === "igst" ? tax : 0;
  const total = taxable + tax;
  const isTaxInvoice = fields.templateStyle.value === "tax-invoice";
  const previewType = isTaxInvoice ? "Tax Invoice" : typeLabel;

  state.templateStyle = fields.templateStyle.value || "simple";
  document.querySelector("#previewTitle").textContent = previewType;
  document.querySelector("#previewDocType").textContent = previewType;
  document.querySelector(".doc-watermark").textContent =
    isTaxInvoice ? "TAX" : state.docType === "receipt" ? "PAID" : fields.templateStyle.value === "estimate" ? "ESTIMATE" : state.docType === "quotation" ? "QUOTE" : "FREE";
  document.querySelector("#dueLabel").textContent = dueLabel;
  document.querySelector("#dateDetailLabel").textContent = state.docType === "receipt" ? "Paid on" : "Due / valid until";
  document.querySelector("#customerLabel").textContent = state.docType === "receipt" ? "Received from" : "Bill to";
  document.querySelector("#printArea").className = `document-preview template-${state.templateStyle}`;
  document.querySelector("#previewBusinessName").textContent = fields.businessName.value || "Your Business";
  document.querySelector("#previewBusinessDetails").textContent = fields.businessDetails.value;
  document.querySelector("#previewBusinessGstin").textContent = !isTaxInvoice && fields.businessGstin.value ? `GSTIN: ${fields.businessGstin.value}` : "";
  document.querySelector("#previewCustomerName").textContent = fields.customerName.value || "Customer";
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
  document.querySelector("#subtotalValue").textContent = money(subtotal);
  document.querySelector("#discountValue").textContent = money(discount);
  document.querySelector("#cgstValue").textContent = money(cgst);
  document.querySelector("#sgstValue").textContent = money(sgst);
  document.querySelector("#igstValue").textContent = money(igst);
  document.querySelector("#cgstRow").classList.toggle("hidden", cgst <= 0);
  document.querySelector("#sgstRow").classList.toggle("hidden", sgst <= 0);
  document.querySelector("#igstRow").classList.toggle("hidden", igst <= 0);
  document.querySelector("#totalValue").textContent = money(total);
  document.querySelector("#taxCopyLine").classList.toggle("hidden", !isTaxInvoice);
  document.querySelector("#taxTransportGrid").classList.toggle("hidden", !isTaxInvoice);
  document.querySelector("#shipToBox").classList.toggle("hidden", !isTaxInvoice);
  document.querySelector("#taxSummaryPanel").classList.toggle("hidden", !isTaxInvoice);
  document.querySelector("#signatureGrid").classList.toggle("hidden", !isTaxInvoice);
  document.querySelector("#signatureBusinessName").textContent = fields.businessName.value || "Your Business";
  document.querySelectorAll(".tax-only").forEach((row) => row.classList.toggle("hidden", !isTaxInvoice));
  document.querySelector("#amountInWords").textContent = amountToWordsIndian(total);

  document.querySelector("#previewTableHead").innerHTML = isTaxInvoice
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
    if (isTaxInvoice) {
      const breakup = lineTaxBreakup(item, subtotal, discount, taxRate, taxMode);
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

  document.querySelector("#taxSummaryRows").innerHTML = renderTaxSummary(state.items, subtotal, discount, taxRate, taxMode);
}

function setDocType(nextType) {
  state.docType = nextType;
  const currentTemplate = fields.templateStyle.value;
  const invoiceTemplates = ["simple", "modern", "tax-invoice", "gst"];
  const suggestedTemplate =
    nextType === "quotation" ? (currentTemplate === "estimate" ? "estimate" : "quotation")
      : nextType === "receipt" ? "receipt"
        : invoiceTemplates.includes(currentTemplate) ? currentTemplate : "simple";
  fields.templateStyle.value = suggestedTemplate;
  document.querySelectorAll(".segment").forEach((button) => {
    button.classList.toggle("active", button.dataset.docType === nextType);
  });
  updatePreview();
}

function loadSample() {
  fields.businessName.value = "Quick Supply Co.";
  fields.businessDetails.value = "Park Street, Kolkata\nsupport@quicksupply.example\n+91 91234 56780";
  fields.businessGstin.value = "19ABCDE1234F1Z8";
  fields.customerName.value = state.docType === "receipt" ? "Green Leaf Cafe" : "Acme Retail";
  fields.customerDetails.value = "Attn: Operations Manager\nBengaluru, India";
  fields.customerGstin.value = "29WXYZR5678L1Z2";
  fields.customerPan.value = "ABCDE1234F";
  fields.customerMobile.value = "8250515014";
  fields.shipToDetails.value = "Warehouse Gate 2\nBengaluru, India";
  fields.documentNumber.value = state.docType === "invoice" ? "INV-2026-014" : state.docType === "quotation" ? "EST-2026-014" : "RCT-2026-014";
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
            ${plan.price === 0 ? "Activate Free" : "Buy"}
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
  document.querySelector("#primaryActionBtn").textContent = state.user ? "Load Sample" : "Create Account";
  document.querySelector("#currentPlanName").textContent = state.user ? `${plan?.name || "No plan"} Package` : "Guest";
  document.querySelector("#accountEmailText").textContent = state.user ? `Logged in as ${state.user.email}` : "Not logged in";
  document.querySelector("#quotaText").textContent = state.user ? `${used} of ${limit} PDF generations used.` : "Login to start tracking PDF usage.";
  document.querySelector("#quotaBar").style.width = `${percent}%`;
  document.querySelector("#logoutBtn").classList.toggle("hidden", !state.user);
}

function sendGuestToCreateAccount(planId = "") {
  state.pendingPlanId = planId;
  setAuthView("create");
  showPage("login");
  const plan = plans[planId];
  setAuthMessage(plan ? `Create an account first to choose the ${plan.name} package.` : "Create an account to start using BillForge.");
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
  setPaymentMessage(`Account ready. Opening payment for ${plans[planId].name} package...`);
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
          .select("plan_id,pdf_used")
          .eq("id", state.user.id)
          .maybeSingle(),
        "Profile loading took too long.",
        6000
      );
      if (!error && data) {
        state.planId = data.plan_id || "starter";
        state.pdfUsed = Number(data.pdf_used || 0);
        updateAccountUi();
        await loadWorkspaceData();
        return;
      }
    } catch (error) {
      console.warn("Profile load skipped:", error.message);
    }
  }

  const profile = loadLocalProfile() || { planId: "starter", pdfUsed: 0 };
  state.planId = profile.planId;
  state.pdfUsed = Number(profile.pdfUsed || 0);
  saveLocalProfile(profile);
  updateAccountUi();
  await loadWorkspaceData();
}

async function saveProfile() {
  if (!state.user) return;
  const profile = { planId: state.planId, pdfUsed: state.pdfUsed };
  saveLocalProfile(profile);

  if (supabaseClient) {
    await withTimeout(
      supabaseClient.from("profiles").upsert({
        id: state.user.id,
        email: state.user.email,
        plan_id: state.planId,
        pdf_used: state.pdfUsed,
        updated_at: new Date().toISOString(),
      }),
      "Profile saving took too long.",
      6000
    ).catch(error => console.warn("Profile save skipped:", error.message));
  }
}

function currentDocumentPayload() {
  return {
    docType: state.docType,
    templateStyle: fields.templateStyle.value,
    businessName: fields.businessName.value,
    businessDetails: fields.businessDetails.value,
    businessGstin: fields.businessGstin.value,
    customerName: fields.customerName.value,
    customerDetails: fields.customerDetails.value,
    customerGstin: fields.customerGstin.value,
    customerPan: fields.customerPan.value,
    customerMobile: fields.customerMobile.value,
    shipToDetails: fields.shipToDetails.value,
    documentNumber: fields.documentNumber.value,
    documentDate: fields.documentDate.value,
    dueDate: fields.dueDate.value,
    currency: currency.value,
    taxRate: fields.taxRate.value,
    taxMode: fields.taxMode.value,
    placeOfSupply: fields.placeOfSupply.value,
    reverseCharge: fields.reverseCharge.value,
    transport: fields.transport.value,
    vehicleNo: fields.vehicleNo.value,
    ewayBill: fields.ewayBill.value,
    discount: fields.discount.value,
    notes: fields.notes.value,
    items: state.items.map(item => ({ ...item })),
  };
}

function applyDocumentPayload(payload = {}) {
  state.docType = payload.docType || "invoice";
  fields.templateStyle.value = payload.templateStyle || "simple";
  fields.businessName.value = payload.businessName || "";
  fields.businessDetails.value = payload.businessDetails || "";
  fields.businessGstin.value = payload.businessGstin || "";
  fields.customerName.value = payload.customerName || "";
  fields.customerDetails.value = payload.customerDetails || "";
  fields.customerGstin.value = payload.customerGstin || "";
  fields.customerPan.value = payload.customerPan || "";
  fields.customerMobile.value = payload.customerMobile || "";
  fields.shipToDetails.value = payload.shipToDetails || "";
  fields.documentNumber.value = payload.documentNumber || "";
  fields.documentDate.value = payload.documentDate || toDateInputValue(new Date());
  fields.dueDate.value = payload.dueDate || toDateInputValue(addDays(new Date(), 7));
  currency.value = payload.currency || "₹";
  fields.taxRate.value = payload.taxRate ?? 18;
  fields.taxMode.value = payload.taxMode || "cgst_sgst";
  fields.placeOfSupply.value = payload.placeOfSupply || "";
  fields.reverseCharge.value = payload.reverseCharge || "N";
  fields.transport.value = payload.transport || "";
  fields.vehicleNo.value = payload.vehicleNo || "";
  fields.ewayBill.value = payload.ewayBill || "";
  fields.discount.value = payload.discount ?? 0;
  fields.notes.value = payload.notes || "";
  state.items = Array.isArray(payload.items) && payload.items.length
    ? payload.items.map(item => ({
        description: item.description || "",
        hsn: item.hsn || "",
        quantity: nonNegativeNumber(item.quantity),
        unit: item.unit || "Pcs.",
        rate: nonNegativeNumber(item.rate),
      }))
    : [{ description: "", hsn: "", quantity: 1, unit: "Pcs.", rate: 0 }];
  setDocType(state.docType);
  renderItemsEditor();
  updatePreview();
}

async function loadWorkspaceData() {
  if (!state.user) {
    state.documents = [];
    state.customers = [];
    state.savedItems = [];
    renderWorkspaceLibrary();
    return;
  }

  state.documents = readUserStore("documents", []);
  state.customers = readUserStore("customers", []);
  state.savedItems = readUserStore("items", []);

  if (supabaseClient) {
    try {
      const [documents, customers, savedItems] = await Promise.all([
        withTimeout(
          supabaseClient.from("documents").select("id,doc_type,title,payload,created_at,updated_at").eq("user_id", state.user.id).order("updated_at", { ascending: false }).limit(30),
          "Documents loading took too long.",
          5000
        ),
        withTimeout(
          supabaseClient.from("customers").select("id,name,details,gstin,pan,mobile,ship_to,updated_at").eq("user_id", state.user.id).order("updated_at", { ascending: false }).limit(30),
          "Customers loading took too long.",
          5000
        ),
        withTimeout(
          supabaseClient.from("saved_items").select("id,description,hsn,unit,rate,updated_at").eq("user_id", state.user.id).order("updated_at", { ascending: false }).limit(40),
          "Items loading took too long.",
          5000
        ),
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
    } catch (error) {
      console.warn("Workspace data loaded from local storage:", error.message);
    }
  }

  renderWorkspaceLibrary();
}

async function syncTable(table, row) {
  if (!supabaseClient || !state.user) return;
  await withTimeout(
    supabaseClient.from(table).upsert(row),
    `${table} saving took too long.`,
    5000
  ).catch(error => console.warn(`${table} save skipped:`, error.message));
}

function renderWorkspaceLibrary() {
  renderDocumentHistory();
  renderSavedCustomers();
  renderSavedItems();
  renderQuickLibrarySelects();
}

function renderQuickLibrarySelects() {
  if (savedCustomerSelect) {
    savedCustomerSelect.innerHTML = state.user
      ? `<option value="">Select saved customer</option>${state.customers.map(customer => `<option value="${customer.id}">${escapeHtml(customer.name || "Customer")} ${customer.gstin ? `- ${escapeHtml(customer.gstin)}` : ""}</option>`).join("")}`
      : `<option value="">Login and save customers to reuse them</option>`;
  }
  if (savedItemSelect) {
    savedItemSelect.innerHTML = state.user
      ? `<option value="">Add saved item</option>${state.savedItems.map(item => `<option value="${item.id}">${escapeHtml(item.description || "Item")} - ${escapeHtml(item.unit || "Pcs.")} - ${money(item.rate || 0)}</option>`).join("")}`
      : `<option value="">Login and save items to reuse them</option>`;
  }
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
  target.innerHTML = state.documents.map((document) => `
    <article class="history-card">
      <div>
        <strong>${escapeHtml(document.title || "Saved document")}</strong>
        <span>${escapeHtml(document.doc_type || document.payload?.docType || "document")} · ${formatDate((document.updated_at || document.created_at || "").slice(0, 10))}</span>
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
            <small>${escapeHtml([customer.gstin || "No GSTIN", customer.mobile || "", customer.pan || ""].filter(Boolean).join(" · "))}</small>
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
  fields.customerDetails.value = customer.details || "";
  fields.customerGstin.value = customer.gstin || "";
  fields.customerPan.value = customer.pan || "";
  fields.customerMobile.value = customer.mobile || "";
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
    ? state.savedItems.map(item => `
        <article class="library-card">
          <button class="library-pill" type="button" data-saved-item-id="${item.id}">
            ${escapeHtml(item.description || "Item")}
            <small>${escapeHtml(item.hsn || "No HSN")} · ${escapeHtml(item.unit || "Pcs.")} · ${money(item.rate || 0)}</small>
          </button>
          <div class="library-actions">
            <button type="button" data-saved-item-edit="${item.id}">Edit</button>
            <button type="button" data-saved-item-delete="${item.id}">Delete</button>
          </div>
        </article>
      `).join("")
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
    description: item.description || "",
    hsn: item.hsn || "",
    quantity: 1,
    unit: item.unit || "Pcs.",
    rate: nonNegativeNumber(item.rate),
  });
  renderItemsEditor();
  updatePreview();
  setAuthMessage("Saved item added to the document.");
}

function editSavedItem(id) {
  const item = state.savedItems.find(saved => String(saved.id) === String(id));
  if (!item) return;
  state.items = [{
    description: item.description || "",
    hsn: item.hsn || "",
    quantity: 1,
    unit: item.unit || "Pcs.",
    rate: nonNegativeNumber(item.rate),
  }];
  renderItemsEditor();
  updatePreview();
  document.querySelector("#itemsList input")?.focus();
  setAuthMessage("Item loaded. Edit it, then click Save Items.");
}

async function saveCurrentDocument(reason = "manual") {
  if (!state.user) {
    sendGuestToCreateAccount();
    setAuthMessage("Login to save documents.");
    return null;
  }
  const payload = currentDocumentPayload();
  const id = makeId("doc");
  const now = new Date().toISOString();
  const title = `${docLabel()} ${payload.documentNumber || now.slice(0, 10)}`;
  const record = {
    id,
    user_id: state.user.id,
    email: state.user.email,
    doc_type: payload.docType,
    title,
    payload,
    created_at: now,
    updated_at: now,
  };
  state.documents = [record, ...state.documents].slice(0, 30);
  writeUserStore("documents", state.documents);
  renderDocumentHistory();
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
    details: fields.customerDetails.value,
    gstin: fields.customerGstin.value,
    pan: fields.customerPan.value,
    mobile: fields.customerMobile.value,
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
        description: item.description,
        hsn: item.hsn || "",
        unit: item.unit || "Pcs.",
        rate: nonNegativeNumber(item.rate),
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
    setAuthMessage("Please login before choosing a package.");
    return;
  }
  if (!payment && state.planId === plan.id) {
    setAuthMessage(`${plan.name} package is already active.`);
    setPaymentMessage(`${plan.name} package is already active.`);
    return;
  }
  state.planId = plan.id;
  state.pdfUsed = 0;
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
      items: [{ item_name: `${plan.name} package`, item_id: plan.id, price: plan.price, quantity: 1 }],
    });
  }
  setAuthMessage(paymentId ? `Payment successful: ${paymentId}` : `${plan.name} package activated.`);
  setPaymentMessage(paymentId ? `${plan.name} package activated. Payment ID: ${paymentId}` : `${plan.name} package activated.`);
}

async function startPayment(planId) {
  const plan = plans[planId];
  if (!state.user) {
    sendGuestToCreateAccount(planId);
    setPaymentMessage("Create an account first, then you can choose a package.");
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
      state.items.push({ description: "", hsn: "", quantity: 1, unit: "Pcs.", rate: 0 });
    }
    renderItemsEditor();
    updatePreview();
  }
});

document.querySelector("#addItemBtn").addEventListener("click", () => {
  state.items.push({ description: "", hsn: "", quantity: 1, unit: "Pcs.", rate: 0 });
  renderItemsEditor();
  updatePreview();
});

document.querySelector("#saveDocumentBtn")?.addEventListener("click", () => saveCurrentDocument());
document.querySelector("#saveCustomerBtn")?.addEventListener("click", saveCustomer);
document.querySelector("#saveItemsBtn")?.addEventListener("click", saveItems);

document.querySelector("#documentHistory")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-doc-action]");
  if (!button) return;
  handleDocumentAction(button.dataset.docAction, button.dataset.docId);
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
renderItemsEditor();
updatePreview();
setTool("invoice");
if (!isResetRequest()) {
  showPage((window.location.hash || "#dashboard").replace("#", ""), false);
}
initializeAuth();
initPasswordResetView();
