// src/pages/dashboard/services/Services.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useSweetAlert } from "../../../components/common/SweetAlert";
import {
  getServices, createService, updateService, deleteService,
  getMainServices,
} from "../../../api/servicesApi";
import {
  IconEdit, IconTrash, IconSave, IconX, IconSearch,
  SvcSpinner, SvcDivider, SvcToggle, SvcStatusBadge,
  SvcContentHeader, SvcCardHeader, SvcEmpty, SvcLoading, SvcCode, SvcCountBadge,
} from "./_shared";

const IconServices = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1.5" y="1.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    <rect x="10.5" y="1.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    <rect x="1.5" y="10.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    <rect x="10.5" y="10.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);
const IconSettings = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M7 1v1M7 12v1M1 7h1M12 7h1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
const IconFilter = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 3h10M4 7h6M6 11h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

function IconToggle() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="4" width="12" height="6" rx="3" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="10" cy="7" r="2" fill="currentColor" />
    </svg>
  );
}

const emptyForm = {
  main_service: "", title_ar: "", title_en: "",
  short_description_ar: "", short_description_en: "",
  is_featured: false, order: 0, is_active: true,
};

export default function Services() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { alert: sweetEl, show: showAlert } = useSweetAlert();

  const [items, setItems]             = useState([]);
  const [mainServices, setMainServices] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [editing, setEditing]         = useState(null);
  const [form, setForm]               = useState(emptyForm);
  const [search, setSearch]           = useState("");
  const [filterMain, setFilterMain]   = useState("");
  const [filterActive, setFilterActive] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterMain)   params.main_service = filterMain;
      if (filterActive !== "") params.is_active = filterActive;
      if (search)       params.search = search;
      const [svcRes, msRes] = await Promise.all([getServices(params), getMainServices()]);
      setItems(svcRes.data?.results ?? svcRes.data ?? []);
      setMainServices(msRes.data?.results ?? msRes.data ?? []);
    } catch { toast.error(t("cms.services.error.load_failed")); }
    finally  { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- reload only when explicit filters change.
  useEffect(() => { loadData(); }, [filterMain, filterActive]);

  const resetForm = () => { setForm(emptyForm); setEditing(null); };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("main_service",           form.main_service);
      fd.append("title_ar",               form.title_ar);
      fd.append("title_en",               form.title_en);
      fd.append("short_description_ar",   form.short_description_ar);
      fd.append("short_description_en",   form.short_description_en);
      fd.append("is_featured",            form.is_featured ? "true" : "false");
      fd.append("order",                  form.order);
      fd.append("is_active",              form.is_active ? "true" : "false");
      if (editing) {
        await updateService(editing.id, fd);
        toast.success(t("cms.services.services.success.updated"));
      } else {
        await createService(fd);
        toast.success(t("cms.services.services.success.created"));
      }
      resetForm(); loadData();
    } catch (err) {
      const d = err?.response?.data;
      toast.error(typeof d === "object" ? Object.values(d).flat().join(" ") : t("cms.services.error.save_failed"));
    } finally { setSaving(false); }
  };

  const handleToggle = async (item) => {
    try {
      const fd = new FormData();
      fd.append("is_active", !item.is_active ? "true" : "false");
      await updateService(item.id, fd);
      toast.success(t("cms.services.services.success.toggled"));
      loadData();
    } catch { toast.error(t("cms.services.error.toggle_failed")); }
  };

  const handleDelete = async (id) => {
    const confirmed = await showAlert({
      type: "confirm",
      title: t("cms.services.confirm_delete_title"),
      message: t("cms.services.confirm_delete_text"),
      confirmText: t("cms.services.delete_button"),
      cancelText: t("cms.services.cancel_button"),
      showCancel: true, isRtl,
    });
    if (!confirmed) return;
    try {
      await deleteService(id);
      toast.success(t("cms.services.services.success.deleted"));
      loadData();
    } catch { toast.error(t("cms.services.error.delete_failed")); }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      main_service:           item.main_service || "",
      title_ar:               item.title_ar || "",
      title_en:               item.title_en || "",
      short_description_ar:   item.short_description_ar || "",
      short_description_en:   item.short_description_en || "",
      is_featured:            item.is_featured ?? false,
      order:                  item.order ?? 0,
      is_active:              item.is_active ?? true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="cms-services-content">
      {sweetEl}

      <SvcContentHeader
        icon={<IconServices />}
        title={t("cms.services.services.title")}
        subtitle={t("cms.services.services.subtitle")}
      />

      {/* ── Form card ── */}
      <div className="cms-services-card cms-services-card--glass">
        <SvcCardHeader
          icon={<IconServices />}
          accent="green"
          title={editing ? t("cms.services.services.form_edit") : t("cms.services.services.form_create")}
          right={editing && (
            <button className="cms-services-icon-btn cms-services-icon-btn--ghost" onClick={resetForm} type="button">
              <IconX />
            </button>
          )}
        />
        <form onSubmit={submit} className="cms-services-form">
          <SvcDivider icon={<IconSettings />} label={t("cms.services.services.section_main")} />

          {/* Main service select */}
          <div className="cms-services-form-row">
            <div className="cms-services-form-group">
              <label className="cms-services-label">{t("cms.services.services.main_service")} *</label>
              <select className="cms-services-select"
                value={form.main_service}
                onChange={(e) => setForm((f) => ({ ...f, main_service: e.target.value }))} required>
                <option value="">{t("cms.services.services.select_main_service")}</option>
                {mainServices.map((ms) => (
                  <option key={ms.id} value={ms.id}>
                    [{ms.code}] {isRtl ? ms.title_ar : ms.title_en}
                  </option>
                ))}
              </select>
            </div>
            <div className="cms-services-form-group">
              <label className="cms-services-label">{t("cms.services.services.order")}</label>
              <input className="cms-services-input" type="number" min="0"
                value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))} />
            </div>
          </div>

          {/* Read-only fields when editing */}
          {editing && (
            <div className="cms-services-form-row">
              <div className="cms-services-form-group">
                <label className="cms-services-label">{t("cms.services.services.serial_number")}</label>
                <input className="cms-services-input cms-services-input--readonly" dir="ltr"
                  value={editing.serial_number || "—"} readOnly />
              </div>
              <div className="cms-services-form-group">
                <label className="cms-services-label">{t("cms.services.services.slug", "المسار")}</label>
                <input className="cms-services-input cms-services-input--readonly" dir="ltr"
                  value={editing.slug || "—"} readOnly />
              </div>
            </div>
          )}

          <SvcDivider icon={<IconSettings />} label={t("cms.services.services.section_titles")} />
          <div className="cms-services-form-row">
            <div className="cms-services-form-group">
              <label className="cms-services-label">{t("cms.services.services.title_ar")} *</label>
              <input className="cms-services-input" dir="rtl"
                placeholder={t("cms.services.services.placeholder_title_ar")}
                value={form.title_ar} onChange={(e) => setForm((f) => ({ ...f, title_ar: e.target.value }))} required />
            </div>
            <div className="cms-services-form-group">
              <label className="cms-services-label">{t("cms.services.services.title_en")} *</label>
              <input className="cms-services-input" dir="ltr"
                placeholder={t("cms.services.services.placeholder_title_en")}
                value={form.title_en} onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))} required />
            </div>
          </div>
          <div className="cms-services-form-row">
            <div className="cms-services-form-group">
              <label className="cms-services-label">{t("cms.services.services.short_description_ar")}</label>
              <textarea className="cms-services-textarea" dir="rtl" rows={3}
                placeholder={t("cms.services.services.placeholder_short_description_ar")}
                value={form.short_description_ar} onChange={(e) => setForm((f) => ({ ...f, short_description_ar: e.target.value }))} />
            </div>
            <div className="cms-services-form-group">
              <label className="cms-services-label">{t("cms.services.services.short_description_en")}</label>
              <textarea className="cms-services-textarea" dir="ltr" rows={3}
                placeholder={t("cms.services.services.placeholder_short_description_en")}
                value={form.short_description_en} onChange={(e) => setForm((f) => ({ ...f, short_description_en: e.target.value }))} />
            </div>
          </div>

          <SvcDivider icon={<IconSettings />} label={t("cms.services.services.section_settings")} />
          <div className="cms-services-form-row">
            <SvcToggle checked={form.is_featured}
              onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
              label={t("cms.services.services.featured")} />
            <SvcToggle checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              label={form.is_active ? t("cms.services.status.active") : t("cms.services.status.inactive")} />
          </div>

          <div className="cms-services-form-actions">
            <button type="submit" className="cms-services-btn cms-services-btn--primary" disabled={saving}>
              {saving ? <SvcSpinner /> : <IconSave />}
              {saving ? t("cms.services.actions.saving") : editing ? t("cms.services.actions.update") : t("cms.services.actions.create")}
            </button>
            {editing && (
              <button type="button" className="cms-services-btn cms-services-btn--ghost" onClick={resetForm}>
                <IconX />{t("cms.services.actions.cancel")}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── List card ── */}
      <div className="cms-services-card">
        <SvcCardHeader
          icon={<IconServices />}
          accent="purple"
          title={t("cms.services.services.list_title")}
          right={<SvcCountBadge count={items.length} />}
        />

        {/* Filter bar */}
        <div className="cms-services-filter-bar">
          <div className="cms-services-search-wrap">
            <IconSearch />
            <input className="cms-services-search-input"
              placeholder={t("cms.services.actions.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadData()} />
          </div>
          <select className="cms-services-select cms-services-select--sm"
            value={filterMain} onChange={(e) => setFilterMain(e.target.value)}>
            <option value="">{t("cms.services.services.filter_all_main")}</option>
            {mainServices.map((ms) => (
              <option key={ms.id} value={ms.id}>[{ms.code}] {isRtl ? ms.title_ar : ms.title_en}</option>
            ))}
          </select>
          <select className="cms-services-select cms-services-select--sm"
            value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
            <option value="">{t("cms.services.filter_all_status")}</option>
            <option value="true">{t("cms.services.status.active")}</option>
            <option value="false">{t("cms.services.status.inactive")}</option>
          </select>
          <button className="cms-services-btn cms-services-btn--ghost cms-services-btn--sm"
            onClick={loadData} type="button">
            <IconFilter />{t("cms.services.actions.search")}
          </button>
        </div>

        {loading ? <SvcLoading /> : items.length === 0 ? (
          <SvcEmpty message={t("cms.services.services.empty")} />
        ) : (
          <div className="cms-services-table-wrapper">
            <table className="cms-services-table">
              <thead>
                <tr>
                  <th>{t("cms.services.table.id")}</th>
                  <th>{t("cms.services.services.serial_number")}</th>
                  <th>{t("cms.services.table.title")}</th>
                  <th>{t("cms.services.services.main_service")}</th>
                  <th>{t("cms.services.table.order")}</th>
                  <th>{t("cms.services.services.featured")}</th>
                  <th>{t("cms.services.table.status")}</th>
                  <th>{t("cms.services.table.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="cms-services-table-row">
                    <td><span className="cms-services-id-chip">#{item.id}</span></td>
                    <td><SvcCode>{item.serial_number || "—"}</SvcCode></td>
                    <td className="cms-services-table-name">
                      <div>{isRtl ? item.title_ar : item.title_en}</div>
                      <div className="cms-services-table-name-sub">{isRtl ? item.title_en : item.title_ar}</div>
                    </td>
                    <td className="cms-services-table-cell-sm">
                      {item.main_service_data
                        ? `[${item.main_service_data.code}] ${isRtl ? item.main_service_data.title_ar : item.main_service_data.title_en}`
                        : "—"}
                    </td>
                    <td><span className="cms-services-order-chip">{item.order}</span></td>
                    <td>
                      {item.is_featured
                        ? <span className="cms-services-featured-chip">★ {t("cms.services.services.featured")}</span>
                        : <span className="cms-services-no-value">—</span>}
                    </td>
                    <td><SvcStatusBadge active={item.is_active} /></td>
                    <td>
                      <div className="cms-services-actions-cell">
                        <button className="cms-services-icon-btn cms-services-icon-btn--edit" onClick={() => handleEdit(item)} title={t("cms.services.actions.edit")}><IconEdit /></button>
                        <button className="cms-services-icon-btn cms-services-icon-btn--toggle" onClick={() => handleToggle(item)} title={item.is_active ? t("cms.services.actions.deactivate") : t("cms.services.actions.activate")}><IconToggle /></button>
                        <button className="cms-services-icon-btn cms-services-icon-btn--delete" onClick={() => handleDelete(item.id)} title={t("cms.services.actions.delete")}><IconTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
