'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CartItem, CustomerDetails, Product, StoreConfig } from '@/types/ecommerce';
import { DEFAULT_STORE_CONFIG } from '@/data/storeCatalog';

/** History-state key marking the entry pushed while a product's details are open. */
const PRODUCT_MODAL_HISTORY_KEY = 'gnaathProductModal';

export interface ShopFilters {
  brand: string;
  inStockOnly: boolean;
  onSaleOnly: boolean;
  preorderOnly: boolean;
}

export const DEFAULT_SHOP_FILTERS: ShopFilters = { brand: 'all', inStockOnly: false, onSaleOnly: false, preorderOnly: false };

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  preferredBranch?: string;
  isVerified?: boolean;
}

interface StoreContextType {
  // User Auth
  user: User | null;
  userLoading: boolean;
  checkAuthStatus: () => Promise<void>;
  logoutUser: () => Promise<void>;

  // Products
  products: Product[];
  isLoadingProducts: boolean;
  refreshProducts: (options?: { silent?: boolean }) => Promise<void>;

  // Config & Details
  config: StoreConfig;
  storeConfig: StoreConfig;
  /** Saves settings to the database (admins only). Resolves true when saved. */
  updateConfig: (newConfig: Partial<StoreConfig>) => Promise<boolean>;
  refreshConfig: () => Promise<void>;
  customerDetails: CustomerDetails;
  setCustomerDetails: React.Dispatch<React.SetStateAction<CustomerDetails>>;
  updateCustomerDetails: (details: Partial<CustomerDetails>) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, options?: Record<string, string>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Wishlist
  wishlist: string[];
  wishlistCount: number;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Product Modal / Quick View
  activeProductModal: Product | null;
  openProductModal: (product: Product) => void;
  /**
   * Closes the details. Pass `{ navigating: true }` when a route change follows immediately; it then
   * returns true if that navigation should `router.replace` the details' own history entry.
   */
  closeProductModal: (options?: { navigating?: boolean }) => boolean;

  // Config Modal
  isConfigModalOpen: boolean;
  setIsConfigModalOpen: (open: boolean) => void;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
  setSortBy: (sort: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest') => void;
  /** Shop page filters; kept here so they survive a trip to checkout and back. */
  shopFilters: ShopFilters;
  setShopFilters: React.Dispatch<React.SetStateAction<ShopFilters>>;

  // Toast notification
  toastMessage: string | null;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [config, setConfig] = useState<StoreConfig>(DEFAULT_STORE_CONFIG);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Lagos',
    preferredBranch: 'lagos_head_office',
    deliveryNotes: '',
    paymentPreference: 'flutterwave',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'>('featured');
  const [shopFilters, setShopFilters] = useState<ShopFilters>(DEFAULT_SHOP_FILTERS);

  // Check auth session
  const checkAuthStatus = async () => {
    try {
      setUserLoading(true);
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok && data.authenticated && data.user) {
        setUser(data.user);
        setCustomerDetails((prev) => ({
          ...prev,
          name: data.user.name || prev.name,
          email: data.user.email || prev.email,
          phone: data.user.phone || prev.phone,
          preferredBranch: data.user.preferredBranch || prev.preferredBranch,
        }));
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setUserLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Fetch products from database. Silent refreshes keep the current list on failure.
  const refreshProducts = async (options: { silent?: boolean } = {}) => {
    try {
      if (!options.silent) setIsLoadingProducts(true);
      const res = await fetch('/api/products', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.success || !Array.isArray(data.products)) {
        throw new Error(data.error || 'Failed to load products.');
      }
      applyFreshProducts(data.products);
    } catch (err) {
      console.error('Error fetching products from API:', err);
      if (!options.silent) {
        setProducts([]);
        showToast(err instanceof Error ? err.message : 'Failed to load products.');
      }
    } finally {
      if (!options.silent) setIsLoadingProducts(false);
    }
  };

  const openedSharedLink = useRef(false);

  /** Pushes fresh product data everywhere a shopper can see it: grid, open popup and cart. */
  const applyFreshProducts = (fresh: Product[]) => {
    setProducts(fresh);
    const byId = new Map(fresh.map((p) => [p.id, p]));
    setCart((prev) =>
      prev.map((item) => {
        const latest = byId.get(item.product.id);
        return latest ? { ...item, product: latest } : { ...item, product: { ...item.product, inStock: false } };
      })
    );
    setActiveProductModal((current) => (current ? byId.get(current.id) || { ...current, inStock: false } : current));

    // Shared links (?product=<id>) open that product's details once the catalogue first loads.
    if (!openedSharedLink.current && fresh.length > 0) {
      openedSharedLink.current = true;
      const shared = byId.get(new URL(window.location.href).searchParams.get('product') || '');
      if (shared) setActiveProductModal(shared);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  // Live availability: re-check every 45s while the tab is visible and when the shopper returns,
  // so "Out of stock" / "Pre-order" changes made by an admin appear without reloading the page.
  const productsRef = useRef<Product[]>([]);
  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    let cancelled = false;

    const syncAvailability = async () => {
      if (document.visibilityState !== 'visible' || productsRef.current.length === 0) return;
      try {
        const res = await fetch('/api/products/availability', { cache: 'no-store' });
        const data = await res.json();
        if (cancelled || !res.ok || !data.success || !Array.isArray(data.products)) return;

        const current = productsRef.current;
        const snapshot = new Map<string, Partial<Product>>(
          data.products.map((p: Partial<Product> & { id: string }) => [p.id, p])
        );
        // New or removed products need the full catalogue; otherwise merge the small snapshot.
        if (snapshot.size !== current.length || current.some((p) => !snapshot.has(p.id))) {
          await refreshProducts({ silent: true });
          return;
        }
        const changed = current.some((p) => {
          const s = snapshot.get(p.id)!;
          return (
            s.inStock !== p.inStock ||
            Boolean(s.isPreorder) !== Boolean(p.isPreorder) ||
            (s.preorderNote ?? null) !== (p.preorderNote ?? null) ||
            (s.stockQuantity ?? null) !== (p.stockQuantity ?? null) ||
            s.price !== p.price ||
            (s.originalPrice ?? null) !== (p.originalPrice ?? null)
          );
        });
        if (changed) applyFreshProducts(current.map((p) => ({ ...p, ...snapshot.get(p.id) })));
      } catch {
        // Offline or a blip: try again on the next tick.
      }
    };

    const timer = window.setInterval(syncAvailability, 45_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') syncAvailability();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, []);

  // Load saved state from localStorage on mount
  useEffect(() => {
    try {
      // Settings now live in the database; drop the old per-browser copy so it can't mask them.
      localStorage.removeItem('gnaath_store_config');

      const savedCart = localStorage.getItem('gnaath_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem('gnaath_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      const savedCustomer = localStorage.getItem('gnaath_customer');
      if (savedCustomer) setCustomerDetails(JSON.parse(savedCustomer));
    } catch (e) {
      console.error('Failed to load storage state:', e);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('gnaath_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('gnaath_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('gnaath_customer', JSON.stringify(customerDetails));
  }, [customerDetails]);

  const refreshConfig = async () => {
    try {
      const res = await fetch('/api/store-config', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.config) setConfig({ ...DEFAULT_STORE_CONFIG, ...data.config });
    } catch {
      // Keep the built-in defaults; the storefront still works.
    }
  };

  useEffect(() => {
    refreshConfig();
  }, []);

  const updateConfig = async (newConfig: Partial<StoreConfig>) => {
    try {
      const res = await fetch('/api/store-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not save store settings.');
      setConfig({ ...DEFAULT_STORE_CONFIG, ...data.config });
      showToast('Store settings saved for everyone');
      return true;
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save store settings.');
      return false;
    }
  };

  const updateCustomerDetails = (details: Partial<CustomerDetails>) => {
    setCustomerDetails((prev) => ({ ...prev, ...details }));
  };

  const addToCart = (product: Product, quantity = 1, options: Record<string, string> = {}) => {
    if (!product.inStock) {
      showToast(`${product.name} is currently out of stock`);
      return;
    }
    const optionKeys = Object.keys(options).sort();
    const optionsSlug = optionKeys.map((k) => `${k}:${options[k]}`).join('|');
    const itemId = `${product.id}_${optionsSlug}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === itemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { id: itemId, product, quantity, selectedOptions: options }];
      }
    });

    showToast(`Added ${product.name} to cart!`);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('Item removed from cart');
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from wishlist');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Added to wishlist!');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Product details get their own history entry (?product=<id>), so the phone/browser Back button
  // closes them and leaves the shopper exactly where they were in the list instead of leaving the page.
  const productUrl = (productId: string | null) => {
    const url = new URL(window.location.href);
    if (productId) url.searchParams.set('product', productId);
    else url.searchParams.delete('product');
    return url.pathname + url.search + url.hash;
  };

  const openProductModal = (product: Product) => {
    setActiveProductModal(product);
    const entry = { [PRODUCT_MODAL_HISTORY_KEY]: product.id };
    if (window.history.state?.[PRODUCT_MODAL_HISTORY_KEY]) window.history.replaceState(entry, '', productUrl(product.id));
    else window.history.pushState(entry, '', productUrl(product.id));
  };

  const closeProductModal = ({ navigating = false }: { navigating?: boolean } = {}) => {
    const hasOwnEntry = Boolean(window.history.state?.[PRODUCT_MODAL_HISTORY_KEY]);
    if (hasOwnEntry && !navigating) {
      window.history.back(); // the popstate listener below clears the modal
      return false;
    }
    setActiveProductModal(null);
    if (hasOwnEntry) return true;
    if (new URL(window.location.href).searchParams.has('product')) window.history.replaceState(null, '', productUrl(null));
    return false;
  };

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const productId = event.state?.[PRODUCT_MODAL_HISTORY_KEY];
      setActiveProductModal(productId ? productsRef.current.find((p) => p.id === productId) ?? null : null);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        user,
        userLoading,
        checkAuthStatus,
        logoutUser,
        products,
        isLoadingProducts,
        refreshProducts,
        config,
        storeConfig: config,
        updateConfig,
        refreshConfig,
        customerDetails,
        setCustomerDetails,
        updateCustomerDetails,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        wishlistCount: wishlist.length,
        toggleWishlist,
        isInWishlist,
        activeProductModal,
        openProductModal,
        closeProductModal,
        isConfigModalOpen,
        setIsConfigModalOpen,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,
        shopFilters,
        setShopFilters,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
