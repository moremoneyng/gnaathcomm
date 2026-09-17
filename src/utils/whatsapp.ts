import { CartItem, CustomerDetails, Product, RepairBooking, SolarQuoteRequest, StoreConfig } from '@/types/ecommerce';

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, symbol: string = '₦'): string {
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/**
 * Clean phone number to digits only (e.g. "07034791996" -> "2347034791996")
 */
export function cleanPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Format shopping cart order for WhatsApp
 */
export function generateCartWhatsAppUrl(
  items: CartItem[],
  customer: CustomerDetails,
  config: StoreConfig,
  totalAmount: number
): string {
  const cleanPhone = cleanPhoneNumber(config.whatsappNumber);

  const branchText =
    customer.preferredBranch === 'lagos_head_office'
      ? '📍 Lagos Head Office (Ago Palace Roundabout, Isolo)'
      : '📍 Abia State Branch (ABSU Uturu)';

  let message = `🛍️ *NEW PRODUCT ORDER - ${config.storeName.toUpperCase()}*\n`;
  message += `_*${config.motto}*_\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  message += `👤 *CUSTOMER DETAILS*\n`;
  message += `• *Name:* ${customer.name || 'Not provided'}\n`;
  message += `• *Phone:* ${customer.phone || 'Not provided'}\n`;
  message += `• *Fulfillment Branch:* ${branchText}\n`;
  message += `• *Delivery Address:* ${customer.address || 'Pickup at branch'}${customer.city ? `, ${customer.city}` : ''}\n`;
  message += `• *Payment Method:* 🔒 Flutterwave secure checkout\n`;

  if (customer.deliveryNotes) {
    message += `• *Notes:* ${customer.deliveryNotes}\n`;
  }

  message += `\n📦 *ORDER ITEMS (${items.reduce((acc, item) => acc + item.quantity, 0)})*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;

  items.forEach((item, index) => {
    const itemTotal = item.product.price * item.quantity;
    const optionsText = Object.entries(item.selectedOptions)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

    message += `${index + 1}. *${item.product.name}* ${item.product.brand ? `(${item.product.brand})` : ''}\n`;
    if (optionsText) {
      message += `   └ Options: ${optionsText}\n`;
    }
    message += `   └ Qty: ${item.quantity} × ${formatCurrency(item.product.price, config.currencySymbol)} = *${formatCurrency(itemTotal, config.currencySymbol)}*\n\n`;
  });

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *TOTAL AMOUNT:* *${formatCurrency(totalAmount, config.currencySymbol)}*\n`;
  message += `⏰ *Order Time:* ${new Date().toLocaleString()}\n\n`;
  message += `Please help me with this paid order. Thank you! 🙏`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Format single product direct inquiry link
 */
export function generateSingleProductWhatsAppUrl(
  product: Product,
  config: StoreConfig,
  quantity: number = 1,
  selectedOptions?: Record<string, string>,
  customNote?: string
): string {
  const cleanPhone = cleanPhoneNumber(config.whatsappNumber);

  let message = `👋 Hello ${config.storeName}! I am interested in purchasing:\n\n`;
  message += `🛍️ *${product.name}* ${product.brand ? `[${product.brand}]` : ''}\n`;
  message += `💰 *Price:* ${formatCurrency(product.price, config.currencySymbol)}\n`;
  message += `🔢 *Quantity:* ${quantity}\n`;

  if (selectedOptions && Object.keys(selectedOptions).length > 0) {
    const optionsText = Object.entries(selectedOptions)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    message += `⚙️ *Selected Options:* ${optionsText}\n`;
  }

  const subtotal = product.price * quantity;
  message += `💵 *Estimated Subtotal:* ${formatCurrency(subtotal, config.currencySymbol)}\n\n`;

  if (customNote) {
    message += `📝 *Customer Note:* ${customNote}\n\n`;
  }

  message += `Is this item available for immediate delivery / branch pickup?`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Format Phone Repair Service request link
 */
export function generateRepairWhatsAppUrl(
  booking: RepairBooking,
  config: StoreConfig
): string {
  const cleanPhone = cleanPhoneNumber(config.whatsappNumber);

  const branchText =
    booking.preferredBranch === 'lagos_head_office'
      ? '📍 Lagos Head Office (Ago Palace Roundabout, Isolo)'
      : '📍 Abia State Branch (ABSU Uturu)';

  let message = `🛠️ *MOBILE PHONE REPAIR INQUIRY - ${config.storeName.toUpperCase()}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `📱 *Device Model:* ${booking.deviceName || 'Mobile Phone'}\n`;
  message += `🔧 *Repair Service Needed:* ${booking.issueType}\n`;
  message += `🏬 *Preferred Branch:* ${branchText}\n`;

  if (booking.additionalNotes) {
    message += `📝 *Issue Details:* ${booking.additionalNotes}\n`;
  }

  message += `\nHello technician! Please give me a quote and estimated time for this phone repair. Thanks!`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Format Solar System Quote request link
 */
export function generateSolarWhatsAppUrl(
  quote: SolarQuoteRequest,
  config: StoreConfig
): string {
  const cleanPhone = cleanPhoneNumber(config.whatsappNumber);

  let message = `☀️ *SOLAR ENERGY INQUIRY - ${config.storeName.toUpperCase()}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `⚡ *Service Needed:* ${
    quote.serviceType === 'new_installation'
      ? 'Full Solar System Installation'
      : quote.serviceType === 'buy_materials'
      ? 'Purchase of Solar Materials (Panels, Inverters, Batteries)'
      : 'Solar Maintenance & Repair'
  }\n`;
  message += `🔋 *Estimated System Capacity:* ${quote.systemSize}\n`;
  message += `🏠 *Installation Location:* ${quote.location || 'Lagos / Abia State'}\n`;

  if (quote.applianceDetails) {
    message += `📺 *Appliances to Power:* ${quote.applianceDetails}\n`;
  }

  message += `\nHello G-Naath Solar Team! Please provide me with a price estimate and consultation for solar installation/materials.`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
