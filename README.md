This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

This project uses pnpm. Install dependencies and run the development server:

```bash
pnpm dev
```

Required deployment variables include `DATABASE_URL`, `DIRECT_URL`, `USER_JWT_SECRET`,
`ADMIN_JWT_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`,
`CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_APP_URL`,
`NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY`, `FLUTTERWAVE_SECRET_KEY`,
`FLUTTERWAVE_ENCRYPTION_KEY`, and `FLUTTERWAVE_WEBHOOK_SECRET`.

Flutterwave must send webhooks to:

```text
https://www.gnaathglobalcomm.ng/api/webhooks/flutterwave
```

Set the Flutterwave webhook secret hash to the same value as
`FLUTTERWAVE_WEBHOOK_SECRET`. Orders remain unpaid until the server verifies the
transaction ID, reference, currency, and amount directly with Flutterwave.

Build and start production locally with:

```bash
pnpm install --frozen-lockfile
pnpm run build
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
