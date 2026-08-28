// Dashboard footer CMS
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import api from "../../../api/axiosClient";
import { API_PATHS } from "../../../api/routes";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useSweetAlert } from "../../../components/common/SweetAlert";
import { Button, EmptyState, Spinner as UiSpinner } from "../../../components/ui";
import { DraftNotice } from "../../../components/forms/cms";
import useFormDraft from "../../../hooks/useFormDraft";
import { parseApiError } from "../../../utils/apiErrors";
import "../../../styles/forms/cms-form.css";
import "../../../styles/dashboard/cms/footer.css";
import Deletebtn from "../../../components/common/dashboard/Deletebtn";
import Editbtn from "../../../components/common/dashboard/Editbtn";

/* ── slug normalizer ── */
function normalizeSlug(val) {
  if (!val) return "";
  val = val.trim();
  if (val.startsWith("http://") || val.startsWith("https://")) return val;
  return val.startsWith("/") ? val : `/${val}`;
}

/**
 * Says what the server said, instead of one generic failure.
 *
 * Every handler on this screen answered a rejected write with
 * `toast.error("فشل حفظ الرابط")` and dropped the server's own message and the
 * name of the field it refused. An editor could not tell a duplicate key from
 * an expired session. The parsed field messages are returned so the caller can
 * put them on the fields as well.
 */
function notifyError(error, fallback) {
  const parsed = parseApiError(error);

  if (!parsed.canceled) toast.error(parsed.message || fallback);

  return parsed;
}

/** The server's word about one field, rendered where that field lives. */
function FieldError({ message }) {
  if (!message) return null;

  return (
    <span className="sf-field__error" role="alert">
      {message}
    </span>
  );
}

/** The server's word about the whole form, above its buttons. */
function FormError({ message }) {
  if (!message) return null;

  return (
    <div className="cms-footer-info-box cms-footer-info-box--warning" role="alert">
      <IconInfo />
      {message}
    </div>
  );
}

/**
 * A number the editor finishes before it is sent.
 *
 * The order boxes wrote on every keystroke and then reloaded the whole screen,
 * so typing `12` sent `1`, threw the tree away, and put the box back at its old
 * value with the caret gone. An editor could not set a two-digit order at all.
 * This one keeps what is being typed and sends it once — on blur, or on Enter —
 * and Escape puts back what was there.
 */
function OrderBox({ value, label, onCommit, disabled = false }) {
  const settled = useRef(String(value ?? ""));
  const [draft, setDraft] = useState(settled.current);

  // A value that moved on the server replaces the box, but never while the
  // editor is part-way through typing their own.
  useEffect(() => {
    const next = String(value ?? "");

    if (next !== settled.current) {
      settled.current = next;
      setDraft(next);
    }
  }, [value]);

  const commit = () => {
    if (draft === settled.current) return;
    settled.current = draft;
    onCommit(draft);
  };

  return (
    <input
      type="number"
      className="cms-footer-input-number"
      value={draft}
      aria-label={label}
      disabled={disabled}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commit();
          event.currentTarget.blur();
        }
        if (event.key === "Escape") {
          setDraft(settled.current);
          event.currentTarget.blur();
        }
      }}
    />
  );
}

const SYSTEM_COLUMN_KEYS = ["newsletter", "social", "sitemap"];

/* ── The shape each form starts from, and returns to after a save ── */
const EMPTY_COLUMN = { key: "", title_ar: "", title_en: "", order: 0, is_active: true };
const EMPTY_LINK = {
  label_ar: "", label_en: "", url: "", page: "", parent: "", order: 0, is_active: true,
};
const EMPTY_SETTINGS = {
  newsletter_title_ar: "", newsletter_title_en: "",
  copyright_ar: "", copyright_en: "",
  logo_ar: null, logo_en: null, vat_logo: null,
};
const EMPTY_CTA = {
  title_ar: "", title_en: "", description_ar: "", description_en: "",
  url: "", page: "", order: 0, is_active: true,
};

/** A copy of `source` without the named keys. */
function without(source, keys) {
  if (!keys.some((key) => key in source)) return source;

  const next = { ...source };
  keys.forEach((key) => delete next[key]);
  return next;
}

/**
 * Puts the caret on the first field the server refused, so the editor is
 * looking at the thing they have to change rather than hunting for it.
 */
function focusRejected(fields) {
  const first = Object.keys(fields || {})[0];
  if (!first || typeof document === "undefined") return;

  const element = document.querySelector(`[data-field="${first}"]`);
  if (element && typeof element.focus === "function") element.focus();
}

/** Whether anything has been typed into a form that started empty. */
function isFilled(values, blank) {
  return Object.keys(blank).some((key) => {
    const now = values[key];
    const was = blank[key];
    if (typeof was === "boolean") return now !== was;
    return String(now ?? "") !== String(was ?? "");
  });
}

/* ══════════════════════════════════════════════════════
   ICONS — minimal SVG set
══════════════════════════════════════════════════════ */
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconSave = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path d="M2 2H11L13 4V13H2V2Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 2V5H10V2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 8H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const IconX = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
    <path d="M11.5 1.5L1.5 11.5M1.5 1.5L11.5 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const IconInfo = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.4" />
    <path d="M7.5 5.5V5M7.5 7.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconColumns = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="5" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="9.5" y="2" width="5" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="17" y="2" width="1" height="16" rx="0.5" fill="currentColor" opacity="0.3" />
  </svg>
);

const IconSettings = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 1v2.5M10 16.5V19M19 10h-2.5M3.5 10H1M16.36 3.64l-1.77 1.77M5.41 14.59l-1.77 1.77M16.36 16.36l-1.77-1.77M5.41 5.41 3.64 3.64" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconLink = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
    <path d="M7.5 5.5L5.5 7.5M8.5 4.5C9.3 3.7 10.5 3.7 11.3 4.5C12.1 5.3 12.1 6.5 11.3 7.3L9.5 9.1C8.7 9.9 7.5 9.9 6.7 9.1M4.5 8.5C3.7 9.3 2.5 9.3 1.7 8.5C0.9 7.7 0.9 6.5 1.7 5.7L3.5 3.9C4.3 3.1 5.5 3.1 6.3 3.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const IconStar = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M9 1.5L11 6.5H16.5L12 9.5L14 14.5L9 11.5L4 14.5L6 9.5L1.5 6.5H7L9 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Spinner = () => (
  <span className="cms-footer-btn-spinner" aria-hidden="true">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="28" strokeDashoffset="10" strokeLinecap="round" />
    </svg>
  </span>
);

/**
 * One link in the tree, and its children under it.
 *
 * This lived inside the screen. A component declared inside another component
 * is a new type on every render, so React did not update the tree — it threw
 * the whole thing away and built a fresh one. Anything focused inside it was
 * destroyed along with it, which is why the caret vanished from the order box
 * after a single character. Out here it keeps its identity between renders.
 */
function TreeItem({ item, isAr, t, loading, onToggle, onDelete, onOrderCommit }) {
  const isDeleting = loading[`link-delete-${item.id}`];

  return (
    <li className="cms-footer-link-item">
      <div className="cms-footer-link-content">
        {/* Icon */}
        <span className="cms-footer-link-icon">
          <IconLink />
        </span>

        {/* Label */}
        <span className={`cms-footer-link-label${!item.is_active ? " cms-footer-link-label--inactive" : ""}`}>
          {isAr ? item.label_ar : item.label_en}
        </span>

        {/* Inactive badge */}
        {!item.is_active && (
          <span className="cms-footer-badge cms-footer-badge--inactive">
            {t("cms.footer.link_disabled")}
          </span>
        )}

        {/* URL preview */}
        {(item.url || item.resolved_url) && (
          <span className="cms-footer-link-url">
            {item.resolved_url || item.url}
          </span>
        )}

        {/* Order — committed when the editor is done with it, not per keystroke */}
        <OrderBox
          value={item.order}
          label={`${t("cms.footer.order")} — ${isAr ? item.label_ar : item.label_en}`}
          onCommit={(next) => onOrderCommit(item, next)}
        />

        {/* Toggle active */}
        <button
          type="button"
          className="cms-footer-btn-edit cms-footer-btn-edit--sm"
          onClick={() => onToggle(item)}
        >
          {item.is_active ? t("cms.footer.disable") : t("cms.footer.enable")}
        </button>

        {/* Delete */}
        <Deletebtn onConfirm={() => onDelete(item.id)} disabled={isDeleting} />
      </div>

      {/* Children */}
      {item.children?.length > 0 && (
        <ul className="cms-footer-links-list cms-footer-links-nested">
          {item.children.map((child) => (
            <TreeItem
              key={child.id}
              item={child}
              isAr={isAr}
              t={t}
              loading={loading}
              onToggle={onToggle}
              onDelete={onDelete}
              onOrderCommit={onOrderCommit}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function FooterCms() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { alert: sweetAlertEl, show: showAlert } = useSweetAlert();

  /* ── state ── */
  const [columns, setColumns] = useState([]);
  const [pages, setPages] = useState([]);
  const [generalSettings, setGeneralSettings] = useState(null);
  const [footerSettings, setFooterSettings] = useState(null);
  const [ctaButtons, setCtaButtons] = useState([]);
  const [activeSection, setActiveSection] = useState("columns");
  const [loading, setLoading] = useState({});

  /* ── What the first load did: loading | ready | failed ── */
  const [pageState, setPageState] = useState({ status: "loading", message: "" });

  /* ── What the server refused, per form ── */
  const [colErrors, setColErrors] = useState({});
  const [colFormError, setColFormError] = useState("");
  const [ctaErrors, setCtaErrors] = useState({});
  const [ctaFormError, setCtaFormError] = useState("");
  const [settingsErrors, setSettingsErrors] = useState({});
  const [settingsFormError, setSettingsFormError] = useState("");
  const [linkErrors, setLinkErrors] = useState({});

  /* ── Column form ── */
  const [colForm, setColForm] = useState(EMPTY_COLUMN);
  const [editColumnId, setEditColumnId] = useState(null);

  // Editing a field clears what the server said about that field, so a
  // corrected value stops carrying the old complaint.
  const setCol = (patch) => {
    setColForm((current) => ({ ...current, ...patch }));
    setColErrors((current) => without(current, Object.keys(patch)));
  };

  /* ── Per-column link forms ── */
  const [linkForms, setLinkForms] = useState({});
  const getLinkForm = (colId) => linkForms[colId] || EMPTY_LINK;
  const setLink = (colId, patch) => {
    setLinkForms((prev) => ({ ...prev, [colId]: { ...(prev[colId] || EMPTY_LINK), ...patch } }));
    setLinkErrors((prev) => {
      const entry = prev[colId];
      if (!entry) return prev;
      return { ...prev, [colId]: { ...entry, fields: without(entry.fields, Object.keys(patch)) } };
    });
  };
  const resetLinkForm = (colId) => {
    setLinkForms((prev) => ({ ...prev, [colId]: EMPTY_LINK }));
    setLinkErrors((prev) => ({ ...prev, [colId]: { fields: {}, message: "" } }));
  };
  const getLinkErrors = (colId) => linkErrors[colId] || { fields: {}, message: "" };

  /* ── Settings form ── */
  const [settingsForm, setSettingsForm] = useState(EMPTY_SETTINGS);
  const setSetting = (patch) => {
    setSettingsForm((current) => ({ ...current, ...patch }));
    setSettingsErrors((current) => without(current, Object.keys(patch)));
  };

  /* ── CTA form ── */
  const [ctaForm, setCtaForm] = useState(EMPTY_CTA);
  const [editCtaId, setEditCtaId] = useState(null);
  const setCta = (patch) => {
    setCtaForm((current) => ({ ...current, ...patch }));
    setCtaErrors((current) => without(current, Object.keys(patch)));
  };

  /* ── Loading helper ── */
  const setLoadingKey = (key, val) =>
    setLoading((prev) => ({ ...prev, [key]: val }));

  /* ══ Pending edits, and the drafts that outlive a closed tab ══
     Nothing on this screen survived a reload: an editor half-way through a
     column, a set of links or the copyright line lost all of it to a stray
     refresh, and the screen never said an edit was pending. */
  const columnDirty = useMemo(() => isFilled(colForm, EMPTY_COLUMN), [colForm]);
  const ctaDirty = useMemo(() => isFilled(ctaForm, EMPTY_CTA), [ctaForm]);
  const linksDirty = useMemo(
    () => Object.values(linkForms).some((form) => isFilled(form, EMPTY_LINK)),
    [linkForms]
  );
  const settingsDirty = useMemo(() => {
    if (!footerSettings) return false;
    return ["newsletter_title_ar", "newsletter_title_en", "copyright_ar", "copyright_en"]
      .some((key) => (settingsForm[key] || "") !== (footerSettings[key] || ""));
  }, [settingsForm, footerSettings]);

  const columnDraft = useFormDraft({
    key: editColumnId ? `footer:column:${editColumnId}` : "footer:column:new",
    values: colForm,
    dirty: columnDirty,
  });
  const ctaDraft = useFormDraft({
    key: editCtaId ? `footer:cta:${editCtaId}` : "footer:cta:new",
    values: ctaForm,
    dirty: ctaDirty,
  });
  const linksDraft = useFormDraft({ key: "footer:links", values: linkForms, dirty: linksDirty });
  // The three files are not carried in a draft — a browser will not hand a
  // chosen file back after a reload — so only the four texts are stored.
  const settingsDraft = useFormDraft({
    key: "footer:settings",
    values: {
      newsletter_title_ar: settingsForm.newsletter_title_ar,
      newsletter_title_en: settingsForm.newsletter_title_en,
      copyright_ar: settingsForm.copyright_ar,
      copyright_en: settingsForm.copyright_en,
    },
    dirty: settingsDirty,
  });

  /** «تعديل غير محفوظ» said in words, where the buttons are. */
  const PendingNote = ({ dirty }) =>
    dirty ? (
      <span className="sf-savebar__dirty">
        {t("form_layer.unsaved", "تعديل غير محفوظ")}
      </span>
    ) : null;

  /* ══ Load Data ══ */
  /**
   * `quiet` is for the refresh that follows a write: the screen already has
   * its content and should not blink back to a loading state to fetch it again.
   */
  const loadData = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setPageState({ status: "loading", message: "" });

    try {
      const [colRes, pagesRes] = await Promise.all([
        api.get(API_PATHS.cms.columns),
        api.get(API_PATHS.cms.pages),
      ]);
      setColumns(colRes.data);
      setPages(pagesRes.data);
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.canceled) return;

      // The screen used to swallow this and render as though the footer simply
      // had no columns, so an outage looked exactly like a wiped footer.
      setPageState({ status: "failed", message: parsed.message });
      return;
    }

    // The three below are decoration for the columns tab; the screen still
    // works without them, so a failure here does not blank the page.
    try {
      const genRes = await api.get(API_PATHS.public.settings);
      setGeneralSettings(genRes.data);
    } catch { /* optional */ }
    try {
      const fsRes = await api.get(API_PATHS.cms.footerSettings);
      setFooterSettings(fsRes.data);
      setSettingsForm({
        newsletter_title_ar: fsRes.data.newsletter_title_ar || "",
        newsletter_title_en: fsRes.data.newsletter_title_en || "",
        copyright_ar: fsRes.data.copyright_ar || "",
        copyright_en: fsRes.data.copyright_en || "",
        logo_ar: null, logo_en: null, vat_logo: null,
      });
    } catch { /* optional */ }
    try {
      const ctaRes = await api.get(API_PATHS.cms.footerCtas);
      setCtaButtons(ctaRes.data);
    } catch { /* optional */ }

    setPageState({ status: "ready", message: "" });
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* ══ Submit Column ══ */
  const submitColumn = async (e) => {
    e.preventDefault();
    const key = editColumnId ? `col-update-${editColumnId}` : "col-create";
    setLoadingKey(key, true);
    setColErrors({});
    setColFormError("");
    try {
      if (editColumnId) {
        await api.patch(API_PATHS.cms.column(editColumnId), colForm);
        toast.success(t("cms.footer.column_updated"));
      } else {
        await api.post(API_PATHS.cms.columns, colForm);
        toast.success(t("cms.footer.column_created"));
      }
      columnDraft.clear();
      resetColumnForm();
      loadData({ quiet: true });
    } catch (err) {
      const parsed = notifyError(err, t("cms.footer.column_save_failed"));
      setColErrors(parsed.fields);
      setColFormError(parsed.message);
      focusRejected(parsed.fields);
    } finally {
      setLoadingKey(key, false);
    }
  };

  const resetColumnForm = () => {
    setColForm(EMPTY_COLUMN);
    setColErrors({});
    setColFormError("");
    setEditColumnId(null);
  };

  const handleDeleteColumn = async (id) => {
    const confirmed = await showAlert({
      type: "confirm",
      title: t("cms.footer.confirm_delete_column_title"),
      message: t("cms.footer.confirm_delete_column_text"),
      confirmText: t("cms.footer.delete_button"),
      cancelText: t("cms.footer.cancel_button"),
      showCancel: true,
      isRtl: isAr,
    });
    if (!confirmed) return;
    setLoadingKey(`col-delete-${id}`, true);
    try {
      await api.delete(API_PATHS.cms.column(id));
      toast.success(t("cms.footer.column_deleted"));
      loadData({ quiet: true });
    } catch (err) {
      notifyError(err, t("cms.footer.column_save_failed"));
    } finally {
      setLoadingKey(`col-delete-${id}`, false);
    }
  };

  /* ══ Submit Link ══ */
  const submitLink = async (e, colId) => {
    e.preventDefault();
    const form = getLinkForm(colId);
    if (form.url && form.page) return toast.error(t("cms.footer.link_conflict"));
    if (!form.url && !form.page) return toast.error(t("cms.footer.link_conflict"));

    const payload = {
      column: colId,
      label_ar: form.label_ar,
      label_en: form.label_en,
      order: form.order,
      is_active: form.is_active,
    };
    if (form.parent) payload.parent = form.parent;
    if (form.page) {
      payload.page = form.page;
    } else {
      payload.url = normalizeSlug(form.url);
    }

    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== "") fd.append(k, String(v));
    });

    const key = `link-create-${colId}`;
    setLoadingKey(key, true);
    setLinkErrors((prev) => ({ ...prev, [colId]: { fields: {}, message: "" } }));
    try {
      await api.post(API_PATHS.cms.footerLinks, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(t("cms.footer.link_created"));
      resetLinkForm(colId);
      loadData({ quiet: true });
    } catch (err) {
      const parsed = notifyError(err, t("cms.footer.link_save_failed"));
      setLinkErrors((prev) => ({
        ...prev,
        [colId]: { fields: parsed.fields, message: parsed.message },
      }));
      focusRejected(parsed.fields);
    } finally {
      setLoadingKey(key, false);
    }
  };

  const handleDeleteLink = async (id) => {
    const confirmed = await showAlert({
      type: "confirm",
      title: t("cms.footer.confirm_delete_link_title"),
      message: t("cms.footer.confirm_delete_link_text"),
      confirmText: t("cms.footer.delete_button"),
      cancelText: t("cms.footer.cancel_button"),
      showCancel: true,
      isRtl: isAr,
    });
    if (!confirmed) return;
    setLoadingKey(`link-delete-${id}`, true);
    try {
      await api.delete(API_PATHS.cms.footerLink(id));
      toast.success(t("cms.footer.link_deleted"));
      loadData({ quiet: true });
    } catch (err) {
      notifyError(err, t("cms.footer.link_save_failed"));
    } finally {
      setLoadingKey(`link-delete-${id}`, false);
    }
  };

  const handleToggleLinkActive = async (link) => {
    try {
      await api.patch(API_PATHS.cms.footerLink(link.id), { is_active: !link.is_active });
      toast.success(t("cms.footer.order_updated"));
      loadData({ quiet: true });
    } catch (err) {
      notifyError(err, t("cms.footer.link_save_failed"));
    }
  };

  const handleLinkOrderCommit = async (link, order) => {
    try {
      await api.patch(API_PATHS.cms.footerLink(link.id), { order });
      toast.success(t("cms.footer.order_updated"));
      loadData({ quiet: true });
    } catch (err) {
      notifyError(err, t("cms.footer.link_save_failed"));
    }
  };

  const handleColumnOrderCommit = async (col, order) => {
    try {
      await api.patch(API_PATHS.cms.column(col.id), { order });
      toast.success(t("cms.footer.order_updated"));
      loadData({ quiet: true });
    } catch (err) {
      notifyError(err, t("cms.footer.column_save_failed"));
    }
  };

  /* ══ Submit Footer Settings ══ */
  const submitFooterSettings = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("newsletter_title_ar", settingsForm.newsletter_title_ar);
    fd.append("newsletter_title_en", settingsForm.newsletter_title_en);
    fd.append("copyright_ar", settingsForm.copyright_ar);
    fd.append("copyright_en", settingsForm.copyright_en);
    if (settingsForm.logo_ar) fd.append("logo_ar", settingsForm.logo_ar);
    if (settingsForm.logo_en) fd.append("logo_en", settingsForm.logo_en);
    if (settingsForm.vat_logo) fd.append("vat_logo", settingsForm.vat_logo);

    setLoadingKey("settings-save", true);
    setSettingsErrors({});
    setSettingsFormError("");
    try {
      await api.post(API_PATHS.cms.footerSettings, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(t("cms.footer.settings_saved"));
      settingsDraft.clear();
      loadData({ quiet: true });
    } catch (err) {
      const parsed = notifyError(err, t("cms.footer.column_save_failed"));
      setSettingsErrors(parsed.fields);
      setSettingsFormError(parsed.message);
      focusRejected(parsed.fields);
    } finally {
      setLoadingKey("settings-save", false);
    }
  };

  /* ══ Submit CTA ══ */
  const submitCta = async (e) => {
    e.preventDefault();
    if (ctaForm.url && ctaForm.page) return toast.error(t("cms.footer.link_conflict"));
    if (!ctaForm.url && !ctaForm.page) return toast.error(t("cms.footer.link_conflict"));
    if (!editCtaId && ctaButtons.length >= 3) return toast.error(t("cms.footer.cta_max_reached"));

    const payload = {
      title_ar: ctaForm.title_ar,
      title_en: ctaForm.title_en,
      description_ar: ctaForm.description_ar,
      description_en: ctaForm.description_en,
      order: ctaForm.order,
      is_active: ctaForm.is_active,
    };
    if (ctaForm.page) {
      payload.page = ctaForm.page;
    } else {
      payload.url = normalizeSlug(ctaForm.url);
    }

    const key = editCtaId ? `cta-update-${editCtaId}` : "cta-create";
    setLoadingKey(key, true);
    setCtaErrors({});
    setCtaFormError("");
    try {
      if (editCtaId) {
        await api.patch(API_PATHS.cms.footerCta(editCtaId), payload);
        toast.success(t("cms.footer.column_updated"));
      } else {
        await api.post(API_PATHS.cms.footerCtas, payload);
        toast.success(t("cms.footer.column_created"));
      }
      ctaDraft.clear();
      resetCtaForm();
      loadData({ quiet: true });
    } catch (err) {
      const parsed = notifyError(err, t("cms.footer.column_save_failed"));
      setCtaErrors(parsed.fields);
      setCtaFormError(parsed.message);
      focusRejected(parsed.fields);
    } finally {
      setLoadingKey(key, false);
    }
  };

  const resetCtaForm = () => {
    setCtaForm(EMPTY_CTA);
    setCtaErrors({});
    setCtaFormError("");
    setEditCtaId(null);
  };

  const handleDeleteCta = async (id) => {
    const confirmed = await showAlert({
      type: "confirm",
      title: t("cms.footer.confirm_delete_link_title"),
      message: t("cms.footer.confirm_delete_link_text"),
      confirmText: t("cms.footer.delete_button"),
      cancelText: t("cms.footer.cancel_button"),
      showCancel: true,
      isRtl: isAr,
    });
    if (!confirmed) return;
    setLoadingKey(`cta-delete-${id}`, true);
    try {
      await api.delete(API_PATHS.cms.footerCta(id));
      toast.success(t("cms.footer.link_deleted"));
      loadData({ quiet: true });
    } catch (err) {
      notifyError(err, t("cms.footer.link_save_failed"));
    } finally {
      setLoadingKey(`cta-delete-${id}`, false);
    }
  };

  /* ══ Column content by key ══ */
  const renderColumnContent = (col) => {
    if (col.key === "social") {
      return (
        <>
          <div className="cms-footer-info-box cms-footer-info-box--warning">
            <IconInfo />
            {t("cms.footer.edit_in_settings")}
          </div>
          {generalSettings && (
            <ul className="cms-footer-links-list cms-footer-links-list--spaced">
              {["linkedin_url", "x_url", "instagram_url"].map((key) =>
                generalSettings[key] ? (
                  <li key={key} className="cms-footer-link-item cms-footer-link-auto">
                    <div className="cms-footer-link-content">
                      <span className="cms-footer-link-icon"><IconLink /></span>
                      <span className="cms-footer-link-label">
                        {key === "linkedin_url" ? "LinkedIn" : key === "x_url" ? "X" : "Instagram"}
                      </span>
                      <span className="cms-footer-badge cms-footer-badge--auto">
                        {t("cms.footer.auto_from_settings")}
                      </span>
                    </div>
                  </li>
                ) : null
              )}
            </ul>
          )}
        </>
      );
    }

    if (col.key === "newsletter") {
      return (
        <div className="cms-footer-info-box cms-footer-info-box--info">
          <IconInfo />
          {t("cms.footer.newsletter_info")}
        </div>
      );
    }

    return (
      <ul className="cms-footer-links-list">
        {col.links?.map((l) => (
          <TreeItem
            key={l.id}
            item={l}
            isAr={isAr}
            t={t}
            loading={loading}
            onToggle={handleToggleLinkActive}
            onDelete={handleDeleteLink}
            onOrderCommit={handleLinkOrderCommit}
          />
        ))}
        {(!col.links || col.links.length === 0) && (
          <li className="cms-footer-links-empty">
            <IconPlus />
            {t("cms.footer.no_links_yet")}
          </li>
        )}
      </ul>
    );
  };

  /* ══ Add Link Form per column ══ */
  const renderAddLinkForm = (col) => {
    if (col.key === "social") return null;
    const form = getLinkForm(col.id);
    const errors = getLinkErrors(col.id);
    const rootLinks = col.links?.filter((l) => !l.parent) || [];
    const isSaving = loading[`link-create-${col.id}`];
    const isDisabled = !form.label_ar.trim() || !form.label_en.trim();

    return (
      <div className="cms-footer-add-link-section">
        <h4 className="cms-footer-add-link-title">
          <IconPlus />
          {t("cms.footer.add_link")}
        </h4>

        <form onSubmit={(e) => submitLink(e, col.id)}>
          <div className="cms-footer-form-section">
            {/* Row 1: AR + EN labels */}
            <div className="cms-footer-form-row">
              <div className="cms-footer-form-group">
                <label className="cms-footer-label" htmlFor={`link-ar-${col.id}`}>
                  {t("cms.footer.link_label_ar")}
                </label>
                <input
                  id={`link-ar-${col.id}`}
                  data-field="label_ar"
                  className="cms-footer-input"
                  required
                  placeholder={t("cms.footer.link_label_ar_placeholder")}
                  value={form.label_ar}
                  onChange={(e) => setLink(col.id, { label_ar: e.target.value })}
                  dir="rtl"
                />
                <FieldError message={errors.fields.label_ar} />
              </div>
              <div className="cms-footer-form-group">
                <label className="cms-footer-label" htmlFor={`link-en-${col.id}`}>
                  {t("cms.footer.link_label_en")}
                </label>
                <input
                  id={`link-en-${col.id}`}
                  data-field="label_en"
                  className="cms-footer-input"
                  required
                  placeholder={t("cms.footer.link_label_en_placeholder")}
                  value={form.label_en}
                  onChange={(e) => setLink(col.id, { label_en: e.target.value })}
                />
                <FieldError message={errors.fields.label_en} />
              </div>
            </div>

            {/* Row 2: URL + Page */}
            <div className="cms-footer-form-row">
              <div className="cms-footer-form-group">
                {/* The column's own «المفتاح» box used to stand here, bound to the
                    add-column form's state and marked required. A link could not
                    be saved until it was filled, and filling it quietly rewrote
                    the key of the column form up the page. It belongs to that
                    form alone, and it is there. */}
                <label className="cms-footer-label" htmlFor={`link-url-${col.id}`}>
                  {t("cms.footer.url")}
                  <span className="cms-footer-label-hint">{t("cms.footer.url_hint")}</span>
                </label>
                <input
                  id={`link-url-${col.id}`}
                  data-field="url"
                  className="cms-footer-input"
                  placeholder="/about-us"
                  value={form.url}
                  disabled={!!form.page}
                  onChange={(e) => setLink(col.id, { url: e.target.value, page: "" })}
                />
                <FieldError message={errors.fields.url} />
              </div>
              <div className="cms-footer-form-group">
                {/* <label className="cms-footer-label">{t("cms.footer.select_page")}</label>
                <select
                  className="cms-footer-select"
                  value={form.page}
                  disabled={!!form.url}
                  onChange={(e) => setLinkForm(col.id, { ...form, page: e.target.value, url: "" })}
                >
                  <option value="">{t("cms.footer.select_page_option")}</option>
                  {pages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {isAr ? p.title_ar : p.title_en}
                    </option>
                  ))}
                </select> */}
              </div>
            </div>

            {/* Row 3: Parent + Order */}
            <div className="cms-footer-form-row">
              <div className="cms-footer-form-group">
                <label className="cms-footer-label" htmlFor={`link-parent-${col.id}`}>
                  {t("cms.footer.parent_link")}
                </label>
                <select
                  id={`link-parent-${col.id}`}
                  data-field="parent"
                  className="cms-footer-select"
                  value={form.parent}
                  onChange={(e) => setLink(col.id, { parent: e.target.value })}
                >
                  <option value="">{t("cms.footer.no_parent")}</option>
                  {rootLinks.map((l) => (
                    <option key={l.id} value={l.id}>
                      {isAr ? l.label_ar : l.label_en}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.fields.parent} />
              </div>
              <div className="cms-footer-form-group">
                <label className="cms-footer-label" htmlFor={`link-order-${col.id}`}>
                  {t("cms.footer.order")}
                </label>
                <input
                  id={`link-order-${col.id}`}
                  data-field="order"
                  className="cms-footer-input"
                  type="number"
                  placeholder="0"
                  value={form.order}
                  onChange={(e) => setLink(col.id, { order: e.target.value })}
                />
                <FieldError message={errors.fields.order} />
              </div>
            </div>

            {/* Row 4: Checkbox + spacer (grid-aligned) */}
            <div className="cms-footer-form-row">
              <div className="cms-footer-form-group cms-footer-form-group--checkbox">
                <label className="cms-footer-checkbox-label">
                  <input
                    type="checkbox"
                    className="cms-footer-checkbox"
                    checked={form.is_active}
                    onChange={(e) => setLink(col.id, { is_active: e.target.checked })}
                  />
                  <span className="cms-footer-checkbox-text">{t("cms.footer.active")}</span>
                </label>
              </div>
              {/* Spacer to maintain grid alignment */}
              <div />
            </div>
          </div>

          <FormError message={errors.message} />

          <div className="cms-footer-form-actions">
            <PendingNote dirty={isFilled(form, EMPTY_LINK)} />
            <button
              type="submit"
              className="cms-footer-btn-primary"
              disabled={isDisabled || isSaving}
            >
              {isSaving ? <Spinner /> : <IconSave />}
              {t("cms.footer.save_link")}
            </button>
            <button
              type="button"
              className="cms-footer-btn-secondary"
              onClick={() => resetLinkForm(col.id)}
            >
              <IconX />
              {t("cms.footer.cancel")}
            </button>
          </div>
        </form>
      </div>
    );
  };

  /* ══ Tabs ══ */
  const tabs = [
    { key: "columns", label: t("cms.footer.tab_columns"), icon: <IconColumns /> },
    { key: "cta", label: t("cms.footer.tab_cta"), icon: <IconStar /> },
    { key: "settings", label: t("cms.footer.tab_settings"), icon: <IconSettings /> },
  ];

  /* ══ Column form validity ══ */
  const colFormValid =
    colForm.key.trim() &&
    colForm.title_ar.trim() &&
    colForm.title_en.trim();
  const colSaving = loading[editColumnId ? `col-update-${editColumnId}` : "col-create"];

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */

  // While the first load runs, and if it fails. The screen used to render its
  // forms over an empty `columns`, so an outage was indistinguishable from a
  // footer with nothing in it.
  if (pageState.status === "loading") {
    return (
      <div className="cms-footer-root">
        <div className="cms-footer-header">
          <div className="cms-footer-header-content">
            <h1 className="cms-footer-title">{t("cms.footer.title")}</h1>
            <p className="cms-footer-subtitle">{t("cms.footer.subtitle")}</p>
          </div>
        </div>
        <div className="cms-footer-card" data-state="loading">
          <UiSpinner size={20} label={t("states.loading", "جار التحميل")} />
        </div>
      </div>
    );
  }

  if (pageState.status === "failed") {
    return (
      <div className="cms-footer-root">
        {sweetAlertEl}
        <div className="cms-footer-header">
          <div className="cms-footer-header-content">
            <h1 className="cms-footer-title">{t("cms.footer.title")}</h1>
            <p className="cms-footer-subtitle">{t("cms.footer.subtitle")}</p>
          </div>
        </div>
        <div className="cms-footer-card" data-state="failed">
          <EmptyState
            title={t("states.error_title", "تعذر جلب البيانات")}
            hint={pageState.message || t("states.error_hint", "تحقق من الاتصال ثم أعد المحاولة.")}
            action={
              <Button onClick={() => loadData()}>
                {t("states.retry", "أعد المحاولة")}
              </Button>
            }
          />
        <FieldError message={ctaErrors.url} />
        </div>
      </div>
    );
  }

  return (
    <div className="cms-footer-root">
      {/* SweetAlert portal */}
      {sweetAlertEl}

      {/* ── Page Header ── */}
      <div className="cms-footer-header">
        <div className="cms-footer-header-content">
          <h1 className="cms-footer-title">{t("cms.footer.title")}</h1>
          <p className="cms-footer-subtitle">{t("cms.footer.subtitle")}</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="cms-footer-tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeSection === tab.key}
            className={`cms-footer-tab${activeSection === tab.key ? " cms-footer-tab--active" : ""}`}
            onClick={() => setActiveSection(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════ COLUMNS & LINKS ══════════════ */}
      {activeSection === "columns" && (
        <div className="cms-footer-tab-content" key="columns">
          {/* Create / Edit Column Form */}
          <div className="cms-footer-card">
            <div className="cms-footer-card-header">
              <div className="cms-footer-card-header-left">
                <IconColumns />
                <h3 className="cms-footer-card-title">
                  {editColumnId ? t("cms.footer.edit_column") : t("cms.footer.create_column")}
                </h3>
              </div>
              {editColumnId && (
                <button className="cms-footer-btn-secondary" onClick={resetColumnForm}>
                  <IconX />
                  {t("cms.footer.cancel")}
                </button>
              )}
            </div>

            <DraftNotice
              draft={columnDraft.draft}
              onRestore={() => {
                const stored = columnDraft.restore();
                if (stored) setColForm({ ...EMPTY_COLUMN, ...stored });
              }}
              onDiscard={columnDraft.discard}
            />

            <form onSubmit={submitColumn}>
              <div className="cms-footer-form-section">
                {/* Column Key */}
                <div className="cms-footer-form-row">
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label" htmlFor="column-key">
                      {t("cms.footer.key_label", "المفتاح")}
                    </label>

                    <input
                      id="column-key"
                      data-field="key"
                      className="cms-footer-input"
                      required
                      placeholder="company_links"
                      value={colForm.key}
                      onChange={(e) =>
                        setCol({ key: e.target.value.toLowerCase().replace(/\s+/g, "_") })
                      }
                    />
                    <FieldError message={colErrors.key} />
                  </div>
                </div>
                {/* Row 1: AR + EN titles */}
                <div className="cms-footer-form-row">
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label" htmlFor="column-title-ar">
                      {t("cms.footer.title_ar")}
                    </label>
                    <input
                      id="column-title-ar"
                      data-field="title_ar"
                      className="cms-footer-input"
                      required
                      placeholder={t("cms.footer.title_ar_placeholder")}
                      value={colForm.title_ar}
                      onChange={(e) => setCol({ title_ar: e.target.value })}
                      dir="rtl"
                    />
                    <FieldError message={colErrors.title_ar} />
                  </div>
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label" htmlFor="column-title-en">
                      {t("cms.footer.title_en")}
                    </label>
                    <input
                      id="column-title-en"
                      data-field="title_en"
                      className="cms-footer-input"
                      required
                      placeholder={t("cms.footer.title_en_placeholder")}
                      value={colForm.title_en}
                      onChange={(e) => setCol({ title_en: e.target.value })}
                    />
                    <FieldError message={colErrors.title_en} />
                  </div>
                </div>

                {/* Row 2: Order + Checkbox */}
                <div className="cms-footer-form-row">
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label" htmlFor="column-order">
                      {t("cms.footer.order")}
                    </label>
                    <input
                      id="column-order"
                      data-field="order"
                      className="cms-footer-input"
                      type="number"
                      placeholder="0"
                      value={colForm.order}
                      onChange={(e) => setCol({ order: e.target.value })}
                    />
                    <FieldError message={colErrors.order} />
                  </div>
                  <div className="cms-footer-form-group cms-footer-form-group--checkbox">
                    <label className="cms-footer-checkbox-label">
                      <input
                        type="checkbox"
                        className="cms-footer-checkbox"
                        checked={colForm.is_active}
                        onChange={(e) => setCol({ is_active: e.target.checked })}
                      />
                      <span className="cms-footer-checkbox-text">{t("cms.footer.active")}</span>
                    </label>
                  </div>
                </div>
              </div>

              <FormError message={colFormError} />

              <div className="cms-footer-form-actions">
                <PendingNote dirty={columnDirty} />
                <button
                  type="submit"
                  className="cms-footer-btn-primary"
                  disabled={!colFormValid || colSaving}
                >
                  {colSaving ? <Spinner /> : <IconSave />}
                  {editColumnId ? t("cms.footer.update") : t("cms.footer.create")}
                </button>
                {editColumnId && (
                  <button type="button" className="cms-footer-btn-secondary" onClick={resetColumnForm}>
                    <IconX />
                    {t("cms.footer.cancel")}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* An edit to the link forms that was interrupted before it was sent */}
          <DraftNotice
            draft={linksDraft.draft}
            onRestore={() => {
              const stored = linksDraft.restore();
              if (stored) setLinkForms(stored);
            }}
            onDiscard={linksDraft.discard}
          />

          {/* Nothing here yet, said rather than shown as a blank page */}
          {columns.length === 0 && (
            <div className="cms-footer-card">
              <EmptyState
                title={t("states.empty", "لا توجد بيانات")}
                hint={t("states.empty_hint", "لم يضف شيء بعد.")}
              />
            <FieldError message={ctaErrors.title_ar} />
            </div>
          )}

          {/* Columns list */}
          {columns.map((col) => {
            const isSystem = SYSTEM_COLUMN_KEYS.includes(col.key);
            const isDeleting = loading[`col-delete-${col.id}`];

            return (
              <div key={col.id} className="cms-footer-card">
                {/* Column header */}
                <div className="cms-footer-card-header">
                  <div className="cms-footer-card-header-left">
                    <IconColumns />
                    <h3 className="cms-footer-card-title">
                      {isAr ? col.title_ar : col.title_en}
                    </h3>
                    {isSystem && (
                      <span className="cms-footer-badge cms-footer-badge--system">
                        {t("cms.footer.system_badge")}
                      </span>
                    )}
                    {!col.is_active && (
                      <span className="cms-footer-badge cms-footer-badge--inactive">
                        {t("cms.footer.link_disabled")}
                      </span>
                    )}
                  </div>

                  <div className="cms-footer-card-actions">
                    <span className="cms-footer-order-label">{t("cms.footer.order")}</span>
                    <OrderBox
                      value={col.order}
                      label={`${t("cms.footer.order")} — ${isAr ? col.title_ar : col.title_en}`}
                      onCommit={(next) => handleColumnOrderCommit(col, next)}
                    />
                    <Editbtn
                      onClick={() => {
                        setEditColumnId(col.id);
                        setColForm({
                          key: col.key || "",
                          title_ar: col.title_ar,
                          title_en: col.title_en,
                          order: col.order,
                          is_active: col.is_active,
                        });

                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                      }}
                    />
                    {!isSystem && (
                      <Deletebtn
                        onConfirm={() => handleDeleteColumn(col.id)}
                        disabled={isDeleting}
                      />
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="cms-footer-section-divider">
                  <div className="cms-footer-section-divider-line" />
                  <span className="cms-footer-section-divider-label">
                    {isAr ? col.title_ar : col.title_en}
                  </span>
                  <div className="cms-footer-section-divider-line" />
                </div>

                {/* Column content */}
                {renderColumnContent(col)}

                {/* Add link form */}
                {renderAddLinkForm(col)}
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════ CTA BUTTONS ══════════════ */}
      {activeSection === "cta" && (
        <div className="cms-footer-tab-content" key="cta">
          {/* CTA form card */}
          <div className="cms-footer-card">
            <div className="cms-footer-card-header">
              <div className="cms-footer-card-header-left">
                <IconStar />
                <h3 className="cms-footer-card-title">
                  {editCtaId ? t("cms.footer.edit_cta") : t("cms.footer.add_cta")}
                </h3>
              </div>
              {editCtaId && (
                <button className="cms-footer-btn-secondary" onClick={resetCtaForm}>
                  <IconX />
                  {t("cms.footer.cancel")}
                </button>
              )}
            </div>

            {!editCtaId && ctaButtons.length >= 3 && (
              <div className="cms-footer-info-box cms-footer-info-box--warning" style={{ marginBottom: 16 }}>
                <IconInfo />
                {t("cms.footer.cta_max_notice")}
              </div>
            )}

            <DraftNotice
              draft={ctaDraft.draft}
              onRestore={() => {
                const stored = ctaDraft.restore();
                if (stored) setCtaForm({ ...EMPTY_CTA, ...stored });
              }}
              onDiscard={ctaDraft.discard}
            />

            <form onSubmit={submitCta}>
              <div className="cms-footer-form-section">
                {/* Row 1: Title AR + EN */}
                <div className="cms-footer-form-row">
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">{t("cms.footer.title_ar")}</label>
                    <input
                      className="cms-footer-input"
                      required
                      placeholder={t("cms.footer.title_ar_placeholder")}
                      value={ctaForm.title_ar}
                      data-field="title_ar"
                      onChange={(e) => setCta({ title_ar: e.target.value })}
                      dir="rtl"
                    />
                  <FieldError message={ctaErrors.title_en} />
                  </div>
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">{t("cms.footer.title_en")}</label>
                    <input
                      className="cms-footer-input"
                      required
                      placeholder={t("cms.footer.title_en_placeholder")}
                      value={ctaForm.title_en}
                      data-field="title_en"
                      onChange={(e) => setCta({ title_en: e.target.value })}
                    />
                  <FieldError message={ctaErrors.order} />
                  </div>
                </div>

                {/* Row 2: Desc AR + EN */}
                <div className="cms-footer-form-row">
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">{t("cms.footer.desc_ar")}</label>
                    <input
                      className="cms-footer-input"
                      placeholder={t("cms.footer.desc_ar_placeholder")}
                      value={ctaForm.description_ar}
                      data-field="description_ar"
                      onChange={(e) => setCta({ description_ar: e.target.value })}
                      dir="rtl"
                    />
                  <FieldError message={ctaErrors.description_ar} />
                  </div>
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">{t("cms.footer.desc_en")}</label>
                    <input
                      className="cms-footer-input"
                      placeholder={t("cms.footer.desc_en_placeholder")}
                      value={ctaForm.description_en}
                      data-field="description_en"
                      onChange={(e) => setCta({ description_en: e.target.value })}
                    />
                  <FieldError message={ctaErrors.description_en} />
                  </div>
                </div>

                {/* Row 3: URL + Page */}
                <div className="cms-footer-form-row">
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">
                      {t("cms.footer.url")}
                      <span className="cms-footer-label-hint">{t("cms.footer.cta_url_hint")}</span>
                    </label>
                    <input
                      className="cms-footer-input"
                      placeholder="/contact"
                      value={ctaForm.url}
                      data-field="url"
                      disabled={!!ctaForm.page}
                      onChange={(e) => setCta({ url: e.target.value, page: "" })}
                    />
                  </div>
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">{t("cms.footer.select_page")}</label>
                    <select
                      className="cms-footer-select"
                      value={ctaForm.page}
                      data-field="page"
                      disabled={!!ctaForm.url}
                      onChange={(e) => setCta({ page: e.target.value, url: "" })}
                    >
                      <option value="">{t("cms.footer.select_page_option")}</option>
                      {pages.map((p) => (
                        <option key={p.id} value={p.id}>
                          {isAr ? p.title_ar : p.title_en}
                        </option>
                      ))}
                    </select>
                  <FieldError message={ctaErrors.page} />
                  </div>
                </div>

                {/* Row 4: Order + Checkbox */}
                <div className="cms-footer-form-row">
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">{t("cms.footer.order")}</label>
                    <input
                      className="cms-footer-input"
                      type="number"
                      placeholder="0"
                      value={ctaForm.order}
                      data-field="order"
                      onChange={(e) => setCta({ order: e.target.value })}
                    />
                  </div>
                  <div className="cms-footer-form-group cms-footer-form-group--checkbox">
                    <label className="cms-footer-checkbox-label">
                      <input
                        type="checkbox"
                        className="cms-footer-checkbox"
                        checked={ctaForm.is_active}
                        onChange={(e) => setCta({ is_active: e.target.checked })}
                      />
                      <span className="cms-footer-checkbox-text">{t("cms.footer.active")}</span>
                    </label>
                  </div>
                </div>
              </div>

              <FormError message={ctaFormError} />

              <div className="cms-footer-form-actions">
                <PendingNote dirty={ctaDirty} />
                <button
                  type="submit"
                  className="cms-footer-btn-primary"
                  disabled={(!editCtaId && ctaButtons.length >= 3) || loading[editCtaId ? `cta-update-${editCtaId}` : "cta-create"]}
                >
                  {loading[editCtaId ? `cta-update-${editCtaId}` : "cta-create"] ? <Spinner /> : <IconSave />}
                  {editCtaId ? t("cms.footer.update") : t("cms.footer.create")}
                </button>
                {editCtaId && (
                  <button type="button" className="cms-footer-btn-secondary" onClick={resetCtaForm}>
                    <IconX />
                    {t("cms.footer.cancel")}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Empty state */}
          {ctaButtons.length === 0 && (
            <div className="cms-footer-links-empty">
              <IconStar />
              {t("cms.footer.no_cta_yet")}
            </div>
          )}

          {/* CTA items */}
          {ctaButtons.map((cta) => {
            const isDeleting = loading[`cta-delete-${cta.id}`];
            return (
              <div key={cta.id} className="cms-footer-card">
                <div className="cms-footer-card-header">
                  <div className="cms-footer-card-header-left">
                    <IconStar />
                    <h3 className={`cms-footer-card-title${!cta.is_active ? " cms-footer-card-title--inactive" : ""}`}>
                      {isAr ? cta.title_ar : cta.title_en}
                    </h3>
                    {!cta.is_active && (
                      <span className="cms-footer-badge cms-footer-badge--inactive">
                        {t("cms.footer.link_disabled")}
                      </span>
                    )}
                  </div>

                  <div className="cms-footer-card-actions">
                    <span className="cms-footer-cta-url">
                      {cta.resolved_url || cta.url || ""}
                    </span>
                    <Editbtn
                      onClick={() => {

                        setEditCtaId(cta.id);
                        setCtaForm({
                          title_ar: cta.title_ar,
                          title_en: cta.title_en,
                          description_ar: cta.description_ar || "",
                          description_en: cta.description_en || "",
                          url: cta.url || "",
                          page: cta.page ? String(cta.page) : "",
                          order: cta.order,
                          is_active: cta.is_active,
                        });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />
                    <Deletebtn
                      onConfirm={() => handleDeleteCta(cta.id)}
                      disabled={isDeleting}
                    />
                  </div>
                </div>

                {(cta.description_ar || cta.description_en) && (
                  <p className="cms-footer-cta-desc">
                    {isAr ? cta.description_ar : cta.description_en}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════ FOOTER SETTINGS ══════════════ */}
      {activeSection === "settings" && (
        <div className="cms-footer-tab-content" key="settings">
          <div className="cms-footer-card">
            <div className="cms-footer-card-header">
              <div className="cms-footer-card-header-left">
                <IconSettings />
                <h3 className="cms-footer-card-title">{t("cms.footer.tab_settings")}</h3>
              </div>
            </div>

            <DraftNotice
              draft={settingsDraft.draft}
              onRestore={() => {
                const stored = settingsDraft.restore();
                if (stored) setSettingsForm((current) => ({ ...current, ...stored }));
              }}
              onDiscard={settingsDraft.discard}
            />

            <form onSubmit={submitFooterSettings}>
              <div className="cms-footer-form-section">
                {/* Newsletter section */}
                <p className="cms-footer-section-heading">{t("cms.footer.section_newsletter_title")}</p>
                <div className="cms-footer-form-row">
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">{t("cms.footer.title_ar")}</label>
                    <input
                      className="cms-footer-input"
                      placeholder={t("cms.footer.newsletter_title_ar_placeholder")}
                      value={settingsForm.newsletter_title_ar}
                      data-field="newsletter_title_ar"
                      onChange={(e) => setSetting({ newsletter_title_ar: e.target.value })}
                      dir="rtl"
                    />
                  <FieldError message={settingsErrors.newsletter_title_ar} />
                  </div>
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">{t("cms.footer.title_en")}</label>
                    <input
                      className="cms-footer-input"
                      placeholder={t("cms.footer.newsletter_title_en_placeholder")}
                      value={settingsForm.newsletter_title_en}
                      data-field="newsletter_title_en"
                      onChange={(e) => setSetting({ newsletter_title_en: e.target.value })}
                    />
                  <FieldError message={settingsErrors.newsletter_title_en} />
                  </div>
                </div>

                {/* Copyright section */}
                <div className="cms-footer-section-divider" style={{ margin: "20px 0 16px" }}>
                  <div className="cms-footer-section-divider-line" />
                  <span className="cms-footer-section-divider-label">{t("cms.footer.section_copyright")}</span>
                  <div className="cms-footer-section-divider-line" />
                </div>

                <div className="cms-footer-form-row">
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">{t("cms.footer.title_ar")}</label>
                    <input
                      className="cms-footer-input"
                      placeholder={t("cms.footer.copyright_ar_placeholder")}
                      value={settingsForm.copyright_ar}
                      data-field="copyright_ar"
                      onChange={(e) => setSetting({ copyright_ar: e.target.value })}
                      dir="rtl"
                    />
                  <FieldError message={settingsErrors.copyright_ar} />
                  </div>
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">{t("cms.footer.title_en")}</label>
                    <input
                      className="cms-footer-input"
                      placeholder={t("cms.footer.copyright_en_placeholder")}
                      value={settingsForm.copyright_en}
                      data-field="copyright_en"
                      onChange={(e) => setSetting({ copyright_en: e.target.value })}
                    />
                  <FieldError message={settingsErrors.copyright_en} />
                  </div>
                </div>

                {/* Logos section */}
                <div className="cms-footer-section-divider" style={{ margin: "20px 0 16px" }}>
                  <div className="cms-footer-section-divider-line" />
                  <span className="cms-footer-section-divider-label">{t("cms.footer.section_logos")}</span>
                  <div className="cms-footer-section-divider-line" />
                </div>

                <div className="cms-footer-form-row cms-footer-form-row--3col">
                  {/* Logo AR */}
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">{t("cms.footer.logo_ar_label")}</label>
                    {footerSettings?.logo_ar && (
                      <div className="cms-footer-logo-preview">
                        <div className="cms-footer-logo-image-wrap">
                          <img src={footerSettings.logo_ar} alt="Logo AR" />
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="cms-footer-input-file"
                      onChange={(e) => setSetting({ logo_ar: e.target.files[0] || null })}
                    />
                  </div>

                  {/* Logo EN */}
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">{t("cms.footer.logo_en_label")}</label>
                    {footerSettings?.logo_en && (
                      <div className="cms-footer-logo-preview">
                        <div className="cms-footer-logo-image-wrap">
                          <img src={footerSettings.logo_en} alt="Logo EN" />
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="cms-footer-input-file"
                      onChange={(e) => setSetting({ logo_en: e.target.files[0] || null })}
                    />
                  </div>

                  {/* VAT logo */}
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">{t("cms.footer.vat_logo_label")}</label>
                    {footerSettings?.vat_logo && (
                      <div className="cms-footer-logo-preview">
                        <div className="cms-footer-logo-image-wrap">
                          <img src={footerSettings.vat_logo} alt="VAT Logo" />
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="cms-footer-input-file"
                      onChange={(e) => setSetting({ vat_logo: e.target.files[0] || null })}
                    />
                  </div>
                </div>
              </div>

              <FormError message={settingsFormError} />

              <div className="cms-footer-form-actions">
                <PendingNote dirty={settingsDirty} />
                <button
                  type="submit"
                  className="cms-footer-btn-primary"
                  disabled={loading["settings-save"]}
                >
                  {loading["settings-save"] ? <Spinner /> : <IconSave />}
                  {t("cms.footer.update")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
