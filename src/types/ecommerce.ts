export interface ProductOption {
  name: string; // e.g. "Color", "Storage", "Capacity"
  values: string[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  images?: string[];
  video?: string;
  description: string;
  features?: string[];
  options?: ProductOption[];
  badge?: string;
  inStock: boolean;
  /** Units on hand; null/undefined when stock is not tracked. */
  stockQuantity?: number | null;
  /** Orderable now, ships later. */
  isPreorder?: boolean;
  /** e.g. "Ships in 2–3 weeks". */
  preorderNote?: string | null;
  isFeatured?: boolean;
  categoryName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  itemCount: number;
  image: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  customIcon: boolean;
  image: string;
  fallbackImage: string;
  itemCount: number;
}

export interface CartItem {
  id: string; // unique combination of product id + options
  product: Product;
  quantity: number;
  selectedOptions: Record<string, string>;
}

export interface CustomerDetails {
  name: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  preferredBranch: 'lagos_head_office' | 'abia_branch_office';
  deliveryNotes?: string;
  paymentPreference: 'flutterwave';
}

export interface StoreConfig {
  storeName: string;
  motto: string;
  rcNumber: string;
  tagline: string;
  whatsappNumber: string; // e.g. +2347034791996
  whatsappDisplayNumber: string;
  email: string;
  facebookName: string;
  facebookUrl: string;
  currencySymbol: string;
  currencyCode: string;
  bannerAnnouncement: string;
  headOfficeAddress: string;
  headOfficeLandmark: string;
  branchOfficeAddress: string;
  branchOfficeLandmark: string;
  businessHours: string;
  logoUrl: string;
  brands: string[];
}

export interface RepairBooking {
  deviceName: string; // e.g. iPhone 13 Pro Max
  issueType: string; // e.g. Screen Replacement, Battery, Charging Port
  preferredBranch: 'lagos_head_office' | 'abia_branch_office';
  additionalNotes?: string;
}

export interface SolarQuoteRequest {
  systemSize: string; // e.g. 1.5kVA, 3.5kVA, 5kVA, 10kVA, Custom
  applianceDetails: string;
  location: string;
  serviceType: 'new_installation' | 'buy_materials' | 'maintenance_repair';
}
