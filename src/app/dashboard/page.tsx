'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  ShoppingBag,
  PackageCheck,
  Clock,
  ShieldCheck,
  LogOut,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Search,
  Box
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface OrderItem {
  id: string;
  productName: string;
  price: number;
  quantity: number;
  selectedOptions?: any;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  preferredBranch: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

export default function UserDashboardPage() {
  const router = useRouter();
  const { user, userLoading, logoutUser, showToast } = useStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'support'>('orders');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    async function fetchUserOrders() {
      try {
        setLoadingOrders(true);
        const res = await fetch('/api/user/orders');
        const data = await res.json();
        if (res.ok && data.success) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }

    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const handleLogout = async () => {
    await logoutUser();
    showToast('Signed out successfully', 'info');
    router.push('/');
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.productName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return (
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
            <PackageCheck className="w-3.5 h-3.5" />
            Delivered
          </span>
        );
      case 'SHIPPED':
      case 'PROCESSING':
        return (
          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            {status}
          </span>
        );
      default:
        return (
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Pending Processing
          </span>
        );
    }
  };

  if (userLoading || (!user && loadingOrders)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-emerald-400">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-light min-h-screen bg-white text-slate-900 py-5 sm:py-10 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-8">
        {/* User Banner Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5 sm:gap-6 relative z-10">
            <div className="flex items-start gap-3 sm:gap-5 min-w-0">
              <div className="w-14 h-14 sm:w-20 sm:h-20 shrink-0 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center font-black text-2xl border border-emerald-500/30 shadow-inner">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-3xl font-black text-white break-words">{user?.name || 'Valued Customer'}</h1>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-1 rounded-full border border-emerald-500/30 inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Member
                  </span>
                </div>
                <p className="text-slate-400 text-xs sm:text-sm mt-2 flex items-center gap-2 truncate">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span className="truncate">{user?.email}</span>
                </p>
                {user?.phone && (
                  <p className="text-slate-500 text-xs mt-1 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    {user.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Link
                href="/shop"
                className="flex-1 sm:flex-initial bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 sm:px-5 py-3 rounded-xl sm:rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <ShoppingBag className="w-4 h-4" />
                Shop Now
              </Link>
              <button
                onClick={handleLogout}
                aria-label="Sign out"
                className="bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 font-medium px-3 sm:px-4 py-3 rounded-xl sm:rounded-2xl text-sm transition-all border border-slate-700/50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-800 -mx-3 px-3 sm:mx-0 sm:px-0 sm:space-x-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setActiveTab('orders')}
            className={`shrink-0 pb-3 sm:pb-4 px-2 sm:px-0 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-1.5 sm:gap-2 ${
              activeTab === 'orders' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>My Orders</span><span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded-full">{orders.length}</span>
            {activeTab === 'orders' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`shrink-0 pb-3 sm:pb-4 px-2 sm:px-0 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-1.5 sm:gap-2 ${
              activeTab === 'profile' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span><span className="hidden sm:inline">& Account Details</span>
            {activeTab === 'profile' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`shrink-0 pb-3 sm:pb-4 px-2 sm:px-0 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-1.5 sm:gap-2 ${
              activeTab === 'support' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Support</span><span className="hidden sm:inline">& Branches</span>
            {activeTab === 'support' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">Order History</h2>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by order # or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl py-3 sm:py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {loadingOrders ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                Fetching your orders...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl sm:rounded-3xl p-7 sm:p-12 text-center space-y-4">
                <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">No orders found</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
                  You haven&apos;t placed any orders yet, or no orders match your search criteria.
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/20"
                >
                  Explore Products
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-all space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-base font-black text-white">#{order.orderNumber}</span>
                          {getStatusBadge(order.orderStatus)}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Total Amount</span>
                        <span className="text-lg font-black text-emerald-400">
                          ₦{order.totalAmount?.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm bg-slate-950/50 p-3 rounded-2xl border border-slate-800/60"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center text-xs font-bold text-emerald-400">
                              {item.quantity}x
                            </div>
                            <span className="font-semibold text-slate-200">{item.productName}</span>
                          </div>
                          <span className="font-bold text-slate-300">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer Info & WhatsApp Track Button */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          Delivery: {order.customerAddress}, {order.customerCity} (
                          {order.preferredBranch === 'abia_branch_office' ? 'ABSU Branch' : 'Lagos Head Office'})
                        </span>
                      </div>

                      <a
                        href={`https://wa.me/2347034791996?text=Hello%20G%20Naath,%20I%20want%20to%20track%20my%20Order%20%23${order.orderNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl font-bold transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Track Order on WhatsApp
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Profile */}
        {activeTab === 'profile' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" />
              Account Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Full Name</span>
                <p className="text-slate-200 font-semibold">{user?.name || 'N/A'}</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Email Address</span>
                <p className="text-slate-200 font-semibold">{user?.email || 'N/A'}</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Phone Number</span>
                <p className="text-slate-200 font-semibold">{user?.phone || 'Not provided'}</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Preferred Branch</span>
                <p className="text-slate-200 font-semibold">
                  {user?.preferredBranch === 'abia_branch_office'
                    ? 'Abia State Branch (ABSU Uturu Campus)'
                    : 'Lagos Head Office (Ago Palace Way, Okota)'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs flex items-center gap-3">
              <Sparkles className="w-5 h-5 shrink-0" />
              <span>
                Your account is verified and fully linked with Resend email notification services for real-time order updates.
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Support */}
        {activeTab === 'support' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3 text-emerald-400">
                <MapPin className="w-6 h-6" />
                <h3 className="text-lg font-bold text-white">Lagos Head Office</h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Suite B101, Ago Palace Way, Okota, Lagos State, Nigeria
              </p>
              <p className="text-slate-400 text-xs">Customer Support & Wholesale Hub</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3 text-cyan-400">
                <MapPin className="w-6 h-6" />
                <h3 className="text-lg font-bold text-white">Abia State ABSU Branch</h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Abia State University Main Campus Commercial Center, Uturu, Abia State
              </p>
              <p className="text-slate-400 text-xs">Campus Express Service Center</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
