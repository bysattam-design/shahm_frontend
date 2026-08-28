import {
  formatDate as writeDate,
  formatDateTime as writeDateTime,
} from "../../../../../utils/format";
// src/pages/dashboard/services/requests/utils/requestHelpers.js

// ─── Status metadata ──────────────────────────────────────────────────────────
export const STATUS_META = {
  new: {
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.10)",
    border: "rgba(59,130,246,0.25)",
    label_en: "New",
    label_ar: "جديد",
  },
  reviewing: {
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.10)",
    border: "rgba(139,92,246,0.25)",
    label_en: "Reviewing",
    label_ar: "قيد المراجعة",
  },
  awaiting_client: {
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.10)",
    border: "rgba(245,158,11,0.25)",
    label_en: "Awaiting Client",
    label_ar: "في انتظار العميل",
  },
  client_updated: {
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.10)",
    border: "rgba(6,182,212,0.25)",
    label_en: "Client Updated",
    label_ar: "تم التحديث من العميل",
  },
  contracting: {
    color: "#10B981",
    bg: "rgba(16,185,129,0.10)",
    border: "rgba(16,185,129,0.25)",
    label_en: "Contracting",
    label_ar: "التعاقد",
  },
  closed: {
    color: "#6B7280",
    bg: "rgba(107,114,128,0.10)",
    border: "rgba(107,114,128,0.25)",
    label_en: "Closed",
    label_ar: "مغلق",
  },
  cancelled: {
    color: "#EF4444",
    bg: "rgba(239,68,68,0.10)",
    border: "rgba(239,68,68,0.25)",
    label_en: "Cancelled",
    label_ar: "ملغى",
  },
};

export const STATUS_OPTIONS = Object.keys(STATUS_META);

/**
 * Returns status meta or a safe fallback.
 */
export function getStatusMeta(status) {
  return (
    STATUS_META[status] || {
      color: "#6B7280",
      bg: "rgba(107,114,128,0.10)",
      border: "rgba(107,114,128,0.25)",
      label_en: status || "Unknown",
      label_ar: status || "غير معروف",
    }
  );
}

// ─── List normalisation ───────────────────────────────────────────────────────
/**
 * Handles both paginated { results: [] } and raw array responses.
 */
export function normalizeRequestListResponse(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

// ─── Display helpers ──────────────────────────────────────────────────────────
export function getRequestDisplayName(request) {
  if (!request) return "—";
  const first = request.first_name || "";
  const last = request.last_name || "";
  const full = `${first} ${last}`.trim();
  return full || request.email || `#${request.id}`;
}

export function getLocalizedServiceTitle(service, lang) {
  if (!service) return "—";
  if (lang === "ar") return service.title_ar || service.title_en || "—";
  return service.title_en || service.title_ar || "—";
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
export function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  try {
    return writeDateTime(dateStr) || dateStr;
  } catch {
    return dateStr;
  }
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return writeDate(dateStr) || dateStr;
  } catch {
    return dateStr;
  }
}

// ─── Clipboard ────────────────────────────────────────────────────────────────
export async function copyToClipboard(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;left:-9999px;top:-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

// ─── Snapshot rendering ───────────────────────────────────────────────────────
/**
 * Formats a single snapshot value for display.
 * Handles strings, arrays, objects, booleans, null.
 */
export function renderSnapshotValue(val) {

  if (val === null || val === undefined || val === "") {
    return "—";
  }

  if (typeof val === "boolean") {
    return val ? "✓" : "✗";
  }

  if (typeof val === "number") {
    return String(val);
  }

  if (typeof val === "string") {

    // URL
    if (/^https?:\/\//i.test(val)) {
      return val;
    }

    return val;
  }

  // =========================================
  // ARRAYS
  // =========================================
  if (Array.isArray(val)) {

    if (val.length === 0) {
      return "—";
    }

    // grouped services structure
    const isGroupedServices =
      typeof val[0] === "object" &&
      val[0] !== null &&
      "services" in val[0];

if (isGroupedServices) {

  return val
    .map((group) => {

      const mainTitle =
        group.main_service_title_ar ||
        group.main_service_title_en ||
        "—";

      const services = (group.services || [])
        .map((service) =>
          service.title_ar ||
          service.title_en
        )
        .join(", ");

      return `${mainTitle}: ${services}`;
    })
    .join(" | ");
}

    return val
      .map((v) =>
        typeof v === "object"
          ? JSON.stringify(v)
          : String(v)
      )
      .join(", ");
  }

  // =========================================
  // OBJECTS
  // =========================================
  if (typeof val === "object") {

    // phone object
    if (
      val.country_code !== undefined &&
      val.number !== undefined
    ) {
      return `${val.country_code}${val.number}`.trim() || "—";
    }

    return JSON.stringify(val);
  }

  return String(val);
}

/**
 * Returns true if the snapshot value looks like a file URL.
 */
export function isFileUrl(val) {
  return typeof val === "string" && /^https?:\/\//i.test(val);
}

/**
 * Prettify a snake_case or camelCase key into a human-readable label.
 */
export function prettifyKey(key) {
  if (!key) return "";
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}