# Flutterwave Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready Flutterwave-only checkout that calculates totals on the server, verifies every payment, handles signed webhooks, and records paid orders safely.

**Architecture:** A dedicated checkout page submits product IDs and quantities to a thin initialization route backed by focused checkout and Flutterwave service modules. Flutterwave hosts payment; callback and webhook routes share an idempotent server-side finalizer that verifies the provider transaction before changing order state.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma 6, PostgreSQL/Supabase, Flutterwave Standard v3 API, Node `crypto`, Node test runner through `tsx`.

**Spec:** `docs/superpowers/specs/2026-09-16-flutterwave-checkout-design.md`

## Global Constraints

- Flutterwave is the only payment method; WhatsApp is support and communication only.
- Enable card, bank transfer, and USSD checkout methods in NGN.
- Never trust browser prices or totals; reload product prices and stock from PostgreSQL.
- A payment becomes `PAID` only after server-side verification of status, amount, currency, and reference.
- Callback and webhook processing must be atomic and idempotent.
- Preserve the cart for failed, cancelled, pending, or unverifiable payments; clear it only after verified success.
- Never expose secret or encryption keys to client code, logs, commits, or API responses.
- Existing orders remain compatible; new database columns are nullable.

---

### Task 1: Environment Contract and Order Payment Schema

**Files:**
- Create: `.env.example`
- Create: `prisma/payment-schema.test.ts`
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260916190000_add_flutterwave_payment_fields/migration.sql`

**Interfaces:**
- Produces nullable `Order.paymentReference`, `Order.flutterwaveTransactionId`, `Order.paymentMethod`, `Order.paidAt`, and `Order.paymentFailureReason` fields.
- Produces environment names consumed by all later tasks.

- [ ] **Step 1: Write the failing schema contract test**

```ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const schema = readFileSync(new URL('./schema.prisma', import.meta.url), 'utf8');

test('orders store idempotent Flutterwave payment data', () => {
  assert.match(schema, /paymentReference\s+String\?\s+@unique/);
  assert.match(schema, /flutterwaveTransactionId\s+String\?\s+@unique/);
  assert.match(schema, /paymentMethod\s+String\?/);
  assert.match(schema, /paidAt\s+DateTime\?/);
  assert.match(schema, /paymentFailureReason\s+String\?/);
});
```

- [ ] **Step 2: Run the test and confirm the expected failure**

Run: `pnpm exec tsx --test prisma/payment-schema.test.ts`
Expected: FAIL because the five fields are absent.

- [ ] **Step 3: Add the nullable fields and environment template**

Add the five fields to `Order`. Add placeholder-only entries to `.env.example`:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY="FLWPUBK_TEST-REPLACE-X"
FLUTTERWAVE_SECRET_KEY="FLWSECK_TEST-REPLACE-X"
FLUTTERWAVE_ENCRYPTION_KEY="REPLACE_ME"
FLUTTERWAVE_WEBHOOK_SECRET="REPLACE_WITH_RANDOM_SECRET"
```

- [ ] **Step 4: Generate and verify the migration**

Run: `pnpm exec prisma migrate dev --name add_flutterwave_payment_fields`
Expected: migration applies locally and Prisma Client regenerates.

Run: `pnpm exec prisma validate && pnpm exec tsx --test prisma/payment-schema.test.ts`
Expected: both PASS.

- [ ] **Step 5: Commit**

```bash
git add .env.example prisma/schema.prisma prisma/migrations prisma/payment-schema.test.ts
git commit -m "feat: add Flutterwave order payment fields"
```

---

### Task 2: Authoritative Checkout Calculation

**Files:**
- Create: `src/lib/checkout/calculateOrder.ts`
- Create: `src/lib/checkout/calculateOrder.test.ts`

**Interfaces:**
- Consumes: `CheckoutCartInput = { productId: string; quantity: number; selectedOptions?: Record<string, string> }[]`.
- Produces: `calculateOrder(cart, products): CalculatedOrder` where `CalculatedOrder` contains normalized order items and `totalAmount`.
- Throws `CheckoutValidationError` with customer-safe messages for empty carts, duplicates, invalid quantities, missing products, and out-of-stock products.

- [ ] **Step 1: Write failing tests for trusted totals**

Cover a valid multi-item total, a browser-supplied price being ignored, quantity outside `1..20`, missing product, and out-of-stock product. Use real objects rather than mocks.

```ts
test('calculates totals from database products', () => {
  const result = calculateOrder(
    [{ productId: 'p1', quantity: 2 }],
    [{ id: 'p1', name: 'Phone', price: 50000, inStock: true }],
  );
  assert.equal(result.totalAmount, 100000);
  assert.deepEqual(result.items[0], {
    productId: 'p1', productName: 'Phone', price: 50000, quantity: 2, selectedOptions: {},
  });
});
```

- [ ] **Step 2: Run tests and confirm imports fail because the module is absent**

Run: `pnpm exec tsx --test src/lib/checkout/calculateOrder.test.ts`
Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement the pure calculation module**

Use a product map by ID, integer quantity validation, database price only, and cent-safe integer arithmetic before converting to NGN numbers.

- [ ] **Step 4: Run tests**

Run: `pnpm exec tsx --test src/lib/checkout/calculateOrder.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/checkout
git commit -m "feat: calculate checkout totals on the server"
```

---

### Task 3: Flutterwave API Client and Verification Rules

**Files:**
- Create: `src/lib/flutterwave/client.ts`
- Create: `src/lib/flutterwave/client.test.ts`
- Create: `src/lib/flutterwave/types.ts`

**Interfaces:**
- Produces: `createFlutterwavePayment(input, fetchImpl?): Promise<{ link: string }>`.
- Produces: `verifyFlutterwaveTransaction(id, expected, fetchImpl?): Promise<VerifiedPayment>`.
- `expected` is `{ txRef: string; amount: number; currency: 'NGN' }`.
- `VerifiedPayment` includes `transactionId`, `txRef`, `amount`, `currency`, `paymentMethod`, and `paidAt`.

- [ ] **Step 1: Write failing API client tests**

Use an injected fake `fetch` to assert:

- initialization posts to `https://api.flutterwave.com/v3/payments` with Bearer authorization;
- payload contains `payment_options: 'card,banktransfer,ussd'`;
- the secret key is never included in the JSON body;
- verification rejects non-success status, wrong currency, wrong reference, and underpayment;
- verification accepts an exact matching transaction.

- [ ] **Step 2: Run tests and confirm module-not-found**

Run: `pnpm exec tsx --test src/lib/flutterwave/client.test.ts`
Expected: FAIL because the client does not exist.

- [ ] **Step 3: Implement the client**

Read `FLUTTERWAVE_SECRET_KEY` only inside functions. Throw `FlutterwaveConfigurationError` when absent and `FlutterwaveRequestError` for provider/network failures. Do not include raw provider bodies in thrown customer-facing messages.

- [ ] **Step 4: Run tests**

Run: `pnpm exec tsx --test src/lib/flutterwave/client.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/flutterwave
git commit -m "feat: add verified Flutterwave API client"
```

---

### Task 4: Pending Order and Payment Initialization Service

**Files:**
- Create: `src/lib/checkout/initializePayment.ts`
- Create: `src/lib/checkout/initializePayment.test.ts`
- Create: `src/app/api/payments/flutterwave/initialize/route.ts`
- Modify: `src/app/api/orders/route.ts`

**Interfaces:**
- Consumes: `{ customer: CheckoutCustomer; cart: CheckoutCartInput; userId?: string | null }`.
- Produces: `initializePayment(input, dependencies): Promise<{ checkoutUrl: string; orderNumber: string; paymentReference: string }>`.
- Route accepts only customer data, product IDs, quantities, and selected options.

- [ ] **Step 1: Write failing service tests**

Use in-memory dependency fakes to prove the service loads products, calls `calculateOrder`, generates references beginning `GNG-FLW-`, persists the exact server total, sets `paymentPreference: 'flutterwave'`, and returns only safe fields. Add tests for missing email and provider initialization failure.

- [ ] **Step 2: Run tests and confirm failure**

Run: `pnpm exec tsx --test src/lib/checkout/initializePayment.test.ts`
Expected: FAIL because the service is absent.

- [ ] **Step 3: Implement the service and thin route**

Use `crypto.randomUUID()` in references. The redirect URL must be `${NEXT_PUBLIC_APP_URL}/api/payments/flutterwave/callback`. Create order items from calculated values. On provider initialization failure, set `paymentStatus: 'FAILED'` and a generic `paymentFailureReason`.

Change the legacy `/api/orders` POST route to return HTTP 410 with:

```json
{ "success": false, "error": "Use the secure checkout to place an order." }
```

This prevents unpaid browser-created orders after Flutterwave becomes mandatory.

- [ ] **Step 4: Run tests and route type-check**

Run: `pnpm exec tsx --test src/lib/checkout/initializePayment.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/checkout src/app/api/payments src/app/api/orders/route.ts
git commit -m "feat: initialize secure Flutterwave orders"
```

---

### Task 5: Idempotent Payment Finalization, Callback, and Webhook

**Files:**
- Create: `src/lib/flutterwave/finalizePayment.ts`
- Create: `src/lib/flutterwave/finalizePayment.test.ts`
- Create: `src/lib/flutterwave/webhook.ts`
- Create: `src/lib/flutterwave/webhook.test.ts`
- Create: `src/app/api/payments/flutterwave/callback/route.ts`
- Create: `src/app/api/webhooks/flutterwave/route.ts`

**Interfaces:**
- Produces: `finalizePayment({ transactionId, txRef }, dependencies): Promise<PaymentResult>`.
- `PaymentResult.status` is `'paid' | 'pending' | 'cancelled' | 'failed' | 'invalid'` and includes `orderNumber`.
- Produces: `isValidWebhookHash(received, expected): boolean` using `timingSafeEqual`.

- [ ] **Step 1: Write failing finalization tests**

Test successful atomic update to `paymentStatus: 'PAID'`, `orderStatus: 'PROCESSING'`, provider transaction ID, method, and `paidAt`. Test wrong reference/amount/currency, unknown order, conflicting transaction ID, and repeated calls returning the already-paid order without a second update.

- [ ] **Step 2: Write failing webhook authentication tests**

Assert equal hashes pass, missing/different/unequal-length hashes fail, and the function never throws for malformed input.

- [ ] **Step 3: Run tests and confirm failure**

Run: `pnpm exec tsx --test src/lib/flutterwave/finalizePayment.test.ts src/lib/flutterwave/webhook.test.ts`
Expected: FAIL because both modules are absent.

- [ ] **Step 4: Implement shared finalization and thin routes**

The callback reads `status`, `transaction_id`, and `tx_ref`, finalizes only when possible, then redirects to `/checkout/result/<orderNumber>`. The webhook checks `verif-hash`, ignores unrelated event types with HTTP 200, re-verifies charge events, and returns HTTP 200 for valid processed events.

- [ ] **Step 5: Run tests**

Run: `pnpm exec tsx --test src/lib/flutterwave/finalizePayment.test.ts src/lib/flutterwave/webhook.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/flutterwave src/app/api/payments/flutterwave/callback src/app/api/webhooks/flutterwave
git commit -m "feat: verify Flutterwave callbacks and webhooks"
```

---

### Task 6: Dedicated Checkout and Verified Result Pages

**Files:**
- Create: `src/app/checkout/page.tsx`
- Create: `src/app/checkout/CheckoutForm.tsx`
- Create: `src/app/checkout/result/[orderNumber]/page.tsx`
- Create: `src/app/checkout/checkout-content.test.ts`
- Modify: `src/types/ecommerce.ts`

**Interfaces:**
- Checkout form posts `{ customer, cart: [{ productId, quantity, selectedOptions }] }` to the initialization route and redirects to `checkoutUrl`.
- Result page reads order state directly from Prisma by `orderNumber`; query parameters do not determine success.

- [ ] **Step 1: Write failing checkout content tests**

Read the component sources and assert required email, phone, address, `Pay securely with Flutterwave`, order-summary rendering, and absence of cash/bank/WhatsApp payment selectors. Assert the result page contains paid, pending, cancelled/failed, retry, and WhatsApp support copy.

- [ ] **Step 2: Run the test and confirm expected failure**

Run: `pnpm exec tsx --test src/app/checkout/checkout-content.test.ts`
Expected: FAIL because pages are absent.

- [ ] **Step 3: Implement checkout UI**

Build an accessible two-column desktop layout and single-column mobile layout. Disable submission during initialization, show API errors inline, retain form/cart state on errors, and redirect with `window.location.assign(checkoutUrl)` only after a successful response.

- [ ] **Step 4: Implement result UI and cart clearing**

Render status from the database. A small client component clears local cart only when server-rendered status is `PAID`. Include order number, verified total, support link, continue-shopping action, and retry action for non-paid orders.

- [ ] **Step 5: Run tests and focused lint**

Run: `pnpm exec tsx --test src/app/checkout/checkout-content.test.ts`
Expected: PASS.

Run: `pnpm exec eslint src/app/checkout src/types/ecommerce.ts`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/checkout src/types/ecommerce.ts
git commit -m "feat: add Flutterwave checkout experience"
```

---

### Task 7: Connect Cart and Admin Payment Visibility

**Files:**
- Modify: `src/components/CartDrawer.tsx`
- Modify: `src/context/StoreContext.tsx`
- Modify: `src/app/admin/page.tsx`
- Create: `src/components/cart-checkout.test.ts`

**Interfaces:**
- Cart drawer navigates to `/checkout` and no longer creates an order or opens WhatsApp.
- Store context no longer exposes `submitOrder`.
- Admin order rows show payment status, reference, provider transaction ID, and paid date when present.

- [ ] **Step 1: Write the failing cart contract test**

Assert `CartDrawer.tsx` links to `/checkout`, includes `Secure Flutterwave Checkout`, and excludes `Send Order to WhatsApp`, `cash_on_delivery`, `bank_transfer`, and `whatsapp_discuss`.

- [ ] **Step 2: Run test and confirm the old behavior fails it**

Run: `pnpm exec tsx --test src/components/cart-checkout.test.ts`
Expected: FAIL because the drawer still contains WhatsApp checkout and payment preferences.

- [ ] **Step 3: Simplify the cart and context**

Keep product review and quantity controls in the drawer. Replace the delivery step with a single `/checkout` action. Remove unused checkout submission, confetti, WhatsApp URL generation, payment selector, and `submitOrder` context interface/implementation.

- [ ] **Step 4: Add admin payment fields**

Extend the admin order response and display to include the new nullable payment fields without breaking legacy orders.

- [ ] **Step 5: Run tests and focused lint**

Run: `pnpm exec tsx --test src/components/cart-checkout.test.ts`
Expected: PASS.

Run: `pnpm exec eslint src/components/CartDrawer.tsx src/context/StoreContext.tsx src/app/admin/page.tsx`
Expected: no new errors; fix changed-file errors before committing.

- [ ] **Step 6: Commit**

```bash
git add src/components/CartDrawer.tsx src/context/StoreContext.tsx src/app/admin/page.tsx src/components/cart-checkout.test.ts
git commit -m "feat: make Flutterwave the storefront payment flow"
```

---

### Task 8: Production Configuration, Deployment, and End-to-End Verification

**Files:**
- Modify: local `.env` without committing
- Modify: Vercel Production and Preview environment variables
- Modify: Flutterwave dashboard webhook settings
- Modify: `README.md`

**Interfaces:**
- Production callback: `https://www.gnaathglobalcomm.ng/api/payments/flutterwave/callback`.
- Production webhook: `https://www.gnaathglobalcomm.ng/api/webhooks/flutterwave`.

- [ ] **Step 1: Add local secrets safely**

Write the supplied public, secret, and encryption keys to local `.env`. Generate at least 32 random bytes for `FLUTTERWAVE_WEBHOOK_SECRET`. Do not print values. Add `NEXT_PUBLIC_APP_URL="https://www.gnaathglobalcomm.ng"`.

- [ ] **Step 2: Apply the production migration**

Run: `pnpm exec prisma migrate deploy`
Expected: `add_flutterwave_payment_fields` applies successfully through `DIRECT_URL`.

- [ ] **Step 3: Run the complete verification suite**

Run:

```bash
pnpm exec tsx --test prisma/*.test.ts src/lib/**/*.test.ts src/app/checkout/*.test.ts src/components/*.test.ts src/data/*.test.ts
pnpm exec prisma validate
pnpm exec eslint prisma/payment-schema.test.ts src/lib/checkout src/lib/flutterwave src/app/api/payments src/app/api/webhooks src/app/checkout src/components/CartDrawer.tsx src/components/cart-checkout.test.ts src/context/StoreContext.tsx src/app/admin/page.tsx src/types/ecommerce.ts
pnpm build
```

Expected: tests pass, schema is valid, focused lint has no errors, and production build succeeds.

- [ ] **Step 4: Configure Vercel without exposing values**

Set all five environment variables for Production and Preview with Vercel CLI. Confirm variable names/scopes through `vercel env ls` without displaying values.

- [ ] **Step 5: Configure Flutterwave webhook**

In the Flutterwave dashboard, set the production webhook URL and secret hash. Enable charge/payment events. This external dashboard change is authorized by the user's request but must not reveal keys in screenshots or logs.

- [ ] **Step 6: Document operations**

Add a README section listing environment variable names, callback/webhook URLs, payment states, deployment commands, and the rule that provider verification is required before fulfillment. Use placeholders only.

- [ ] **Step 7: Commit, push, and deploy**

```bash
git add README.md
git commit -m "docs: add Flutterwave production operations"
git push origin main
npx --yes vercel@latest deploy --prod --yes
```

- [ ] **Step 8: Verify production behavior**

Confirm checkout loads, initialization returns a Flutterwave hosted URL, webhook rejects an invalid hash, products/categories still return HTTP 200, and Vercel logs contain no Prisma or payment initialization errors.

- [ ] **Step 9: Perform the live-payment handoff**

Prepare a controlled low-value order and stop before the final payment confirmation because it moves real money. Ask the user to complete that transaction. After payment, verify the callback result, paid order, admin display, webhook behavior, and cart clearing.
