// src/pages/dashboard/services/ServicesPageCMS.jsx
import React, { useEffect, useState, useRef } from "react";
import UploadLimits, { PICTURE_ACCEPT } from "../../../components/forms/cms/UploadLimits";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import api from "../../../api/axiosClient";
import { getServicesPageCMS, createServicesPageCMS, updateServicesPageCMS } from "../../../api/servicesApi";
import {
  IconSave, IconUpload,
  SvcSpinner, SvcDivider, SvcToggle,
  SvcContentHeader, SvcCardHeader, SvcLoading,
} from "./_shared";

const IconPage = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M11 2H4a1.5 1.5 0 00-1.5 1.5v11A1.5 1.5 0 004 16h10a1.5 1.5 0 001.5-1.5V6.5L11 2z"
      stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M11 2v4.5H15.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
);
const IconHero = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M1 5h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M4 8h6M4 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
const IconContent = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 3h10M2 6h7M2 9h10M2 12h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
const IconButton = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="4" width="12" height="6" rx="2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M4 7h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const emptyForm = {
  title_ar: "", title_en: "",
  description_ar: "", description_en: "",
  search_placeholder_ar: "", search_placeholder_en: "",
  hero_media_type: "image",
  primary_button_label_ar: "", primary_button_label_en: "",
  primary_action_type: "none", primary_url: "", primary_form: "",
  is_active: true,
  hero_logo: null, hero_image: null, hero_video: null,
};

export default function ServicesPageCMS() {
  const { t } = useTranslation();
  const [cmsId, setCmsId]         = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [previews, setPreviews]   = useState({ hero_logo: null, hero_image: null, hero_video: null });
  const [existing, setExisting]   = useState({ hero_logo: null, hero_image: null, hero_video: null });
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [forms, setForms]         = useState([]);
  const logoRef = useRef(); const imageRef = useRef(); const videoRef = useRef();

  const loadData = async () => {
    setLoading(true);
    try {
      const [res, formsRes] = await Promise.all([getServicesPageCMS(), api.get("admin/forms/")]);
      const data = res.data?.results ?? res.data;
      const item = Array.isArray(data) ? data[0] : data;
      setForms(Array.isArray(formsRes.data) ? formsRes.data : []);
      if (item) {
        setCmsId(item.id);
        setForm({
          title_ar: item.title_ar || "", title_en: item.title_en || "",
          description_ar: item.description_ar || "", description_en: item.description_en || "",
          search_placeholder_ar: item.search_placeholder_ar || "",
          search_placeholder_en: item.search_placeholder_en || "",
          hero_media_type: item.hero_media_type || "image",
          primary_button_label_ar: item.primary_button_label_ar || "",
          primary_button_label_en: item.primary_button_label_en || "",
          primary_action_type: item.primary_action_type || "none",
          primary_url: item.primary_url || "", primary_form: item.primary_form || "",
          is_active: item.is_active ?? true,
          hero_logo: null, hero_image: null, hero_video: null,
        });
        setExisting({ hero_logo: item.hero_logo || null, hero_image: item.hero_image || null, hero_video: item.hero_video || null });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((f) => ({ ...f, [field]: file }));
    setPreviews((p) => ({ ...p, [field]: URL.createObjectURL(file) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title_ar",              form.title_ar);
      fd.append("title_en",              form.title_en);
      fd.append("description_ar",        form.description_ar);
      fd.append("description_en",        form.description_en);
      fd.append("search_placeholder_ar", form.search_placeholder_ar);
      fd.append("search_placeholder_en", form.search_placeholder_en);
      fd.append("hero_media_type",       form.hero_media_type);
      fd.append("primary_button_label_ar", form.primary_button_label_ar);
      fd.append("primary_button_label_en", form.primary_button_label_en);
      fd.append("primary_action_type",   form.primary_action_type);
      fd.append("primary_url",           form.primary_url);
      if (form.primary_form) fd.append("primary_form", form.primary_form);
      fd.append("is_active",             form.is_active ? "true" : "false");
      if (form.hero_logo  instanceof File) fd.append("hero_logo",  form.hero_logo);
      if (form.hero_image instanceof File) fd.append("hero_image", form.hero_image);
      if (form.hero_video instanceof File) fd.append("hero_video", form.hero_video);
      if (cmsId) {
        await updateServicesPageCMS(cmsId, fd);
        toast.success(t("cms.services.cms.success.updated"));
      } else {
        await createServicesPageCMS(fd);
        toast.success(t("cms.services.cms.success.created"));
      }
      loadData();
    } catch (err) {
      const d = err?.response?.data;
      toast.error(typeof d === "object" ? Object.values(d).flat().join(" ") : t("cms.services.error.save_failed"));
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="cms-services-content"><SvcLoading /></div>
  );

  const logoSrc  = previews.hero_logo  || existing.hero_logo;
  const imageSrc = previews.hero_image || existing.hero_image;
  const videoSrc = previews.hero_video || existing.hero_video;

  return (
    <div className="cms-services-content">
      <SvcContentHeader
        icon={<IconPage />}
        title={t("cms.services.cms.title")}
        subtitle={t("cms.services.cms.subtitle")}
      />

      <form onSubmit={submit} className="cms-services-form-standalone">

        {/* ── Hero Media card ── */}
        <div className="cms-services-card cms-services-card--glass">
          <SvcCardHeader icon={<IconHero />} accent="blue" title={t("cms.services.cms.section_hero")} />
          <div className="cms-services-form">
            <SvcDivider icon={<IconHero />} label={t("cms.services.cms.hero_media_type")} />
            <div className="cms-services-media-type-row">
              {["image", "video"].map((type) => (
                <label key={type} className={`cms-services-media-type-btn ${form.hero_media_type === type ? "cms-services-media-type-btn--active" : ""}`}>
                  <input type="radio" name="hero_media_type" value={type}
                    checked={form.hero_media_type === type}
                    onChange={(e) => setForm((f) => ({ ...f, hero_media_type: e.target.value }))} />
                  <span style={{ textTransform: "capitalize" }}>{type}</span>
                </label>
              ))}
            </div>

            <div className="cms-services-form-row">
              {/* Hero Logo */}
              <div className="cms-services-form-group">
                <label className="cms-services-label">{t("cms.services.cms.hero_logo")}</label>
                <div className="cms-services-file-row">
                  {logoSrc && <div className="cms-services-icon-preview"><img src={logoSrc} alt="logo" /></div>}
                  <label className="cms-services-file-label">
                    <IconUpload />
                    <span>{t("cms.services.cms.choose_file")}</span>
                    <input ref={logoRef} type="file" accept={PICTURE_ACCEPT} className="cms-services-file-input"
                      onChange={(e) => handleFileChange("hero_logo", e)} />
                    <UploadLimits kind="logo_full" />
                  </label>
                </div>
              </div>

              {/* Hero Image or Video */}
              {form.hero_media_type === "image" && (
                <div className="cms-services-form-group">
                  <label className="cms-services-label">{t("cms.services.cms.hero_image")}</label>
                  <div className="cms-services-file-row">
                    {imageSrc && (
                      <div className="cms-services-media-preview">
                        <img src={imageSrc} alt="hero" />
                      </div>
                    )}
                    <label className="cms-services-file-label">
                      <IconUpload />
                      <span>{t("cms.services.cms.choose_file")}</span>
                      <input ref={imageRef} type="file" accept={PICTURE_ACCEPT} className="cms-services-file-input"
                        onChange={(e) => handleFileChange("hero_image", e)} />
                      <UploadLimits kind="icon" />
                    </label>
                  </div>
                </div>
              )}
              {form.hero_media_type === "video" && (
                <div className="cms-services-form-group">
                  <label className="cms-services-label">{t("cms.services.cms.hero_video")}</label>
                  <div className="cms-services-file-row">
                    {videoSrc && (
                      <video src={videoSrc} controls className="cms-services-video-preview" />
                    )}
                    <label className="cms-services-file-label">
                      <IconUpload />
                      <span>{t("cms.services.cms.choose_file")}</span>
                      <input ref={videoRef} type="file" accept="video/*" className="cms-services-file-input"
                        onChange={(e) => handleFileChange("hero_video", e)} />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Page Content card ── */}
        <div className="cms-services-card cms-services-card--glass">
          <SvcCardHeader icon={<IconContent />} accent="green" title={t("cms.services.cms.section_content")} />
          <div className="cms-services-form">
            <SvcDivider icon={<IconContent />} label={t("cms.services.cms.section_titles")} />
            <div className="cms-services-form-row">
              <div className="cms-services-form-group">
                <label className="cms-services-label">{t("cms.services.cms.title_ar")} *</label>
                <input className="cms-services-input" dir="rtl" required
                  placeholder={t("cms.services.cms.placeholder_title_ar")}
                  value={form.title_ar} onChange={(e) => setForm((f) => ({ ...f, title_ar: e.target.value }))} />
              </div>
              <div className="cms-services-form-group">
                <label className="cms-services-label">{t("cms.services.cms.title_en")} *</label>
                <input className="cms-services-input" dir="ltr" required
                  placeholder={t("cms.services.cms.placeholder_title_en")}
                  value={form.title_en} onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))} />
              </div>
            </div>
            <div className="cms-services-form-row">
              <div className="cms-services-form-group">
                <label className="cms-services-label">{t("cms.services.cms.description_ar")}</label>
                <textarea className="cms-services-textarea" dir="rtl" rows={4}
                  placeholder={t("cms.services.cms.placeholder_description_ar")}
                  value={form.description_ar} onChange={(e) => setForm((f) => ({ ...f, description_ar: e.target.value }))} />
              </div>
              <div className="cms-services-form-group">
                <label className="cms-services-label">{t("cms.services.cms.description_en")}</label>
                <textarea className="cms-services-textarea" dir="ltr" rows={4}
                  placeholder={t("cms.services.cms.placeholder_description_en")}
                  value={form.description_en} onChange={(e) => setForm((f) => ({ ...f, description_en: e.target.value }))} />
              </div>
            </div>
            <SvcDivider icon={<IconContent />} label={t("cms.services.cms.section_search")} />
            <div className="cms-services-form-row">
              <div className="cms-services-form-group">
                <label className="cms-services-label">{t("cms.services.cms.search_placeholder_ar")}</label>
                <input className="cms-services-input" dir="rtl"
                  placeholder={t("cms.services.cms.placeholder_search_ar")}
                  value={form.search_placeholder_ar} onChange={(e) => setForm((f) => ({ ...f, search_placeholder_ar: e.target.value }))} />
              </div>
              <div className="cms-services-form-group">
                <label className="cms-services-label">{t("cms.services.cms.search_placeholder_en")}</label>
                <input className="cms-services-input" dir="ltr"
                  placeholder={t("cms.services.cms.placeholder_search_en")}
                  value={form.search_placeholder_en} onChange={(e) => setForm((f) => ({ ...f, search_placeholder_en: e.target.value }))} />
              </div>
            </div>
            <SvcToggle checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              label={form.is_active ? t("cms.services.status.active") : t("cms.services.status.inactive")} />
          </div>
        </div>

        {/* ── Submit Button card ── */}
        <div className="cms-services-card cms-services-card--glass">
          <SvcCardHeader icon={<IconButton />} accent="amber" title={t("cms.services.cms.section_button")} />
          <div className="cms-services-form">
            <SvcDivider icon={<IconButton />} label={t("cms.services.cms.button_labels")} />
            <div className="cms-services-form-row">
              <div className="cms-services-form-group">
                <label className="cms-services-label">{t("cms.services.cms.button_label_ar")}</label>
                <input className="cms-services-input" dir="rtl"
                  value={form.primary_button_label_ar}
                  onChange={(e) => setForm((f) => ({ ...f, primary_button_label_ar: e.target.value }))} />
              </div>
              <div className="cms-services-form-group">
                <label className="cms-services-label">{t("cms.services.cms.button_label_en")}</label>
                <input className="cms-services-input" dir="ltr"
                  value={form.primary_button_label_en}
                  onChange={(e) => setForm((f) => ({ ...f, primary_button_label_en: e.target.value }))} />
              </div>
            </div>
            <SvcDivider icon={<IconButton />} label={t("cms.services.cms.button_action")} />
            <div className="cms-services-form-row">
              <div className="cms-services-form-group">
                <label className="cms-services-label">{t("cms.services.cms.action_type")}</label>
                <select className="cms-services-select"
                  value={form.primary_action_type}
                  onChange={(e) => setForm((f) => ({ ...f, primary_action_type: e.target.value }))}>
                  <option value="none">{t("cms.services.cms.action_none")}</option>
                  <option value="url">{t("cms.services.cms.action_url")}</option>
                  <option value="form_modal">{t("cms.services.cms.action_form_modal")}</option>
                </select>
              </div>
              {form.primary_action_type === "url" && (
                <div className="cms-services-form-group">
                  <label className="cms-services-label">{t("cms.services.cms.action_url_label")}</label>
                  <input className="cms-services-input" dir="ltr" placeholder="https://..."
                    value={form.primary_url}
                    onChange={(e) => setForm((f) => ({ ...f, primary_url: e.target.value }))} />
                </div>
              )}
              {form.primary_action_type === "form_modal" && (
                <div className="cms-services-form-group">
                  <label className="cms-services-label">{t("cms.services.cms.action_form_label")}</label>
                  <select className="cms-services-select"
                    value={form.primary_form}
                    onChange={(e) => setForm((f) => ({ ...f, primary_form: e.target.value }))}>
                    <option value="">{t("cms.services.cms.select_form")}</option>
                    {forms.map((f) => (
                      <option key={f.id} value={f.id}>{f.title_en || f.title_ar}</option>
                    ))}
                  </select>
                </div>
              )}
              {form.primary_action_type === "none" && <div />}
            </div>
          </div>
        </div>

        {/* Actions bar */}
        <div className="cms-services-actions-bar">
          <button type="submit" className="cms-services-btn cms-services-btn--primary" disabled={saving}>
            {saving ? <SvcSpinner /> : <IconSave />}
            {saving ? t("cms.services.actions.saving") : cmsId ? t("cms.services.actions.update") : t("cms.services.actions.create")}
          </button>
        </div>
      </form>
    </div>
  );
}
