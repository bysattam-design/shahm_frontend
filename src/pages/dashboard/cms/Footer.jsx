// Dashboard footer CMS
import React, { useEffect, useState, useCallback } from "react";
import api from "../../../api/axiosClient";
import { API_PATHS } from "../../../api/routes";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useSweetAlert } from "../../../components/common/SweetAlert";
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

const SYSTEM_COLUMN_KEYS = ["newsletter", "social", "sitemap"];

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

  /* ── Column form ── */
  const [colForm, setColForm] = useState({
    key: "",
    title_ar: "",
    title_en: "",
    order: 0,
    is_active: true
  });
  const [editColumnId, setEditColumnId] = useState(null);

  /* ── Per-column link forms ── */
  const [linkForms, setLinkForms] = useState({});
  const getLinkForm = (colId) =>
    linkForms[colId] || { label_ar: "", label_en: "", url: "", page: "", parent: "", order: 0, is_active: true };
  const setLinkForm = (colId, val) =>
    setLinkForms((prev) => ({ ...prev, [colId]: val }));
  const resetLinkForm = (colId) =>
    setLinkForms((prev) => ({
      ...prev,
      [colId]: { label_ar: "", label_en: "", url: "", page: "", parent: "", order: 0, is_active: true },
    }));

  /* ── Settings form ── */
  const [settingsForm, setSettingsForm] = useState({
    newsletter_title_ar: "", newsletter_title_en: "",
    copyright_ar: "", copyright_en: "",
    logo_ar: null, logo_en: null, vat_logo: null,
  });

  /* ── CTA form ── */
  const [ctaForm, setCtaForm] = useState({
    title_ar: "", title_en: "", description_ar: "", description_en: "",
    url: "", page: "", order: 0, is_active: true,
  });
  const [editCtaId, setEditCtaId] = useState(null);

  /* ── Loading helper ── */
  const setLoadingKey = (key, val) =>
    setLoading((prev) => ({ ...prev, [key]: val }));

  /* ══ Load Data ══ */
  const loadData = useCallback(async () => {
    try {
      const [colRes, pagesRes] = await Promise.all([
        api.get(API_PATHS.cms.columns),
        api.get(API_PATHS.cms.pages),
      ]);
      setColumns(colRes.data);
      setPages(pagesRes.data);
    } catch (err) {
      console.error("Failed to load columns/pages:", err);
    }
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
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* ══ Submit Column ══ */
  const submitColumn = async (e) => {
    e.preventDefault();
    const key = editColumnId ? `col-update-${editColumnId}` : "col-create";
    setLoadingKey(key, true);
    await new Promise((r) => setTimeout(r, 800)); // subtle loading feedback
    try {
      if (editColumnId) {
        await api.patch(API_PATHS.cms.column(editColumnId), colForm);
        toast.success(t("cms.footer.column_updated"));
      } else {
        await api.post(API_PATHS.cms.columns, colForm);
        toast.success(t("cms.footer.column_created"));
      }
      resetColumnForm();
      loadData();
    } catch {
      toast.error(t("cms.footer.column_save_failed"));
    } finally {
      setLoadingKey(key, false);
    }
  };

  const resetColumnForm = () => {
    setColForm({
      key: "",
      title_ar: "",
      title_en: "",
      order: 0,
      is_active: true
    });

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
    await new Promise((r) => setTimeout(r, 800));
    try {
      await api.delete(API_PATHS.cms.column(id));
      toast.success(t("cms.footer.column_deleted"));
      loadData();
    } catch {
      toast.error(t("cms.footer.column_save_failed"));
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
    await new Promise((r) => setTimeout(r, 800));
    try {
      await api.post(API_PATHS.cms.footerLinks, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(t("cms.footer.link_created"));
      resetLinkForm(colId);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error(t("cms.footer.link_save_failed"));
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
    await new Promise((r) => setTimeout(r, 800));
    try {
      await api.delete(API_PATHS.cms.footerLink(id));
      toast.success(t("cms.footer.link_deleted"));
      loadData();
    } catch {
      toast.error(t("cms.footer.link_save_failed"));
    } finally {
      setLoadingKey(`link-delete-${id}`, false);
    }
  };

  const handleToggleLinkActive = async (link) => {
    try {
      await api.patch(API_PATHS.cms.footerLink(link.id), { is_active: !link.is_active });
      toast.success(t("cms.footer.order_updated"));
      loadData();
    } catch {
      toast.error(t("cms.footer.link_save_failed"));
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
    await new Promise((r) => setTimeout(r, 800));
    try {
      await api.post(API_PATHS.cms.footerSettings, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(t("cms.footer.settings_saved"));
      loadData();
    } catch {
      toast.error(t("cms.footer.column_save_failed"));
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
    await new Promise((r) => setTimeout(r, 800));
    try {
      if (editCtaId) {
        await api.patch(API_PATHS.cms.footerCta(editCtaId), payload);
        toast.success(t("cms.footer.column_updated"));
      } else {
        await api.post(API_PATHS.cms.footerCtas, payload);
        toast.success(t("cms.footer.column_created"));
      }
      resetCtaForm();
      loadData();
    } catch {
      toast.error(t("cms.footer.column_save_failed"));
    } finally {
      setLoadingKey(key, false);
    }
  };

  const resetCtaForm = () => {
    setCtaForm({ title_ar: "", title_en: "", description_ar: "", description_en: "", url: "", page: "", order: 0, is_active: true });
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
    await new Promise((r) => setTimeout(r, 800));
    try {
      await api.delete(API_PATHS.cms.footerCta(id));
      toast.success(t("cms.footer.link_deleted"));
      loadData();
    } catch {
      toast.error(t("cms.footer.link_save_failed"));
    } finally {
      setLoadingKey(`cta-delete-${id}`, false);
    }
  };

  /* ══ Tree Item ══ */
  function TreeItem({ item }) {
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

          {/* Order input */}
          <input
            type="number"
            className="cms-footer-input-number"
            value={item.order}
            aria-label={t("cms.footer.order")}
            onChange={async (e) => {
              try {
                await api.patch(API_PATHS.cms.footerLink(item.id), { order: e.target.value });
                toast.success(t("cms.footer.order_updated"));
                loadData();
              } catch {
                toast.error(t("cms.footer.link_save_failed"));
              }
            }}
          />

          {/* Toggle active */}
          <button
            className="cms-footer-btn-edit cms-footer-btn-edit--sm"
            onClick={() => handleToggleLinkActive(item)}
          >
            {item.is_active ? t("cms.footer.disable") : t("cms.footer.enable")}
          </button>

          {/* Delete */}
          <Deletebtn
            onConfirm={() => handleDeleteLink(item.id)}
            disabled={isDeleting}
          />
        </div>

        {/* Children */}
        {item.children?.length > 0 && (
          <ul className="cms-footer-links-list cms-footer-links-nested">
            {item.children.map((c) => (
              <TreeItem key={c.id} item={c} />
            ))}
          </ul>
        )}
      </li>
    );
  }

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
          <TreeItem key={l.id} item={l} />
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
                <label className="cms-footer-label">{t("cms.footer.link_label_ar")}</label>
                <input
                  className="cms-footer-input"
                  required
                  placeholder={t("cms.footer.link_label_ar_placeholder")}
                  value={form.label_ar}
                  onChange={(e) => setLinkForm(col.id, { ...form, label_ar: e.target.value })}
                  dir="rtl"
                />
              </div>
              <div className="cms-footer-form-group">
                <label className="cms-footer-label">{t("cms.footer.link_label_en")}</label>
                <input
                  className="cms-footer-input"
                  required
                  placeholder={t("cms.footer.link_label_en_placeholder")}
                  value={form.label_en}
                  onChange={(e) => setLinkForm(col.id, { ...form, label_en: e.target.value })}
                />
              </div>
            </div>

            {/* Row 2: URL + Page */}
            <div className="cms-footer-form-row">
              <div className="cms-footer-form-group">
                <div className="cms-footer-form-row">
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">
                      {t("cms.footer.key_label", "المفتاح")}
                    </label>

                    <input
                      className="cms-footer-input"
                      required
                      placeholder="company_links"
                      value={colForm.key}
                      onChange={(e) =>
                        setColForm({
                          ...colForm,
                          key: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "_")
                        })
                      }
                    />
                  </div>
                </div>
                <label className="cms-footer-label">
                  {t("cms.footer.url")}
                  <span className="cms-footer-label-hint">{t("cms.footer.url_hint")}</span>
                </label>
                <input
                  className="cms-footer-input"
                  placeholder="/about-us"
                  value={form.url}
                  disabled={!!form.page}
                  onChange={(e) => setLinkForm(col.id, { ...form, url: e.target.value, page: "" })}
                />
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
                <label className="cms-footer-label">{t("cms.footer.parent_link")}</label>
                <select
                  className="cms-footer-select"
                  value={form.parent}
                  onChange={(e) => setLinkForm(col.id, { ...form, parent: e.target.value })}
                >
                  <option value="">{t("cms.footer.no_parent")}</option>
                  {rootLinks.map((l) => (
                    <option key={l.id} value={l.id}>
                      {isAr ? l.label_ar : l.label_en}
                    </option>
                  ))}
                </select>
              </div>
              <div className="cms-footer-form-group">
                <label className="cms-footer-label">{t("cms.footer.order")}</label>
                <input
                  className="cms-footer-input"
                  type="number"
                  placeholder="0"
                  value={form.order}
                  onChange={(e) => setLinkForm(col.id, { ...form, order: e.target.value })}
                />
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
                    onChange={(e) => setLinkForm(col.id, { ...form, is_active: e.target.checked })}
                  />
                  <span className="cms-footer-checkbox-text">{t("cms.footer.active")}</span>
                </label>
              </div>
              {/* Spacer to maintain grid alignment */}
              <div />
            </div>
          </div>

          <div className="cms-footer-form-actions">
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

            <form onSubmit={submitColumn}>
              <div className="cms-footer-form-section">
                {/* Column Key */}
                <div className="cms-footer-form-row">
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">
                      {t("cms.footer.key_label", "المفتاح")}
                    </label>

                    <input
                      className="cms-footer-input"
                      required
                      placeholder="company_links"
                      value={colForm.key}
                      onChange={(e) =>
                        setColForm({
                          ...colForm,
                          key: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "_")
                        })
                      }
                    />
                  </div>
                </div>
                {/* Row 1: AR + EN titles */}
                <div className="cms-footer-form-row">
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">{t("cms.footer.title_ar")}</label>
                    <input
                      className="cms-footer-input"
                      required
                      placeholder={t("cms.footer.title_ar_placeholder")}
                      value={colForm.title_ar}
                      onChange={(e) => setColForm({ ...colForm, title_ar: e.target.value })}
                      dir="rtl"
                    />
                  </div>
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">{t("cms.footer.title_en")}</label>
                    <input
                      className="cms-footer-input"
                      required
                      placeholder={t("cms.footer.title_en_placeholder")}
                      value={colForm.title_en}
                      onChange={(e) => setColForm({ ...colForm, title_en: e.target.value })}
                    />
                  </div>
                </div>

                {/* Row 2: Order + Checkbox */}
                <div className="cms-footer-form-row">
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">{t("cms.footer.order")}</label>
                    <input
                      className="cms-footer-input"
                      type="number"
                      placeholder="0"
                      value={colForm.order}
                      onChange={(e) => setColForm({ ...colForm, order: e.target.value })}
                    />
                  </div>
                  <div className="cms-footer-form-group cms-footer-form-group--checkbox">
                    <label className="cms-footer-checkbox-label">
                      <input
                        type="checkbox"
                        className="cms-footer-checkbox"
                        checked={colForm.is_active}
                        onChange={(e) => setColForm({ ...colForm, is_active: e.target.checked })}
                      />
                      <span className="cms-footer-checkbox-text">{t("cms.footer.active")}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="cms-footer-form-actions">
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
                    <input
                      type="number"
                      className="cms-footer-input-number"
                      value={col.order}
                      aria-label={t("cms.footer.order")}
                      onChange={async (e) => {
                        try {
                          await api.patch(API_PATHS.cms.column(col.id), { order: e.target.value });
                          toast.success(t("cms.footer.order_updated"));
                          loadData();
                        } catch {
                          toast.error(t("cms.footer.column_save_failed"));
                        }
                      }}
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
                      onChange={(e) => setCtaForm({ ...ctaForm, title_ar: e.target.value })}
                      dir="rtl"
                    />
                  </div>
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">{t("cms.footer.title_en")}</label>
                    <input
                      className="cms-footer-input"
                      required
                      placeholder={t("cms.footer.title_en_placeholder")}
                      value={ctaForm.title_en}
                      onChange={(e) => setCtaForm({ ...ctaForm, title_en: e.target.value })}
                    />
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
                      onChange={(e) => setCtaForm({ ...ctaForm, description_ar: e.target.value })}
                      dir="rtl"
                    />
                  </div>
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">{t("cms.footer.desc_en")}</label>
                    <input
                      className="cms-footer-input"
                      placeholder={t("cms.footer.desc_en_placeholder")}
                      value={ctaForm.description_en}
                      onChange={(e) => setCtaForm({ ...ctaForm, description_en: e.target.value })}
                    />
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
                      disabled={!!ctaForm.page}
                      onChange={(e) => setCtaForm({ ...ctaForm, url: e.target.value, page: "" })}
                    />
                  </div>
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">{t("cms.footer.select_page")}</label>
                    <select
                      className="cms-footer-select"
                      value={ctaForm.page}
                      disabled={!!ctaForm.url}
                      onChange={(e) => setCtaForm({ ...ctaForm, page: e.target.value, url: "" })}
                    >
                      <option value="">{t("cms.footer.select_page_option")}</option>
                      {pages.map((p) => (
                        <option key={p.id} value={p.id}>
                          {isAr ? p.title_ar : p.title_en}
                        </option>
                      ))}
                    </select>
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
                      onChange={(e) => setCtaForm({ ...ctaForm, order: e.target.value })}
                    />
                  </div>
                  <div className="cms-footer-form-group cms-footer-form-group--checkbox">
                    <label className="cms-footer-checkbox-label">
                      <input
                        type="checkbox"
                        className="cms-footer-checkbox"
                        checked={ctaForm.is_active}
                        onChange={(e) => setCtaForm({ ...ctaForm, is_active: e.target.checked })}
                      />
                      <span className="cms-footer-checkbox-text">{t("cms.footer.active")}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="cms-footer-form-actions">
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
                      onChange={(e) => setSettingsForm({ ...settingsForm, newsletter_title_ar: e.target.value })}
                      dir="rtl"
                    />
                  </div>
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">{t("cms.footer.title_en")}</label>
                    <input
                      className="cms-footer-input"
                      placeholder={t("cms.footer.newsletter_title_en_placeholder")}
                      value={settingsForm.newsletter_title_en}
                      onChange={(e) => setSettingsForm({ ...settingsForm, newsletter_title_en: e.target.value })}
                    />
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
                      onChange={(e) => setSettingsForm({ ...settingsForm, copyright_ar: e.target.value })}
                      dir="rtl"
                    />
                  </div>
                  <div className="cms-footer-form-group">
                    <label className="cms-footer-label">{t("cms.footer.title_en")}</label>
                    <input
                      className="cms-footer-input"
                      placeholder={t("cms.footer.copyright_en_placeholder")}
                      value={settingsForm.copyright_en}
                      onChange={(e) => setSettingsForm({ ...settingsForm, copyright_en: e.target.value })}
                    />
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
                      onChange={(e) => setSettingsForm({ ...settingsForm, logo_ar: e.target.files[0] || null })}
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
                      onChange={(e) => setSettingsForm({ ...settingsForm, logo_en: e.target.files[0] || null })}
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
                      onChange={(e) => setSettingsForm({ ...settingsForm, vat_logo: e.target.files[0] || null })}
                    />
                  </div>
                </div>
              </div>

              <div className="cms-footer-form-actions">
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
