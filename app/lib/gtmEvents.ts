/**
 * Google Tag Manager — E-commerce Data Layer helpers
 *
 * يُطلق هذه الدوال من أي مكان في الـ Client Components
 * لإرسال أحداث التجارة الإلكترونية إلى GTM/Google Ads/GA4.
 *
 * الأحداث المدعومة:
 *  - add_to_cart      (عند إضافة منتج للسلة)
 *  - begin_checkout   (عند فتح صفحة الدفع)
 *  - purchase         (عند تأكيد الشراء)
 */

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

/** تأكد من وجود dataLayer */
function dl(): Record<string, unknown>[] {
  if (typeof window === "undefined") return [];
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

export interface GtmItem {
  item_id: string;        // _id للمنتج
  item_name: string;      // اسم المنتج
  price: number;          // السعر بعد الخصم
  quantity: number;
  item_brand?: string;
  item_category?: string;
  discount?: number;      // مقدار الخصم إن وجد
}

export interface AddToCartPayload {
  currency: string;
  value: number;          // سعر × الكمية
  items: GtmItem[];
}

export interface BeginCheckoutPayload {
  currency: string;
  value: number;          // إجمالي السلة
  items: GtmItem[];
}

export interface PurchasePayload {
  transaction_id: string; // orderId
  currency: string;
  value: number;          // الإجمالي النهائي
  items: GtmItem[];
}

// ─────────────────────────────────────────────────────────
// Event helpers
// ─────────────────────────────────────────────────────────

/**
 * add_to_cart
 * يُطلق عند ضغط المستخدم على "أضف للسلة"
 */
export function pushAddToCart(payload: AddToCartPayload): void {
  dl().push({ ecommerce: null }); // امسح الحدث السابق أولاً
  dl().push({
    event: "add_to_cart",
    ecommerce: {
      currency: payload.currency,
      value: payload.value,
      items: payload.items,
    },
  });
}

/**
 * begin_checkout
 * يُطلق مرة واحدة عند دخول صفحة الدفع
 */
export function pushBeginCheckout(payload: BeginCheckoutPayload): void {
  dl().push({ ecommerce: null });
  dl().push({
    event: "begin_checkout",
    ecommerce: {
      currency: payload.currency,
      value: payload.value,
      items: payload.items,
    },
  });
}

/**
 * purchase
 * يُطلق بعد تأكيد الشراء (صفحة verify — عند نجاح OTP أو Cash on Delivery)
 */
export function pushPurchase(payload: PurchasePayload): void {
  dl().push({ ecommerce: null });
  dl().push({
    event: "purchase",
    ecommerce: {
      transaction_id: payload.transaction_id,
      currency: payload.currency,
      value: payload.value,
      items: payload.items,
    },
  });
}
