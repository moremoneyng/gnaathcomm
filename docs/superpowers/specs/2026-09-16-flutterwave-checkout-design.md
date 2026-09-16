# Flutterwave Checkout Design

## Objective

Add a production-ready Flutterwave checkout to G Naath Global Communications. Flutterwave is the only payment method. WhatsApp remains a support and communication channel after an order is placed.

## Customer Experience

The cart sends customers to a dedicated `/checkout` page. The page displays the current cart, order total, and a form requiring the customer's name, email address, phone number, delivery address, city, and preferred branch.

Submitting the form does not trust totals from the browser. The server validates the requested products, reloads their current prices from PostgreSQL, calculates the authoritative total, creates a pending order, initializes a Flutterwave Standard hosted checkout, and returns the hosted payment link. The browser redirects the customer to Flutterwave for card, bank transfer, or USSD payment.

Flutterwave redirects the customer to `/checkout/callback`. The callback verifies the transaction on the server before displaying success. A verified payment clears the cart and shows the order number, amount, payment status, and a WhatsApp support link. Cancelled, pending, invalid, and failed payments receive distinct messages and a safe retry path.

## Integration Choice

Use Flutterwave Standard hosted checkout through the server-side Payments API. The application will not collect or process card details. The secret key stays on the server and is used to initialize and verify payments.

The supplied public and encryption keys will be stored as environment variables, but the first implementation will not expose or depend on them. Hosted checkout only needs the secret key for server-side initialization.

## Server Components

### Payment initialization

`POST /api/payments/flutterwave/initialize` accepts customer and cart identifiers. It will:

1. Validate required customer and delivery fields.
2. Reject empty carts and invalid quantities.
3. Load every product from PostgreSQL and reject missing or unavailable products.
4. Recalculate each line and the total from database prices.
5. Generate an unpredictable, unique payment reference.
6. Create an order with `paymentStatus = PENDING`, `orderStatus = PENDING`, and `paymentPreference = flutterwave`.
7. Request a Flutterwave Standard payment link using NGN, the verified total, customer details, allowed payment methods, order reference, and production callback URL.
8. Return only the hosted checkout URL and order reference to the browser.

If initialization fails, the endpoint records a failed initialization state or removes the unusable pending order in a transaction-safe way. It returns a customer-safe error while logging enough server detail for diagnosis.

### Payment verification

A shared server-only function receives a Flutterwave transaction ID and expected reference. It calls Flutterwave's verification endpoint and only accepts a transaction when:

- Status is `successful`.
- Currency is `NGN`.
- Transaction reference equals the stored order reference.
- Paid amount is at least the exact stored order total.
- The order exists and is not linked to another Flutterwave transaction.

The update is idempotent. Repeated callbacks and webhooks return the existing result without duplicating orders or changing totals.

### Callback

`GET /checkout/callback` reads Flutterwave's redirect parameters and performs server-side verification. It never marks an order paid from query parameters alone. It renders a confirmation state for successful, pending, cancelled, failed, or unverifiable payments.

### Webhook

`POST /api/webhooks/flutterwave` compares the `verif-hash` header to `FLUTTERWAVE_WEBHOOK_SECRET` with a timing-safe comparison. Invalid requests are rejected. Valid charge events are re-verified with Flutterwave before updating an order. Duplicate events remain safe.

## Data Model

Extend `Order` with:

- `paymentReference String? @unique`
- `flutterwaveTransactionId String? @unique`
- `paymentMethod String?`
- `paidAt DateTime?`
- `paymentFailureReason String?`

Existing `paymentStatus` values will use `PENDING`, `PAID`, `FAILED`, and `CANCELLED`. A verified payment changes `orderStatus` to `PROCESSING`. Existing orders remain compatible because all new columns are nullable.

The migration will be applied through Prisma using the direct session-mode Supabase connection. Runtime queries continue through the transaction-mode pooler.

## Environment Configuration

Local `.env` and Vercel Production/Preview environments will contain:

- `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY`
- `FLUTTERWAVE_SECRET_KEY`
- `FLUTTERWAVE_ENCRYPTION_KEY`
- `FLUTTERWAVE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL=https://www.gnaathglobalcomm.ng`

Secrets will never be committed, printed, returned to the browser, or included in logs. `.env.example` will contain placeholders only.

The Flutterwave dashboard webhook URL will be `https://www.gnaathglobalcomm.ng/api/webhooks/flutterwave` and use the same secret hash stored in Vercel.

## Cart and Order Changes

The cart checkout action navigates to `/checkout`. The existing WhatsApp order submission and payment preference selector will be removed. WhatsApp remains available on confirmation and support surfaces.

The order API will no longer accept a browser-provided total as authoritative. The payment initialization endpoint owns order creation for storefront orders. Existing admin views will display Flutterwave payment states and references where useful.

The cart clears only after verified payment. A failed or cancelled payment preserves the cart so the customer can retry.

## Error Handling

- Invalid cart or changed prices: show a clear message and refresh the summary.
- Product out of stock: block checkout and identify the affected product.
- Initialization failure: preserve the cart and allow retry.
- Cancelled payment: preserve the cart and return to checkout.
- Pending transfer: show pending and rely on the webhook for settlement.
- Verification mismatch: do not mark paid; log the mismatch and show support.
- Duplicate callback or webhook: return the previously finalized state.

## Security Controls

- Recalculate prices and totals on the server.
- Keep secret and encryption keys server-only.
- Use unique, unpredictable payment references.
- Verify every successful redirect and webhook through Flutterwave's API.
- Match status, amount, currency, and reference before fulfillment.
- Authenticate webhooks with a secret hash and timing-safe comparison.
- Make payment finalization atomic and idempotent.
- Never store card or bank credentials.
- Return customer-safe errors without exposing provider responses or secrets.

## Testing and Verification

Automated tests will cover server total calculation, tampered prices, payment initialization, successful verification, mismatched transaction data, idempotency, webhook authentication, checkout validation, cart preservation on failure, and cart clearing after verified success.

Before deployment, run focused tests, lint changed files, Prisma validation/generation, and the full production build. Apply the production migration, configure Vercel variables and Flutterwave webhook, deploy, verify production health, and perform a controlled low-value live payment to confirm the provider flow.

## Release Behavior

The release is complete when customers can move from cart to checkout, pay through Flutterwave, return to a verified confirmation page, and see a paid order in the admin dashboard. Failed, cancelled, pending, duplicate, and tampered payment attempts must never create a paid order.
