// src/pages/dashboard/forms/components/SuccessResponseModal.jsx
import React, { useEffect, useState } from "react";
import UploadLimits, { PICTURE_ACCEPT } from "../../../../components/forms/cms/UploadLimits";
import { useTranslation } from "react-i18next";

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const IconSave = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M2 2H10.5L13 4.5V13H2V2Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.5 2V5.5H10V2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 8.5H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const Spinner = () => (
  <span className="fb-spinner">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"
        strokeDasharray="28" strokeDashoffset="10" strokeLinecap="round" />
    </svg>
  </span>
);

const EMPTY_FORM = {
  slug: "",
  logo: null,
  title_ar: "",
  title_en: "",
  subtitle_ar: "",
  subtitle_en: "",
  description_ar: "",
  description_en: "",
  show_reference_number: false,
  reference_prefix: "",
  button_label_ar: "",
  button_label_en: "",
  button_action_type: "close",
  button_url: "",
  is_active: true,
};

export default function SuccessResponseModal({ initialData, onClose, onSubmit, saving }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(EMPTY_FORM);
  const [preview, setPreview] = useState("");

  useEffect(() => {

    if (initialData) {
      const data = {
        ...EMPTY_FORM,
        ...initialData,
        logo: null,
      };

      setForm(data);
      setPreview(initialData.logo_url || "");
    }
  }, [initialData]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    set("logo", file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return;
      }

      if (key === "logo" && !(value instanceof File)) {
        return;
      }

      fd.append(key, value);
    });
    await onSubmit(fd);
  };

  return (
    <div className="fb-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fb-modal" style={{ maxWidth: "950px" }}>

        {/* Header */}
        <div className="fb-modal-header">
          <h2 className="fb-modal-title">
            {initialData
              ? t("cms.forms.success_responses.modal_title_edit")
              : t("cms.forms.success_responses.modal_title_create")}
          </h2>
          <button className="fb-icon-btn fb-icon-btn--ghost" onClick={onClose} type="button">
            <IconX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="fb-modal-body">

          {/* Slug + Logo */}
          <div className="fb-form-row">
            <div className="fb-form-group">
              <label className="fb-label">
                {t("cms.forms.success_responses.fields.slug")}
                <span className="fb-label-hint">{t("cms.forms.slug_hint")}</span>
              </label>
              <input className="fb-input" dir="ltr"
                placeholder={t("cms.forms.success_responses.placeholders.slug")}
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)} />
            </div>
            <div className="fb-form-group">
              <label className="fb-label">{t("cms.forms.success_responses.fields.logo")}</label>
              <input type="file" accept={PICTURE_ACCEPT} onChange={handleLogo} />
              <UploadLimits kind="logo_full" />
              {preview && (
                <img src={preview} alt=""
                  style={{ width: "72px", marginTop: "10px", objectFit: "contain", borderRadius: "8px" }} />
              )}
            </div>
          </div>

          {/* Titles */}
          <div className="fb-form-row">
            <div className="fb-form-group">
              <label className="fb-label">{t("cms.forms.success_responses.fields.title_ar")}</label>
              <input className="fb-input" dir="rtl"
                placeholder={t("cms.forms.success_responses.placeholders.title_ar")}
                value={form.title_ar}
                onChange={(e) => set("title_ar", e.target.value)} />
            </div>
            <div className="fb-form-group">
              <label className="fb-label">{t("cms.forms.success_responses.fields.title_en")}</label>
              <input className="fb-input" dir="ltr"
                placeholder={t("cms.forms.success_responses.placeholders.title_en")}
                value={form.title_en}
                onChange={(e) => set("title_en", e.target.value)} />
            </div>
          </div>

          {/* Subtitles */}
          <div className="fb-form-row">
            <div className="fb-form-group">
              <label className="fb-label">{t("cms.forms.success_responses.fields.subtitle_ar")}</label>
              <input className="fb-input" dir="rtl"
                placeholder={t("cms.forms.success_responses.placeholders.subtitle_ar")}
                value={form.subtitle_ar}
                onChange={(e) => set("subtitle_ar", e.target.value)} />
            </div>
            <div className="fb-form-group">
              <label className="fb-label">{t("cms.forms.success_responses.fields.subtitle_en")}</label>
              <input className="fb-input" dir="ltr"
                placeholder={t("cms.forms.success_responses.placeholders.subtitle_en")}
                value={form.subtitle_en}
                onChange={(e) => set("subtitle_en", e.target.value)} />
            </div>
          </div>

          {/* Descriptions */}
          <div className="fb-form-row">
            <div className="fb-form-group">
              <label className="fb-label">{t("cms.forms.success_responses.fields.description_ar")}</label>
              <textarea className="fb-textarea" dir="rtl" rows={4}
                placeholder={t("cms.forms.success_responses.placeholders.description_ar")}
                value={form.description_ar}
                onChange={(e) => set("description_ar", e.target.value)} />
            </div>
            <div className="fb-form-group">
              <label className="fb-label">{t("cms.forms.success_responses.fields.description_en")}</label>
              <textarea className="fb-textarea" dir="ltr" rows={4}
                placeholder={t("cms.forms.success_responses.placeholders.description_en")}
                value={form.description_en}
                onChange={(e) => set("description_en", e.target.value)} />
            </div>
          </div>

          {/* Reference number */}
          <div className="fb-form-row">
            <div className="fb-form-group">
              <label className="fb-label">{t("cms.forms.success_responses.fields.show_reference")}</label>
              <label className="fb-toggle">
                <input type="checkbox" checked={form.show_reference_number}
                  onChange={(e) => set("show_reference_number", e.target.checked)} />
                <span className="fb-toggle-track"><span className="fb-toggle-thumb" /></span>
                <span className="fb-toggle-label">
                  {form.show_reference_number
                    ? t("cms.forms.status.active")
                    : t("cms.forms.status.inactive")}
                </span>
              </label>
            </div>
            <div className="fb-form-group">
              <label className="fb-label">{t("cms.forms.success_responses.fields.reference_prefix")}</label>
              <input className="fb-input" dir="ltr"
                placeholder="#"
                value={form.reference_prefix}
                onChange={(e) => set("reference_prefix", e.target.value)} />
            </div>
          </div>

          {/* Button labels */}
          <div className="fb-form-row">
            <div className="fb-form-group">
              <label className="fb-label">{t("cms.forms.success_responses.fields.button_label_ar")}</label>
              <input className="fb-input" dir="rtl"
                placeholder={t("cms.forms.success_responses.placeholders.button_label_ar")}
                value={form.button_label_ar}
                onChange={(e) => set("button_label_ar", e.target.value)} />
            </div>
            <div className="fb-form-group">
              <label className="fb-label">{t("cms.forms.success_responses.fields.button_label_en")}</label>
              <input className="fb-input" dir="ltr"
                placeholder={t("cms.forms.success_responses.placeholders.button_label_en")}
                value={form.button_label_en}
                onChange={(e) => set("button_label_en", e.target.value)} />
            </div>
          </div>

          {/* Button action + URL */}
          <div className="fb-form-row">
            <div className="fb-form-group">
              <label className="fb-label">{t("cms.forms.success_responses.fields.button_action")}</label>
              <select className="fb-select"
                value={form.button_action_type}
                onChange={(e) => set("button_action_type", e.target.value)}>
                <option value="none">{t("cms.forms.success_responses.button_actions.none")}</option>
                <option value="close">{t("cms.forms.success_responses.button_actions.close")}</option>
                <option value="url">{t("cms.forms.success_responses.button_actions.url")}</option>
              </select>
            </div>
            <div className="fb-form-group">
              <label className="fb-label">{t("cms.forms.success_responses.fields.button_url")}</label>
              <input className="fb-input" dir="ltr"
                placeholder="https://..."
                value={form.button_url}
                onChange={(e) => set("button_url", e.target.value)}
                disabled={form.button_action_type !== "url"} />
            </div>
          </div>

          {/* Active */}
          <div className="fb-form-row">
            <div className="fb-form-group">
              <label className="fb-label">{t("cms.forms.fields.is_active")}</label>
              <label className="fb-toggle">
                <input type="checkbox" checked={form.is_active}
                  onChange={(e) => set("is_active", e.target.checked)} />
                <span className="fb-toggle-track"><span className="fb-toggle-thumb" /></span>
                <span className="fb-toggle-label">
                  {form.is_active ? t("cms.forms.status.active") : t("cms.forms.status.inactive")}
                </span>
              </label>
            </div>
            <div className="fb-form-spacer" />
          </div>

          {/* Footer */}
          <div className="fb-modal-footer">
            <button type="button" className="fb-btn fb-btn--ghost" onClick={onClose}>
              <IconX />
              {t("cms.forms.actions.cancel")}
            </button>
            <button type="submit" className="fb-btn fb-btn--primary" disabled={saving}>
              {saving ? <Spinner /> : <IconSave />}
              {t("cms.forms.actions.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}