# Murgdur Commerce

Built baseline:

- Luxury storefront with categories: mens, womens, hand bag, watches.
- Customer login/create profile flow.
- Contact number and editable address book.
- Cart and checkout.
- Product color/size variants with per-variant quantity.
- Customer stock labels: low product quantity below 10, out of stock at 0.
- Admin inventory editor for each product color/size quantity.
- Blank Razorpay payment gateway hook.
- Order ID, tracking ID, invoice number generation.
- Invoice download endpoint.
- Email invoice hook through SMTP.
- Customer order tracking timeline.
- Admin dashboard with sales summary and manual delivery status override.
- Prisma PostgreSQL schema for production persistence.

## Run locally

```bash
npm install
copy .env.example .env
docker compose up -d postgres redis meilisearch
npm run dev
```

Open `http://localhost:3000`.

## Make PostgreSQL real

The demo UI currently uses `lib/store.ts` in-memory data so you can test flows immediately. For production, move the API route logic to Prisma using `prisma/schema.prisma`.

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Production database setup:

- AWS RDS/Aurora PostgreSQL.
- 1 writer and 2 read replicas.
- PgBouncer in front of app connections.
- `DATABASE_URL` points to PgBouncer.

## What you must change before launch

1. Replace `.env` values:
   - `NEXTAUTH_SECRET`
   - `DATABASE_URL`
   - `REDIS_URL`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`
   - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`
   - `CLOUDFLARE_R2_*`
   - `SANITY_*`
   - `SENTRY_DSN`

2. Replace `lib/payment.ts` stub with Razorpay Orders API.

3. Replace `lib/email.ts` SMTP placeholders with your production sender.

4. Replace `lib/delivery.ts` with Shiprocket, Delhivery, BlueDart, or your delivery database webhook.

5. Replace in-memory `lib/store.ts` API operations with Prisma database queries.

6. Add admin authentication before exposing `/api/admin/*`.

7. Generate actual PDF invoices using `@react-pdf/renderer`; current endpoint returns invoice text for easy local testing.

8. Push media uploads to Cloudflare R2 and serve through Cloudflare CDN.

9. Deploy on EKS with Redis Cluster, Meilisearch, Prometheus, Grafana, Loki, Sentry, and Tempo.
"# murgudur---trail" 
"# murgudur---trail" 
