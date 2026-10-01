'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  RefreshCw,
  Search,
  Truck,
  X,
  XCircle,
} from 'lucide-react';

export interface AdminOrderItem {
  id: string;
  productName: string;
  price: number;
  quantity: number;
  selectedOptions?: Record<string, string> | null;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  preferredBranch: string;
  deliveryNotes?: string | null;
  paymentStatus: string;
  paymentReference?: string | null;
  flutterwaveTransactionId?: string | null;
  paymentMethod?: string | null;
  paidAt?: string | null;
  paymentFailureReason?: string | null;
  orderStatus: string;
  totalAmount: number;
  createdAt: string;
  items: AdminOrderItem[];
}

const STATUS_FLOW = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const;

const STATUS_META: Record<string, { label: string; icon: React.ElementType; pill: string }> = {
  PENDING: { label: 'Pending', icon: Clock, pill: 'bg-amber-50 text-amber-800 ring-amber-200' },
  PROCESSING: { label: 'Processing', icon: RefreshCw, pill: 'bg-sky-50 text-sky-800 ring-sky-200' },
  SHIPPED: { label: 'Shipped', icon: Truck, pill: 'bg-indigo-50 text-indigo-800 ring-indigo-200' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle2, pill: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, pill: 'bg-rose-50 text-rose-700 ring-rose-200' },
};

const PAYMENT_META: Record<string, { label: string; icon: React.ElementType; pill: string }> = {
  PAID: { label: 'Paid', icon: CheckCircle2, pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  PENDING: { label: 'Awaiting payment', icon: Clock, pill: 'bg-amber-50 text-amber-800 ring-amber-200' },
  FAILED: { label: 'Failed', icon: XCircle, pill: 'bg-rose-50 text-rose-700 ring-rose-200' },
};

const BRANCH_LABEL: Record<string, string> = {
  lagos_head_office: 'Lagos head office',
  abia_branch_office: 'Abia ABSU branch',
};

const PAGE_SIZE = 25;

function Pill({ meta }: { meta: { label: string; icon: React.ElementType; pill: string } }) {
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${meta.pill}`}>
      <Icon className="h-3 w-3" /> {meta.label}
    </span>
  );
}

const formatDate = (iso: string, withTime = false) =>
  new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime && { hour: '2-digit', minute: '2-digit' }),
    timeZone: 'Africa/Lagos',
  });

const whatsappLink = (phone: string, text: string) => {
  const digits = phone.replace(/\D/g, '');
  const international = digits.startsWith('0') ? `234${digits.slice(1)}` : digits;
  return `https://wa.me/${international}?text=${encodeURIComponent(text)}`;
};

interface OrdersManagerProps {
  orders: AdminOrder[];
  isLoading: boolean;
  currencySymbol: string;
  onRefresh: () => void;
  onUpdateStatus: (orderId: string, status: string) => Promise<void>;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function OrdersManager({ orders, isLoading, currencySymbol, onRefresh, onUpdateStatus, notify }: OrdersManagerProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const money = (value: number) => `${currencySymbol}${Math.round(value).toLocaleString('en-NG')}`;

  const counts = useMemo(() => {
    const result: Record<string, number> = { ALL: orders.length };
    for (const order of orders) result[order.orderStatus] = (result[order.orderStatus] || 0) + 1;
    return result;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'ALL' && o.orderStatus !== statusFilter) return false;
      if (paymentFilter !== 'ALL' && o.paymentStatus !== paymentFilter) return false;
      if (!q) return true;
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
        (o.customerEmail || '').toLowerCase().includes(q) ||
        o.items.some((item) => item.productName.toLowerCase().includes(q))
      );
    });
  }, [orders, search, statusFilter, paymentFilter]);

  const openOrder = orders.find((o) => o.id === openOrderId) || null;

  return (
    <div className="space-y-4">
      {/* Status tabs */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {['ALL', ...STATUS_FLOW, 'CANCELLED'].map((status) => {
          const isActive = statusFilter === status;
          const meta = STATUS_META[status];
          const Icon = meta?.icon;
          return (
            <button
              key={status}
              type="button"
              onClick={() => {
                setStatusFilter(status);
                setVisibleCount(PAGE_SIZE);
              }}
              aria-pressed={isActive}
              className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-bold ring-1 transition ${
                isActive ? 'bg-ink-900 text-white ring-ink-900' : 'bg-white text-slate-700 ring-slate-200 hover:ring-slate-300'
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {status === 'ALL' ? 'All orders' : meta.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${isActive ? 'bg-white/15' : 'bg-slate-100 text-slate-600'}`}>
                {counts[status] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="Search order number, customer, phone or product…"
            aria-label="Search orders"
            className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            aria-label="Filter by payment"
            className="h-11 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-semibold text-slate-800 focus:outline-none sm:flex-none"
          >
            <option value="ALL">All payments</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Awaiting payment</option>
            <option value="FAILED">Failed</option>
          </select>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        {filtered.length === 0 ? (
          <p className="p-12 text-center text-sm text-slate-500">
            {orders.length === 0 ? (isLoading ? 'Loading orders…' : 'No orders yet.') : 'No orders match these filters.'}
          </p>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden w-full text-left text-xs md:table">
              <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Items</th>
                  <th className="hidden px-3 py-3 xl:table-cell">Branch</th>
                  <th className="px-3 py-3">Payment</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right">Total</th>
                  <th className="w-10 px-3 py-3" aria-label="Open" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.slice(0, visibleCount).map((order) => {
                  const itemCount = order.items.reduce((n, item) => n + item.quantity, 0);
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setOpenOrderId(order.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setOpenOrderId(order.id);
                        }
                      }}
                      tabIndex={0}
                      aria-label={`Open order ${order.orderNumber}`}
                      className="cursor-pointer transition hover:bg-slate-50 focus-visible:bg-emerald-50/60 focus-visible:outline-none"
                    >
                      <td className="px-5 py-3.5">
                        <p className="whitespace-nowrap font-mono text-[11px] font-bold text-ink-900">{order.orderNumber}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{formatDate(order.createdAt)}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="max-w-44 truncate font-semibold text-slate-800">{order.customerName}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{order.customerPhone}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="max-w-56 truncate text-slate-700">{order.items[0]?.productName || '—'}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {itemCount} item{itemCount === 1 ? '' : 's'}
                          {order.items.length > 1 ? ` · +${order.items.length - 1} more` : ''}
                        </p>
                      </td>
                      <td className="hidden px-3 py-3.5 text-slate-600 xl:table-cell">{BRANCH_LABEL[order.preferredBranch] || order.preferredBranch}</td>
                      <td className="px-3 py-3.5">
                        <Pill meta={PAYMENT_META[order.paymentStatus] || PAYMENT_META.PENDING} />
                      </td>
                      <td className="px-3 py-3.5">
                        <Pill meta={STATUS_META[order.orderStatus] || STATUS_META.PENDING} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-right text-sm font-bold tabular-nums text-ink-900">{money(order.totalAmount)}</td>
                      <td className="px-3 py-3.5 text-slate-300">
                        <ChevronRight className="h-4 w-4" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile list */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {filtered.slice(0, visibleCount).map((order) => (
                <li key={order.id}>
                  <button type="button" onClick={() => setOpenOrderId(order.id)} className="w-full px-4 py-3.5 text-left active:bg-slate-50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-ink-900">{order.customerName}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                          {order.orderNumber} · {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-bold tabular-nums text-ink-900">{money(order.totalAmount)}</p>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Pill meta={PAYMENT_META[order.paymentStatus] || PAYMENT_META.PENDING} />
                      <Pill meta={STATUS_META[order.orderStatus] || STATUS_META.PENDING} />
                      <span className="ml-auto text-[11px] text-slate-400">
                        {order.items.reduce((n, item) => n + item.quantity, 0)} item(s)
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
              <span>
                Showing {Math.min(visibleCount, filtered.length)} of {filtered.length}
              </span>
              {filtered.length > visibleCount && (
                <button type="button" onClick={() => setVisibleCount((n) => n + PAGE_SIZE)} className="font-bold text-emerald-700">
                  Show more
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {openOrder && (
        <OrderDetailDialog
          order={openOrder}
          money={money}
          onClose={() => setOpenOrderId(null)}
          onUpdateStatus={onUpdateStatus}
          notify={notify}
        />
      )}
    </div>
  );
}

function OrderDetailDialog({
  order,
  money,
  onClose,
  onUpdateStatus,
  notify,
}: {
  order: AdminOrder;
  money: (value: number) => string;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: string) => Promise<void>;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
}) {
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const isPaid = order.paymentStatus === 'PAID';
  const flowIndex = STATUS_FLOW.indexOf(order.orderStatus as (typeof STATUS_FLOW)[number]);
  const isCancelled = order.orderStatus === 'CANCELLED';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const changeStatus = async (status: string) => {
    if (status === order.orderStatus) return;
    if (!isPaid && (status === 'SHIPPED' || status === 'DELIVERED')) {
      if (!confirm(`This order has not been paid yet. Mark it as ${STATUS_META[status].label.toLowerCase()} anyway?`)) return;
    }
    if (status === 'CANCELLED' && !confirm(`Cancel order ${order.orderNumber}?`)) return;
    setIsSaving(status);
    await onUpdateStatus(order.id, status);
    setIsSaving(null);
  };

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify(`${label} copied`, 'success');
    } catch {
      notify('Could not copy', 'error');
    }
  };

  const itemCount = order.items.reduce((n, item) => n + item.quantity, 0);
  const nextStatus = !isCancelled && flowIndex >= 0 && flowIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[flowIndex + 1] : null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink-950/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-dialog-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 id="order-dialog-title" className="font-mono text-base font-extrabold text-ink-900">
                {order.orderNumber}
              </h3>
              <button type="button" onClick={() => copy(order.orderNumber, 'Order number')} aria-label="Copy order number" className="rounded p-1 text-slate-400 hover:text-slate-700">
                <Copy className="h-3.5 w-3.5" />
              </button>
              <Pill meta={PAYMENT_META[order.paymentStatus] || PAYMENT_META.PENDING} />
              <Pill meta={STATUS_META[order.orderStatus] || STATUS_META.PENDING} />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Placed {formatDate(order.createdAt, true)} · {itemCount} item{itemCount === 1 ? '' : 's'} · {money(order.totalAmount)}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          {/* Fulfilment progress */}
          <section>
            <h4 className="mb-3 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">Fulfilment</h4>
            <ol className="grid grid-cols-4 gap-2">
              {STATUS_FLOW.map((status, index) => {
                const meta = STATUS_META[status];
                const Icon = meta.icon;
                const reached = !isCancelled && flowIndex >= index;
                const isCurrent = order.orderStatus === status;
                return (
                  <li key={status}>
                    <button
                      type="button"
                      onClick={() => changeStatus(status)}
                      disabled={Boolean(isSaving)}
                      aria-current={isCurrent ? 'step' : undefined}
                      className={`flex w-full flex-col items-center gap-1.5 rounded-2xl px-1 py-3 text-center ring-1 transition disabled:opacity-60 ${
                        isCurrent
                          ? 'bg-ink-900 text-white ring-ink-900'
                          : reached
                            ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                            : 'bg-white text-slate-500 ring-slate-200 hover:ring-slate-400'
                      }`}
                    >
                      {isSaving === status ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                      <span className="text-[11px] font-bold">{meta.label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {nextStatus && (
                <button
                  type="button"
                  onClick={() => changeStatus(nextStatus)}
                  disabled={Boolean(isSaving)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-extrabold text-white hover:bg-emerald-500 disabled:opacity-60"
                >
                  Mark as {STATUS_META[nextStatus].label.toLowerCase()}
                </button>
              )}
              {isCancelled ? (
                <button
                  type="button"
                  onClick={() => changeStatus('PENDING')}
                  disabled={Boolean(isSaving)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Re-open order
                </button>
              ) : (
                order.orderStatus !== 'DELIVERED' && (
                  <button
                    type="button"
                    onClick={() => changeStatus('CANCELLED')}
                    disabled={Boolean(isSaving)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-bold text-rose-600 hover:bg-rose-50"
                  >
                    Cancel order
                  </button>
                )
              )}
              {!isPaid && !isCancelled && (
                <span className="text-[11px] font-semibold text-amber-700">Not paid yet: confirm payment before shipping.</span>
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Customer */}
            <section className="rounded-2xl border border-slate-200 p-4">
              <h4 className="mb-3 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">Customer</h4>
              <p className="text-sm font-bold text-ink-900">{order.customerName}</p>
              <p className="mt-1 text-xs text-slate-600">{order.customerPhone}</p>
              {order.customerEmail && <p className="mt-0.5 break-all text-xs text-slate-600">{order.customerEmail}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={whatsappLink(order.customerPhone, `Hello ${order.customerName.split(' ')[0]}, this is G Naath about your order ${order.orderNumber}.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
                <a href={`tel:${order.customerPhone}`} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
                  <Phone className="h-4 w-4" /> Call
                </a>
                {order.customerEmail && (
                  <a
                    href={`mailto:${order.customerEmail}?subject=${encodeURIComponent(`Your G Naath order ${order.orderNumber}`)}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Mail className="h-4 w-4" /> Email
                  </a>
                )}
              </div>
            </section>

            {/* Delivery */}
            <section className="rounded-2xl border border-slate-200 p-4">
              <h4 className="mb-3 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">Delivery</h4>
              <p className="flex items-start gap-2 text-sm text-slate-700">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  {order.customerAddress || 'Store pickup'}
                  {order.customerCity ? `, ${order.customerCity}` : ''}
                </span>
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Fulfilled by <span className="font-bold text-slate-700">{BRANCH_LABEL[order.preferredBranch] || order.preferredBranch}</span>
              </p>
              {order.deliveryNotes && (
                <p className="mt-2 rounded-xl bg-slate-50 p-2.5 text-xs italic text-slate-600">“{order.deliveryNotes}”</p>
              )}
            </section>
          </div>

          {/* Items */}
          <section className="rounded-2xl border border-slate-200">
            <h4 className="border-b border-slate-100 px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">Items</h4>
            <ul className="divide-y divide-slate-100">
              {order.items.map((item) => {
                const options = item.selectedOptions ? Object.entries(item.selectedOptions) : [];
                return (
                  <li key={item.id} className="flex items-start gap-3 px-4 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <Package className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink-900">{item.productName}</p>
                      {options.length > 0 && (
                        <p className="mt-0.5 text-[11px] text-slate-500">{options.map(([k, v]) => `${k}: ${v}`).join(' · ')}</p>
                      )}
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {money(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold tabular-nums text-ink-900">{money(item.price * item.quantity)}</p>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-xs font-bold text-slate-600">Total</span>
              <span className="text-base font-extrabold tabular-nums text-ink-900">{money(order.totalAmount)}</span>
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-slate-200 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
              <CreditCard className="h-3.5 w-3.5" /> Payment
            </h4>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-xs sm:grid-cols-2">
              {[
                ['Status', (PAYMENT_META[order.paymentStatus] || PAYMENT_META.PENDING).label],
                ['Method', order.paymentMethod || 'Flutterwave'],
                ['Paid at', order.paidAt ? formatDate(order.paidAt, true) : 'Not paid yet'],
                ['Reference', order.paymentReference || '—'],
                ['Flutterwave ID', order.flutterwaveTransactionId || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 border-b border-dashed border-slate-100 pb-2">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="min-w-0 truncate text-right font-semibold text-slate-800" title={value}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            {order.paymentFailureReason && (
              <p className="mt-3 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700">Failure reason: {order.paymentFailureReason}</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
