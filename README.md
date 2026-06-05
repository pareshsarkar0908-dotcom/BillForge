# BillForge Business Platform Upgrade

Upload everything in this folder to your BillForge Vercel project.

## What Is New

- Multi-business profiles with saved business details, tax ID, logo, signature, brand color, footer text, and default taxes.
- Customer CRM fields for business name, email, phone, address, GST/tax ID, PAN, and shipping address.
- Product/service catalog support with item name, HSN/SAC, unit, rate, and tax rate.
- Custom global tax engine for VAT, service tax, sales tax, GST preset, or no tax.
- Auto document numbering for invoices, quotations, and receipts.
- Richer document history with search, type filter, sort, status, customer, and amount.
- Dashboard cards for total documents, invoices, receipts, quotations, customers, and saved items.
- Branding in the PDF preview: logo, signature, brand color, and footer note.
- Backward-compatible Supabase migration for the new tables and columns.
- Existing PWA, dark mode, SEO pages, Supabase auth, and Razorpay monthly subscriptions are preserved.

## Upload To Vercel

1. Upload every file and folder from this folder to your Vercel project.
2. Keep the `api` folder at the root.
3. Keep these files at the root:
   - `index.html`
   - `script.js`
   - `styles.css`
   - `manifest.json`
   - `sw.js`
   - `offline.html`
   - `robots.txt`
   - `sitemap.xml`
   - `vercel.json`
   - `privacy-policy.html`
   - `account-deletion.html`
4. Keep the `icons/` and `blog/` folders.
5. Redeploy in Vercel.

## Supabase Required Step

Run `supabase-schema.sql` in Supabase SQL Editor after uploading the new files.

This migration keeps your old data and adds:

- `businesses`
- `products`
- `document_items`
- `document_taxes`
- `document_history`
- New columns on `documents`, `customers`, and `saved_items`
- Row level security policies for the new tables

If you skip this step, the website can still work locally in the browser, but online saving for the new business/profile fields may not persist correctly in Supabase.

## Vercel Settings

Keep your existing environment variables:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

No new Vercel environment variable is required for this upgrade.

## Razorpay Settings

No Razorpay change is required if your current subscription/payment buttons already work.

The plan prices remain controlled by the website code and your existing API endpoints:

- Free: 10 PDFs
- Basic: ₹49 / month for 100 PDFs
- Growth: ₹99 / month for 250 PDFs
- Pro: ₹199 / month for unlimited PDFs

## Supabase Auth Redirect URLs

Keep these redirect URLs in Supabase Auth settings:

- `https://www.billforge.net/`
- `https://www.billforge.net/?reset=1`
- `https://billforge.net/`
- `https://billforge.net/?reset=1`

## After Deploy

1. Open `https://www.billforge.net/`.
2. Hard refresh once.
3. Test login.
4. Save a business profile.
5. Save a customer.
6. Save an item.
7. Create and save an invoice.
8. Check the history search/filter.
9. Generate a PDF.
10. Test dark mode and mobile view.

## Google Search Console

Your sitemap path is:

`https://www.billforge.net/sitemap.xml`

Submit only this HTTPS sitemap. Remove the old HTTP `SiteMap.xml` entry if Google Search Console still shows it with errors.

## Notes

- Uploading only `index.html` and `script.js` is not enough for this upgrade because the PWA cache, CSS, and Supabase schema also changed.
- The app still stores the full document payload for backward compatibility.
- The normalized document item/tax/history tables are included for future reporting and audit workflows.
