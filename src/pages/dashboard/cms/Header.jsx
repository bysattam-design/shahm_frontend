// Dashboard header CMS
import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "../../../api/axiosClient";
import { API_PATHS } from "../../../api/routes";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useSweetAlert } from "../../../components/common/SweetAlert";
import Editbtn   from "../../../components/common/dashboard/Editbtn";
import Deletebtn from "../../../components/common/dashboard/Deletebtn";
import { Button, EmptyState, Spinner as UiSpinner } from "../../../components/ui";
import { parseApiError } from "../../../utils/apiErrors";
import "../../../styles/forms/cms-form.css";
import "../../../styles/dashboard/cms/header.css";

/* ══════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════ */
const IcoMenu = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);
const IcoImage = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="7" cy="7.5" r="1.5" fill="currentColor"/>
    <path d="M2 13L6.5 9L10 12.5L13 10L18 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IcoLogo = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="5" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 10H14M10 7V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IcoBolt = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <path d="M11.5 2L3.5 11.5H10L8.5 18L16.5 8.5H10L11.5 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IcoDoc = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <path d="M12 2H5a1 1 0 00-1 1v14a1 1 0 001 1h10a1 1 0 001-1V6L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 2v4h4M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IcoSave = () => (
  <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
    <path d="M15.75 8.063v7.124a.938.938 0 01-.938.938H3.188a.938.938 0 01-.938-.938V3.563c0-.25.1-.488.255-.663A.938.938 0 013.188 2.5h7.124" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="m13.5 1.5 3 3-8.25 8.25H5.25V9.75L13.5 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IcoX = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M11.5 1.5L1.5 11.5M1.5 1.5L11.5 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);
const IcoUpload = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M7.5 10V2M7.5 2L4.5 5M7.5 2L10.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 11V12.5C2 13.05 2.45 13.5 3 13.5H12c.55 0 1-.45 1-1V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IcoInfo = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M7.5 5.5V5M7.5 7.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IcoPlus = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M7.5 2V13M2 7.5H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);
const IcoGear = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2 9h20M9 9v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IcoSpinner = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ch-spin">
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"
      strokeDasharray="28" strokeDashoffset="10" strokeLinecap="round"/>
  </svg>
);

/* ══════════════════════════════════════════════════════
   TREE HELPER
══════════════════════════════════════════════════════ */
function buildTree(flat) {
  const map = {};
  const roots = [];
  flat.forEach((item) => { map[item.id] = { ...item, children: [] }; });
  flat.forEach((item) => {
    if (item.parent) map[item.parent]?.children.push(map[item.id]);
    else roots.push(map[item.id]);
  });
  return roots;
}

const TABS = ["menu", "logos", "menu_images", "quick_access", "page_content"];

/** Nothing refused, nothing said — the state each form starts from. */
const NO_REFUSAL = { fields: {}, message: "" };

/**
 * Says what the server said, and hands back what belongs on the fields.
 *
 * Twelve catch sites on this screen answered a refusal with one of two keys —
 * «فشل الحفظ» or «فشل الحذف» — and dropped the server's own message and the
 * name of the field it named. One of them read `non_field_errors[0]` and threw
 * the per-field messages away with the rest.
 */
function reportRefusal(error, fallback) {
  const parsed = parseApiError(error);

  if (!parsed.canceled) toast.error(parsed.message || fallback);

  return { fields: parsed.fields, message: parsed.message };
}

/**
 * Puts the caret on the first field the server refused, so the editor is
 * looking at what they have to change rather than hunting for it.
 */
function focusRejected(fields) {
  const first = Object.keys(fields || {})[0];
  if (!first || typeof document === "undefined") return;

  const element = document.querySelector(`[data-field="${first}"]`);
  if (element && typeof element.focus === "function") element.focus();
}

/** The server's word about one field, where that field lives. */
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
    <div className="cms-header-form-error" role="alert">
      {message}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function HeaderCms() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { alert: sweetAlertEl, show: showAlert } = useSweetAlert();

  /* ── Sliding indicator ── */
  const tabsBarRef = useRef(null);
  const tabRefs    = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, right: "auto", width: 0 });
  const [activeTab, setActiveTab] = useState("menu");

  // What the first load did, and what the server refused on each of the
  // screen's five forms.
  const [pageState, setPageState] = useState({ status: "loading", message: "" });
  const [menuErrors, setMenuErrors] = useState(NO_REFUSAL);
  const [logoError, setLogoError] = useState("");
  const [imageErrors, setImageErrors] = useState(NO_REFUSAL);
  const [qaErrors, setQaErrors] = useState(NO_REFUSAL);
  const [pcErrors, setPcErrors] = useState(NO_REFUSAL);

  const measureIndicator = useCallback(() => {
    const bar      = tabsBarRef.current;
    const activeIdx = TABS.indexOf(activeTab);
    const activeEl  = tabRefs.current[activeIdx];
    if (!bar || !activeEl) return;
    const barRect = bar.getBoundingClientRect();
    const tabRect = activeEl.getBoundingClientRect();
    if (isAr) {
      setIndicator({ left: "auto", right: barRect.right - tabRect.right, width: tabRect.width });
    } else {
      setIndicator({ left: tabRect.left - barRect.left, right: "auto", width: tabRect.width });
    }
  }, [activeTab, isAr]);

  useEffect(() => {
    const id = requestAnimationFrame(measureIndicator);
    return () => cancelAnimationFrame(id);
  }, [measureIndicator]);

  useEffect(() => {
    window.addEventListener("resize", measureIndicator);
    return () => window.removeEventListener("resize", measureIndicator);
  }, [measureIndicator]);

  /* ── Shared data ── */
  const [links,      setLinks]      = useState([]);
  const [pages,      setPages]      = useState([]);
  const [parents,    setParents]    = useState([]);
  const [loading,    setLoading]    = useState({});
  const setLoadingKey = (key, val) => setLoading((prev) => ({ ...prev, [key]: val }));

  /* ── Tab 1 – Menu ── */
  const [form, setForm] = useState({
    type:"link", label_ar:"", label_en:"", description_ar:"", description_en:"",
    slug:"", url:"", page:"", parent:"", order:0, is_active:true,
  });
  const [editId, setEditId] = useState(null);

  /* ── Tab 2 – Logos ── */
  const [logos,     setLogos]     = useState({ full_ar:null, scroll_ar:null, full_en:null, scroll_en:null });
  const [logoFiles, setLogoFiles] = useState({ full_ar:null, scroll_ar:null, full_en:null, scroll_en:null });

  /* ── Tab 3 – Menu Images ── */
  const [menuImages,     setMenuImages]     = useState([]);
  const [menuImageForm,  setMenuImageForm]  = useState({
    type:"menu_image", label_ar:"", label_en:"", description_ar:"", description_en:"",
    parent:"", order:0, is_active:true, image:null, slug:"", url:"", page:"",
  });
  const [menuImageEditId, setMenuImageEditId] = useState(null);

  /* ── Tab 4 – Quick Access ── */
  const [quickAccess, setQuickAccess] = useState([]);
  const [qaForm, setQaForm] = useState({
    type:"quick_access", label_ar:"", label_en:"", slug:"", url:"", page:"", order:0, is_active:true,
  });
  const [qaEditId, setQaEditId] = useState(null);

  /* ── Tab 5 – Page Content ── */
  const [pcEditSlug, setPcEditSlug] = useState(null);
  const [pcForm,     setPcForm]     = useState({ slug:"", title_ar:"", title_en:"", content_ar:"", content_en:"" });

  /* ── Load all data ── */
  const loadData = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setPageState((prev) => (prev.status === "ready" ? prev : { status: "loading", message: "" }));

    try {
      const res = await api.get(API_PATHS.cms.header);
      const all = res.data;
      const logoMap = { full_ar:null, scroll_ar:null, full_en:null, scroll_en:null };
      all.filter((l) => l.type === "logo").forEach((l) => { if (l.logo_variant) logoMap[l.logo_variant] = l; });
      setLogos(logoMap);
      const linksOnly = all.filter((l) => l.type === "link");
      setLinks(buildTree(linksOnly));
      setParents(linksOnly);
      setMenuImages(all.filter((l) => l.type === "menu_image"));
      setQuickAccess(all.filter((l) => l.type === "quick_access"));
      const p = await api.get(API_PATHS.cms.pages);
      setPages(p.data);
      setPageState({ status: "ready", message: "" });
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.canceled) return;

      // The failure used to go to the console and nowhere else, so the screen
      // rendered its five empty tabs and an outage looked like a header with
      // nothing in it.
      setPageState({ status: "failed", message: parsed.message });
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* ══ TAB 1 — Menu ══ */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "url"  && form.page) { toast.error(t("cms.header.url_page_conflict")); return; }
    if (name === "page" && form.url)  { toast.error(t("cms.header.page_url_conflict")); return; }
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const key = editId ? `menu-update-${editId}` : "menu-create";
    setLoadingKey(key, true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== "") fd.append(k, v); });
    try {
      if (editId) {
        await api.patch(API_PATHS.cms.headerItem(editId), fd, { headers:{ "Content-Type":"multipart/form-data" } });
        toast.success(t("cms.header.success.updated"));
      } else {
        await api.post(API_PATHS.cms.header, fd, { headers:{ "Content-Type":"multipart/form-data" } });
        toast.success(t("cms.header.success.created"));
      }
      setMenuErrors(NO_REFUSAL);
      resetForm(); loadData({ quiet: true });
    } catch (err) {
      const refused = reportRefusal(err, t("cms.header.save_failed"));
      setMenuErrors(refused);
      focusRejected(refused.fields);
    } finally { setLoadingKey(key, false); }
  };

  const resetForm = () => {
    setForm({ type:"link", label_ar:"", label_en:"", description_ar:"", description_en:"", slug:"", url:"", page:"", parent:"", order:0, is_active:true });
    setEditId(null);
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({ type:"link", label_ar:item.label_ar||"", label_en:item.label_en||"", description_ar:item.description_ar||"", description_en:item.description_en||"", slug:item.slug||"", url:item.url||"", page:item.page||"", parent:item.parent||"", order:item.order, is_active:item.is_active });
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = await showAlert({ type:"confirm", title:t("cms.header.confirm_delete_title"), message:t("cms.header.confirm_delete_text"), confirmText:t("cms.header.delete_button"), cancelText:t("cms.header.cancel_button"), showCancel:true, isRtl:isAr });
    if (!confirmed) return;
    setLoadingKey(`menu-delete-${id}`, true);
    try {
      await api.delete(API_PATHS.cms.headerItem(id));
      toast.success(t("cms.header.success.deleted")); loadData({ quiet: true });
    } catch (err) { reportRefusal(err, t("cms.header.delete_failed")); }
    finally  { setLoadingKey(`menu-delete-${id}`, false); }
  };

  /* ══ TAB 2 — Logos ══ */
  const handleLogoUpload = async (e, variant) => {
    e.preventDefault();
    const file = logoFiles[variant];
    if (!file) { toast.error(t("cms.header.logo.file_required")); return; }
    const fd = new FormData();
    fd.append("type","logo"); fd.append("logo_variant",variant); fd.append("logo",file); fd.append("order",0); fd.append("is_active",true);
    const key = `logo-upload-${variant}`;
    setLoadingKey(key, true);
    try {
      await api.post(API_PATHS.cms.header, fd, { headers:{ "Content-Type":"multipart/form-data" } });
      toast.success(t("cms.header.logo.success.uploaded"));
      setLogoError("");
      setLogoFiles((prev) => ({ ...prev, [variant]:null })); loadData({ quiet: true });
    } catch (err) { setLogoError(reportRefusal(err, t("cms.header.save_failed")).message); }
    finally  { setLoadingKey(key, false); }
  };

  const handleDeleteLogo = async (variant) => {
    const logoItem = logos[variant];
    if (!logoItem) return;
    const confirmed = await showAlert({ type:"confirm", title:t("cms.header.logo.confirm_delete_title"), message:t("cms.header.logo.confirm_delete_text"), confirmText:t("cms.header.logo.delete_button"), cancelText:t("cms.header.logo.cancel_button"), showCancel:true, isRtl:isAr });
    if (!confirmed) return;
    setLoadingKey(`logo-delete-${variant}`, true);
    try {
      await api.delete(API_PATHS.cms.headerItem(logoItem.id));
      toast.success(t("cms.header.logo.success.deleted")); loadData({ quiet: true });
    } catch (err) { setLogoError(reportRefusal(err, t("cms.header.save_failed")).message); }
    finally  { setLoadingKey(`logo-delete-${variant}`, false); }
  };

  /* ══ TAB 3 — Menu Images ══ */
  const handleMenuImageChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === "url"  && menuImageForm.page) { toast.error(t("cms.header.url_page_conflict")); return; }
    if (name === "page" && menuImageForm.url)  { toast.error(t("cms.header.page_url_conflict")); return; }
    if (type === "file") setMenuImageForm({ ...menuImageForm, image: files[0] });
    else setMenuImageForm({ ...menuImageForm, [name]: type === "checkbox" ? checked : value });
  };

  const handleMenuImageSubmit = async (e) => {
    e.preventDefault();
    const key = menuImageEditId ? `img-update-${menuImageEditId}` : "img-create";
    setLoadingKey(key, true);
    const fd = new FormData();
    fd.append("type","menu_image");
    Object.entries(menuImageForm).forEach(([k, v]) => { if (k !== "type" && v !== "" && v !== null) fd.append(k, v); });
    try {
      if (menuImageEditId) {
        await api.patch(API_PATHS.cms.headerItem(menuImageEditId), fd, { headers:{ "Content-Type":"multipart/form-data" } });
        toast.success(t("cms.header.success.updated"));
      } else {
        await api.post(API_PATHS.cms.header, fd, { headers:{ "Content-Type":"multipart/form-data" } });
        toast.success(t("cms.header.success.created"));
      }
      setImageErrors(NO_REFUSAL);
      resetMenuImageForm(); loadData({ quiet: true });
    } catch (err) {
      const refused = reportRefusal(err, t("cms.header.save_failed"));
      setImageErrors(refused);
      focusRejected(refused.fields);
    }
    finally  { setLoadingKey(key, false); }
  };

  const resetMenuImageForm = () => {
    setMenuImageForm({ type:"menu_image", label_ar:"", label_en:"", description_ar:"", description_en:"", parent:"", order:0, is_active:true, image:null, slug:"", url:"", page:"" });
    setMenuImageEditId(null);
  };

  const handleMenuImageEdit = (item) => {
    setMenuImageEditId(item.id);
    setMenuImageForm({ type:"menu_image", label_ar:item.label_ar||"", label_en:item.label_en||"", description_ar:item.description_ar||"", description_en:item.description_en||"", parent:item.parent||"", order:item.order, is_active:item.is_active, image:null, slug:item.slug||"", url:item.url||"", page:item.page||"" });
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const handleMenuImageDelete = async (id) => {
    const confirmed = await showAlert({ type:"confirm", title:t("cms.header.confirm_delete_title"), message:t("cms.header.confirm_delete_text"), confirmText:t("cms.header.delete_button"), cancelText:t("cms.header.cancel_button"), showCancel:true, isRtl:isAr });
    if (!confirmed) return;
    setLoadingKey(`img-delete-${id}`, true);
    try {
      await api.delete(API_PATHS.cms.headerItem(id));
      toast.success(t("cms.header.success.deleted")); loadData({ quiet: true });
    } catch (err) { reportRefusal(err, t("cms.header.delete_failed")); }
    finally  { setLoadingKey(`img-delete-${id}`, false); }
  };

  /* ══ TAB 4 — Quick Access ══ */
  const handleQaChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQaForm({ ...qaForm, [name]: type === "checkbox" ? checked : value });
  };

  const handleQaSubmit = async (e) => {
    e.preventDefault();
    const key = qaEditId ? `qa-update-${qaEditId}` : "qa-create";
    setLoadingKey(key, true);
    const fd = new FormData();
    Object.entries(qaForm).forEach(([k, v]) => { if (v !== "") fd.append(k, v); });
    try {
      if (qaEditId) {
        await api.patch(API_PATHS.cms.headerItem(qaEditId), fd, { headers:{ "Content-Type":"multipart/form-data" } });
        toast.success(t("cms.header.success.updated"));
      } else {
        await api.post(API_PATHS.cms.header, fd, { headers:{ "Content-Type":"multipart/form-data" } });
        toast.success(t("cms.header.success.created"));
      }
      setQaForm({ type:"quick_access", label_ar:"", label_en:"", slug:"", url:"", page:"", order:0, is_active:true });
      setQaEditId(null); setQaErrors(NO_REFUSAL); loadData({ quiet: true });
    } catch (err) {
      // This one already showed `non_field_errors[0]` and dropped every
      // per-field message with the rest.
      const refused = reportRefusal(err, t("cms.header.save_failed"));
      setQaErrors(refused);
      focusRejected(refused.fields);
    } finally { setLoadingKey(key, false); }
  };

  const handleQaEdit = (item) => {
    setQaEditId(item.id);
    setQaForm({ type:"quick_access", label_ar:item.label_ar||"", label_en:item.label_en||"", slug:item.slug||"", url:item.url||"", page:item.page||"", order:item.order, is_active:item.is_active });
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const handleQaDelete = async (id) => {
    const confirmed = await showAlert({ type:"confirm", title:t("cms.header.confirm_delete_title"), message:t("cms.header.confirm_delete_text"), confirmText:t("cms.header.delete_button"), cancelText:t("cms.header.cancel_button"), showCancel:true, isRtl:isAr });
    if (!confirmed) return;
    setLoadingKey(`qa-delete-${id}`, true);
    try {
      await api.delete(API_PATHS.cms.headerItem(id));
      toast.success(t("cms.header.success.deleted")); loadData({ quiet: true });
    } catch (err) { reportRefusal(err, t("cms.header.save_failed")); }
    finally  { setLoadingKey(`qa-delete-${id}`, false); }
  };

  /* ══ TAB 5 — Page Content ══ */
  const loadPageContent = async (slug) => {
    try {
      const res = await api.get(API_PATHS.cms.publicContent(slug));
      setPcForm(res.data);
      setPcErrors(NO_REFUSAL);
    } catch (err) { setPcErrors(reportRefusal(err, t("cms.header.save_failed"))); }
  };

  const handlePcSubmit = async (e) => {
    e.preventDefault();
    if (!pcEditSlug) return;
    const key = "pc-save";
    setLoadingKey(key, true);
    try {
      await api.patch(API_PATHS.cms.pageContent(pcEditSlug), pcForm);
      setPcErrors(NO_REFUSAL);
      toast.success(t("cms.header.success.updated"));
    } catch (err) {
      const refused = reportRefusal(err, t("cms.header.save_failed"));
      setPcErrors(refused);
      focusRejected(refused.fields);
    }
    finally  { setLoadingKey(key, false); }
  };

  /* ══ Tree renderer ══ */
  const renderTree = (items, level = 0) =>
    items.map((item) => {
      return (
        <div key={item.id} className={`cms-header-tree-item cms-header-tree-level-${level}`}>
          <div className="cms-header-tree-content">
            <div className="cms-header-tree-order">
              <label className="cms-header-tree-order-label">{t("cms.header.order")}</label>
              <input type="number" className="cms-header-input-number" value={item.order}
                aria-label={t("cms.header.order")}
                onChange={async (e) => {
                  await api.patch(API_PATHS.cms.headerItem(item.id), { order: e.target.value });
                  toast.success(t("cms.header.success.order_updated")); loadData();
                }} />
            </div>
            <div className="cms-header-tree-info">
              <div className="cms-header-tree-label">
                {isAr ? item.label_ar : item.label_en}
                {!item.is_active && (
                  <span className="cms-header-badge cms-header-badge--inactive">{t("cms.header.inactive")}</span>
                )}
              </div>
              <div className="cms-header-tree-url">{item.resolved_url || item.url || item.slug || "—"}</div>
              {(item.description_ar || item.description_en) && (
                <div className="cms-header-tree-desc">{isAr ? item.description_ar : item.description_en}</div>
              )}
            </div>
            <div className="cms-header-tree-actions">
              <Editbtn
                onClick={() => handleEdit(item)}
                className="cms-header-btn-edit"
                iconOnly={false}
                label={t("cms.header.edit")}
              />
              <Deletebtn
                onConfirm={() => handleDelete(item.id)}
                className="cms-header-btn-delete"
                iconOnly={false}
                label={t("cms.header.delete")}
              />
            </div>
          </div>
          {item.children?.length > 0 && (
            <div className="cms-header-tree-children">{renderTree(item.children, level + 1)}</div>
          )}
        </div>
      );
    });

  /* ══ Config ══ */
  const logoVariants = [
    { key:"full_ar",   label:t("cms.header.logo.full_ar")   },
    { key:"scroll_ar", label:t("cms.header.logo.scroll_ar") },
    { key:"full_en",   label:t("cms.header.logo.full_en")   },
    { key:"scroll_en", label:t("cms.header.logo.scroll_en") },
  ];

  const tabDefs = [
    { key:"menu",         label:t("cms.header.tabs.menu"),         Icon: IcoMenu   },
    { key:"logos",        label:t("cms.header.tabs.logos"),        Icon: IcoLogo   },
    { key:"menu_images",  label:t("cms.header.tabs.menu_images"),  Icon: IcoImage  },
    { key:"quick_access", label:t("cms.header.tabs.quick_access"), Icon: IcoBolt   },
    { key:"page_content", label:t("cms.header.tabs.page_content"), Icon: IcoDoc    },
  ];

  const menuFormValid = form.label_ar.trim() && form.label_en.trim();
  const imgFormValid  = menuImageForm.label_ar.trim() && menuImageForm.label_en.trim();
  const qaFormValid   = qaForm.label_ar.trim() && qaForm.label_en.trim();

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  const pageHeader = (
    <div className="cms-header-page-header">
      <div className="cms-header-page-header-left">
        <div className="cms-header-page-header-icon"><IcoGear /></div>
        <div>
          <h1 className="cms-header-title">{t("cms.header.title")}</h1>
          <p className="cms-header-subtitle">{t("cms.header.subtitle")}</p>
        </div>
      </div>
    </div>
  );

  // A refused load used to go to the console and nowhere else, so the screen
  // rendered its five empty tabs and an outage looked like a header with
  // nothing in it.
  if (pageState.status === "loading") {
    return (
      <div className="cms-header-root" dir={isAr ? "rtl" : "ltr"}>
        {pageHeader}
        <div style={{ padding: "48px 0", textAlign: "center" }}>
          <UiSpinner size={20} label={t("states.loading", "جار التحميل")} />
        </div>
      </div>
    );
  }

  if (pageState.status === "failed") {
    return (
      <div className="cms-header-root" dir={isAr ? "rtl" : "ltr"}>
        {sweetAlertEl}
        {pageHeader}
        <EmptyState
          title={t("states.error_title", "تعذر جلب البيانات")}
          hint={pageState.message || t("states.error_hint", "تحقق من الاتصال ثم أعد المحاولة.")}
          action={
            <Button onClick={() => loadData()}>
              {t("states.retry", "أعد المحاولة")}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="cms-header-root" dir={isAr ? "rtl" : "ltr"}>
      {sweetAlertEl}

      {/* ── Page Header ── */}
      <div className="cms-header-page-header">
        <div className="cms-header-page-header-left">
          <div className="cms-header-page-header-icon"><IcoGear /></div>
          <div>
            <h1 className="cms-header-title">{t("cms.header.title")}</h1>
            <p className="cms-header-subtitle">{t("cms.header.subtitle")}</p>
          </div>
        </div>
      </div>

      {/* ── Tabs — sliding indicator ── */}
      <div className="cms-header-tabs-wrapper">
        <div className="cms-header-tabs-bar" ref={tabsBarRef}>
          {tabDefs.map(({ key, label, Icon }, idx) => (
            <button
              key={key}
              ref={(el) => { tabRefs.current[idx] = el; }}
              className={`cms-header-tab${activeTab === key ? " cms-header-tab--active" : ""}`}
              onClick={() => setActiveTab(key)}
              type="button"
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="cms-header-tabs-track">
          <div className="cms-header-tabs-indicator"
            style={{ left:indicator.left, right:indicator.right, width:indicator.width }} />
        </div>
      </div>

      {/* ══════════════ TAB 1 — MENU STRUCTURE ══════════════ */}
      {activeTab === "menu" && (
        <div className="cms-header-tab-content" key="menu">
          {/* Form card */}
          <div className="cms-header-card">
            <div className="cms-header-card-header">
              <div className="cms-header-card-header-left">
                <span className="cms-header-card-icon cms-header-card-icon--blue"><IcoMenu /></span>
                <h2 className="cms-header-card-title">
                  {editId ? t("cms.header.form_edit") : t("cms.header.form_create")}
                </h2>
              </div>
              {editId && (
                <button className="cms-header-btn-secondary" onClick={resetForm} type="button">
                  <IcoX />{t("cms.header.cancel")}
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit}>
              <div className="cms-header-form-section">
                <div className="cms-header-section-divider">
                  <div className="cms-header-section-divider-line" />
                  <span className="cms-header-section-divider-label">{t("cms.header.section_basic")}</span>
                  <div className="cms-header-section-divider-line" />
                </div>
                <div className="cms-header-form-row">
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.label_ar")}</label>
                    <input className="cms-header-input" name="label_ar" data-field="label_ar" dir="rtl"
                      placeholder={t("cms.header.placeholder_label_ar")}
                      value={form.label_ar} onChange={handleChange} required />
                    <FieldError message={menuErrors.fields.label_ar} />
                  </div>
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.label_en")}</label>
                    <input className="cms-header-input" name="label_en" data-field="label_en"
                      placeholder={t("cms.header.placeholder_label_en")}
                      value={form.label_en} onChange={handleChange} required />
                    <FieldError message={menuErrors.fields.label_en} />
                  </div>
                </div>
                <div className="cms-header-form-row">
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.fields.description_ar")}</label>
                    <input className="cms-header-input" name="description_ar" dir="rtl"
                      value={form.description_ar} onChange={handleChange} />
                  </div>
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.fields.description_en")}</label>
                    <input className="cms-header-input" name="description_en"
                      value={form.description_en} onChange={handleChange} />
                  </div>
                </div>
                <div className="cms-header-form-row">
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.fields.slug")}</label>
                    <input className="cms-header-input" name="slug" data-field="slug" placeholder="/contact"
                      value={form.slug} onChange={handleChange} />
                    <FieldError message={menuErrors.fields.slug} />
                  </div>
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.custom_url")}</label>
                    <input className="cms-header-input" name="url" data-field="url"
                      placeholder={t("cms.header.placeholder_url")}
                      value={form.url} onChange={handleChange} />
                    <FieldError message={menuErrors.fields.url} />
                  </div>
                </div>
              </div>

              <div className="cms-header-form-section">
                <div className="cms-header-section-divider">
                  <div className="cms-header-section-divider-line" />
                  <span className="cms-header-section-divider-label">{t("cms.header.section_hierarchy")}</span>
                  <div className="cms-header-section-divider-line" />
                </div>
                <div className="cms-header-form-row">
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.fields.parent")}</label>
                    <select className="cms-header-select" name="parent" value={form.parent} onChange={handleChange}>
                      <option value="">{t("cms.header.root_item")}</option>
                      {parents.filter((p) => p.id !== editId).map((p) => (
                        <option key={p.id} value={p.id}>{isAr ? p.label_ar : p.label_en}</option>
                      ))}
                    </select>
                  </div>
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.fields.order")}</label>
                    <input className="cms-header-input" type="number" name="order" data-field="order"
                      value={form.order} onChange={handleChange} />
                    <FieldError message={menuErrors.fields.order} />
                  </div>
                </div>
                <div className="cms-header-form-row">
                  <div className="cms-header-form-group cms-header-form-group--checkbox">
                    <label className="cms-header-checkbox-label">
                      <input type="checkbox" className="cms-header-checkbox" name="is_active"
                        checked={form.is_active} onChange={handleChange} />
                      <span className="cms-header-checkbox-text">{t("cms.header.fields.is_active")}</span>
                    </label>
                  </div>
                  <div />
                </div>
              </div>

              <FormError message={menuErrors.message} />
              <div className="cms-header-form-actions">
                <button type="submit" className="cms-header-btn-primary"
                  disabled={!menuFormValid || loading[editId ? `menu-update-${editId}` : "menu-create"]}>
                  {loading[editId ? `menu-update-${editId}` : "menu-create"] ? <IcoSpinner /> : <IcoSave />}
                  {editId ? t("cms.header.update") : t("cms.header.create")}
                </button>
                {editId && (
                  <button type="button" className="cms-header-btn-secondary" onClick={resetForm}>
                    <IcoX />{t("cms.header.cancel")}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Tree list card */}
          <div className="cms-header-card">
            <div className="cms-header-card-header">
              <div className="cms-header-card-header-left">
                <span className="cms-header-card-icon cms-header-card-icon--blue"><IcoMenu /></span>
                <h2 className="cms-header-card-title">{t("cms.header.current_menu")}</h2>
              </div>
              <span className="cms-header-count-badge">{parents.length}</span>
            </div>
            <div className="cms-header-tree-list">
              {links.length > 0 ? renderTree(links) : (
                <div className="cms-header-empty"><IcoPlus />{t("cms.header.empty")}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ TAB 2 — LOGOS ══════════════ */}
      {activeTab === "logos" && (
        <div className="cms-header-tab-content" key="logos">
          <FormError message={logoError} />
          <div className="cms-header-logo-grid">
            {logoVariants.map(({ key, label }, idx) => {
              const isUploading = loading[`logo-upload-${key}`];
              return (
                <div key={key} className="cms-header-logo-card" style={{ animationDelay:`${idx * 0.06}s` }}>
                  <div className="cms-header-card-header">
                    <div className="cms-header-card-header-left">
                      <span className="cms-header-card-icon cms-header-card-icon--purple"><IcoLogo /></span>
                      <h3 className="cms-header-card-title">{label}</h3>
                    </div>
                    <span className="cms-header-badge cms-header-badge--system">{key}</span>
                  </div>
                  {logos[key] ? (
                    <div className="cms-header-logo-preview">
                      <div className="cms-header-logo-image-wrap">
                        <img src={logos[key].logo_url} alt={label} />
                      </div>
                      <div className="cms-header-logo-preview-actions">
                        <Deletebtn
                          onConfirm={() => handleDeleteLogo(key)}
                          className="cms-header-btn-delete"
                          iconOnly={false}
                          label={t("cms.header.logo.delete")}
                        />
                        <label className="cms-header-btn-upload" style={{ cursor:"pointer" }}>
                          <IcoUpload />{t("cms.header.logo.upload")}
                          <input type="file" accept="image/*" style={{ display:"none" }}
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              setLogoFiles((prev) => ({ ...prev, [key]: file }));
                              const fd = new FormData();
                              fd.append("type","logo"); fd.append("logo_variant",key); fd.append("logo",file); fd.append("order",0); fd.append("is_active",true);
                              api.post(API_PATHS.cms.header, fd, { headers:{ "Content-Type":"multipart/form-data" } })
                                .then(() => { setLogoError(""); toast.success(t("cms.header.logo.success.uploaded")); loadData({ quiet: true }); })
                                .catch((err) => setLogoError(reportRefusal(err, t("cms.header.save_failed")).message));
                            }} />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <form className="cms-header-logo-upload-form" onSubmit={(e) => handleLogoUpload(e, key)}>
                      <input type="file" accept="image/*" className="cms-header-input-file"
                        onChange={(e) => setLogoFiles((prev) => ({ ...prev, [key]: e.target.files[0] }))} />
                      <button type="submit" className="cms-header-btn-primary" disabled={isUploading}>
                        {isUploading ? <IcoSpinner /> : <IcoUpload />}
                        {t("cms.header.logo.upload")}
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════ TAB 3 — MENU IMAGES ══════════════ */}
      {activeTab === "menu_images" && (
        <div className="cms-header-tab-content" key="menu_images">
          <div className="cms-header-card">
            <div className="cms-header-card-header">
              <div className="cms-header-card-header-left">
                <span className="cms-header-card-icon cms-header-card-icon--teal"><IcoImage /></span>
                <h2 className="cms-header-card-title">{t("cms.header.menu_images.form_title")}</h2>
              </div>
              {menuImageEditId && (
                <button className="cms-header-btn-secondary" onClick={resetMenuImageForm} type="button">
                  <IcoX />{t("cms.header.cancel")}
                </button>
              )}
            </div>
            <form onSubmit={handleMenuImageSubmit}>
              <div className="cms-header-form-section">
                <div className="cms-header-form-row">
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.label_ar")}</label>
                    <input className="cms-header-input" name="label_ar" data-field="label_ar" dir="rtl"
                      value={menuImageForm.label_ar} onChange={handleMenuImageChange} required />
                    <FieldError message={imageErrors.fields.label_ar} />
                  </div>
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.label_en")}</label>
                    <input className="cms-header-input" name="label_en" data-field="label_en"
                      value={menuImageForm.label_en} onChange={handleMenuImageChange} required />
                    <FieldError message={imageErrors.fields.label_en} />
                  </div>
                </div>
                <div className="cms-header-form-row">
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.fields.description_ar")}</label>
                    <input className="cms-header-input" name="description_ar" dir="rtl"
                      value={menuImageForm.description_ar} onChange={handleMenuImageChange} />
                  </div>
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.fields.description_en")}</label>
                    <input className="cms-header-input" name="description_en"
                      value={menuImageForm.description_en} onChange={handleMenuImageChange} />
                  </div>
                </div>
                <div className="cms-header-form-row">
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.fields.slug")}</label>
                    <input className="cms-header-input" name="slug" data-field="slug" placeholder="/contact"
                      value={menuImageForm.slug} onChange={handleMenuImageChange} />
                    <FieldError message={imageErrors.fields.slug} />
                  </div>
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.custom_url")}</label>
                    <input className="cms-header-input" name="url" data-field="url" placeholder="https://..."
                      value={menuImageForm.url} onChange={handleMenuImageChange} />
                    <FieldError message={imageErrors.fields.url} />
                  </div>
                </div>
                <div className="cms-header-form-row">
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.fields.parent")}</label>
                    <select className="cms-header-select" name="parent"
                      value={menuImageForm.parent} onChange={handleMenuImageChange}>
                      <option value="">{t("cms.header.root_item")}</option>
                      {parents.map((p) => (
                        <option key={p.id} value={p.id}>{isAr ? p.label_ar : p.label_en}</option>
                      ))}
                    </select>
                  </div>
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.select_page")}</label>
                    <select className="cms-header-select" name="page"
                      value={menuImageForm.page} onChange={handleMenuImageChange}>
                      <option value="">{t("cms.header.select_page")}</option>
                      {pages.map((p) => (
                        <option key={p.id} value={p.id}>{isAr ? p.title_ar : p.title_en}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="cms-header-form-row">
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.fields.order")}</label>
                    <input className="cms-header-input" type="number" name="order" data-field="order"
                      value={menuImageForm.order} onChange={handleMenuImageChange} />
                    <FieldError message={imageErrors.fields.order} />
                  </div>
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.fields.image")}</label>
                    <input type="file" accept="image/*" className="cms-header-input-file"
                      onChange={handleMenuImageChange} />
                    {menuImageEditId && !menuImageForm.image && (
                      <span className="cms-header-hint">{t("cms.header.menu_images.keep_existing")}</span>
                    )}
                  </div>
                </div>
                <div className="cms-header-form-row">
                  <div className="cms-header-form-group cms-header-form-group--checkbox">
                    <label className="cms-header-checkbox-label">
                      <input type="checkbox" className="cms-header-checkbox" name="is_active"
                        checked={menuImageForm.is_active} onChange={handleMenuImageChange} />
                      <span className="cms-header-checkbox-text">{t("cms.header.fields.is_active")}</span>
                    </label>
                  </div>
                  <div />
                </div>
              </div>
              <FormError message={imageErrors.message} />
              <div className="cms-header-form-actions">
                <button type="submit" className="cms-header-btn-primary"
                  disabled={!imgFormValid || loading[menuImageEditId ? `img-update-${menuImageEditId}` : "img-create"]}>
                  {loading[menuImageEditId ? `img-update-${menuImageEditId}` : "img-create"] ? <IcoSpinner /> : <IcoSave />}
                  {menuImageEditId ? t("cms.header.update") : t("cms.header.create")}
                </button>
                {menuImageEditId && (
                  <button type="button" className="cms-header-btn-secondary" onClick={resetMenuImageForm}>
                    <IcoX />{t("cms.header.cancel")}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Menu images list */}
          <div className="cms-header-card">
            <div className="cms-header-card-header">
              <div className="cms-header-card-header-left">
                <span className="cms-header-card-icon cms-header-card-icon--teal"><IcoImage /></span>
                <h2 className="cms-header-card-title">{t("cms.header.menu_images.list_title")}</h2>
              </div>
              <span className="cms-header-count-badge">{menuImages.length}</span>
            </div>
            {menuImages.length === 0 ? (
              <div className="cms-header-empty"><IcoPlus />{t("cms.header.empty")}</div>
            ) : (
              <div className="cms-header-tree-list">
                {menuImages.map((item) => (
                  <div key={item.id} className="cms-header-tree-item">
                    <div className="cms-header-tree-content">
                      {item.image_url && (
                        <div className="cms-header-menu-image-thumb">
                          <img src={item.image_url} alt={item.label_ar} />
                        </div>
                      )}
                      <div className="cms-header-tree-info">
                        <div className="cms-header-tree-label">
                          {isAr ? item.label_ar : item.label_en}
                          {!item.is_active && (
                            <span className="cms-header-badge cms-header-badge--inactive">{t("cms.header.inactive")}</span>
                          )}
                        </div>
                        <div className="cms-header-tree-url">{isAr ? item.description_ar : item.description_en}</div>
                      </div>
                      <div className="cms-header-tree-actions">
                        <Editbtn onClick={() => handleMenuImageEdit(item)} className="cms-header-btn-edit" iconOnly={false} label={t("cms.header.edit")} />
                        <Deletebtn onConfirm={() => handleMenuImageDelete(item.id)} className="cms-header-btn-delete" iconOnly={false} label={t("cms.header.delete")} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ TAB 4 — QUICK ACCESS ══════════════ */}
      {activeTab === "quick_access" && (
        <div className="cms-header-tab-content" key="quick_access">
          <div className="cms-header-card">
            <div className="cms-header-card-header">
              <div className="cms-header-card-header-left">
                <span className="cms-header-card-icon cms-header-card-icon--amber"><IcoBolt /></span>
                <h2 className="cms-header-card-title">{t("cms.header.quick_access.form_title")}</h2>
              </div>
              {qaEditId && (
                <button className="cms-header-btn-secondary" type="button"
                  onClick={() => { setQaEditId(null); setQaForm({ type:"quick_access", label_ar:"", label_en:"", slug:"", url:"", page:"", order:0, is_active:true }); }}>
                  <IcoX />{t("cms.header.cancel")}
                </button>
              )}
            </div>
            <div className="cms-header-info-box cms-header-info-box--warning">
              <IcoInfo />
              {t("cms.header.quick_access.limit_hint", { count: quickAccess.length })}
            </div>
            <form onSubmit={handleQaSubmit} style={{ marginTop:16 }}>
              <div className="cms-header-form-section">
                <div className="cms-header-form-row">
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.label_ar")}</label>
                    <input className="cms-header-input" name="label_ar" data-field="label_ar" dir="rtl"
                      value={qaForm.label_ar} onChange={handleQaChange} required />
                    <FieldError message={qaErrors.fields.label_ar} />
                  </div>
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.label_en")}</label>
                    <input className="cms-header-input" name="label_en" data-field="label_en"
                      value={qaForm.label_en} onChange={handleQaChange} required />
                    <FieldError message={qaErrors.fields.label_en} />
                  </div>
                </div>
                <div className="cms-header-form-row">
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.fields.slug")}</label>
                    <input className="cms-header-input" name="slug" data-field="slug" placeholder="/contact"
                      value={qaForm.slug} onChange={handleQaChange} />
                    <FieldError message={qaErrors.fields.slug} />
                  </div>
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.custom_url")}</label>
                    <input className="cms-header-input" name="url" data-field="url" placeholder="https://..."
                      value={qaForm.url} onChange={handleQaChange} />
                    <FieldError message={qaErrors.fields.url} />
                  </div>
                </div>
                <div className="cms-header-form-row">
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.select_page")}</label>
                    <select className="cms-header-select" name="page" value={qaForm.page}
                      onChange={(e) => setQaForm({ ...qaForm, page: e.target.value })}>
                      <option value="">{t("cms.header.select_page")}</option>
                      {pages.map((p) => (
                        <option key={p.id} value={p.id}>{isAr ? p.title_ar : p.title_en}</option>
                      ))}
                    </select>
                  </div>
                  <div className="cms-header-form-group">
                    <label className="cms-header-label">{t("cms.header.fields.order")}</label>
                    <input className="cms-header-input" type="number" name="order" data-field="order"
                      value={qaForm.order} onChange={handleQaChange} />
                    <FieldError message={qaErrors.fields.order} />
                  </div>
                </div>
                <div className="cms-header-form-row">
                  <div className="cms-header-form-group cms-header-form-group--checkbox">
                    <label className="cms-header-checkbox-label">
                      <input type="checkbox" className="cms-header-checkbox" name="is_active"
                        checked={qaForm.is_active} onChange={handleQaChange} />
                      <span className="cms-header-checkbox-text">{t("cms.header.fields.is_active")}</span>
                    </label>
                  </div>
                  <div />
                </div>
              </div>
              <FormError message={qaErrors.message} />
              <div className="cms-header-form-actions">
                <button type="submit" className="cms-header-btn-primary"
                  disabled={!qaFormValid || (!qaEditId && quickAccess.length >= 8) || loading[qaEditId ? `qa-update-${qaEditId}` : "qa-create"]}>
                  {loading[qaEditId ? `qa-update-${qaEditId}` : "qa-create"] ? <IcoSpinner /> : <IcoSave />}
                  {qaEditId ? t("cms.header.update") : t("cms.header.create")}
                </button>
              </div>
            </form>
          </div>

          {/* Quick access list */}
          <div className="cms-header-card">
            <div className="cms-header-card-header">
              <div className="cms-header-card-header-left">
                <span className="cms-header-card-icon cms-header-card-icon--amber"><IcoBolt /></span>
                <h2 className="cms-header-card-title">{t("cms.header.quick_access.title")}</h2>
              </div>
              <span className="cms-header-count-badge">{quickAccess.length}/8</span>
            </div>
            {quickAccess.length === 0 ? (
              <div className="cms-header-empty"><IcoPlus />{t("cms.header.empty")}</div>
            ) : (
              <div className="cms-header-tree-list">
                {quickAccess.map((item) => (
                  <div key={item.id} className="cms-header-tree-item">
                    <div className="cms-header-tree-content">
                      <div className="cms-header-tree-order">
                        <label className="cms-header-tree-order-label">{t("cms.header.order")}</label>
                        <input type="number" className="cms-header-input-number" value={item.order}
                          onChange={async (e) => {
                            await api.patch(API_PATHS.cms.headerItem(item.id), { order: e.target.value });
                            toast.success(t("cms.header.success.order_updated")); loadData();
                          }} />
                      </div>
                      <div className="cms-header-tree-info">
                        <div className="cms-header-tree-label">
                          {isAr ? item.label_ar : item.label_en}
                          {!item.is_active && (
                            <span className="cms-header-badge cms-header-badge--inactive">{t("cms.header.inactive")}</span>
                          )}
                        </div>
                        <div className="cms-header-tree-url">{item.resolved_url || item.slug || item.url}</div>
                      </div>
                      <div className="cms-header-tree-actions">
                        <Editbtn onClick={() => handleQaEdit(item)} className="cms-header-btn-edit" iconOnly={false} label={t("cms.header.edit")} />
                        <Deletebtn onConfirm={() => handleQaDelete(item.id)} className="cms-header-btn-delete" iconOnly={false} label={t("cms.header.delete")} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ TAB 5 — PAGE CONTENT ══════════════ */}
      {activeTab === "page_content" && (
        <div className="cms-header-tab-content" key="page_content">
          <div className="cms-header-card">
            <div className="cms-header-card-header">
              <div className="cms-header-card-header-left">
                <span className="cms-header-card-icon cms-header-card-icon--green"><IcoDoc /></span>
                <h2 className="cms-header-card-title">{t("cms.header.page_content.title")}</h2>
              </div>
            </div>
            <div className="cms-header-form-section">
              <div className="cms-header-info-box cms-header-info-box--info" style={{ marginBottom:16 }}>
                <IcoInfo />
                {t("cms.header.page_content.hint")}
              </div>
              <div className="cms-header-form-row">
                <div className="cms-header-form-group">
                  <label className="cms-header-label">{t("cms.header.fields.slug")}</label>
                  <div className="cms-header-inline-group">
                    <input className="cms-header-input" placeholder="/contact"
                      value={pcEditSlug || ""}
                      onChange={(e) => setPcEditSlug(e.target.value)} />
                    <button type="button" className="cms-header-btn-primary"
                      onClick={() => pcEditSlug && loadPageContent(pcEditSlug)}>
                      {t("cms.header.page_content.load_btn")}
                    </button>
                  </div>
                  {pcEditSlug && (
                    <div className="cms-header-resolved-url">→ <strong>{`/page/${pcEditSlug}`}</strong></div>
                  )}
                </div>
                <div />
              </div>
            </div>

            {pcForm.slug && (
              <form onSubmit={handlePcSubmit}>
                <div className="cms-header-form-section">
                  <div className="cms-header-form-row">
                    <div className="cms-header-form-group">
                      <label className="cms-header-label">{t("cms.header.page_content.title_ar")}</label>
                      <input className="cms-header-input" dir="rtl"
                        value={pcForm.title_ar || ""}
                        onChange={(e) => setPcForm({ ...pcForm, title_ar: e.target.value })} />
                    </div>
                    <div className="cms-header-form-group">
                      <label className="cms-header-label">{t("cms.header.page_content.title_en")}</label>
                      <input className="cms-header-input"
                        value={pcForm.title_en || ""}
                        onChange={(e) => setPcForm({ ...pcForm, title_en: e.target.value })} />
                    </div>
                  </div>
                  <div className="cms-header-form-row">
                    <div className="cms-header-form-group">
                      <label className="cms-header-label">{t("cms.header.page_content.content_ar")}</label>
                      <textarea className="cms-header-input cms-header-textarea" rows={5} dir="rtl"
                        value={pcForm.content_ar || ""}
                        onChange={(e) => setPcForm({ ...pcForm, content_ar: e.target.value })} />
                    </div>
                    <div className="cms-header-form-group">
                      <label className="cms-header-label">{t("cms.header.page_content.content_en")}</label>
                      <textarea className="cms-header-input cms-header-textarea" rows={5}
                        value={pcForm.content_en || ""}
                        onChange={(e) => setPcForm({ ...pcForm, content_en: e.target.value })} />
                    </div>
                  </div>
                </div>
                <FormError message={pcErrors.message} />
                <div className="cms-header-form-actions">
                  <button type="submit" className="cms-header-btn-primary" disabled={loading["pc-save"]}>
                    {loading["pc-save"] ? <IcoSpinner /> : <IcoSave />}
                    {t("cms.header.update")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
