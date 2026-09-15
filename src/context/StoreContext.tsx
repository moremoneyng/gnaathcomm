'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CustomerDetails, Product, StoreConfig } from '@/types/ecommerce';
import { DEFAULT_STORE_CONFIG } from '@/data/storeCatalog';

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
  refreshProducts: () => Promise<void>;
  submitOrder: () => Promise<{ success: boolean; orderNumber?: string; error?: string }>;

  // Config & Details
  config: StoreConfig;
  storeConfig: StoreConfig;
  updateConfig: (newConfig: Partial<StoreConfig>) => void;
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
  closeProductModal: () => void;

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
    paymentPreference: 'cash_on_delivery',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'>('featured');

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

  // Fetch products from database
  const refreshProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const res = await fetch('/api/products', { cache: 'no-store' });
      const data = await res.json();
      setProducts(data.success && Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      console.error('Error fetching products from API:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  // Submit order to PostgreSQL database
  const submitOrder = async (): Promise<{ success: boolean; orderNumber?: string; error?: string }> => {
    try {
      const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerDetails,
          cart,
          totalAmount: cartSubtotal,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        clearCart();
        return { success: true, orderNumber: data.order.orderNumber };
      }
      return { success: false, error: data.error || 'Failed to submit order' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Load saved state from localStorage on mount
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('gnaath_store_config');
      if (savedConfig) setConfig(JSON.parse(savedConfig));

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

  const updateConfig = (newConfig: Partial<StoreConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    localStorage.setItem('gnaath_store_config', JSON.stringify(updated));
    showToast('Store settings updated successfully!');
  };

  const updateCustomerDetails = (details: Partial<CustomerDetails>) => {
    setCustomerDetails((prev) => ({ ...prev, ...details }));
  };

  const addToCart = (product: Product, quantity = 1, options: Record<string, string> = {}) => {
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

  const openProductModal = (product: Product) => {
    setActiveProductModal(product);
  };

  const closeProductModal = () => {
    setActiveProductModal(null);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
        submitOrder,
        config,
        storeConfig: config,
        updateConfig,
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

