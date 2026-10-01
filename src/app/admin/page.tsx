'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { ProductManager } from '@/components/admin/ProductManager';
import { ProductFormModal } from '@/components/admin/ProductFormModal';
import { CategoryEditorDialog, CategoryManager } from '@/components/admin/CategoryManager';
import { ChangePasswordCard } from '@/components/admin/ChangePasswordCard';
import { StoreSettingsForm } from '@/components/admin/StoreSettingsForm';
import { MediaCleanupCard } from '@/components/admin/MediaCleanupCard';
import { OverviewDashboard, type OverviewMetrics } from '@/components/admin/OverviewDashboard';
import type { AdminCategory, Product } from '@/types/ecommerce';
import {
  ShoppingBag,
  Layers,
  Users,
  Wrench,
  Sun,
  Settings,
  LogOut,
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Menu,
  X,
  MessageSquare,
  ShieldCheck,
  Lock,
  Mail,
  Store,
  Tags,
  LayoutDashboard,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type AdminTab = 'overview' | 'products' | 'categories' | 'orders' | 'customers' | 'services' | 'settings';

const NAV_GROUPS: { label: string; items: { tab: AdminTab; label: string; icon: React.ElementType }[] }[] = [
  { label: 'Overview', items: [{ tab: 'overview', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    label: 'Catalogue',
    items: [
      { tab: 'products', label: 'Products & inventory', icon: ShoppingBag },
      { tab: 'categories', label: 'Categories', icon: Tags },
    ],
  },
  {
    label: 'Sales',
    items: [
      { tab: 'orders', label: 'Orders', icon: Layers },
      { tab: 'customers', label: 'Customers', icon: Users },
    ],
  },
  { label: 'Services', items: [{ tab: 'services', label: 'Repairs & solar', icon: Wrench }] },
  { label: 'Store', items: [{ tab: 'settings', label: 'Settings', icon: Settings }] },
];

const TAB_META: Record<AdminTab, { title: string; group: string }> = {
  overview: { title: 'Dashboard', group: 'Overview' },
  products: { title: 'Products & inventory', group: 'Catalogue' },
  categories: { title: 'Categories', group: 'Catalogue' },
  orders: { title: 'Orders', group: 'Sales' },
  customers: { title: 'Customers', group: 'Sales' },
  services: { title: 'Repair & solar requests', group: 'Services' },
  settings: { title: 'Store settings', group: 'Store' },
};

export default function AdminPage() {
  const { products, refreshProducts, storeConfig, updateConfig, showToast } = useStore();

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Admin View
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Reports & Analytics State
  const [reports, setReports] = useState<OverviewMetrics | null>(null);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  // Products & Categories State
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isUploadSuccessOpen, setIsUploadSuccessOpen] = useState(false);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [adminEmail, setAdminEmail] = useState('');

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Customers State
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  // Services State
  const [repairs, setRepairs] = useState<any[]>([]);
  const [solarQuotes, setSolarQuotes] = useState<any[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);


  // Check Admin Session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setAdminEmail(data.admin?.email || '');
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);


  // Fetch Tab Specific Data
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchCategories();

    if (activeTab === 'overview') {
      fetchReports();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'customers') {
      fetchCustomers();
    } else if (activeTab === 'services') {
      fetchServices();
    }
  }, [activeTab, isAuthenticated]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchReports = async () => {
    setIsLoadingReports(true);
    try {
      const res = await fetch('/api/admin/reports');
      const data = await res.json();
      if (data.success) {
        setReports(data.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error('Failed to fetch customer directory:', err);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const fetchServices = async () => {
    setIsLoadingServices(true);
    try {
      const res = await fetch('/api/admin/services');
      const data = await res.json();
      if (data.success) {
        setRepairs(data.repairs || []);
        setSolarQuotes(data.solarQuotes || []);
      }
    } catch (err) {
      console.error('Failed to fetch service requests:', err);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setIsAuthenticated(true);
        setAdminEmail(data.admin?.email || '');
        setLoginPassword('');
        showToast('Welcome back, Admin!');
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
    showToast('Logged out of Admin Dashboard');
  };

  const refreshInventory = async () => {
    await Promise.all([refreshProducts(), fetchCategories()]);
    if (activeTab === 'overview') fetchReports();
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setIsProductFormOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };

  const handleProductSaved = async (mode: 'created' | 'updated') => {
    setIsProductFormOpen(false);
    setEditingProduct(null);
    await refreshInventory();
    if (mode === 'created') setIsUploadSuccessOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Order status updated');
        fetchOrders();
        if (activeTab === 'overview') fetchReports();
      }
    } catch (err) {
      showToast('Failed to update order', 'error');
    }
  };


  // Loading State
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center text-slate-800">
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span className="text-sm font-semibold">Loading Admin Dashboard...</span>
        </div>
      </div>
    );
  }

  // LOGIN SCREEN (White Theme)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] text-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">G Naath Admin Portal</h1>
            <p className="text-xs text-slate-500">Sign in to manage inventory, Cloudinary uploads &amp; orders</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  autoComplete="username"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md flex items-center justify-center gap-2 text-sm"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In to Admin Portal</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center border-t border-slate-100 pt-4 text-[11px] text-slate-400 font-medium">
            G Naath Global Communications Ltd • Ultimate Satisfaction Assured!
          </div>
        </div>
      </div>
    );
  }

  // WHITE THEME EXECUTIVE DASHBOARD WITH SIDEBAR
  const filteredCustomersList = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch) ||
      c.city.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f4f6f9] font-sans text-slate-900">
      {/* 1. SIDEBAR (fixed on desktop, drawer on mobile) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-68 flex-col bg-ink-950 text-slate-300 transition-transform duration-300 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        aria-label="Admin navigation"
      >
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <Link href="/admin" className="flex items-center gap-3" onClick={() => setActiveTab('overview')}>
            <Image src="/gnaathlogo-transparent-dark.png" alt="G Naath" width={58} height={40} className="h-10 w-auto" />
            <span>
              <span className="block text-sm font-extrabold tracking-tight text-white">G Naath Global</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-brand-green">Admin</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{group.label}</p>
              <div className="space-y-1">
                {group.items.map(({ tab, label, icon: Icon }) => {
                  const isActive = activeTab === tab;
                  const badge =
                    tab === 'orders'
                      ? reports?.sales?.awaitingPaymentOrders
                      : tab === 'products'
                        ? reports?.inventory?.outOfStock
                        : tab === 'services'
                          ? reports?.services?.pending
                          : 0;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab);
                        setIsMobileSidebarOpen(false);
                      }}
                      aria-current={isActive ? 'page' : undefined}
                      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition ${
                        isActive ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                          isActive ? 'bg-emerald-500 text-ink-950' : 'bg-white/5 text-slate-400 group-hover:text-white'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1 text-left">{label}</span>
                      {badge ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            tab === 'products' ? 'bg-rose-500/20 text-rose-200' : 'bg-amber-400/20 text-amber-200'
                          }`}
                          title={tab === 'products' ? 'Out of stock' : tab === 'orders' ? 'Awaiting payment' : 'New requests'}
                        >
                          {badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-3 border-t border-white/10 p-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <span className="flex items-center gap-2">
              <Store className="h-4 w-4 text-brand-green" /> View store
            </span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <div className="flex items-center gap-3 px-1">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-cyan-400 to-emerald-500 text-xs font-black text-ink-950">
              {(adminEmail || 'A').charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-white">{adminEmail || 'Administrator'}</span>
              <span className="block text-[10px] text-slate-500">Administrator</span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign out"
              title="Sign out"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-300"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {isMobileSidebarOpen && (
        <div onClick={() => setIsMobileSidebarOpen(false)} className="fixed inset-0 z-40 bg-ink-950/50 backdrop-blur-sm lg:hidden" />
      )}

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-68">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/85 px-4 py-3.5 backdrop-blur-xl sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open menu"
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="hidden text-[11px] font-semibold text-slate-400 sm:block">
                Admin <span className="mx-1">/</span> {TAB_META[activeTab].group}
              </p>
              <h1 className="truncate text-base font-extrabold tracking-tight text-ink-900 sm:text-lg">{TAB_META[activeTab].title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab !== 'products' && activeTab !== 'overview' && (
              <button
                type="button"
                onClick={openNewProduct}
                className="hidden h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-500 sm:inline-flex"
              >
                <Plus className="h-4 w-4" /> New product
              </button>
            )}
            <Link
              href="/"
              target="_blank"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <Store className="h-4 w-4 text-emerald-600" />
              <span className="hidden md:inline">View store</span>
            </Link>
          </div>
        </header>

        {/* Dashboard Main View Container */}
        <main className="mx-auto w-full max-w-[1400px] flex-1 space-y-6 p-4 sm:p-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <OverviewDashboard
              metrics={reports}
              isLoading={isLoadingReports}
              currencySymbol={storeConfig.currencySymbol}
              onNavigate={(tab) => setActiveTab(tab)}
              onAddProduct={openNewProduct}
              onRefresh={fetchReports}
            />
          )}

          {/* TAB 2: PRODUCTS & INVENTORY MANAGER */}
          {activeTab === 'products' && (
            <ProductManager
              products={products}
              categories={categories}
              currencySymbol={storeConfig.currencySymbol}
              onCreate={openNewProduct}
              onEdit={openEditProduct}
              onChanged={refreshInventory}
              notify={showToast}
            />
          )}

          {/* TAB 2b: CATEGORIES */}
          {activeTab === 'categories' && (
            <CategoryManager categories={categories} onChanged={refreshInventory} notify={showToast} />
          )}

          {/* TAB 3: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
                  <Layers className="w-4.5 h-4.5 text-emerald-600" />
                  <span>Customer Orders Directory ({orders.length})</span>
                </h3>

                <button
                  onClick={fetchOrders}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                  <span>Refresh Orders</span>
                </button>
              </div>

              <div className="space-y-4">
                {orders.length > 0 ? (
                  orders.map((o) => (
                    <div key={o.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold">
                              {o.orderNumber}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(o.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="text-sm font-extrabold text-slate-950 mt-2">{o.customerName} ({o.customerPhone})</h4>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Fulfillment Branch: <span className="font-bold text-slate-900">{o.preferredBranch === 'abia_branch_office' ? 'Abia State ABSU Branch' : 'Lagos Head Office'}</span> • Delivery Address: {o.customerAddress || 'Store Pickup'}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold">
                            <span className={`rounded-full px-2.5 py-1 ${o.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              Payment: {o.paymentStatus}
                            </span>
                            {o.paymentReference && <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-slate-600">{o.paymentReference}</span>}
                            {o.flutterwaveTransactionId && <span className="rounded-full bg-sky-50 px-2.5 py-1 font-mono text-sky-700">FLW #{o.flutterwaveTransactionId}</span>}
                            {o.paidAt && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">Paid {new Date(o.paidAt).toLocaleString()}</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-xs text-slate-400 font-medium">Order Total</span>
                            <p className="text-lg font-black text-slate-950">
                              {storeConfig.currencySymbol}{o.totalAmount.toLocaleString()}
                            </p>
                          </div>

                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Order Items</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {o.items?.map((item: any) => (
                            <div key={item.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                              <span className="min-w-0">
                                <span className="font-bold text-slate-900">{item.productName} (x{item.quantity})</span>
                                {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                  <span className="mt-0.5 block text-[11px] text-slate-500">
                                    {Object.entries(item.selectedOptions as Record<string, string>)
                                      .map(([key, value]) => `${key}: ${value}`)
                                      .join(' · ')}
                                  </span>
                                )}
                              </span>
                              <span className="text-emerald-700 font-black">{storeConfig.currencySymbol}{item.price.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 font-medium">
                    No customer checkout orders recorded yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMERS DIRECTORY */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
                  <Users className="w-4.5 h-4.5 text-emerald-600" />
                  <span>Customer Contact Database ({customers.length})</span>
                </h3>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search by customer name, phone..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-950 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="p-4">Customer Name</th>
                        <th className="p-4">Phone Number</th>
                        <th className="p-4">Location / City</th>
                        <th className="p-4">Total Orders</th>
                        <th className="p-4">Lifetime Spend</th>
                        <th className="p-4 text-right">Quick Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCustomersList.length > 0 ? (
                        filteredCustomersList.map((c, i) => (
                          <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 font-extrabold text-slate-950 text-sm">{c.name}</td>
                            <td className="p-4 font-mono text-slate-800">{c.phone}</td>
                            <td className="p-4 font-medium text-slate-600">{c.city}</td>
                            <td className="p-4 font-bold text-slate-900">{c.totalOrders} orders</td>
                            <td className="p-4 font-black text-emerald-700 text-sm">
                              {storeConfig.currencySymbol}
                              {c.totalSpent.toLocaleString()}
                            </td>
                            <td className="p-4 text-right">
                              {c.phone && (
                                <a
                                  href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors shadow-xs"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-slate-500 font-medium">
                            No customers found in directory.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SERVICE REQUESTS */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Repairs */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Wrench className="w-4.5 h-4.5 text-emerald-600" />
                  <span>Phone &amp; Gadget Repair Bookings</span>
                </h3>

                <div className="space-y-3">
                  {repairs.length > 0 ? (
                    repairs.map((r) => (
                      <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-950 text-sm">{r.deviceName}</span>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">{r.issueType}</span>
                        </div>
                        <p className="text-slate-600 font-medium">Customer: {r.customerName} ({r.customerPhone})</p>
                        {r.additionalNotes && <p className="text-slate-500 italic">&quot;{r.additionalNotes}&quot;</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-8 font-medium">No repair bookings submitted yet.</p>
                  )}
                </div>
              </div>

              {/* Solar Quotes */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sun className="w-4.5 h-4.5 text-amber-500" />
                  <span>Solar System Quote Requests</span>
                </h3>

                <div className="space-y-3">
                  {solarQuotes.length > 0 ? (
                    solarQuotes.map((s) => (
                      <div key={s.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-950 text-sm">System: {s.systemSize}</span>
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">{s.serviceType}</span>
                        </div>
                        <p className="text-slate-600 font-medium">Location: {s.location} • Phone: {s.customerPhone}</p>
                        {s.applianceDetails && <p className="text-slate-500 italic">Appliance Load: {s.applianceDetails}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-8 font-medium">No solar quote requests submitted yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: STORE CONFIGURATION SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
            <StoreSettingsForm key={JSON.stringify(storeConfig)} config={storeConfig} onSave={updateConfig} />
            <MediaCleanupCard notify={showToast} />
            <ChangePasswordCard notify={showToast} />
            </div>
          )}
        </main>
      </div>

      {/* 3. PRODUCT CREATE / EDIT MODAL */}
      {isProductFormOpen && (
        <ProductFormModal
          key={editingProduct?.id || 'new'}
          product={editingProduct}
          categories={categories}
          brandSuggestions={Array.from(new Set([...storeConfig.brands, ...products.map((p) => p.brand || '')].filter(Boolean))).sort()}
          currencySymbol={storeConfig.currencySymbol}
          onClose={() => {
            setIsProductFormOpen(false);
            setEditingProduct(null);
          }}
          onSaved={handleProductSaved}
          onRequestNewCategory={() => setIsCategoryModalOpen(true)}
          notify={showToast}
        />
      )}

      {isCategoryModalOpen && (
        <CategoryEditorDialog
          category={null}
          onClose={() => setIsCategoryModalOpen(false)}
          onSaved={async () => {
            setIsCategoryModalOpen(false);
            await fetchCategories();
          }}
          notify={showToast}
        />
      )}

      {isUploadSuccessOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-7 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-950">Product uploaded successfully</h3>
              <p className="mt-2 text-sm text-slate-500">Your product is now saved and visible in the customer shop.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => { setIsUploadSuccessOpen(false); openNewProduct(); }}
                className="w-full py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-extrabold text-sm"
              >
                Upload New Product
              </button>
              <button
                type="button"
                onClick={() => { setIsUploadSuccessOpen(false); setActiveTab('products'); }}
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-sm"
              >
                Go to Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
