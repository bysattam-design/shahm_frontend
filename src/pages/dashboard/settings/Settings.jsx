// Dashboard site settings
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSettingsStore } from "../../../store/useSettingsStore";
import { useTranslation } from "react-i18next";
import AppearanceSettings from "../../../components/common/AppearanceSettings";
import "../../../styles/dashboard/cms/site-settings.css";

/* ══════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════ */
const IconGlobe = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 2c-2 2.5-3 5-3 8s1 5.5 3 8M10 2c2 2.5 3 5 3 8s-1 5.5-3 8M2 10h16"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M1.5 6l6.5 4 6.5-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);
const IconPhone = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 2h3l1.5 3.5-2 1.5a8 8 0 003.5 3.5l1.5-2L14 10v3a1 1 0 01-1 1A11 11 0 012 3a1 1 0 011-1z"
      stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
);
const IconShare = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="12" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="12" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="4" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M5.5 7.2l5-2.8M5.5 8.8l5 2.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);
const IconSave = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path d="M2 2H10.5L13 4.5V13H2V2Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.5 2V5.5H10V2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 8.5H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const Spinner = () => (
  <span className="ss-spinner" aria-hidden="true">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"
        strokeDasharray="28" strokeDashoffset="10" strokeLinecap="round" />
    </svg>
  </span>
);

/* ══════════════════════════════════════════════════════
   SECTION DIVIDER
══════════════════════════════════════════════════════ */
function SectionDivider({ icon, label }) {
  return (
    <div className="ss-divider">
      <span className="ss-divider-icon">{icon}</span>
      <span className="ss-divider-label">{label}</span>
      <div className="ss-divider-line" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function Settings() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { settings, fetchSettings, saveSettings, loading } = useSettingsStore();

  const [form, setForm] = useState({
    site_name_ar: "",
    site_name_en: "",
    contact_receiver_email: "",
    auto_reply_email: "",
    phone_number: "",
    whatsapp_number: "",
    address: "",
    map_embed: "",
    linkedin_url: "",
    x_url: "",
    instagram_url: "",
    tiktok_url: "",
    country: "",
    locale: "",
    logo_light: null,
    logo_dark: null,
  });

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setForm({
        site_name_ar:           settings.site_name_ar || "",
        site_name_en:           settings.site_name_en || "",
        contact_receiver_email: settings.contact_receiver_email || "",
        auto_reply_email:       settings.auto_reply_email || "",
        phone_number:           settings.phone_number || "",
        whatsapp_number:        settings.whatsapp_number || "",
        address:                settings.address || "",
        map_embed:              settings.map_embed || "",
        linkedin_url:           settings.linkedin_url || "",
        x_url:                  settings.x_url || "",
        instagram_url:          settings.instagram_url || "",
        tiktok_url:             settings.tiktok_url || "",
        country:                settings.country || "",
        locale:                 settings.locale || "ar",
        logo_light:             null,
        logo_dark:              null,
      });
    }
  }, [settings]);

  /* ── Logic unchanged ── */
  const updateField = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    for (const key in form) {
      if (form[key] !== null && form[key] !== undefined) {
        fd.append(key, form[key]);
      }
    }
    const res = await saveSettings(fd);
    if (res.success) {
      toast.success(t("cms.settings.success.updated"));
    } else {
      toast.error(t("cms.settings.errors.failed"));
    }
  };

  /* ── Loading state ──
     The appearance panel is a preference of this browser and does not wait
     for the site settings to arrive, so it stays reachable even when the
     server is slow or unreachable. */
  if (!settings) {
    return (
      <div className="ss-root" dir={isRtl ? "rtl" : "ltr"}>
        <AppearanceSettings />
        <div className="ss-loading">
          <Spinner />
          <span>{t("common.loading")}</span>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div className="ss-root" dir={isRtl ? "rtl" : "ltr"}>

      {/* ── Page Header ── */}
      <div className="ss-page-header">
        <div className="ss-page-header-left">
          <div className="ss-page-header-icon"><IconGlobe /></div>
          <div>
            <h1 className="ss-page-title">{t("cms.settings.title")}</h1>
            <p className="ss-page-subtitle">{t("cms.settings.subtitle")}</p>
          </div>
        </div>
      </div>

      {/* Reader preferences: kept in this browser, not part of the site
          settings the form below saves. */}
      <AppearanceSettings />

      <form onSubmit={submitHandler} className="ss-form">

        {/* ════════ SITE INFO ════════ */}
        <div className="ss-card">
          <div className="ss-card-header">
            <div className="ss-card-header-left">
              <span className="ss-card-header-icon ss-card-header-icon--blue"><IconGlobe /></span>
              <h2 className="ss-card-title">{t("cms.settings.sections.site")}</h2>
            </div>
          </div>
          <div className="ss-form-body">
            <SectionDivider icon={<IconGlobe />} label={t("cms.settings.sections.site")} />
            <div className="ss-form-row">
              <div className="ss-form-group">
                <label className="ss-label">{t("cms.settings.fields.site_name_ar")}</label>
                <input className="ss-input" dir="rtl"
                  name="site_name_ar" value={form.site_name_ar} onChange={updateField}
                  placeholder={t("cms.settings.placeholders.site_name_ar")} />
              </div>
              <div className="ss-form-group">
                <label className="ss-label">{t("cms.settings.fields.site_name_en")}</label>
                <input className="ss-input" dir="ltr"
                  name="site_name_en" value={form.site_name_en} onChange={updateField}
                  placeholder={t("cms.settings.placeholders.site_name_en")} />
              </div>
            </div>
          </div>
        </div>

        {/* ════════ EMAIL ════════ */}
        <div className="ss-card">
          <div className="ss-card-header">
            <div className="ss-card-header-left">
              <span className="ss-card-header-icon ss-card-header-icon--purple"><IconMail /></span>
              <h2 className="ss-card-title">{t("cms.settings.sections.email")}</h2>
            </div>
          </div>
          <div className="ss-form-body">
            <SectionDivider icon={<IconMail />} label={t("cms.settings.sections.email")} />
            <div className="ss-form-row">
              <div className="ss-form-group">
                <label className="ss-label">{t("cms.settings.fields.contact_email")}</label>
                <input className="ss-input" dir="ltr" type="email"
                  name="contact_receiver_email" value={form.contact_receiver_email} onChange={updateField}
                  placeholder={t("cms.settings.placeholders.contact_email")} />
              </div>
              <div className="ss-form-group">
                <label className="ss-label">{t("cms.settings.fields.auto_reply_email")}</label>
                <input className="ss-input" dir="ltr" type="email"
                  name="auto_reply_email" value={form.auto_reply_email} onChange={updateField}
                  placeholder={t("cms.settings.placeholders.auto_reply_email")} />
              </div>
            </div>
          </div>
        </div>

        {/* ════════ CONTACT ════════ */}
        <div className="ss-card">
          <div className="ss-card-header">
            <div className="ss-card-header-left">
              <span className="ss-card-header-icon ss-card-header-icon--green"><IconPhone /></span>
              <h2 className="ss-card-title">{t("cms.settings.sections.contact")}</h2>
            </div>
          </div>
          <div className="ss-form-body">
            <SectionDivider icon={<IconPhone />} label={t("cms.settings.sections.contact")} />
            <div className="ss-form-row">
              <div className="ss-form-group">
                <label className="ss-label">{t("cms.settings.fields.phone")}</label>
                <input className="ss-input" dir="ltr"
                  name="phone_number" value={form.phone_number} onChange={updateField}
                  placeholder={t("cms.settings.placeholders.phone")} />
              </div>
              <div className="ss-form-group">
                <label className="ss-label">{t("cms.settings.fields.whatsapp")}</label>
                <input className="ss-input" dir="ltr"
                  name="whatsapp_number" value={form.whatsapp_number} onChange={updateField}
                  placeholder={t("cms.settings.placeholders.whatsapp")} />
              </div>
            </div>
            {/* Full-width address */}
            <div className="ss-form-row ss-form-row--full">
              <div className="ss-form-group">
                <label className="ss-label">{t("cms.settings.fields.address")}</label>
                <input className="ss-input"
                  name="address" value={form.address} onChange={updateField}
                  placeholder={t("cms.settings.placeholders.address")} />
              </div>
            </div>
            {/* Full-width map embed */}
            <div className="ss-form-row ss-form-row--full">
              <div className="ss-form-group">
                <label className="ss-label">{t("cms.settings.fields.map")}</label>
                <textarea className="ss-textarea"
                  name="map_embed" value={form.map_embed} onChange={updateField}
                  placeholder={t("cms.settings.placeholders.map")} rows={4} />
              </div>
            </div>
          </div>
        </div>

        {/* ════════ SOCIAL MEDIA ════════ */}
        <div className="ss-card">
          <div className="ss-card-header">
            <div className="ss-card-header-left">
              <span className="ss-card-header-icon ss-card-header-icon--amber"><IconShare /></span>
              <h2 className="ss-card-title">{t("cms.settings.sections.social")}</h2>
            </div>
          </div>
          <div className="ss-form-body">
            <SectionDivider icon={<IconShare />} label={t("cms.settings.sections.social")} />
            <div className="ss-form-row">
              <div className="ss-form-group">
                <label className="ss-label">LinkedIn</label>
                <input className="ss-input" dir="ltr"
                  name="linkedin_url" value={form.linkedin_url} onChange={updateField}
                  placeholder={t("cms.settings.placeholders.linkedin")} />
              </div>
              <div className="ss-form-group">
                <label className="ss-label">X (Twitter)</label>
                <input className="ss-input" dir="ltr"
                  name="x_url" value={form.x_url} onChange={updateField}
                  placeholder={t("cms.settings.placeholders.x")} />
              </div>
            </div>
            <div className="ss-form-row">
              <div className="ss-form-group">
                <label className="ss-label">Instagram</label>
                <input className="ss-input" dir="ltr"
                  name="instagram_url" value={form.instagram_url} onChange={updateField}
                  placeholder={t("cms.settings.placeholders.instagram")} />
              </div>
              <div className="ss-form-group">
                <label className="ss-label">TikTok</label>
                <input className="ss-input" dir="ltr"
                  name="tiktok_url" value={form.tiktok_url} onChange={updateField}
                  placeholder="https://www.tiktok.com/@username" />
              </div>
            </div>
          </div>
        </div>

        {/* ════════ REGION & LANGUAGE — commented out (not used) ════════ */}
        {/*
        <div className="ss-card">
          <div className="ss-card-header">
            <div className="ss-card-header-left">
              <span className="ss-card-header-icon ss-card-header-icon--blue"><IconGlobe /></span>
              <h2 className="ss-card-title">{t("cms.settings.sections.locale")}</h2>
            </div>
          </div>
          <div className="ss-form-body">
            <SectionDivider icon={<IconGlobe />} label={t("cms.settings.sections.locale")} />
            <div className="ss-form-row">
              <div className="ss-form-group">
                <label className="ss-label">{t("cms.settings.fields.country")}</label>
                <input className="ss-input" dir="ltr"
                  name="country" value={form.country} onChange={updateField}
                  placeholder={t("cms.settings.placeholders.country")} />
              </div>
              <div className="ss-form-group">
                <label className="ss-label">{t("cms.settings.fields.locale")}</label>
                <select className="ss-select"
                  name="locale" value={form.locale} onChange={updateField}>
                  <option value="ar">{t("cms.settings.locales.arabic")}</option>
                  <option value="en">{t("cms.settings.locales.english")}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        */}

        {/* ════════ LOGOS — commented out (not used) ════════ */}
        {/*
        <div className="ss-card">
          <div className="ss-card-header">
            <div className="ss-card-header-left">
              <span className="ss-card-header-icon ss-card-header-icon--purple"><IconGlobe /></span>
              <h2 className="ss-card-title">{t("cms.settings.sections.logo")}</h2>
            </div>
          </div>
          <div className="ss-form-body">
            <div className="ss-logo-grid">
              <div className="ss-logo-group">
                <label className="ss-label">{t("cms.settings.fields.logo_light")}</label>
                <div className="ss-logo-preview">
                  {settings.logo_light_url && (
                    <img src={settings.logo_light_url} alt="Light Logo" />
                  )}
                </div>
                <input className="ss-input-file" type="file"
                  name="logo_light" onChange={updateField} accept=".svg,.png,.jpg,.jpeg,.webp,.gif" />
              </div>
              <div className="ss-logo-group">
                <label className="ss-label">{t("cms.settings.fields.logo_dark")}</label>
                <div className="ss-logo-preview">
                  {settings.logo_dark_url && (
                    <img src={settings.logo_dark_url} alt="Dark Logo" />
                  )}
                </div>
                <input className="ss-input-file" type="file"
                  name="logo_dark" onChange={updateField} accept=".svg,.png,.jpg,.jpeg,.webp,.gif" />
              </div>
            </div>
          </div>
        </div>
        */}

        {/* ════════ SUBMIT ════════ */}
        <div className="ss-form-actions">
          <button type="submit" className="ss-btn ss-btn--primary" disabled={loading}>
            {loading ? <Spinner /> : <IconSave />}
            {loading ? t("common.loading") : t("cms.settings.actions.save")}
          </button>
        </div>

      </form>
    </div>
  );
}
