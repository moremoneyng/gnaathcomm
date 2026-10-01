'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { ProductManager } from '@/components/admin/ProductManager';
import { ProductFormModal } from '@/components/admin/ProductFormModal';
import { CategoryEditorDialog, CategoryManager } from '@/components/admin/CategoryManager';
import { ChangePasswordCard } from '@/components/admin/ChangePasswordCard';
import { StoreSettingsForm } from '@/components/admin/StoreSettingsForm';
import { MediaCleanupCard } from '@/components/admin/MediaCleanupCard';
import type { AdminCategory, Product } from '@/types/ecommerce';
import {
  BarChart3,
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
  DollarSign,
  Menu,
  X,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Lock,
  Mail,
  Building2,
  Store,
  Tags,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { products, refreshProducts, storeConfig, updateConfig, showToast } = useStore();

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Admin View
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'orders' | 'customers' | 'services' | 'settings'>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Reports & Analytics State
  const [reports, setReports] = useState<any>(null);
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
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 flex font-sans">
      {/* 1. LEFT SIDEBAR NAVIGATION (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-6">
          {/* Logo & Store Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                G
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-950 tracking-tight">G Naath Global</h2>
                <p className="text-[10px] font-bold text-emerald-700 font-mono">ADMIN DASHBOARD</p>
              </div>
            </div>

            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => {
                setActiveTab('overview');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 ${
                activeTab === 'overview'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <BarChart3 className="w-4.5 h-4.5" />
              <span>Reports &amp; Overview</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('products');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 ${
                activeTab === 'products'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              <span>Products &amp; Inventory</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('categories');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 ${
                activeTab === 'categories'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <Tags className="w-4.5 h-4.5" />
              <span>Categories</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('orders');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 ${
                activeTab === 'orders'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <Layers className="w-4.5 h-4.5" />
              <span>Orders Management</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('customers');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 ${
                activeTab === 'customers'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <Users className="w-4.5 h-4.5" />
              <span>Customers Directory</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('services');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 ${
                activeTab === 'services'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <Wrench className="w-4.5 h-4.5" />
              <span>Service Requests</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('settings');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 ${
                activeTab === 'settings'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <Settings className="w-4.5 h-4.5" />
              <span>Store Configuration</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer & Logout */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-950 truncate">{adminEmail || 'Administrator'}</p>
              <p className="text-[10px] text-slate-500 font-medium">Administrator</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-600 text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Topbar Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-950 capitalize">
                {activeTab === 'overview'
                  ? 'Performance Reports & Overview'
                  : activeTab === 'products'
                  ? 'Products & Inventory Management'
                  : activeTab === 'categories'
                  ? 'Category Management'
                  : activeTab === 'orders'
                  ? 'Customer Orders Management'
                  : activeTab === 'customers'
                  ? 'Customer Contact Directory'
                  : activeTab === 'services'
                  ? 'Phone Repair & Solar Quote Requests'
                  : 'Store Configuration Settings'}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">Supabase PostgreSQL • Cloudinary Image Storage</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200"
            >
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">View Store Front</span>
            </Link>
          </div>
        </header>

        {/* Dashboard Main View Container */}
        <main className="p-4 sm:p-8 space-y-6 flex-1">
          {/* TAB 1: OVERVIEW & PERFORMANCE REPORTS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Total Revenue */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Orders Revenue</span>
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-950">
                    {storeConfig.currencySymbol}
                    {(reports?.totalRevenue || 0).toLocaleString()}
                  </div>
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Real-time PostgreSQL tracking</span>
                  </p>
                </div>

                {/* Total Orders */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Customer Orders</span>
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-950">
                    {reports?.totalOrders || 0}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {reports?.pendingOrdersCount || 0} Pending • {reports?.deliveredOrdersCount || 0} Delivered
                  </p>
                </div>

                {/* Products in Inventory */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Products in Catalog</span>
                    <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-950">
                    {reports?.totalProducts || products.length}
                  </div>
                  <p className="text-[11px] text-emerald-600 font-semibold">
                    {reports?.inStockCount || products.filter((p) => p.inStock).length} In Stock Ready
                    {reports?.lowStockCount ? (
                      <button type="button" onClick={() => setActiveTab('products')} className="ml-1 text-orange-600 hover:underline">
                        · {reports.lowStockCount} low stock
                      </button>
                    ) : null}
                  </p>
                </div>

                {/* Service Requests */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Service Inquiries</span>
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                      <Wrench className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-950">
                    {(reports?.repairCount || 0) + (reports?.solarCount || 0)}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {reports?.repairCount || 0} Phone Repairs • {reports?.solarCount || 0} Solar Quotes
                  </p>
                </div>
              </div>

              {/* Branch Fulfillment Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-950">Lagos Head Office Fulfillment</h3>
                      <p className="text-xs text-slate-500">Ago Palace Roundabout, Isolo, Lagos</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-500">Branch Revenue</span>
                      <p className="text-xl font-black text-slate-950">
                        {storeConfig.currencySymbol}
                        {(reports?.branchMetrics?.lagos?.revenue || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-500">Total Orders</span>
                      <p className="text-xl font-black text-emerald-600">
                        {reports?.branchMetrics?.lagos?.count || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-950">Abia ABSU Branch Fulfillment</h3>
                      <p className="text-xs text-slate-500">ABSU Uturu, Along Uturu-Afikpo Road</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-500">Branch Revenue</span>
                      <p className="text-xl font-black text-slate-950">
                        {storeConfig.currencySymbol}
                        {(reports?.branchMetrics?.abia?.revenue || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-500">Total Orders</span>
                      <p className="text-xl font-black text-cyan-600">
                        {reports?.branchMetrics?.abia?.count || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Breakdown list */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
                  <ShoppingBag className="w-4.5 h-4.5 text-emerald-600" />
                  <span>Category Inventory Distribution</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {reports?.categoryBreakdown?.map((cat: any) => (
                    <div key={cat.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                      <p className="text-xs font-extrabold text-slate-950 capitalize">{cat.name}</p>
                      <p className="text-lg font-black text-emerald-600">{cat.productCount} items</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
