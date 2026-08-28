// src/pages/dashboard/services/MainServices.jsx
import React, { useEffect, useState } from "react";
import UploadLimits, { PICTURE_ACCEPT } from "../../../components/forms/cms/UploadLimits";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useSweetAlert } from "../../../components/common/SweetAlert";
import {
  getMainServices, createMainService,
  updateMainService, deleteMainService,
} from "../../../api/servicesApi";
import {
  IconEdit, IconTrash, IconSave, IconX, IconSearch, IconImage,
  SvcSpinner, SvcDivider, SvcToggle, SvcStatusBadge,
  SvcContentHeader, SvcCardHeader, SvcEmpty, SvcLoading, SvcCode, SvcCountBadge,
} from "./_shared";

const IconFolder = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M1.5 4A1.5 1.5 0 013 2.5h4.5l1.5 2.25H15A1.5 1.5 0 0116.5 6v7.5A1.5 1.5 0 0115 15H3a1.5 1.5 0 01-1.5-1.5V4z"
      stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round" />
  </svg>
);
const IconSettings = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M7 1v1M7 12v1M1 7h1M12 7h1M2.93 2.93l.7.7M10.37 10.37l.7.7M2.93 11.07l.7-.7M10.37 3.63l.7-.7"
      stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const emptyForm = { code: "", title_ar: "", title_en: "", icon: null, order: 0, is_active: true };

export default function MainServices() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { alert: sweetEl, show: showAlert } = useSweetAlert();

  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [iconPreview, setIconPreview] = useState(null);
  const [search, setSearch]         = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMainServices();
      setItems(res.data?.results ?? res.data ?? []);
    } catch { toast.error(t("cms.services.error.load_failed")); }
    finally  { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- local loader is intentionally mount-only.
  useEffect(() => { load(); }, []);

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) { setForm((f) => ({ ...f, icon: file })); setIconPreview(URL.createObjectURL(file)); }
  };

  const resetForm = () => { setForm(emptyForm); setEditing(null); setIconPreview(null); };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("code",      form.code);
      fd.append("title_ar",  form.title_ar);
      fd.append("title_en",  form.title_en);
      fd.append("order",     form.order);
      fd.append("is_active", form.is_active ? "true" : "false");
      if (form.icon instanceof File) fd.append("icon", form.icon);
      if (editing) {
        await updateMainService(editing.id, fd);
        toast.success(t("cms.services.mainServices.success.updated"));
      } else {
        await createMainService(fd);
        toast.success(t("cms.services.mainServices.success.created"));
      }
      resetForm(); load();
    } catch (err) {
      const detail = err?.response?.data;
      toast.error(typeof detail === "object" ? Object.values(detail).flat().join(" ") : t("cms.services.error.save_failed"));
    } finally { setSaving(false); }
  };

  const handleToggle = async (item) => {
    try {
      const fd = new FormData();
      fd.append("is_active", !item.is_active ? "true" : "false");
      await updateMainService(item.id, fd);
      toast.success(t("cms.services.mainServices.success.toggled"));
      load();
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
      await deleteMainService(id);
      toast.success(t("cms.services.mainServices.success.deleted"));
      load();
    } catch { toast.error(t("cms.services.error.delete_failed")); }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({ code: item.code || "", title_ar: item.title_ar || "", title_en: item.title_en || "",
      icon: null, order: item.order ?? 0, is_active: item.is_active ?? true });
    setIconPreview(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filtered = items.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return item.title_en?.toLowerCase().includes(q) || item.title_ar?.toLowerCase().includes(q) || item.code?.toLowerCase().includes(q);
  });

  return (
    <div className="cms-services-content">
      {sweetEl}

      <SvcContentHeader
        icon={<IconFolder />}
        title={t("cms.services.mainServices.title")}
        subtitle={t("cms.services.mainServices.subtitle")}
      />

      {/* ── Form card ── */}
      <div className="cms-services-card cms-services-card--glass">
        <SvcCardHeader
          icon={<IconFolder />}
          accent="blue"
          title={editing ? t("cms.services.mainServices.form_edit") : t("cms.services.mainServices.form_create")}
          right={editing && (
            <button className="cms-services-icon-btn cms-services-icon-btn--ghost" onClick={resetForm} type="button">
              <IconX />
            </button>
          )}
        />
        <form onSubmit={submit} className="cms-services-form">
          <SvcDivider icon={<IconSettings />} label={t("cms.services.mainServices.section_basic")} />
          <div className="cms-services-form-row">
            <div className="cms-services-form-group">
              <label className="cms-services-label">{t("cms.services.mainServices.code")} *</label>
              <input className="cms-services-input" dir="ltr" placeholder="e.g. CORP"
                value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
            </div>
            <div className="cms-services-form-group">
              <label className="cms-services-label">{t("cms.services.mainServices.order")}</label>
              <input className="cms-services-input" type="number" min="0"
                value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))} />
            </div>
          </div>
          <div className="cms-services-form-row">
            <div className="cms-services-form-group">
              <label className="cms-services-label">{t("cms.services.mainServices.title_ar")} *</label>
              <input className="cms-services-input" dir="rtl"
                placeholder={t("cms.services.mainServices.placeholder_title_ar")}
                value={form.title_ar} onChange={(e) => setForm((f) => ({ ...f, title_ar: e.target.value }))} required />
            </div>
            <div className="cms-services-form-group">
              <label className="cms-services-label">{t("cms.services.mainServices.title_en")} *</label>
              <input className="cms-services-input" dir="ltr"
                placeholder={t("cms.services.mainServices.placeholder_title_en")}
                value={form.title_en} onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))} required />
            </div>
          </div>
          <SvcDivider icon={<IconImage />} label={t("cms.services.mainServices.section_icon")} />
          <div className="cms-services-form-row">
            <div className="cms-services-form-group">
              <label className="cms-services-label">{t("cms.services.mainServices.icon")}</label>
              <div className="cms-services-file-row">
                {(iconPreview || (editing?.icon && !iconPreview)) && (
                  <div className="cms-services-icon-preview">
                    <img src={iconPreview || editing.icon} alt="icon" />
                  </div>
                )}
                <label className="cms-services-file-label">
                  <IconImage />
                  <span>{t("cms.services.mainServices.choose_icon")}</span>
                  <input type="file" accept={PICTURE_ACCEPT} className="cms-services-file-input" onChange={handleIconChange} />
                  <UploadLimits kind="icon" />
                </label>
              </div>
            </div>
            <div className="cms-services-form-group cms-services-form-group--center">
              <label className="cms-services-label">{t("cms.services.mainServices.active")}</label>
              <SvcToggle checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                label={form.is_active ? t("cms.services.status.active") : t("cms.services.status.inactive")} />
            </div>
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
          icon={<IconFolder />}
          accent="purple"
          title={t("cms.services.mainServices.list_title")}
          right={
            <div className="cms-services-search-row">
              <div className="cms-services-search-wrap">
                <IconSearch />
                <input className="cms-services-search-input"
                  placeholder={t("cms.services.actions.search")}
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <SvcCountBadge count={filtered.length} />
            </div>
          }
        />
        {loading ? <SvcLoading /> : filtered.length === 0 ? (
          <SvcEmpty message={t("cms.services.mainServices.empty")} />
        ) : (
          <div className="cms-services-table-wrapper">
            <table className="cms-services-table">
              <thead>
                <tr>
                  <th>{t("cms.services.table.id")}</th>
                  <th>{t("cms.services.mainServices.code")}</th>
                  <th>{t("cms.services.table.icon")}</th>
                  <th>{t("cms.services.table.title")}</th>
                  <th>{t("cms.services.table.order")}</th>
                  <th>{t("cms.services.mainServices.services_count")}</th>
                  <th>{t("cms.services.table.status")}</th>
                  <th>{t("cms.services.table.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="cms-services-table-row">
                    <td><span className="cms-services-id-chip">#{item.id}</span></td>
                    <td><SvcCode>{item.code}</SvcCode></td>
                    <td>
                      {item.icon
                        ? <img src={item.icon} alt="icon" className="cms-services-table-icon" />
                        : <span className="cms-services-no-value">—</span>}
                    </td>
                    <td className="cms-services-table-name">
                      <div>{isRtl ? item.title_ar : item.title_en}</div>
                      <div className="cms-services-table-name-sub">{isRtl ? item.title_en : item.title_ar}</div>
                    </td>
                    <td><span className="cms-services-order-chip">{item.order}</span></td>
                    <td><SvcCountBadge count={item.services_count ?? 0} /></td>
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

// re-export missing icon used inside
function IconToggle() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="4" width="12" height="6" rx="3" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="10" cy="7" r="2" fill="currentColor" />
    </svg>
  );
}
