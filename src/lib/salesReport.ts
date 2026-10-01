/**
 * Sales figures for the admin overview. Revenue only counts PAID orders; unpaid checkouts
 * are reported separately as "awaiting payment" so the headline number is money received.
 * Days are bucketed in Lagos time (Africa/Lagos).
 */

export interface ReportOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  preferredBranch: string;
  createdAt: Date | string;
  paidAt?: Date | string | null;
  items: { productId: string | null; productName: string; price: number; quantity: number }[];
}

export const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Africa/Lagos',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** YYYY-MM-DD in Lagos time. */
export function lagosDayKey(date: Date | string) {
  return dayKeyFormatter.format(new Date(date));
}

const isPaid = (order: ReportOrder) => order.paymentStatus === 'PAID';
const paidDate = (order: ReportOrder) => new Date(order.paidAt || order.createdAt);

export function buildSalesReport(orders: ReportOrder[], now = new Date(), days = 30) {
  const paid = orders.filter(isPaid);
  const live = orders.filter((o) => o.orderStatus !== 'CANCELLED');
  const awaiting = live.filter((o) => !isPaid(o) && o.paymentStatus !== 'FAILED');

  const sum = (list: ReportOrder[]) => list.reduce((total, o) => total + (o.totalAmount || 0), 0);

  // Daily paid revenue for the last `days` days, oldest first, including empty days.
  const daily: { date: string; revenue: number; orders: number }[] = [];
  const index = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const key = lagosDayKey(new Date(now.getTime() - i * 86_400_000));
    if (!index.has(key)) {
      index.set(key, daily.length);
      daily.push({ date: key, revenue: 0, orders: 0 });
    }
  }
  for (const order of paid) {
    const slot = index.get(lagosDayKey(paidDate(order)));
    if (slot !== undefined) {
      daily[slot].revenue += order.totalAmount || 0;
      daily[slot].orders += 1;
    }
  }

  const windowRevenue = daily.reduce((total, d) => total + d.revenue, 0);
  const previousStart = new Date(now.getTime() - 2 * days * 86_400_000);
  const windowStart = new Date(now.getTime() - days * 86_400_000);
  const previousRevenue = sum(paid.filter((o) => paidDate(o) >= previousStart && paidDate(o) < windowStart));

  const byStatus = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0])) as Record<string, number>;
  for (const order of orders) byStatus[order.orderStatus] = (byStatus[order.orderStatus] || 0) + 1;

  const topProducts = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const order of paid) {
    for (const item of order.items) {
      const key = item.productId || item.productName;
      const entry = topProducts.get(key) || { name: item.productName, quantity: 0, revenue: 0 };
      entry.quantity += item.quantity;
      entry.revenue += item.price * item.quantity;
      topProducts.set(key, entry);
    }
  }

  const branch = (id: string) => {
    const branchPaid = paid.filter((o) => o.preferredBranch === id);
    return {
      paidRevenue: sum(branchPaid),
      paidOrders: branchPaid.length,
      totalOrders: orders.filter((o) => o.preferredBranch === id).length,
    };
  };

  return {
    paidRevenue: sum(paid),
    paidOrders: paid.length,
    averageOrderValue: paid.length ? sum(paid) / paid.length : 0,
    awaitingPaymentRevenue: sum(awaiting),
    awaitingPaymentOrders: awaiting.length,
    totalOrders: orders.length,
    windowDays: days,
    windowRevenue,
    previousWindowRevenue: previousRevenue,
    dailyRevenue: daily,
    ordersByStatus: byStatus,
    topProducts: Array.from(topProducts.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
    recentOrders: [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)
      .map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        totalAmount: o.totalAmount,
        paymentStatus: o.paymentStatus,
        orderStatus: o.orderStatus,
        createdAt: new Date(o.createdAt).toISOString(),
        itemCount: o.items.reduce((n, item) => n + item.quantity, 0),
      })),
    branches: {
      lagos: branch('lagos_head_office'),
      abia: branch('abia_branch_office'),
    },
  };
}

export type SalesReport = ReturnType<typeof buildSalesReport>;
