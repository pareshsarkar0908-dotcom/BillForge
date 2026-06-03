# BillForge Pro Upgrade

Upload everything in this folder to your BillForge project.

## What is included

- Direct homepage: "Create invoices and business PDFs in minutes"
- Buttons for Create Invoice, Make Receipt, Generate Quotation, and View Pricing
- Invoice preview on the homepage
- Invoice, receipt, quotation, estimate, and GST invoice templates
- GST fields: GSTIN, invoice number, HSN/SAC, tax mode, and place of supply
- Saved documents, customers, and item presets for logged-in users
- Pricing flow that sends new users to create an account before buying
- Razorpay payment buttons labelled "Buy"
- Supabase login, logout, account creation, and password reset flow
- Google Ads / Analytics tags and events for account created, PDF generated, and plan purchased
- PWA files for install support: `manifest.json`, `sw.js`, `offline.html`, and `icons/`

## Upload steps

1. Upload all files from this folder to your hosting project.
2. Keep the `api` folder included.
3. Keep `manifest.json`, `sw.js`, `offline.html`, and `icons/` at the website root so install and offline support work.
4. In Vercel, keep these environment variables:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
5. In Supabase SQL Editor, run `supabase-schema.sql` once.
6. In Supabase Auth URL settings, keep these redirect URLs:
   - `https://www.billforge.net/`
   - `https://www.billforge.net/?reset=1`
   - `https://billforge.net/`
   - `https://billforge.net/?reset=1`

## Cost note

These website features are free to add in code. Real monthly cost can still come from hosting, Supabase usage, Razorpay payment fees, Google Ads, and any paid API usage.
