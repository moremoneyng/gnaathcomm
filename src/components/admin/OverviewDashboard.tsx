'use client';

import React, { useMemo, useState } from 'react';
import type { SalesReport } from '@/lib/salesReport';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  ImageOff,
  PackageCheck,
  PackageX,
  Plus,
  RefreshCw,
  Receipt,
  ShoppingBag,
  Timer,
  Trophy,
  Truck,
  Wrench,
  XCircle,
} from 'lucide-react';

export interface OverviewMetrics {
  sales: SalesReport;
  inventory: {
    total: number;
    available: number;
    preorder: number;
    outOfStock: number;
    featured: number;
    lowStock: number;
    thinListings: number;
  };
  services: { repairs: number; solar: number; pending: number };
  categoryBreakdown: { id: string; name: string; slug: string; productCount: number }[];
  generatedAt: string;
}

type Tab = 'products' | 'orders' | 'services' | 'categories';

interface OverviewDashboardProps {
  metrics: OverviewMetrics | null;
  isLoading: boolean;
  currencySymbol: string;
  adminName?: string;
  onNavigate: (tab: Tab) => void;
  onAddProduct: () => void;
  onRefresh: () => void;
}

const ORDER_STATUS_META: Record<string, { label: string; icon: React.ElementType; tone: string }> = {
  PENDING: { label: 'Pending', icon: Clock, tone: 'text-amber-600' },
  PROCESSING: { label: 'Processing', icon: RefreshCw, tone: 'text-sky-600' },
  SHIPPED: { label: 'Shipped', icon: Truck, tone: 'text-indigo-600' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle2, tone: 'text-emerald-600' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, tone: 'text-rose-600' },
};

const PAYMENT_META: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  PAID: { label: 'Paid', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  PENDING: { label: 'Awaiting payment', icon: Clock, className: 'bg-amber-50 text-amber-800 ring-amber-200' },
  FAILED: { label: 'Failed', icon: XCircle, className: 'bg-rose-50 text-rose-700 ring-rose-200' },
};

function money(value: number, symbol: string) {
  return `${symbol}${Math.round(value).toLocaleString('en-NG')}`;
}

function compactMoney(value: number, symbol: string) {
  if (Math.abs(value) < 10_000) return money(value, symbol);
  return `${symbol}${new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)}`;
}

function greeting(date = new Date()) {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Africa/Lagos' }).format(date));
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

const shortDate = (key: string) =>
  new Date(`${key}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

function Panel({ title, subtitle, action, children, className = '' }: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-extrabold text-ink-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function LinkButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800">
      {children} <ArrowRight className="h-3.5 w-3.5" />
    </button>
  );
}

/** Single-series column chart: paid revenue per day, with a hover/focus tooltip and a table fallback. */
function RevenueChart({ data, symbol }: { data: SalesReport['dailyRevenue']; symbol: string }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.revenue), 0);
  const niceMax = max === 0 ? 1 : Math.ceil(max / Math.pow(10, Math.floor(Math.log10(max)))) * Math.pow(10, Math.floor(Math.log10(max)));
  const ticks = [niceMax, niceMax / 2, 0];
  const point = active !== null ? data[active] : null;

  return (
    <div>
      <div className="relative flex h-52 gap-3">
        <div className="flex w-12 shrink-0 flex-col justify-between pb-6 text-right text-[10px] font-semibold text-slate-400" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">
              {max === 0 ? '' : compactMoney(t, symbol)}
            </span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          {/* Recessive hairline grid */}
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between" aria-hidden="true">
            {ticks.map((t) => (
              <div key={t} className="h-px bg-slate-100" />
            ))}
          </div>
          <div
            className="absolute inset-x-0 top-0 bottom-6 flex items-end gap-[2px]"
            role="img"
            aria-label={`Paid revenue per day for the last ${data.length} days`}
            onMouseLeave={() => setActive(null)}
          >
            {data.map((d, i) => (
              <button
                key={d.date}
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                aria-label={`${shortDate(d.date)}: ${money(d.revenue, symbol)} from ${d.orders} paid order${d.orders === 1 ? '' : 's'}`}
                className="group flex h-full min-w-0 flex-1 items-end justify-center focus-visible:outline-none"
              >
                <span
                  className={`block w-full max-w-6 rounded-t transition-colors ${
                    d.revenue > 0 ? (active === i ? 'bg-emerald-700' : 'bg-emerald-600') : 'bg-slate-100'
                  } group-focus-visible:ring-2 group-focus-visible:ring-emerald-300`}
                  style={{ height: d.revenue > 0 ? `${Math.max(3, (d.revenue / niceMax) * 100)}%` : '2px' }}
                />
              </button>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] font-semibold text-slate-400" aria-hidden="true">
            <span>{shortDate(data[0].date)}</span>
            <span className="hidden sm:inline">{shortDate(data[Math.floor(data.length / 2)].date)}</span>
            <span>Today</span>
          </div>
          {point && (
            <div
              className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-ink-900 px-3 py-2 text-xs text-white shadow-xl"
              style={{ left: `${((active! + 0.5) / data.length) * 100}%` }}
            >
              <p className="font-bold">{shortDate(point.date)}</p>
              <p className="mt-0.5 whitespace-nowrap text-slate-300">
                {money(point.revenue, symbol)} · {point.orders} order{point.orders === 1 ? '' : 's'}
              </p>
            </div>
          )}
        </div>
      </div>
      {max === 0 && (
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
          No paid orders in this period yet. Paid Flutterwave orders appear here automatically.
        </p>
      )}
      <details className="mt-3 text-xs text-slate-500">
        <summary className="cursor-pointer font-semibold hover:text-slate-700">View as table</summary>
        <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-100">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2">Day</th>
                <th className="px-3 py-2 text-right">Paid orders</th>
                <th className="px-3 py-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {[...data].reverse().map((d) => (
                <tr key={d.date}>
                  <td className="px-3 py-1.5">{shortDate(d.date)}</td>
                  <td className="px-3 py-1.5 text-right">{d.orders}</td>
                  <td className="px-3 py-1.5 text-right font-semibold text-slate-700">{money(d.revenue, symbol)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function BarRow({ label, value, max, icon: Icon, iconTone, suffix }: {
  label: string;
  value: number;
  max: number;
  icon?: React.ElementType;
  iconTone?: string;
  suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="flex min-w-0 items-center gap-2 font-semibold text-slate-700">
          {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${iconTone || 'text-slate-400'}`} aria-hidden="true" />}
          <span className="truncate">{label}</span>
        </span>
        <span className="shrink-0 font-bold tabular-nums text-ink-900">
          {value.toLocaleString()}
          {suffix && <span className="ml-1 font-medium text-slate-400">{suffix}</span>}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-600" style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }} />
      </div>
    </div>
  );
}

export function OverviewDashboard({ metrics, isLoading, currencySymbol: symbol, adminName, onNavigate, onAddProduct, onRefresh }: OverviewDashboardProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const today = useMemo(
    () => new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Lagos' }),
    []
  );

  if (!metrics) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton h-36 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="skeleton h-80 rounded-3xl xl:col-span-2" />
          <div className="skeleton h-80 rounded-3xl" />
        </div>
        {!isLoading && (
          <p className="text-center text-sm text-slate-500">
            Reports couldn&apos;t load.{' '}
            <button type="button" onClick={onRefresh} className="font-bold text-emerald-700">
              Try again
            </button>
          </p>
        )}
      </div>
    );
  }

  const { sales, inventory, services } = metrics;
  const change =
    sales.previousWindowRevenue > 0 ? ((sales.windowRevenue - sales.previousWindowRevenue) / sales.previousWindowRevenue) * 100 : null;
  const statusMax = Math.max(...Object.values(sales.ordersByStatus), 0);
  const categories = showAllCategories ? metrics.categoryBreakdown : metrics.categoryBreakdown.slice(0, 8);
  const categoryMax = metrics.categoryBreakdown[0]?.productCount || 0;
  const branchTotal = sales.branches.lagos.paidRevenue + sales.branches.abia.paidRevenue;

  const attention = [
    { count: inventory.outOfStock, label: 'Out of stock', text: 'Hidden from checkout', icon: PackageX, tone: 'text-rose-600 bg-rose-50' },
    { count: inventory.lowStock, label: 'Low stock', text: '3 units or fewer', icon: AlertTriangle, tone: 'text-orange-600 bg-orange-50' },
    { count: inventory.preorder, label: 'On pre-order', text: 'Customers paying ahead', icon: Timer, tone: 'text-amber-700 bg-amber-50' },
    { count: inventory.thinListings, label: 'Thin listings', text: 'No description or one photo', icon: ImageOff, tone: 'text-slate-600 bg-slate-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome + actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500">{today}</p>
          <h2 className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            {greeting()}{adminName ? `, ${adminName.split(' ')[0]}` : ''}
          </h2>
          <p className="mt-1 text-sm text-slate-500">Here&apos;s how G Naath is doing today.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onRefresh}
            aria-label="Refresh reports"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            onClick={onAddProduct}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink-900 px-4 text-xs font-extrabold text-white shadow-sm hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4" /> Add product
          </button>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="relative overflow-hidden rounded-3xl bg-ink-900 p-5 text-white shadow-lg sm:p-6">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/25 blur-2xl" aria-hidden="true" />
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <CreditCard className="h-4 w-4 text-brand-green" /> Revenue received
          </p>
          <p className="mt-3 font-heading text-3xl font-extrabold tracking-tight sm:text-[2rem]" title={money(sales.paidRevenue, symbol)}>
            {compactMoney(sales.paidRevenue, symbol)}
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-slate-300">
            {change !== null ? (
              <span className={`inline-flex items-center gap-0.5 font-bold ${change >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {change >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {Math.abs(change).toFixed(0)}%
              </span>
            ) : null}
            <span>
              {sales.paidOrders} paid order{sales.paidOrders === 1 ? '' : 's'}
              {change !== null ? ` · vs previous ${sales.windowDays} days` : ''}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('orders')}
          className="rounded-3xl border border-slate-200/80 bg-white p-5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-amber-300 sm:p-6"
        >
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Clock className="h-4 w-4 text-amber-600" /> Awaiting payment
          </p>
          <p className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-ink-900 sm:text-[2rem]" title={money(sales.awaitingPaymentRevenue, symbol)}>
            {compactMoney(sales.awaitingPaymentRevenue, symbol)}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {sales.awaitingPaymentOrders} checkout{sales.awaitingPaymentOrders === 1 ? '' : 's'} not yet paid · follow up
          </p>
        </button>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Receipt className="h-4 w-4 text-sky-600" /> Average order value
          </p>
          <p className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-ink-900 sm:text-[2rem]">
            {compactMoney(sales.averageOrderValue, symbol)}
          </p>
          <p className="mt-2 text-xs text-slate-500">{sales.totalOrders} orders placed in total</p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('products')}
          className="rounded-3xl border border-slate-200/80 bg-white p-5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-emerald-300 sm:p-6"
        >
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <ShoppingBag className="h-4 w-4 text-emerald-600" /> Products
          </p>
          <p className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-ink-900 sm:text-[2rem]">{inventory.total}</p>
          <p className="mt-2 text-xs text-slate-500">
            {inventory.available} available · {inventory.preorder} pre-order · {inventory.outOfStock} out
          </p>
        </button>
      </div>

      {/* Revenue + order status */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Revenue received"
          subtitle={`Paid orders per day · last ${sales.windowDays} days · ${money(sales.windowRevenue, symbol)}`}
        >
          <RevenueChart data={sales.dailyRevenue} symbol={symbol} />
        </Panel>

        <Panel title="Orders by status" subtitle={`${sales.totalOrders} orders`} action={<LinkButton onClick={() => onNavigate('orders')}>Manage</LinkButton>}>
          <div className="space-y-4">
            {Object.entries(ORDER_STATUS_META).map(([status, meta]) => (
              <BarRow
                key={status}
                label={meta.label}
                value={sales.ordersByStatus[status] || 0}
                max={statusMax}
                icon={meta.icon}
                iconTone={meta.tone}
              />
            ))}
          </div>
        </Panel>
      </div>

      {/* Recent orders + top products */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Recent orders" action={<LinkButton onClick={() => onNavigate('orders')}>All orders</LinkButton>}>
          {sales.recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No orders yet.</p>
          ) : (
            <>
            <ul className="-mx-1 divide-y divide-slate-100 sm:hidden">
              {sales.recentOrders.map((order) => {
                const payment = PAYMENT_META[order.paymentStatus] || PAYMENT_META.PENDING;
                const status = ORDER_STATUS_META[order.orderStatus] || ORDER_STATUS_META.PENDING;
                const PaymentIcon = payment.icon;
                const StatusIcon = status.icon;
                return (
                  <li key={order.id} className="px-1 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-ink-900">{order.customerName}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                          {order.orderNumber} · {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-bold tabular-nums text-ink-900">{compactMoney(order.totalAmount, symbol)}</p>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${payment.className}`}>
                        <PaymentIcon className="h-3 w-3" /> {payment.label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                        <StatusIcon className={`h-3.5 w-3.5 ${status.tone}`} /> {status.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="-mx-5 hidden overflow-x-auto sm:-mx-6 sm:block">
              <table className="w-full min-w-[560px] text-left text-xs">
                <thead className="border-y border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-2.5 sm:px-6">Order</th>
                    <th className="px-3 py-2.5">Customer</th>
                    <th className="px-3 py-2.5">Payment</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-5 py-2.5 text-right sm:px-6">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales.recentOrders.map((order) => {
                    const payment = PAYMENT_META[order.paymentStatus] || PAYMENT_META.PENDING;
                    const status = ORDER_STATUS_META[order.orderStatus] || ORDER_STATUS_META.PENDING;
                    const PaymentIcon = payment.icon;
                    const StatusIcon = status.icon;
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/60">
                        <td className="px-5 py-3 sm:px-6">
                          <p className="whitespace-nowrap font-mono text-[11px] font-bold text-ink-900">{order.orderNumber}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {order.itemCount} item
                            {order.itemCount === 1 ? '' : 's'}
                          </p>
                        </td>
                        <td className="max-w-40 truncate px-3 py-3 font-semibold text-slate-700">{order.customerName}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${payment.className}`}>
                            <PaymentIcon className="h-3 w-3" /> {payment.label}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                            <StatusIcon className={`h-3.5 w-3.5 ${status.tone}`} /> {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-bold tabular-nums text-ink-900 sm:px-6">{money(order.totalAmount, symbol)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </>
          )}
        </Panel>

        <Panel title="Best sellers" subtitle="By paid revenue">
          {sales.topProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">Best sellers appear after the first paid orders.</p>
          ) : (
            <ol className="space-y-3">
              {sales.topProducts.map((product, index) => (
                <li key={product.name} className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-black ${
                      index === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {index === 0 ? <Trophy className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold text-ink-900">{product.name}</span>
                    <span className="text-[11px] text-slate-500">{product.quantity} sold</span>
                  </span>
                  <span className="shrink-0 text-xs font-bold tabular-nums text-ink-900">{compactMoney(product.revenue, symbol)}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>

      {/* Branches, inventory health, categories */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Panel title="Branch performance" subtitle="Paid revenue by fulfilment branch">
          <div className="space-y-4">
            {[
              { name: 'Lagos head office', place: 'Ago Palace, Isolo', data: sales.branches.lagos },
              { name: 'Abia ABSU branch', place: 'Uturu, Abia State', data: sales.branches.abia },
            ].map(({ name, place, data }) => {
              const share = branchTotal > 0 ? (data.paidRevenue / branchTotal) * 100 : 0;
              return (
                <div key={name} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 ring-1 ring-slate-200">
                        <Building2 className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-bold text-ink-900">{name}</span>
                        <span className="block text-[11px] text-slate-500">{place}</span>
                      </span>
                    </div>
                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-extrabold tabular-nums text-ink-900">{compactMoney(data.paidRevenue, symbol)}</span>
                      <span className="text-[11px] text-slate-500">
                        {data.paidOrders} paid / {data.totalOrders}
                      </span>
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/70">
                      <div className="h-full rounded-full bg-emerald-600" style={{ width: `${share}%` }} />
                    </div>
                    <span className="w-9 text-right text-[11px] font-bold tabular-nums text-slate-600">{share.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Inventory health" subtitle="What needs your attention" action={<LinkButton onClick={() => onNavigate('products')}>Inventory</LinkButton>}>
          <div className="grid grid-cols-2 gap-3">
            {attention.map(({ count, label, text, icon: Icon, tone }) => (
              <button
                key={label}
                type="button"
                onClick={() => onNavigate('products')}
                className="rounded-2xl border border-slate-100 p-3.5 text-left transition hover:border-slate-300"
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="mt-2 block text-xl font-extrabold tabular-nums text-ink-900">{count}</span>
                <span className="block text-xs font-bold text-slate-700">{label}</span>
                <span className="block text-[11px] text-slate-400">{text}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onNavigate('services')}
            className="mt-3 flex w-full items-center justify-between rounded-2xl bg-slate-50 px-3.5 py-3 text-left text-xs transition hover:bg-slate-100"
          >
            <span className="flex items-center gap-2 font-bold text-slate-700">
              <Wrench className="h-4 w-4 text-slate-500" /> Service requests
            </span>
            <span className="text-slate-500">
              {services.repairs} repairs · {services.solar} solar
              {services.pending > 0 && <span className="ml-1.5 font-bold text-amber-700">· {services.pending} new</span>}
            </span>
          </button>
        </Panel>

        <Panel
          className="lg:col-span-2 xl:col-span-1"
          title="Products by category"
          subtitle={`${metrics.categoryBreakdown.length} categories`}
          action={<LinkButton onClick={() => onNavigate('categories')}>Edit</LinkButton>}
        >
          <div className="space-y-3.5">
            {categories.map((category) => (
              <BarRow key={category.id} label={category.name} value={category.productCount} max={categoryMax} icon={PackageCheck} />
            ))}
          </div>
          {metrics.categoryBreakdown.length > 8 && (
            <button
              type="button"
              onClick={() => setShowAllCategories((v) => !v)}
              className="mt-4 text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              {showAllCategories ? 'Show fewer' : `Show all ${metrics.categoryBreakdown.length}`}
            </button>
          )}
        </Panel>
      </div>

      <p className="text-center text-[11px] text-slate-400">
        Updated {new Date(metrics.generatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · Revenue counts paid
        orders only
      </p>
    </div>
  );
}
