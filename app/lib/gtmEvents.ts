/**
 * Tracking & Analytics Helper (GTM / TikTok Pixel / GA4 / Snap Pixel)
 *
 * يُطلق هذه الدوال من الـ Client Components لإرسال أحداث التجارة الإلكترونية
 * المتوافقة كلياً مع:
 *  - Google Tag Manager (Data Layer)
 *  - Google Analytics 4 (GA4 Standard E-commerce)
 *  - TikTok Pixel (سواء عبر GTM Data Layer، أو عبر الوسم الرسمي لـ TikTok، أو استدعاء مباشر لـ ttq)
 *  - Snap Pixel (snaptr)
 *
 * الأحداث المدعومة:
 *  - ViewContent / view_item      (عرض تفاصيل المنتج ومطابقة الكتالوج)
 *  - AddToCart / add_to_cart      (إضافة منتج للسلة)
 *  - InitiateCheckout / begin_checkout (بدء الدفع)
 *  - CompletePayment / PlaceAnOrder / purchase (إتمام الشراء)
 */

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    ttq?: {
      track: (event: string, params?: Record<string, unknown>) => void;
      page?: () => void;
    };
    snaptr?: (action: string, event: string, params?: Record<string, unknown>) => void;
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
  item_id: string;        // _id للمنتج في قاعدة البيانات (مطابق لـ Catalog id)
  item_name: string;      // اسم المنتج
  price: number;          // السعر
  quantity: number;
  item_brand?: string;
  item_category?: string;
  discount?: number;      // مقدار الخصم إن وجد
}

export interface ViewItemPayload {
  currency: string;
  value: number;
  items: GtmItem[];
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
  transaction_id: string; // رقم الطلب الفريد
  currency: string;
  value: number;          // الإجمالي النهائي
  items: GtmItem[];
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function toTikTokContents(items: GtmItem[]) {
  return items.map((it) => ({
    content_id: String(it.item_id),
    content_name: it.item_name,
    content_category: it.item_category || "",
    quantity: it.quantity || 1,
    price: it.price,
  }));
}

// ─────────────────────────────────────────────────────────
// Event helpers
// ─────────────────────────────────────────────────────────

/**
 * ViewContent / view_item
 * يُطلق عند فتح صفحة المنتج لمطابقة الكتالوج في تيك توك وجوجل
 */
export function pushViewItem(payload: ViewItemPayload): void {
  const primaryItem = payload.items[0];
  const contentId = primaryItem ? String(primaryItem.item_id) : "";
  const contentName = primaryItem ? primaryItem.item_name : "";
  const contents = toTikTokContents(payload.items);

  // 1. Google Tag Manager — GA4 Event
  dl().push({ ecommerce: null });
  dl().push({
    event: "view_item",
    ecommerce: {
      currency: payload.currency,
      value: payload.value,
      items: payload.items,
    },
    // خصائص مباشرة لقراءة GTM tags
    content_id: contentId,
    content_name: contentName,
    content_type: "product",
    value: payload.value,
    currency: payload.currency,
    contents,
  });

  // 2. Google Tag Manager — TikTok Standard Event Name (لو التاج معمول على ViewContent)
  dl().push({
    event: "ViewContent",
    content_id: contentId,
    content_name: contentName,
    content_type: "product",
    value: payload.value,
    currency: payload.currency,
    contents,
    ecommerce: {
      currency: payload.currency,
      value: payload.value,
      items: payload.items,
    },
  });

  // 3. TikTok Direct Pixel Call (إذا تم حقن ttq بواسطة GTM أو السكربت)
  if (typeof window !== "undefined" && window.ttq && typeof window.ttq.track === "function") {
    try {
      window.ttq.track("ViewContent", {
        content_id: contentId,
        content_type: "product",
        content_name: contentName,
        quantity: 1,
        price: payload.value,
        value: payload.value,
        currency: payload.currency,
        contents,
      });
    } catch (e) {
      console.warn("TikTok Pixel ViewContent error:", e);
    }
  }

  // 4. Snap Pixel Call
  if (typeof window !== "undefined" && typeof window.snaptr === "function") {
    try {
      window.snaptr("track", "VIEW_CONTENT", {
        item_ids: [contentId],
        price: payload.value,
        currency: payload.currency,
      });
    } catch {}
  }
}

/**
 * AddToCart / add_to_cart
 * يُطلق عند إضافة منتج للسلة من أي مكان (الكروت أو صفحة المنتج)
 */
export function pushAddToCart(payload: AddToCartPayload): void {
  const primaryItem = payload.items[0];
  const contentId = primaryItem ? String(primaryItem.item_id) : "";
  const contentName = primaryItem ? primaryItem.item_name : "";
  const contents = toTikTokContents(payload.items);

  // 1. GTM — GA4 add_to_cart
  dl().push({ ecommerce: null });
  dl().push({
    event: "add_to_cart",
    ecommerce: {
      currency: payload.currency,
      value: payload.value,
      items: payload.items,
    },
    content_id: contentId,
    content_name: contentName,
    content_type: "product",
    value: payload.value,
    currency: payload.currency,
    contents,
  });

  // 2. GTM — TikTok AddToCart Trigger
  dl().push({
    event: "AddToCart",
    content_id: contentId,
    content_name: contentName,
    content_type: "product",
    value: payload.value,
    currency: payload.currency,
    contents,
    ecommerce: {
      currency: payload.currency,
      value: payload.value,
      items: payload.items,
    },
  });

  // 3. TikTok Direct Pixel Call
  if (typeof window !== "undefined" && window.ttq && typeof window.ttq.track === "function") {
    try {
      window.ttq.track("AddToCart", {
        contents,
        content_id: contentId,
        content_name: contentName,
        content_type: "product",
        value: payload.value,
        currency: payload.currency,
      });
    } catch (e) {
      console.warn("TikTok Pixel AddToCart error:", e);
    }
  }

  // 4. Snap Pixel Call
  if (typeof window !== "undefined" && typeof window.snaptr === "function") {
    try {
      window.snaptr("track", "ADD_CART", {
        item_ids: payload.items.map((i) => String(i.item_id)),
        price: payload.value,
        currency: payload.currency,
        number_items: payload.items.reduce((s, it) => s + (it.quantity || 1), 0),
      });
    } catch {}
  }
}

/**
 * InitiateCheckout / begin_checkout
 * يُطلق عند دخول صفحة إتمام الطلب
 */
export function pushBeginCheckout(payload: BeginCheckoutPayload): void {
  const contents = toTikTokContents(payload.items);
  const primaryItem = payload.items[0];

  // 1. GTM — GA4 begin_checkout
  dl().push({ ecommerce: null });
  dl().push({
    event: "begin_checkout",
    ecommerce: {
      currency: payload.currency,
      value: payload.value,
      items: payload.items,
    },
    content_type: "product",
    content_id: primaryItem ? String(primaryItem.item_id) : "",
    value: payload.value,
    currency: payload.currency,
    contents,
  });

  // 2. GTM — TikTok InitiateCheckout Trigger
  dl().push({
    event: "InitiateCheckout",
    content_type: "product",
    content_id: primaryItem ? String(primaryItem.item_id) : "",
    value: payload.value,
    currency: payload.currency,
    contents,
    ecommerce: {
      currency: payload.currency,
      value: payload.value,
      items: payload.items,
    },
  });

  // 3. TikTok Direct Pixel Call
  if (typeof window !== "undefined" && window.ttq && typeof window.ttq.track === "function") {
    try {
      window.ttq.track("InitiateCheckout", {
        contents,
        content_type: "product",
        value: payload.value,
        currency: payload.currency,
      });
    } catch (e) {
      console.warn("TikTok Pixel InitiateCheckout error:", e);
    }
  }

  // 4. Snap Pixel Call
  if (typeof window !== "undefined" && typeof window.snaptr === "function") {
    try {
      window.snaptr("track", "START_CHECKOUT", {
        item_ids: payload.items.map((i) => String(i.item_id)),
        price: payload.value,
        currency: payload.currency,
        number_items: payload.items.reduce((s, it) => s + (it.quantity || 1), 0),
      });
    } catch {}
  }
}

/**
 * CompletePayment / PlaceAnOrder / purchase
 * يُطلق بعد تأكيد الشراء أو إتمام الطلب بنجاح
 */
export function pushPurchase(payload: PurchasePayload): void {
  const contents = toTikTokContents(payload.items);
  const primaryItem = payload.items[0];

  // 1. GTM — GA4 purchase
  dl().push({ ecommerce: null });
  dl().push({
    event: "purchase",
    ecommerce: {
      transaction_id: payload.transaction_id,
      currency: payload.currency,
      value: payload.value,
      items: payload.items,
    },
    transaction_id: payload.transaction_id,
    content_type: "product",
    content_id: primaryItem ? String(primaryItem.item_id) : "",
    value: payload.value,
    currency: payload.currency,
    contents,
  });

  // 2. GTM — TikTok CompletePayment Trigger
  dl().push({
    event: "CompletePayment",
    event_id: payload.transaction_id,
    transaction_id: payload.transaction_id,
    content_type: "product",
    content_id: primaryItem ? String(primaryItem.item_id) : "",
    value: payload.value,
    currency: payload.currency,
    contents,
    ecommerce: {
      transaction_id: payload.transaction_id,
      currency: payload.currency,
      value: payload.value,
      items: payload.items,
    },
  });

  // 3. GTM — TikTok PlaceAnOrder Trigger (لتغطية التاجات التي تستخدم PlaceAnOrder)
  dl().push({
    event: "PlaceAnOrder",
    event_id: payload.transaction_id,
    transaction_id: payload.transaction_id,
    content_type: "product",
    value: payload.value,
    currency: payload.currency,
    contents,
  });

  // 4. TikTok Direct Pixel Call
  if (typeof window !== "undefined" && window.ttq && typeof window.ttq.track === "function") {
    try {
      window.ttq.track("CompletePayment", {
        contents,
        content_type: "product",
        value: payload.value,
        currency: payload.currency,
        event_id: payload.transaction_id,
      });
    } catch (e) {
      console.warn("TikTok Pixel CompletePayment error:", e);
    }
  }

  // 5. Snap Pixel Call
  if (typeof window !== "undefined" && typeof window.snaptr === "function") {
    try {
      window.snaptr("track", "PURCHASE", {
        transaction_id: payload.transaction_id,
        item_ids: payload.items.map((i) => String(i.item_id)),
        price: payload.value,
        currency: payload.currency,
        number_items: payload.items.reduce((s, it) => s + (it.quantity || 1), 0),
      });
    } catch {}
  }
}
