import React, { useEffect, useState, useCallback, useRef } from "react";
import UploadLimits, { PICTURE_ACCEPT } from "../../../components/forms/cms/UploadLimits";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useSweetAlert } from "../../../components/common/SweetAlert";
import {
  getAdminAbout,
  updateAdminAbout,
  createStat,
  updateStat,
  deleteStat,
  createPost,
  updatePost,
  deletePost,
  createSection,
  updateSection,
  deleteSection,
  createIcon,
  updateIcon,
  deleteIcon,
  createPartner,
  updatePartner,
  deletePartner,
} from "../../../api/aboutApi";
import { BilingualField } from "../../../components/forms/cms";
import { parseApiError } from "../../../utils/apiErrors";
import "../../../styles/forms/cms-form.css";
import "../../../styles/dashboard/cms/about.css";
import Deletebtn from "../../../components/common/dashboard/Deletebtn";

/* ═══════════════════════════════════════════════════
   ICONS
═══════════════════════════════════════════════════ */
const IconAbout = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 9v5M10 7v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const IconSave = () => (
  <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path d="M2 2H10.5L13 4.5V13H2V2Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.5 2V5.5H10V2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 8.5H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const IconPlus = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
    <path d="M6.5 2v9M2 6.5h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const IconPreview = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M1 8S3.5 3 8 3s7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);
const IconImage = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="5.5" cy="6" r="1.5" fill="currentColor" opacity=".5" />
    <path d="M1 10.5L5 7.5L8 10L11 7.5L15 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconStat = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2 12V8M6 12V5M10 12V7M14 12V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const IconPost = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="1.5" y="2" width="13" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M4 5.5h8M4 8h6M4 10.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);
const IconSection = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="1.5" y="2" width="13" height="3" rx="1" fill="currentColor" opacity=".3" />
    <rect x="1.5" y="7" width="8" height="2" rx="1" fill="currentColor" opacity=".5" />
    <rect x="1.5" y="11" width="10" height="2" rx="1" fill="currentColor" opacity=".5" />
  </svg>
);
const IconPartner = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2L9.5 5.5L13.5 6L10.5 8.5L11.5 12.5L8 10.5L4.5 12.5L5.5 8.5L2.5 6L6.5 5.5L8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
);
const IconUpload = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 9V2M7 2L4.5 4.5M7 2L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1.5 10v1.5A1 1 0 002.5 12.5h9a1 1 0 001-1V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
    <path d="M2 7L5 10L11 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Spinner = () => (
  <span className="ca-spinner" aria-hidden="true">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"
        strokeDasharray="28" strokeDashoffset="10" strokeLinecap="round" />
    </svg>
  </span>
);

/* ═══════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════ */
function toFormData(data) {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    fd.append(key, value);
  });
  return fd;
}

function isVideoUrl(url) {
  return url && /\.(mp4|webm|mov|avi)$/i.test(url);
}

/**
 * Shows what the server actually said instead of one generic failure.
 *
 * Every handler on this screen used to answer a rejected write with
 * `toast.error("save failed")` and drop the server's message, so an editor
 * could not tell a too-long title from an expired session. The parsed field
 * messages are returned so a caller can put them on the fields as well.
 */
function notifyError(error, fallback) {
  const parsed = parseApiError(error);

  if (!parsed.canceled) toast.error(parsed.message || fallback);

  return parsed;
}

/* ═══════════════════════════════════════════════════
   SHARED FIELD / CARD PRIMITIVES
═══════════════════════════════════════════════════ */
function Field({ label, hint, children }) {
  return (
    <div className="ca-field">
      <label className="ca-label">
        {label}
        {hint && <span className="ca-label-hint">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function SectionDivider({ label }) {
  return (
    <div className="ca-divider">
      <div className="ca-divider-line" />
      <span className="ca-divider-label">{label}</span>
      <div className="ca-divider-line" />
    </div>
  );
}

function FileUploadZone({ accept, onChange, preview, previewType = "image", label }) {
  const inputRef = useRef();
  return (
    <div className="ca-upload-zone">
      {preview ? (
        <div className="ca-upload-preview">
          {previewType === "video" || isVideoUrl(preview) ? (
            <video src={preview} className="ca-preview-media ca-preview-media--video" muted />
          ) : (
            <img src={preview} alt="" className="ca-preview-media" />
          )}
          <button
            type="button"
            className="ca-upload-replace-btn"
            onClick={() => inputRef.current?.click()}
          >
            <IconUpload />
            {label || "Replace"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="ca-upload-trigger"
          onClick={() => inputRef.current?.click()}
        >
          <IconUpload />
          <span>{label || "Upload file"}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={onChange}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TAB 1 — GENERAL
═══════════════════════════════════════════════════ */
function GeneralTab({ data, reload }) {
  const { t } = useTranslation();
  const [logoFile, setLogoFile] = useState(null);
  const [mobileLogoFile, setMobileLogoFile] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [isActive, setIsActive] = useState(data.is_active ?? true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      if (logoFile) fd.append("logo", logoFile);
      if (mobileLogoFile) fd.append("mobile_logo", mobileLogoFile);
      if (mediaFile) fd.append("media", mediaFile);
      fd.append("is_active", isActive);
      await updateAdminAbout(fd);
      toast.success(t("cms.about.general.saveSuccess"));
      setLogoFile(null);
      setMobileLogoFile(null);
      setMediaFile(null);
      await reload();
    } catch (err) {
      notifyError(err, t("cms.about.error.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ca-tab-inner">
      <div className="ca-card">
        <div className="ca-card-header">
          <div className="ca-card-header-left">
            <span className="ca-card-icon ca-card-icon--blue"><IconAbout /></span>
            <h2 className="ca-card-title">{t("cms.about.general.cardTitle")}</h2>
          </div>
          <label className="ca-toggle-wrap">
            <span className="ca-toggle-label">{t("cms.about.general.isActive")}</span>
            <button
              type="button"
              className={`ca-toggle ${isActive ? "ca-toggle--on" : ""}`}
              onClick={() => setIsActive(!isActive)}
              aria-pressed={isActive}
            >
              <span className="ca-toggle-thumb" />
            </button>
          </label>
        </div>

        <div className="ca-card-body">
          <div className="ca-form-row">
            <div className="ca-form-group">
              <SectionDivider label={t("cms.about.general.logoSection")} />
              <Field label={t("cms.about.general.logoLabel")} hint={t("cms.about.general.logoHint")}>
                <FileUploadZone
                  accept={PICTURE_ACCEPT}
                  preview={logoFile ? URL.createObjectURL(logoFile) : data.logo_url}
                  previewType="image"
                  label={logoFile ? t("cms.about.general.changeFile") : t("cms.about.general.uploadLogo")}
                  onChange={(e) => {
                  <UploadLimits kind="logo_full" />
                    const f = e.target.files[0];
                    if (f) setLogoFile(f);
                  }}
                />
                {logoFile && (
                  <p className="ca-file-selected">
                    <IconCheck /> {logoFile.name}
                  </p>
                )}
              </Field>

              <Field label="شعار الجوال" hint="يظهر بدل الشعار الأساسي على الشاشات الصغيرة">
                <FileUploadZone
                  accept={PICTURE_ACCEPT}
                  preview={
                    mobileLogoFile
                      ? URL.createObjectURL(mobileLogoFile)
                      : data.mobile_logo_url
                  }
                  previewType="image"
                  label={mobileLogoFile ? t("cms.about.general.changeFile") : "رفع شعار الجوال"}
                  onChange={(e) => {
                  <UploadLimits kind="logo_compact" />
                    const f = e.target.files[0];
                    if (f) setMobileLogoFile(f);
                  }}
                />

                {mobileLogoFile && (
                  <p className="ca-file-selected">
                    <IconCheck /> {mobileLogoFile.name}
                  </p>
                )}
              </Field>
            </div>

            <div className="ca-form-group">
              <SectionDivider label={t("cms.about.general.mediaSection")} />
              <Field label={t("cms.about.general.mediaLabel")} hint={t("cms.about.general.mediaHint")}>
                <FileUploadZone
                  accept="image/*,video/*"
                  preview={mediaFile ? URL.createObjectURL(mediaFile) : data.media_url}
                  previewType={isVideoUrl(data.media_url) ? "video" : "image"}
                  label={mediaFile ? t("cms.about.general.changeFile") : t("cms.about.general.uploadMedia")}
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) setMediaFile(f);
                  }}
                />
                {mediaFile && (
                  <p className="ca-file-selected">
                    <IconCheck /> {mediaFile.name}
                  </p>
                )}
              </Field>
            </div>
          </div>

          <div className="ca-form-actions">
            <button
              type="button"
              className="ca-btn ca-btn--primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Spinner /> : <IconSave />}
              {t("cms.about.general.saveBtn")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TAB 2 — STATS
═══════════════════════════════════════════════════ */
const emptyStat = () => ({ number: "", label_ar: "", label_en: "", order: 0, is_active: true });

function StatsTab({ data, reload }) {
  const { t } = useTranslation();
  const { alert: sweetAlertEl, show: showAlert } = useSweetAlert();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [newStat, setNewStat] = useState(emptyStat());
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [editForms, setEditForms] = useState({});
  const [addErrors, setAddErrors] = useState({});
  const [rowErrors, setRowErrors] = useState({});

  const stats = data.stats || [];

  useEffect(() => {
    const forms = {};
    stats.forEach((s) => {
      forms[s.id] = { number: s.number || "", label_ar: s.label_ar || "", label_en: s.label_en || "", order: s.order || 0, is_active: s.is_active ?? true };
    });
    setEditForms(forms);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- child arrays are derived from data.
  }, [data]);

  const handleAdd = async () => {
    if (!newStat.number.trim() || (!newStat.label_ar.trim() && !newStat.label_en.trim())) {
      toast.error(t("cms.about.stats.validationError"));
      return;
    }
    setAdding(true);
    try {
      await createStat({ ...newStat, order: stats.length });
      toast.success(t("cms.about.stats.addSuccess"));
      setNewStat(emptyStat());
      setAddErrors({});
      await reload();
    } catch (err) {
      setAddErrors(notifyError(err, t("cms.about.error.saveFailed")).fields);
    } finally {
      setAdding(false);
    }
  };

  const handleSaveStat = async (id) => {
    setSavingId(id);
    try {
      await updateStat(id, editForms[id]);
      toast.success(t("cms.about.stats.updateSuccess"));
      setRowErrors((prev) => ({ ...prev, [id]: {} }));
      await reload();
    } catch (err) {
      const parsed = notifyError(err, t("cms.about.error.saveFailed"));
      setRowErrors((prev) => ({ ...prev, [id]: parsed.fields }));
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showAlert({
      type: "confirm",
      title: t("cms.about.confirmDeleteTitle"),
      message: t("cms.about.confirmDeleteText"),
      confirmText: t("cms.about.deleteBtn"),
      cancelText: t("cms.about.cancelBtn"),
      showCancel: true,
      isRtl,
    });
    if (!confirmed) return;
    try {
      await deleteStat(id);
      toast.success(t("cms.about.stats.deleteSuccess"));
      await reload();
    } catch (err) {
      notifyError(err, t("cms.about.error.deleteFailed"));
    }
  };

  const updateField = (id, field, value) => {
    setEditForms((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  return (
    <div className="ca-tab-inner">
      {sweetAlertEl}

      {/* Add new stat */}
      <div className="ca-card">
        <div className="ca-card-header">
          <div className="ca-card-header-left">
            <span className="ca-card-icon ca-card-icon--green"><IconStat /></span>
            <h2 className="ca-card-title">{t("cms.about.stats.addTitle")}</h2>
          </div>
        </div>
        <div className="ca-card-body">
          <div className="ca-form-row ca-form-row--4">
            <div className="ca-form-group">
              <Field label={t("cms.about.stats.numberLabel")} hint={t("cms.about.stats.numberHint")}>
                <input
                  className="ca-input"
                  value={newStat.number}
                  onChange={(e) => setNewStat({ ...newStat, number: e.target.value })}
                  placeholder="+20 / 360° / 24/7"
                />
              </Field>
            </div>
            <div className="ca-form-group ca-form-group--wide">
              <BilingualField
                label={t("cms.about.stats.labelAr")}
                name="label"
                values={newStat}
                errors={addErrors}
                onChange={(name, value) => setNewStat({ ...newStat, [name]: value })}
                placeholder={t("cms.about.stats.labelArPlaceholder")}
                placeholderEn={t("cms.about.stats.labelEnPlaceholder")}
              />
            </div>
            <div className="ca-form-group">
              <Field label={t("cms.about.stats.orderLabel")}>
                <input
                  className="ca-input"
                  type="number"
                  value={newStat.order}
                  onChange={(e) => setNewStat({ ...newStat, order: parseInt(e.target.value) || 0 })}
                />
              </Field>
            </div>
          </div>
          <div className="ca-form-actions">
            <button
              type="button"
              className="ca-btn ca-btn--primary"
              onClick={handleAdd}
              disabled={adding}
            >
              {adding ? <Spinner /> : <IconPlus />}
              {t("cms.about.stats.addButton")}
            </button>
            <label className="ca-inline-toggle">
              <input
                type="checkbox"
                checked={newStat.is_active}
                onChange={(e) => setNewStat({ ...newStat, is_active: e.target.checked })}
              />
              <span>{t("cms.about.stats.isActive")}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Existing stats */}
      {stats.length > 0 && (
        <div className="ca-card">
          <div className="ca-card-header">
            <div className="ca-card-header-left">
              <span className="ca-card-icon ca-card-icon--purple"><IconStat /></span>
              <h2 className="ca-card-title">{t("cms.about.stats.listTitle")}</h2>
            </div>
            <span className="ca-count-badge">{stats.length}</span>
          </div>
          <div className="ca-card-body ca-card-body--no-top">
            <div className="ca-items-list">
              {stats.map((s) => (
                <div key={s.id} className="ca-item-row">
                  <div className="ca-item-stat-number">{s.number}</div>
                  <div className="ca-item-body">
                    <div className="ca-form-row ca-form-row--4">
                      <div className="ca-form-group">
                        <Field label={t("cms.about.stats.numberLabel")}>
                          <input
                            className="ca-input ca-input--sm"
                            value={editForms[s.id]?.number ?? s.number}
                            onChange={(e) => updateField(s.id, "number", e.target.value)}
                          />
                        </Field>
                      </div>
                      <div className="ca-form-group ca-form-group--wide">
                        <BilingualField
                          label={t("cms.about.stats.labelAr")}
                          name="label"
                          values={editForms[s.id] ?? s}
                          errors={rowErrors[s.id] ?? {}}
                          onChange={(name, value) => updateField(s.id, name, value)}
                        />
                      </div>
                      <div className="ca-form-group">
                        <Field label={t("cms.about.stats.orderLabel")}>
                          <input
                            className="ca-input ca-input--sm"
                            type="number"
                            value={editForms[s.id]?.order ?? s.order}
                            onChange={(e) => updateField(s.id, "order", parseInt(e.target.value) || 0)}
                          />
                        </Field>
                      </div>
                    </div>
                    <div className="ca-item-actions">
                      <label className="ca-inline-toggle">
                        <input
                          type="checkbox"
                          checked={editForms[s.id]?.is_active ?? s.is_active}
                          onChange={(e) => updateField(s.id, "is_active", e.target.checked)}
                        />
                        <span>{t("cms.about.stats.isActive")}</span>
                      </label>
                      <button
                        type="button"
                        className="ca-btn ca-btn--save"
                        onClick={() => handleSaveStat(s.id)}
                        disabled={savingId === s.id}
                      >
                        {savingId === s.id ? <Spinner /> : <IconSave />}
                        {t("cms.about.saveBtn")}
                      </button>
                      <Deletebtn
                        onConfirm={() => handleDelete(s.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TAB 3 — POSTS
═══════════════════════════════════════════════════ */
const emptyPost = () => ({
  title_ar: "", title_en: "", subtitle_ar: "", subtitle_en: "",
  body_ar: "", body_en: "", order: 0, is_active: true, image: null,
});

function PostsTab({ data, reload }) {
  const { t } = useTranslation();
  const { alert: sweetAlertEl, show: showAlert } = useSweetAlert();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [newPost, setNewPost] = useState(emptyPost());
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [editForms, setEditForms] = useState({});
  const [imageFiles, setImageFiles] = useState({});
  const [addErrors, setAddErrors] = useState({});
  const [rowErrors, setRowErrors] = useState({});

  const posts = data.posts || [];

  useEffect(() => {
    const forms = {};
    posts.forEach((p) => {
      forms[p.id] = {
        title_ar: p.title_ar || "", title_en: p.title_en || "",
        subtitle_ar: p.subtitle_ar || "", subtitle_en: p.subtitle_en || "",
        body_ar: p.body_ar || "", body_en: p.body_en || "",
        order: p.order || 0, is_active: p.is_active ?? true,
      };
    });
    setEditForms(forms);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- child arrays are derived from data.
  }, [data]);

  const handleAdd = async () => {
    if (!newPost.title_ar.trim() && !newPost.title_en.trim()) {
      toast.error(t("cms.about.posts.validationError"));
      return;
    }
    setAdding(true);
    try {
      const fd = new FormData();
      Object.entries(newPost).forEach(([k, v]) => {
        if (k === "image" && v) fd.append(k, v);
        else if (k !== "image") fd.append(k, v);
      });
      fd.set("order", posts.length);
      await createPost(fd);
      toast.success(t("cms.about.posts.addSuccess"));
      setNewPost(emptyPost());
      setAddErrors({});
      await reload();
    } catch (err) {
      setAddErrors(notifyError(err, t("cms.about.error.saveFailed")).fields);
    } finally {
      setAdding(false);
    }
  };

  const handleSave = async (id) => {
    setSavingId(id);
    try {
      const form = editForms[id];
      const imgFile = imageFiles[id];
      if (imgFile) {
        const fd = toFormData({ ...form, image: imgFile });
        await updatePost(id, fd);
        setImageFiles((prev) => { const n = { ...prev }; delete n[id]; return n; });
      } else {
        await updatePost(id, form);
      }
      toast.success(t("cms.about.posts.updateSuccess"));
      setRowErrors((prev) => ({ ...prev, [id]: {} }));
      await reload();
    } catch (err) {
      const parsed = notifyError(err, t("cms.about.error.saveFailed"));
      setRowErrors((prev) => ({ ...prev, [id]: parsed.fields }));
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showAlert({
      type: "confirm",
      title: t("cms.about.confirmDeleteTitle"),
      message: t("cms.about.confirmDeleteText"),
      confirmText: t("cms.about.deleteBtn"),
      cancelText: t("cms.about.cancelBtn"),
      showCancel: true,
      isRtl,
    });
    if (!confirmed) return;
    try {
      await deletePost(id);
      toast.success(t("cms.about.posts.deleteSuccess"));
      await reload();
    } catch (err) {
      notifyError(err, t("cms.about.error.deleteFailed"));
    }
  };

  const updateField = (id, field, value) => {
    setEditForms((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  return (
    <div className="ca-tab-inner">
      {sweetAlertEl}

      {/* Add new post */}
      <div className="ca-card">
        <div className="ca-card-header">
          <div className="ca-card-header-left">
            <span className="ca-card-icon ca-card-icon--amber"><IconPost /></span>
            <h2 className="ca-card-title">{t("cms.about.posts.addTitle")}</h2>
          </div>
        </div>
        <div className="ca-card-body">
          <div className="ca-form-row">
            <div className="ca-form-group ca-form-group--wide">
              <BilingualField
                label={t("cms.about.posts.subtitleAr")}
                name="subtitle"
                values={newPost}
                errors={addErrors}
                onChange={(name, value) => setNewPost({ ...newPost, [name]: value })}
                placeholder={t("cms.about.posts.subtitleArPlaceholder")}
                placeholderEn={t("cms.about.posts.subtitleEnPlaceholder")}
              />
            </div>
          </div>
          <div className="ca-form-row">
            <div className="ca-form-group ca-form-group--wide">
              <BilingualField
                label={t("cms.about.posts.titleAr")}
                name="title"
                values={newPost}
                errors={addErrors}
                onChange={(name, value) => setNewPost({ ...newPost, [name]: value })}
                placeholder={t("cms.about.posts.titleArPlaceholder")}
                placeholderEn={t("cms.about.posts.titleEnPlaceholder")}
              />
            </div>
          </div>
          <div className="ca-form-row">
            <div className="ca-form-group ca-form-group--wide">
              <BilingualField
                label={t("cms.about.posts.bodyAr")}
                name="body"
                as="textarea"
                rows={3}
                values={newPost}
                errors={addErrors}
                onChange={(name, value) => setNewPost({ ...newPost, [name]: value })}
                placeholder={t("cms.about.posts.bodyArPlaceholder")}
                placeholderEn={t("cms.about.posts.bodyEnPlaceholder")}
              />
            </div>
          </div>
          <div className="ca-form-row">
            <div className="ca-form-group">
              <Field label={t("cms.about.posts.imageLabel")}>
                <FileUploadZone
                  accept={PICTURE_ACCEPT}
                  preview={newPost.image ? URL.createObjectURL(newPost.image) : null}
                  label={newPost.image ? t("cms.about.general.changeFile") : t("cms.about.posts.uploadImage")}
                  onChange={(e) => {
                  <UploadLimits />
                    const f = e.target.files[0];
                    if (f) setNewPost({ ...newPost, image: f });
                  }}
                />
                {newPost.image && (
                  <p className="ca-file-selected"><IconCheck /> {newPost.image.name}</p>
                )}
              </Field>
            </div>
            <div className="ca-form-group">
              <Field label={t("cms.about.stats.orderLabel")}>
                <input className="ca-input" type="number" value={newPost.order}
                  onChange={(e) => setNewPost({ ...newPost, order: parseInt(e.target.value) || 0 })} />
              </Field>
            </div>
          </div>
          <div className="ca-form-actions">
            <button type="button" className="ca-btn ca-btn--primary" onClick={handleAdd} disabled={adding}>
              {adding ? <Spinner /> : <IconPlus />}
              {t("cms.about.posts.addButton")}
            </button>
            <label className="ca-inline-toggle">
              <input type="checkbox" checked={newPost.is_active}
                onChange={(e) => setNewPost({ ...newPost, is_active: e.target.checked })} />
              <span>{t("cms.about.stats.isActive")}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Existing posts */}
      {posts.length > 0 && (
        <div className="ca-card">
          <div className="ca-card-header">
            <div className="ca-card-header-left">
              <span className="ca-card-icon ca-card-icon--purple"><IconPost /></span>
              <h2 className="ca-card-title">{t("cms.about.posts.listTitle")}</h2>
            </div>
            <span className="ca-count-badge">{posts.length}</span>
          </div>
          <div className="ca-card-body ca-card-body--no-top">
            <div className="ca-items-list">
              {posts.map((p) => (
                <div key={p.id} className="ca-item-row ca-item-row--post">
                  {(imageFiles[p.id] ? URL.createObjectURL(imageFiles[p.id]) : p.image_url) && (
                    <div className="ca-post-thumb">
                      <img
                        src={imageFiles[p.id] ? URL.createObjectURL(imageFiles[p.id]) : p.image_url}
                        alt=""
                      />
                    </div>
                  )}
                  <div className="ca-item-body ca-item-body--full">
                    <div className="ca-form-row">
                      <div className="ca-form-group ca-form-group--wide">
                        <BilingualField
                          label={t("cms.about.posts.subtitleAr")}
                          name="subtitle"
                          values={editForms[p.id] ?? {}}
                          errors={rowErrors[p.id] ?? {}}
                          onChange={(field, value) => updateField(p.id, field, value)}
                        />
                      </div>
                    </div>
                    <div className="ca-form-row">
                      <div className="ca-form-group ca-form-group--wide">
                        <BilingualField
                          label={t("cms.about.posts.titleAr")}
                          name="title"
                          values={editForms[p.id] ?? {}}
                          errors={rowErrors[p.id] ?? {}}
                          onChange={(field, value) => updateField(p.id, field, value)}
                        />
                      </div>
                    </div>
                    <div className="ca-form-row">
                      <div className="ca-form-group ca-form-group--wide">
                        <BilingualField
                          label={t("cms.about.posts.bodyAr")}
                          name="body"
                          as="textarea"
                          rows={2}
                          values={editForms[p.id] ?? {}}
                          errors={rowErrors[p.id] ?? {}}
                          onChange={(field, value) => updateField(p.id, field, value)}
                        />
                      </div>
                    </div>
                    <div className="ca-form-row">
                      <div className="ca-form-group">
                        <Field label={t("cms.about.posts.imageLabel")}>
                          <label className="ca-upload-inline-btn">
                            <IconUpload />
                            {imageFiles[p.id] ? imageFiles[p.id].name : t("cms.about.posts.replaceImage")}
                            <input type="file" accept={PICTURE_ACCEPT} style={{ display: "none" }}
                              onChange={(e) => {
                            <UploadLimits kind="icon" />
                                const f = e.target.files[0];
                                if (f) setImageFiles((prev) => ({ ...prev, [p.id]: f }));
                              }} />
                          </label>
                        </Field>
                      </div>
                      <div className="ca-form-group">
                        <Field label={t("cms.about.stats.orderLabel")}>
                          <input className="ca-input ca-input--sm" type="number"
                            value={editForms[p.id]?.order ?? 0}
                            onChange={(e) => updateField(p.id, "order", parseInt(e.target.value) || 0)} />
                        </Field>
                      </div>
                    </div>
                    <div className="ca-item-actions">
                      <label className="ca-inline-toggle">
                        <input type="checkbox"
                          checked={editForms[p.id]?.is_active ?? true}
                          onChange={(e) => updateField(p.id, "is_active", e.target.checked)} />
                        <span>{t("cms.about.stats.isActive")}</span>
                      </label>
                      <button type="button" className="ca-btn ca-btn--save"
                        onClick={() => handleSave(p.id)} disabled={savingId === p.id}>
                        {savingId === p.id ? <Spinner /> : <IconSave />}
                        {t("cms.about.saveBtn")}
                      </button>
                      <Deletebtn
                        onConfirm={() => handleDelete(p.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TAB 4 — SECTIONS + ICONS
═══════════════════════════════════════════════════ */
const emptySection = () => ({
  key: "", subtitle_ar: "", subtitle_en: "", title_ar: "", title_en: "",
  body_ar: "", body_en: "", order: 0,
});
const emptyIcon = () => ({ label_ar: "", label_en: "", order: 0, icon: null });

function IconRow({ icon, onSave, onDelete, saving }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ label_ar: icon.label_ar || "", label_en: icon.label_en || "", order: icon.order || 0 });
  const [iconFile, setIconFile] = useState(null);

  return (
    <div className="ca-icon-row">
      <div className="ca-icon-preview">
        {(iconFile ? URL.createObjectURL(iconFile) : icon.icon_url) ? (
          <img src={iconFile ? URL.createObjectURL(iconFile) : icon.icon_url} alt="" className="ca-icon-img" />
        ) : (
          <div className="ca-icon-placeholder"><IconImage /></div>
        )}
        <label className="ca-icon-replace-btn">
          <IconUpload />
          <input type="file" accept={PICTURE_ACCEPT} style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files[0]; if (f) setIconFile(f); }} />
          <UploadLimits kind="icon" />
        </label>
      </div>
      <div className="ca-icon-fields">
        <BilingualField
          label={t("cms.about.sections.iconLabelAr")}
          name="label"
          values={form}
          onChange={(name, value) => setForm({ ...form, [name]: value })}
          placeholder={t("cms.about.sections.iconLabelAr")}
          placeholderEn={t("cms.about.sections.iconLabelEn")}
        />
        <input className="ca-input ca-input--sm ca-input--tiny" type="number"
          value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
      </div>
      <div className="ca-icon-actions">
        <button type="button" className="ca-icon-btn ca-icon-btn--save"
          onClick={() => onSave(icon.id, form, iconFile)} disabled={saving}>
          {saving ? <Spinner /> : <IconSave />}
        </button>
        <Deletebtn
          onConfirm={() => onDelete(icon.id)}
        />
      </div>
    </div>
  );
}

function SectionsTab({ data, reload }) {
  const { t } = useTranslation();
  const { alert: sweetAlertEl, show: showAlert } = useSweetAlert();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [newSection, setNewSection] = useState(emptySection());
  const [addErrors, setAddErrors] = useState({});
  const [rowErrors, setRowErrors] = useState({});
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [editForms, setEditForms] = useState({});
  const [newIconForms, setNewIconForms] = useState({});
  const [addingIconId, setAddingIconId] = useState(null);
  const [savingIconId, setSavingIconId] = useState(null);

  const sections = data.sections || [];

  useEffect(() => {
    const forms = {};
    const iconForms = {};
    sections.forEach((s) => {
      forms[s.id] = {
        key: s.key || "", subtitle_ar: s.subtitle_ar || "", subtitle_en: s.subtitle_en || "",
        title_ar: s.title_ar || "", title_en: s.title_en || "",
        body_ar: s.body_ar || "", body_en: s.body_en || "", order: s.order || 0,
      };
      iconForms[s.id] = emptyIcon();
    });
    setEditForms(forms);
    setNewIconForms(iconForms);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- child arrays are derived from data.
  }, [data]);

  const handleAddSection = async () => {
    const autoKey = newSection.key.trim() || `section-${Date.now()}`;
    if (!newSection.title_ar.trim() && !newSection.title_en.trim() && !newSection.key.trim()) {
      toast.error(t("cms.about.sections.validationError"));
      return;
    }
    setAdding(true);
    try {
      await createSection({ ...newSection, key: autoKey, order: sections.length });
      toast.success(t("cms.about.sections.addSuccess"));
      setNewSection(emptySection());
      setAddErrors({});
      await reload();
    } catch (err) {
      setAddErrors(notifyError(err, t("cms.about.error.saveFailed")).fields);
    } finally {
      setAdding(false);
    }
  };

  const handleSaveSection = async (id) => {
    setSavingId(id);
    try {
      await updateSection(id, editForms[id]);
      toast.success(t("cms.about.sections.updateSuccess"));
      setRowErrors((prev) => ({ ...prev, [id]: {} }));
      await reload();
    } catch (err) {
      const parsed = notifyError(err, t("cms.about.error.saveFailed"));
      setRowErrors((prev) => ({ ...prev, [id]: parsed.fields }));
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteSection = async (id) => {
    const confirmed = await showAlert({
      type: "confirm",
      title: t("cms.about.confirmDeleteTitle"),
      message: t("cms.about.confirmDeleteText"),
      confirmText: t("cms.about.deleteBtn"),
      cancelText: t("cms.about.cancelBtn"),
      showCancel: true,
      isRtl,
    });
    if (!confirmed) return;
    try {
      await deleteSection(id);
      toast.success(t("cms.about.sections.deleteSuccess"));
      await reload();
    } catch (err) {
      notifyError(err, t("cms.about.error.deleteFailed"));
    }
  };

  const handleAddIcon = async (sectionId) => {
    const iconForm = newIconForms[sectionId];
    if (!iconForm?.icon) {
      toast.error(t("cms.about.sections.iconFileRequired"));
      return;
    }
    setAddingIconId(sectionId);
    try {
      const fd = new FormData();
      fd.append("section", sectionId);
      fd.append("icon", iconForm.icon);
      fd.append("label_ar", iconForm.label_ar);
      fd.append("label_en", iconForm.label_en);
      fd.append("order", iconForm.order);
      await createIcon(fd);
      toast.success(t("cms.about.sections.iconAddSuccess"));
      setNewIconForms((prev) => ({ ...prev, [sectionId]: emptyIcon() }));
      await reload();
    } catch (err) {
      notifyError(err, t("cms.about.error.saveFailed"));
    } finally {
      setAddingIconId(null);
    }
  };

  const handleSaveIcon = async (iconId, form, iconFile) => {
    setSavingIconId(iconId);
    try {
      if (iconFile) {
        const fd = toFormData({ ...form, icon: iconFile });
        await updateIcon(iconId, fd);
      } else {
        await updateIcon(iconId, form);
      }
      toast.success(t("cms.about.sections.iconUpdateSuccess"));
      await reload();
    } catch (err) {
      notifyError(err, t("cms.about.error.saveFailed"));
    } finally {
      setSavingIconId(null);
    }
  };

  const handleDeleteIcon = async (iconId) => {
    const confirmed = await showAlert({
      type: "confirm",
      title: t("cms.about.confirmDeleteTitle"),
      message: t("cms.about.confirmDeleteText"),
      confirmText: t("cms.about.deleteBtn"),
      cancelText: t("cms.about.cancelBtn"),
      showCancel: true,
      isRtl,
    });
    if (!confirmed) return;
    try {
      await deleteIcon(iconId);
      toast.success(t("cms.about.sections.iconDeleteSuccess"));
      await reload();
    } catch (err) {
      notifyError(err, t("cms.about.error.deleteFailed"));
    }
  };

  const updateSectionField = (id, field, value) => {
    setEditForms((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  return (
    <div className="ca-tab-inner">
      {sweetAlertEl}

      {/* Add new section */}
      <div className="ca-card">
        <div className="ca-card-header">
          <div className="ca-card-header-left">
            <span className="ca-card-icon ca-card-icon--teal"><IconSection /></span>
            <h2 className="ca-card-title">{t("cms.about.sections.addTitle")}</h2>
          </div>
        </div>
        <div className="ca-card-body">
          <div className="ca-form-row">
            <div className="ca-form-group">
              <Field label={t("cms.about.sections.keyLabel")} hint={t("cms.about.sections.keyHint")}>
                <input className="ca-input" value={newSection.key}
                  onChange={(e) => setNewSection({ ...newSection, key: e.target.value })}
                  placeholder="mission / vision / values" />
              </Field>
            </div>
            <div className="ca-form-group">
              <Field label={t("cms.about.stats.orderLabel")}>
                <input className="ca-input" type="number" value={newSection.order}
                  onChange={(e) => setNewSection({ ...newSection, order: parseInt(e.target.value) || 0 })} />
              </Field>
            </div>
          </div>
          <div className="ca-form-row">
            <div className="ca-form-group ca-form-group--wide">
              <BilingualField
                label={t("cms.about.sections.subtitleAr")}
                name="subtitle"
                values={newSection}
                errors={addErrors}
                onChange={(name, value) => setNewSection({ ...newSection, [name]: value })}
              />
            </div>
          </div>
          <div className="ca-form-row">
            <div className="ca-form-group ca-form-group--wide">
              <BilingualField
                label={t("cms.about.sections.titleAr")}
                name="title"
                values={newSection}
                errors={addErrors}
                onChange={(name, value) => setNewSection({ ...newSection, [name]: value })}
              />
            </div>
          </div>
          <div className="ca-form-row">
            <div className="ca-form-group ca-form-group--wide">
              <BilingualField
                label={t("cms.about.sections.bodyAr")}
                name="body"
                as="textarea"
                rows={3}
                values={newSection}
                errors={addErrors}
                onChange={(name, value) => setNewSection({ ...newSection, [name]: value })}
              />
            </div>
          </div>
          <div className="ca-form-actions">
            <button type="button" className="ca-btn ca-btn--primary" onClick={handleAddSection} disabled={adding}>
              {adding ? <Spinner /> : <IconPlus />}
              {t("cms.about.sections.addButton")}
            </button>
          </div>
        </div>
      </div>

      {/* Existing sections */}
      {sections.length > 0 && (
        <div className="ca-card">
          <div className="ca-card-header">
            <div className="ca-card-header-left">
              <span className="ca-card-icon ca-card-icon--purple"><IconSection /></span>
              <h2 className="ca-card-title">{t("cms.about.sections.listTitle")}</h2>
            </div>
            <span className="ca-count-badge">{sections.length}</span>
          </div>
          <div className="ca-card-body ca-card-body--no-top">
            {sections.map((sec) => (
              <div key={sec.id} className="ca-section-block">
                <div className="ca-section-header">
                  <div className="ca-section-header-left">
                    <span className="ca-section-number">{sec.order}</span>
                    <code className="ca-section-key">{sec.key}</code>
                    <span className="ca-section-title-preview">
                      {sec.title_ar || sec.title_en || "—"}
                    </span>
                  </div>
                  <div className="ca-section-header-actions">
                    <button type="button" className="ca-btn ca-btn--save ca-btn--sm"
                      onClick={() => handleSaveSection(sec.id)} disabled={savingId === sec.id}>
                      {savingId === sec.id ? <Spinner /> : <IconSave />}
                      {t("cms.about.saveBtn")}
                    </button>
                    <Deletebtn
                      onConfirm={() => handleDeleteSection(sec.id)}
                    />
                  </div>
                </div>

                <div className="ca-section-body">
                  <div className="ca-form-row">
                    <div className="ca-form-group">
                      <Field label={t("cms.about.sections.keyLabel")}>
                        <input className="ca-input ca-input--sm" value={editForms[sec.id]?.key ?? ""}
                          onChange={(e) => updateSectionField(sec.id, "key", e.target.value)} />
                      </Field>
                    </div>
                    <div className="ca-form-group">
                      <Field label={t("cms.about.stats.orderLabel")}>
                        <input className="ca-input ca-input--sm" type="number"
                          value={editForms[sec.id]?.order ?? 0}
                          onChange={(e) => updateSectionField(sec.id, "order", parseInt(e.target.value) || 0)} />
                      </Field>
                    </div>
                  </div>
                  <div className="ca-form-row">
                    <div className="ca-form-group ca-form-group--wide">
                      <BilingualField
                        label={t("cms.about.sections.subtitleAr")}
                        name="subtitle"
                        values={editForms[sec.id] ?? {}}
                        errors={rowErrors[sec.id] ?? {}}
                        onChange={(field, value) => updateSectionField(sec.id, field, value)}
                      />
                    </div>
                  </div>
                  <div className="ca-form-row">
                    <div className="ca-form-group ca-form-group--wide">
                      <BilingualField
                        label={t("cms.about.sections.titleAr")}
                        name="title"
                        values={editForms[sec.id] ?? {}}
                        errors={rowErrors[sec.id] ?? {}}
                        onChange={(field, value) => updateSectionField(sec.id, field, value)}
                      />
                    </div>
                  </div>
                  <div className="ca-form-row">
                    <div className="ca-form-group ca-form-group--wide">
                      <BilingualField
                        label={t("cms.about.sections.bodyAr")}
                        name="body"
                        as="textarea"
                        rows={2}
                        values={editForms[sec.id] ?? {}}
                        errors={rowErrors[sec.id] ?? {}}
                        onChange={(field, value) => updateSectionField(sec.id, field, value)}
                      />
                    </div>
                  </div>

                  {/* Icons sub-section */}
                  <div className="ca-icons-section">
                    <SectionDivider label={t("cms.about.sections.iconsTitle")} />

                    {/* Add icon form */}
                    <div className="ca-add-icon-row">
                      <div className="ca-icon-upload-area">
                        <label className="ca-upload-inline-btn">
                          <IconUpload />
                          {newIconForms[sec.id]?.icon
                            ? newIconForms[sec.id].icon.name
                            : t("cms.about.sections.uploadIcon")}
                          <input type="file" accept={PICTURE_ACCEPT}
                            style={{ display: "none" }}
                            onChange={(e) => {
                          <UploadLimits kind="icon" />
                              const f = e.target.files[0];
                              if (f) setNewIconForms((prev) => ({ ...prev, [sec.id]: { ...prev[sec.id], icon: f } }));
                            }} />
                        </label>
                      </div>
                      <input className="ca-input ca-input--sm" dir="rtl"
                        value={newIconForms[sec.id]?.label_ar ?? ""}
                        onChange={(e) => setNewIconForms((prev) => ({ ...prev, [sec.id]: { ...prev[sec.id], label_ar: e.target.value } }))}
                        placeholder={t("cms.about.sections.iconLabelAr")} />
                      <input className="ca-input ca-input--sm"
                        value={newIconForms[sec.id]?.label_en ?? ""}
                        onChange={(e) => setNewIconForms((prev) => ({ ...prev, [sec.id]: { ...prev[sec.id], label_en: e.target.value } }))}
                        placeholder={t("cms.about.sections.iconLabelEn")} />
                      <input className="ca-input ca-input--sm ca-input--tiny" type="number"
                        value={newIconForms[sec.id]?.order ?? 0}
                        onChange={(e) => setNewIconForms((prev) => ({ ...prev, [sec.id]: { ...prev[sec.id], order: parseInt(e.target.value) || 0 } }))} />
                      <button type="button" className="ca-btn ca-btn--primary ca-btn--sm"
                        onClick={() => handleAddIcon(sec.id)}
                        disabled={addingIconId === sec.id}>
                        {addingIconId === sec.id ? <Spinner /> : <IconPlus />}
                        {t("cms.about.sections.addIconButton")}
                      </button>
                    </div>

                    {/* Existing icons */}
                    {sec.icons && sec.icons.length > 0 && (
                      <div className="ca-icons-list">
                        {sec.icons.map((icon) => (
                          <IconRow
                            key={icon.id}
                            icon={icon}
                            onSave={handleSaveIcon}
                            onDelete={handleDeleteIcon}
                            saving={savingIconId === icon.id}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TAB 5 — PARTNERS
═══════════════════════════════════════════════════ */
function PartnersTab({ data, reload }) {
  const { t } = useTranslation();
  const { alert: sweetAlertEl, show: showAlert } = useSweetAlert();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [subtitleForm, setSubtitleForm] = useState({
    partners_subtitle_ar: data.partners_subtitle_ar || "",
    partners_subtitle_en: data.partners_subtitle_en || "",
  });
  const [savingSubtitle, setSavingSubtitle] = useState(false);
  const [newPartnerFile, setNewPartnerFile] = useState(null);
  const [newPartnerOrder, setNewPartnerOrder] = useState(0);
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [editOrders, setEditOrders] = useState({});
  const [replaceFiles, setReplaceFiles] = useState({});
  const [subtitleErrors, setSubtitleErrors] = useState({});

  const partners = data.partners || [];

  useEffect(() => {
    const orders = {};
    partners.forEach((p) => { orders[p.id] = p.order || 0; });
    setEditOrders(orders);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- child arrays are derived from data.
  }, [data]);

  const handleSaveSubtitle = async () => {
    setSavingSubtitle(true);
    try {
      await updateAdminAbout(subtitleForm);
      toast.success(t("cms.about.partners.subtitleSaved"));
      setSubtitleErrors({});
      await reload();
    } catch (err) {
      setSubtitleErrors(notifyError(err, t("cms.about.error.saveFailed")).fields);
    } finally {
      setSavingSubtitle(false);
    }
  };

  const handleAddPartner = async () => {
    if (!newPartnerFile) {
      toast.error(t("cms.about.partners.logoRequired"));
      return;
    }
    setAdding(true);
    try {
      const fd = new FormData();
      fd.append("logo", newPartnerFile);
      fd.append("order", newPartnerOrder);
      await createPartner(fd);
      toast.success(t("cms.about.partners.addSuccess"));
      setNewPartnerFile(null);
      setNewPartnerOrder(partners.length);
      await reload();
    } catch (err) {
      notifyError(err, t("cms.about.error.saveFailed"));
    } finally {
      setAdding(false);
    }
  };

  const handleSavePartner = async (id) => {
    setSavingId(id);
    try {
      const replaceFile = replaceFiles[id];
      if (replaceFile) {
        const fd = new FormData();
        fd.append("logo", replaceFile);
        fd.append("order", editOrders[id] ?? 0);
        await updatePartner(id, fd);
        setReplaceFiles((prev) => { const n = { ...prev }; delete n[id]; return n; });
      } else {
        await updatePartner(id, { order: editOrders[id] ?? 0 });
      }
      toast.success(t("cms.about.partners.updateSuccess"));
      await reload();
    } catch (err) {
      notifyError(err, t("cms.about.error.saveFailed"));
    } finally {
      setSavingId(null);
    }
  };

  const handleDeletePartner = async (id) => {
    const confirmed = await showAlert({
      type: "confirm",
      title: t("cms.about.confirmDeleteTitle"),
      message: t("cms.about.confirmDeleteText"),
      confirmText: t("cms.about.deleteBtn"),
      cancelText: t("cms.about.cancelBtn"),
      showCancel: true,
      isRtl,
    });
    if (!confirmed) return;
    try {
      await deletePartner(id);
      toast.success(t("cms.about.partners.deleteSuccess"));
      await reload();
    } catch (err) {
      notifyError(err, t("cms.about.error.deleteFailed"));
    }
  };

  return (
    <div className="ca-tab-inner">
      {sweetAlertEl}

      {/* Subtitle settings */}
      <div className="ca-card">
        <div className="ca-card-header">
          <div className="ca-card-header-left">
            <span className="ca-card-icon ca-card-icon--blue"><IconPartner /></span>
            <h2 className="ca-card-title">{t("cms.about.partners.cardTitle")}</h2>
          </div>
        </div>
        <div className="ca-card-body">
          <div className="ca-form-row">
            <div className="ca-form-group ca-form-group--wide">
              <BilingualField
                label={t("cms.about.partners.subtitleAr")}
                name="partners_subtitle"
                values={subtitleForm}
                errors={subtitleErrors}
                onChange={(name, value) => setSubtitleForm({ ...subtitleForm, [name]: value })}
                placeholder={t("cms.about.partners.subtitleArPlaceholder")}
                placeholderEn={t("cms.about.partners.subtitleEnPlaceholder")}
              />
            </div>
          </div>
          <div className="ca-form-actions">
            <button type="button" className="ca-btn ca-btn--primary"
              onClick={handleSaveSubtitle} disabled={savingSubtitle}>
              {savingSubtitle ? <Spinner /> : <IconSave />}
              {t("cms.about.partners.saveSubtitleBtn")}
            </button>
          </div>
        </div>
      </div>

      {/* Add partner */}
      <div className="ca-card">
        <div className="ca-card-header">
          <div className="ca-card-header-left">
            <span className="ca-card-icon ca-card-icon--amber"><IconPartner /></span>
            <h2 className="ca-card-title">{t("cms.about.partners.addTitle")}</h2>
          </div>
        </div>
        <div className="ca-card-body">
          <div className="ca-form-row">
            <div className="ca-form-group">
              <Field label={t("cms.about.partners.logoLabel")}>
                <FileUploadZone
                  accept={PICTURE_ACCEPT}
                  preview={newPartnerFile ? URL.createObjectURL(newPartnerFile) : null}
                  label={newPartnerFile ? newPartnerFile.name : t("cms.about.partners.uploadLogo")}
                  onChange={(e) => { const f = e.target.files[0]; if (f) setNewPartnerFile(f); }}
                />
                  <UploadLimits kind="logo_full" />
              </Field>
            </div>
            <div className="ca-form-group">
              <Field label={t("cms.about.stats.orderLabel")}>
                <input className="ca-input" type="number" value={newPartnerOrder}
                  onChange={(e) => setNewPartnerOrder(parseInt(e.target.value) || 0)} />
              </Field>
            </div>
          </div>
          <div className="ca-form-actions">
            <button type="button" className="ca-btn ca-btn--primary"
              onClick={handleAddPartner} disabled={adding}>
              {adding ? <Spinner /> : <IconPlus />}
              {t("cms.about.partners.addButton")}
            </button>
          </div>
        </div>
      </div>

      {/* Partners grid */}
      {partners.length > 0 && (
        <div className="ca-card">
          <div className="ca-card-header">
            <div className="ca-card-header-left">
              <span className="ca-card-icon ca-card-icon--purple"><IconPartner /></span>
              <h2 className="ca-card-title">{t("cms.about.partners.listTitle")}</h2>
            </div>
            <span className="ca-count-badge">{partners.length}</span>
          </div>
          <div className="ca-card-body">
            <div className="ca-partners-grid">
              {partners.map((p) => (
                <div key={p.id} className="ca-partner-card">
                  <div className="ca-partner-logo-wrap">
                    {(replaceFiles[p.id] ? URL.createObjectURL(replaceFiles[p.id]) : p.logo_url) && (
                      <img
                        src={replaceFiles[p.id] ? URL.createObjectURL(replaceFiles[p.id]) : p.logo_url}
                        alt=""
                        className="ca-partner-logo"
                      />
                    )}
                    <label className="ca-partner-replace">
                      <IconUpload />
                      <input type="file" accept={PICTURE_ACCEPT}
                        style={{ display: "none" }}
                        onChange={(e) => {
                      <UploadLimits kind="logo_full" />
                          const f = e.target.files[0];
                          if (f) setReplaceFiles((prev) => ({ ...prev, [p.id]: f }));
                        }} />
                    </label>
                  </div>
                  <input
                    className="ca-input ca-input--sm ca-input--center"
                    type="number"
                    value={editOrders[p.id] ?? 0}
                    onChange={(e) => setEditOrders((prev) => ({ ...prev, [p.id]: parseInt(e.target.value) || 0 }))}
                  />
                  <div className="ca-partner-actions">
                    <button type="button" className="ca-icon-btn ca-icon-btn--save"
                      onClick={() => handleSavePartner(p.id)} disabled={savingId === p.id}>
                      {savingId === p.id ? <Spinner /> : <IconSave />}
                    </button>
                    <Deletebtn
                      onConfirm={() => handleDeletePartner(p.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PREVIEW PANEL
═══════════════════════════════════════════════════ */
function PreviewPanel({ data }) {
  const { t } = useTranslation();

  if (!data) return null;

  return (
    <div className="ca-preview-panel">
      <div className="ca-preview-header">
        <IconPreview />
        <span>{t("cms.about.preview.title")}</span>
      </div>

      {/* General */}
      <div className="ca-preview-section">
        <p className="ca-preview-section-label">{t("cms.about.preview.general")}</p>
        <div className="ca-preview-general">
          {data.logo_url && (
            <img src={data.logo_url} alt="About logo" className="ca-preview-logo" />
          )}
          {data.media_url && (
            isVideoUrl(data.media_url)
              ? <video src={data.media_url} className="ca-preview-media-thumb" muted />
              : <img src={data.media_url} alt="About media" className="ca-preview-media-thumb" />
          )}
          <span className={`ca-preview-badge ${data.is_active ? "ca-preview-badge--on" : "ca-preview-badge--off"}`}>
            {data.is_active ? t("cms.about.preview.active") : t("cms.about.preview.inactive")}
          </span>
        </div>
      </div>

      {/* Stats */}
      {data.stats?.length > 0 && (
        <div className="ca-preview-section">
          <p className="ca-preview-section-label">{t("cms.about.preview.stats")}</p>
          <div className="ca-preview-stats">
            {data.stats.map((s) => (
              <div key={s.id} className="ca-preview-stat">
                <span className="ca-preview-stat-number">{s.number}</span>
                <span className="ca-preview-stat-label">{s.label_ar || s.label_en}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      {data.posts?.length > 0 && (
        <div className="ca-preview-section">
          <p className="ca-preview-section-label">{t("cms.about.preview.posts")}</p>
          <div className="ca-preview-posts">
            {data.posts.map((p) => (
              <div key={p.id} className="ca-preview-post">
                {p.image_url && <img src={p.image_url} alt="" className="ca-preview-post-img" />}
                <div className="ca-preview-post-info">
                  <p className="ca-preview-post-subtitle">{p.subtitle_ar || p.subtitle_en}</p>
                  <p className="ca-preview-post-title">{p.title_ar || p.title_en}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sections */}
      {data.sections?.length > 0 && (
        <div className="ca-preview-section">
          <p className="ca-preview-section-label">{t("cms.about.preview.sections")}</p>
          <div className="ca-preview-sections">
            {data.sections.map((s) => (
              <div key={s.id} className="ca-preview-sec">
                <p className="ca-preview-sec-title">{s.title_ar || s.title_en || s.key}</p>
                {s.icons?.length > 0 && (
                  <div className="ca-preview-icons">
                    {s.icons.map((icon) => (
                      <div key={icon.id} className="ca-preview-icon">
                        {icon.icon_url && <img src={icon.icon_url} alt="" />}
                        <span>{icon.label_ar || icon.label_en}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partners */}
      {(data.partners_subtitle_ar || data.partners?.length > 0) && (
        <div className="ca-preview-section">
          <p className="ca-preview-section-label">{t("cms.about.preview.partners")}</p>
          {data.partners_subtitle_ar && (
            <p className="ca-preview-partners-subtitle">{data.partners_subtitle_ar}</p>
          )}
          <div className="ca-preview-partners">
            {data.partners?.map((p) => (
              p.logo_url && <img key={p.id} src={p.logo_url} alt="" className="ca-preview-partner-logo" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
const TABS = [
  { key: "general", icon: <IconAbout /> },
  { key: "stats", icon: <IconStat /> },
  { key: "posts", icon: <IconPost /> },
  { key: "sections", icon: <IconSection /> },
  { key: "partners", icon: <IconPartner /> },
];

export default function CMSAbout() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [activeTab, setActiveTab] = useState("general");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await getAdminAbout();
      setData(res.data);
    } catch (err) {
      const parsed = parseApiError(err);
      if (!parsed.canceled) setError(parsed.message || t("cms.about.error.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="ca-root" dir={isRtl ? "rtl" : "ltr"}>
        <div className="ca-loading">
          <Spinner />
          <span>{t("cms.about.loading")}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ca-root" dir={isRtl ? "rtl" : "ltr"}>
        <div className="ca-error">
          <p>{error}</p>
          <button type="button" className="ca-btn ca-btn--primary" onClick={load}>
            {t("cms.about.retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ca-root" dir={isRtl ? "rtl" : "ltr"}>
      {/* Page header */}
      <div className="ca-page-header">
        <div className="ca-page-header-left">
          <div className="ca-page-header-icon"><IconAbout /></div>
          <div>
            <h1 className="ca-page-title">{t("cms.about.pageTitle")}</h1>
            <p className="ca-page-subtitle">{t("cms.about.pageSubtitle")}</p>
          </div>
        </div>
        <button
          type="button"
          className={`ca-btn ca-btn--preview ${showPreview ? "ca-btn--preview-active" : ""}`}
          onClick={() => setShowPreview((v) => !v)}
        >
          <IconPreview />
          {showPreview ? t("cms.about.preview.hide") : t("cms.about.preview.show")}
        </button>
      </div>

      {/* Tabs */}
      <div className="ca-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`ca-tab ${activeTab === tab.key ? "ca-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            <span className="ca-tab-icon">{tab.icon}</span>
            {t(`cms.about.tabs.${tab.key}`)}
          </button>
        ))}
      </div>

      {/* Main layout: content + optional preview */}
      <div className={`ca-layout ${showPreview ? "ca-layout--with-preview" : ""}`}>
        <div className="ca-content">
          {activeTab === "general" && <GeneralTab data={data} reload={load} />}
          {activeTab === "stats" && <StatsTab data={data} reload={load} />}
          {activeTab === "posts" && <PostsTab data={data} reload={load} />}
          {activeTab === "sections" && <SectionsTab data={data} reload={load} />}
          {activeTab === "partners" && <PartnersTab data={data} reload={load} />}
        </div>

        {showPreview && (
          <div className="ca-preview-sidebar">
            <PreviewPanel data={data} />
          </div>
        )}
      </div>
    </div>
  );
}
