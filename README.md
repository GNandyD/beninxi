This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Kkiapay

The checkout now supports real KKiaPay payments through the official browser widget and a server webhook.

Add the required variables from [.env.example](./.env.example) to your local or production environment:

- `NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY`
- `NEXT_PUBLIC_KKIAPAY_SANDBOX`
- `KKIAPAY_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS` for the admin order dashboard if you do not use a Supabase `admin` role

Then configure a KKiaPay webhook in the dashboard that points to:

```text
https://your-domain.com/api/payments/kkiapay/webhook
```

The checkout creates the order first, opens the KKiaPay widget, links the transaction ID when available, and marks the order as paid after a valid webhook confirms the transaction amount.

## Admin Orders

An admin dashboard is available at `/admin`.

Access is granted when one of these conditions is true:

- the Supabase user has `app_metadata.role = "admin"`
- the Supabase user has `user_metadata.role = "admin"`
- the Supabase user has `is_admin = true`
- the user's email is present in `ADMIN_EMAILS`

## Order Notifications

Customer notifications are now dispatched automatically from order events such as:

- order creation
- payment confirmation or failure
- admin confirmation
- shipping start
- delivery completion
- cancellation
- refund

The app sends notifications through generic outgoing webhooks so you can connect your own SMS or email provider without changing the checkout or admin flows.

Add these variables if you want live notifications:

- `NEXT_PUBLIC_SITE_URL`
- `ORDER_NOTIFICATION_EMAIL_WEBHOOK_URL`
- `ORDER_NOTIFICATION_EMAIL_WEBHOOK_TOKEN`
- `ORDER_NOTIFICATION_SMS_WEBHOOK_URL`
- `ORDER_NOTIFICATION_SMS_WEBHOOK_TOKEN`

Each webhook receives a JSON payload containing the customer, order, event, and rendered message fields (`subject`, `text`, and `html` for email).

Delivery attempts are stored in `order_notifications` and exposed in the admin order detail so you can see whether each SMS or email was sent, failed, or was skipped because a recipient or webhook was missing.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
