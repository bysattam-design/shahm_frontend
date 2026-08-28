// Dashboard blog CMS
import React, { useEffect, useState, useCallback } from "react";
import { useBlogStore } from "../../../store/useBlogStore";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useSweetAlert } from "../../../components/common/SweetAlert";
import Editbtn from "../../../components/common/dashboard/Editbtn";
import Deletebtn from "../../../components/common/dashboard/Deletebtn";
import { Button, EmptyState, Spinner as UiSpinner } from "../../../components/ui";
import "../../../styles/forms/cms-form.css";
import "../../../styles/dashboard/cms/blog.css";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";

/* ══════════════════════════════════════════════════════
   ICONS — minimal stroke SVG set
══════════════════════════════════════════════════════ */
const IconSettings = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const IconFolder = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M3 5C3 4.45 3.45 4 4 4H8L10 6H16C16.55 6 17 6.45 17 7V15C17 15.55 16.55 16 16 16H4C3.45 16 3 15.55 3 15V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconTag = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M3 3H9.5L17 10.5L11 16.5L3.5 9V3H3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="6.5" cy="6.5" r="1" fill="currentColor" />
  </svg>
);
const IconDoc = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M12 2H5C4.45 2 4 2.45 4 3V17C4 17.55 4.45 18 5 18H15C15.55 18 16 17.55 16 17V6L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 2V6H16M7 10H13M7 13H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const IconSave = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path d="M2 2H10.5L13 4.5V13H2V2Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.5 2V5.5H10V2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 8.5H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M2 4H12M4.5 4V2.5H9.5V4M5.5 6.5V11M8.5 6.5V11M3 4L3.5 12C3.5 12.55 3.95 13 4.5 13H9.5C10.05 13 10.5 12.55 10.5 12L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path d="M7.5 2V13M2 7.5H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const IconX = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
    <path d="M11.5 1.5L1.5 11.5M1.5 1.5L11.5 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const IconSection = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="12" height="3" rx="1" stroke="currentColor" strokeWidth="1.3" />
    <rect x="2" y="7" width="12" height="7" rx="1" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);
const IconList = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M3 4H15M3 9H15M3 14H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const Spinner = () => (
  <span className="cms-blog-btn-spinner" aria-hidden="true">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"
        strokeDasharray="28" strokeDashoffset="10" strokeLinecap="round" />
    </svg>
  </span>
);

/* ══════════════════════════════════════════════════════
   EMPTY POST FORM — centralized default
══════════════════════════════════════════════════════ */
const EMPTY_POST = {
  title_ar: "",
  title_en: "",
  intro_ar: "",
  intro_en: "",
  category: "",
  tags: [],
  cover_image: null,
  image: null,
  status: "draft",
  sections: [
    { title_ar: "", title_en: "", content_ar: "", content_en: "", order: 1 },
  ],
};

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
/**
 * Says what the server said, and hands back what belongs on the fields.
 *
 * Every handler on this screen answered a refusal with one generic key —
 * «فشل حفظ التصنيف» — and dropped the message the store had already captured.
 * The three delete handlers were worse: they never looked at the answer at
 * all and announced success either way.
 */
function reportRefusal(result, fallback) {
  const message = result?.message || "";

  if (!result?.canceled) toast.error(message || fallback);

  return { fields: result?.fields || {}, message };
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
    <div className="blog-form-error" role="alert">
      {message}
    </div>
  );
}

export default function BlogCms() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { alert: sweetAlertEl, show: showAlert } = useSweetAlert();

  const [activeTab, setActiveTab] = useState("settings");

  // What the first load did, and what the server refused on each form.
  const [pageState, setPageState] = useState({ status: "loading", message: "" });
  const [settingsErrors, setSettingsErrors] = useState({ fields: {}, message: "" });
  const [catErrors, setCatErrors] = useState({ fields: {}, message: "" });
  const [tagErrors, setTagErrors] = useState({ fields: {}, message: "" });
  const [postErrors, setPostErrors] = useState({ fields: {}, message: "" });
  const [loading, setLoading] = useState({});
  const setLoadingKey = (key, val) =>
    setLoading((prev) => ({ ...prev, [key]: val }));

  const {
    categories, tags, posts,
    fetchCategories, createCategory, updateCategory, deleteCategory,
    fetchTags, createTag, updateTag, deleteTag,
    fetchPosts, createPost, updatePost, deletePost,
    fetchBlogSettings, updateBlogSettings,
  } = useBlogStore();

  /* ── Settings form ── */
  const [settingsForm, setSettingsForm] = useState({
    page_title_ar: "", page_title_en: "",
    last_update_title_ar: "", last_update_title_en: "",
    last_update_description_ar: "", last_update_description_en: "",
  });

  /* ── Category form ── */
  const [catForm, setCatForm] = useState({
    name_ar: "", name_en: "", slug: "", color: "#353C3C", icon: null,
  });
  const [editingCat, setEditingCat] = useState(null);

  /* ── Tag form ── */
  const [tagForm, setTagForm] = useState({ name_ar: "", name_en: "", slug: "" });
  const [editingTag, setEditingTag] = useState(null);

  /* ── Post form ── */
  const [postForm, setPostForm] = useState(EMPTY_POST);
  const [editPost, setEditPost] = useState(null);

  /* ══ Load data on mount ══ */
  const loadSettings = useCallback(async () => {
    const result = await fetchBlogSettings();
    if (result?.success && result.data) setSettingsForm(result.data);
    return result;
  }, [fetchBlogSettings]);

  /**
   * The screen used to render its forms over empty lists whatever the server
   * answered, so an outage was indistinguishable from a blog with nothing in
   * it. `quiet` is for the refresh after a write, which should not blink the
   * whole screen back to loading.
   */
  const loadAll = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setPageState({ status: "loading", message: "" });

    const results = await Promise.all([
      fetchCategories(),
      fetchTags(),
      fetchPosts(),
      loadSettings(),
    ]);

    const refused = results.find((r) => r && !r.success && !r.canceled);

    setPageState(
      refused
        ? { status: "failed", message: refused.message }
        : { status: "ready", message: "" }
    );
  }, [fetchCategories, fetchTags, fetchPosts, loadSettings]);

  const EDITOR_OPTIONS = {
    height: 260,

    fontSize: [
      12, 14, 16, 18, 20, 24, 28, 32, 36
    ],

    buttonList: [
      ["undo", "redo"],

      ["font", "fontSize", "formatBlock"],

      ["bold", "underline", "italic", "strike"],

      ["fontColor", "hiliteColor"],

      ["align", "horizontalRule", "list", "lineHeight"],

      ["outdent", "indent"],

      ["table", "link", "image"],

      ["removeFormat"],

      ["fullScreen", "codeView"],
    ],
  };

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  /* ══════════════════════════════════════════════════════
     SETTINGS
  ══════════════════════════════════════════════════════ */
  const saveSettings = async () => {
    setLoadingKey("settings", true);
    const result = await updateBlogSettings(settingsForm);
    setLoadingKey("settings", false);

    if (result.success) {
      setSettingsErrors({ fields: {}, message: "" });
      toast.success(t("cms.blog.success.settings_saved"));
      return;
    }

    setSettingsErrors(reportRefusal(result, t("cms.blog.errors.settings_failed")));
  };

  /* ══════════════════════════════════════════════════════
     CATEGORIES
  ══════════════════════════════════════════════════════ */
  const saveCategory = async () => {
    if (!catForm.name_ar.trim()) return toast.error(t("cms.blog.errors.category_required"));
    if (catForm.color && !/^#([0-9A-F]{3}){1,2}$/i.test(catForm.color))
      return toast.error(t("cms.blog.errors.invalid_color"));

    const payload = new FormData();
    payload.append("name_ar", catForm.name_ar.trim());
    payload.append("name_en", catForm.name_en?.trim() || "");
    if (catForm.slug) payload.append("slug", catForm.slug.trim());
    if (catForm.color) payload.append("color", catForm.color);
    if (catForm.icon) payload.append("icon", catForm.icon);

    const key = editingCat ? `cat-update-${editingCat.id}` : "cat-create";
    setLoadingKey(key, true);
    const result = editingCat
      ? await updateCategory(editingCat.id, payload)
      : await createCategory(payload);
    setLoadingKey(key, false);

    if (result.success) {
      setCatErrors({ fields: {}, message: "" });
      toast.success(t("cms.blog.success.category_saved"));
      setCatForm({ name_ar: "", name_en: "", slug: "", color: "#353C3C", icon: null });
      setEditingCat(null);
      return;
    }

    setCatErrors(reportRefusal(result, t("cms.blog.errors.category_failed")));
  };

  const handleDeleteCategory = async (id) => {
    const confirmed = await showAlert({
      type: "confirm",
      title: t("cms.blog.confirm_delete_category_title"),
      message: t("cms.blog.confirm_delete_category"),
      confirmText: t("cms.blog.actions.delete"),
      cancelText: t("cms.blog.actions.cancel"),
      showCancel: true,
      isRtl: isAr,
    });
    if (!confirmed) return;
    setLoadingKey(`cat-delete-${id}`, true);
    const result = await deleteCategory(id);
    setLoadingKey(`cat-delete-${id}`, false);

    // The answer used to be thrown away and success announced whatever
    // happened, so a refused delete left the record on screen under a
    // notice saying it was gone.
    if (result?.success) {
      toast.success(t("cms.blog.success.category_deleted"));
      return;
    }

    reportRefusal(result, t("cms.blog.errors.category_failed"));
  };

  /* ══════════════════════════════════════════════════════
     TAGS
  ══════════════════════════════════════════════════════ */
  const saveTag = async () => {
    if (!tagForm.name_ar.trim()) return toast.error(t("cms.blog.errors.tag_required"));
    const payload = {
      name_ar: tagForm.name_ar,
      name_en: tagForm.name_en,
      ...(tagForm.slug.trim() && { slug: tagForm.slug }),
    };
    const key = editingTag ? `tag-update-${editingTag.id}` : "tag-create";
    setLoadingKey(key, true);
    const result = editingTag
      ? await updateTag(editingTag.id, payload)
      : await createTag(payload);
    setLoadingKey(key, false);

    if (result.success) {
      setTagErrors({ fields: {}, message: "" });
      toast.success(t("cms.blog.success.tag_saved"));
      setTagForm({ name_ar: "", name_en: "", slug: "" });
      setEditingTag(null);
      return;
    }

    setTagErrors(reportRefusal(result, t("cms.blog.errors.tag_failed")));
  };

  const handleDeleteTag = async (id) => {
    const confirmed = await showAlert({
      type: "confirm",
      title: t("cms.blog.confirm_delete_tag_title"),
      message: t("cms.blog.confirm_delete_tag"),
      confirmText: t("cms.blog.actions.delete"),
      cancelText: t("cms.blog.actions.cancel"),
      showCancel: true,
      isRtl: isAr,
    });
    if (!confirmed) return;
    setLoadingKey(`tag-delete-${id}`, true);
    const result = await deleteTag(id);
    setLoadingKey(`tag-delete-${id}`, false);

    // The answer used to be thrown away and success announced whatever
    // happened, so a refused delete left the record on screen under a
    // notice saying it was gone.
    if (result?.success) {
      toast.success(t("cms.blog.success.tag_deleted"));
      return;
    }

    reportRefusal(result, t("cms.blog.errors.tag_failed"));
  };

  /* ══════════════════════════════════════════════════════
     POSTS
  ══════════════════════════════════════════════════════ */
  const handlePostChange = (e) => {
    const { name, value, files } = e.target;
    setPostForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const toggleTag = (id) => {
    setPostForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(id)
        ? prev.tags.filter((t) => t !== id)
        : [...prev.tags, id],
    }));
  };

  /* ── Section helpers ── */
  const addSection = () => {
    setPostForm((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          title_ar: "", title_en: "",
          content_ar: "", content_en: "",
          order: prev.sections.length + 1,
        },
      ],
    }));
  };

  const updateSection = (index, field, value) => {
    setPostForm((prev) => {
      const updated = [...prev.sections];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, sections: updated };
    });
  };

  const removeSection = (index) => {
    setPostForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 })),
    }));
  };

  const loadPostIntoForm = (post) => {
    setPostForm({
      title_ar: post.title_ar || "",
      title_en: post.title_en || "",
      intro_ar: post.intro_ar || "",
      intro_en: post.intro_en || "",
      category: post.category?.id || "",
      tags: post.tags ? post.tags.map((t) => t.id) : [],
      cover_image: null,
      image: null,
      status: post.status || "draft",
      sections: post.sections?.length
        ? post.sections.map((s) => ({
          title_ar: s.title_ar || "",
          title_en: s.title_en || "",
          content_ar: s.content_ar || "",
          content_en: s.content_en || "",
          order: s.order || 1,
        }))
        : [{ title_ar: "", title_en: "", content_ar: "", content_en: "", order: 1 }],
    });
    setEditPost(post);
    setActiveTab("posts");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetPostForm = () => {
    setPostForm(EMPTY_POST);
    setEditPost(null);
  };

  const savePost = async () => {
    const fd = new FormData();

    fd.append("title_ar", postForm.title_ar);
    fd.append("title_en", postForm.title_en);
    fd.append("intro_ar", postForm.intro_ar);
    fd.append("intro_en", postForm.intro_en);
    fd.append("status", postForm.status);

    if (postForm.category) fd.append("category_id", postForm.category);

    postForm.tags.forEach((tagId) => fd.append("tag_ids", tagId));

    fd.append("sections_data", JSON.stringify(postForm.sections));

    if (postForm.cover_image) fd.append("cover_image", postForm.cover_image);
    if (postForm.image) fd.append("image", postForm.image);

    const key = editPost ? `post-update-${editPost.id}` : "post-create";
    setLoadingKey(key, true);
    const result = editPost
      ? await updatePost(editPost.id, fd)
      : await createPost(fd);
    setLoadingKey(key, false);

    if (result.success) {
      setPostErrors({ fields: {}, message: "" });
      toast.success(editPost
        ? t("cms.blog.success.post_updated")
        : t("cms.blog.success.post_created")
      );
      resetPostForm();
      return;
    }

    setPostErrors(reportRefusal(result, t("cms.blog.errors.post_failed")));
  };

  const handleDeletePost = async (id) => {
    const confirmed = await showAlert({
      type: "confirm",
      title: t("cms.blog.confirm_delete_post_title"),
      message: t("cms.blog.confirm_delete_post"),
      confirmText: t("cms.blog.actions.delete"),
      cancelText: t("cms.blog.actions.cancel"),
      showCancel: true,
      isRtl: isAr,
    });
    if (!confirmed) return;
    setLoadingKey(`post-delete-${id}`, true);
    const result = await deletePost(id);
    setLoadingKey(`post-delete-${id}`, false);

    // The answer used to be thrown away and success announced whatever
    // happened, so a refused delete left the record on screen under a
    // notice saying it was gone.
    if (result?.success) {
      toast.success(t("cms.blog.success.post_deleted"));
      return;
    }

    reportRefusal(result, t("cms.blog.errors.post_failed"));
  };

  /* ══ Tabs config ══ */
  const tabs = [
    { id: "settings", label: t("cms.blog.tabs.settings"), icon: <IconSettings /> },
    { id: "categories", label: t("cms.blog.tabs.categories"), icon: <IconFolder /> },
    { id: "tags", label: t("cms.blog.tabs.tags"), icon: <IconTag /> },
    { id: "posts", label: t("cms.blog.tabs.posts"), icon: <IconDoc /> },
  ];

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  const header = (
    <div className="cms-blog-page-header">
      <div className="cms-blog-page-header-content">
        <h1 className="cms-blog-title">{t("cms.blog.title")}</h1>
        <p className="cms-blog-subtitle">{t("cms.blog.subtitle")}</p>
      </div>
    </div>
  );

  // A refused load used to render the forms over three empty lists, so an
  // outage and an empty blog looked exactly alike.
  if (pageState.status === "loading") {
    return (
      <div className="cms-blog-root">
        {header}
        <div style={{ padding: "48px 0", textAlign: "center" }}>
          <UiSpinner size={20} label={t("states.loading", "جار التحميل")} />
        </div>
      </div>
    );
  }

  if (pageState.status === "failed") {
    return (
      <div className="cms-blog-root">
        {sweetAlertEl}
        {header}
        <EmptyState
          title={t("states.error_title", "تعذر جلب البيانات")}
          hint={pageState.message || t("states.error_hint", "تحقق من الاتصال ثم أعد المحاولة.")}
          action={
            <Button onClick={() => loadAll()}>
              {t("states.retry", "أعد المحاولة")}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="cms-blog-root">
      {sweetAlertEl}

      {/* ── Page Header ── */}
      <div className="cms-blog-page-header">
        <div className="cms-blog-page-header-content">
          <h1 className="cms-blog-title">{t("cms.blog.title")}</h1>
          <p className="cms-blog-subtitle">{t("cms.blog.subtitle")}</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="cms-blog-tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`cms-blog-tab${activeTab === tab.id ? " cms-blog-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ══════════════ SETTINGS ══════════════ */}
      {activeTab === "settings" && (
        <div className="cms-blog-tab-content" key="settings">
          <div className="cms-blog-card">
            <div className="cms-blog-card-header">
              <div className="cms-blog-card-header-left">
                <IconSettings />
                <h2 className="cms-blog-card-title">{t("cms.blog.settings.title")}</h2>
              </div>
            </div>

            <div className="cms-blog-form-section">
              <div className="cms-blog-section-divider">
                <div className="cms-blog-section-divider-line" />
                <span className="cms-blog-section-divider-label">{t("cms.blog.settings.section_page")}</span>
                <div className="cms-blog-section-divider-line" />
              </div>

              {/* Row 1: page titles */}
              <div className="cms-blog-form-row">
                <div className="cms-blog-form-group">
                  <label className="cms-blog-label">{t("cms.blog.settings.page_title_ar")}</label>
                  <input className="cms-blog-input"
                    value={settingsForm.page_title_ar}
                    onChange={(e) => setSettingsForm({ ...settingsForm, page_title_ar: e.target.value })}
                    dir="rtl" />
                </div>
                <div className="cms-blog-form-group">
                  <label className="cms-blog-label">{t("cms.blog.settings.page_title_en")}</label>
                  <input className="cms-blog-input"
                    value={settingsForm.page_title_en}
                    onChange={(e) => setSettingsForm({ ...settingsForm, page_title_en: e.target.value })} />
                </div>
              </div>

              {/* Row 2: update titles */}
              <div className="cms-blog-form-row">
                <div className="cms-blog-form-group">
                  <label className="cms-blog-label">{t("cms.blog.settings.update_title_ar")}</label>
                  <input className="cms-blog-input"
                    value={settingsForm.last_update_title_ar}
                    onChange={(e) => setSettingsForm({ ...settingsForm, last_update_title_ar: e.target.value })}
                    dir="rtl" />
                </div>
                <div className="cms-blog-form-group">
                  <label className="cms-blog-label">{t("cms.blog.settings.update_title_en")}</label>
                  <input className="cms-blog-input"
                    value={settingsForm.last_update_title_en}
                    onChange={(e) => setSettingsForm({ ...settingsForm, last_update_title_en: e.target.value })} />
                </div>
              </div>

              {/* Row 3: update descriptions */}
              <div className="cms-blog-form-row">
                <div className="cms-blog-form-group">
                  <label className="cms-blog-label">{t("cms.blog.settings.update_desc_ar")}</label>
                  <textarea className="cms-blog-textarea"
                    value={settingsForm.last_update_description_ar}
                    onChange={(e) => setSettingsForm({ ...settingsForm, last_update_description_ar: e.target.value })}
                    rows={4} dir="rtl" />
                </div>
                <div className="cms-blog-form-group">
                  <label className="cms-blog-label">{t("cms.blog.settings.update_desc_en")}</label>
                  <textarea className="cms-blog-textarea"
                    value={settingsForm.last_update_description_en}
                    onChange={(e) => setSettingsForm({ ...settingsForm, last_update_description_en: e.target.value })}
                    rows={4} />
                </div>
              </div>
            </div>

            <FormError message={settingsErrors.message} />
            <div className="cms-blog-form-actions">
              <button className="cms-blog-btn-primary" onClick={saveSettings}
                disabled={loading["settings"]}>
                {loading["settings"] ? <Spinner /> : <IconSave />}
                {t("cms.blog.actions.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ CATEGORIES ══════════════ */}
      {activeTab === "categories" && (
        <div className="cms-blog-tab-content" key="categories">
          {/* Form card */}
          <div className="cms-blog-card">
            <div className="cms-blog-card-header">
              <div className="cms-blog-card-header-left">
                <IconFolder />
                <h2 className="cms-blog-card-title">
                  {editingCat ? t("cms.blog.actions.update_category") : t("cms.blog.actions.create_category")}
                </h2>
              </div>
              {editingCat && (
                <button className="cms-blog-btn-secondary"
                  onClick={() => { setEditingCat(null); setCatForm({ name_ar: "", name_en: "", slug: "", color: "#353C3C", icon: null }); }}>
                  <IconX />
                  {t("cms.blog.actions.cancel")}
                </button>
              )}
            </div>

            <div className="cms-blog-form-section">
              {/* Row 1: names */}
              <div className="cms-blog-form-row">
                <div className="cms-blog-form-group">
                  <label className="cms-blog-label">{t("cms.blog.fields.category_ar")}</label>
                  <input className="cms-blog-input"
                    placeholder={t("cms.blog.fields.category_ar_placeholder")}
                    value={catForm.name_ar}
                    data-field="name_ar"
                    onChange={(e) => setCatForm({ ...catForm, name_ar: e.target.value })}
                    dir="rtl" />
                  <FieldError message={catErrors.fields.name_ar} />
                </div>
                <div className="cms-blog-form-group">
                  <label className="cms-blog-label">{t("cms.blog.fields.category_en")}</label>
                  <input className="cms-blog-input"
                    placeholder={t("cms.blog.fields.category_en_placeholder")}
                    value={catForm.name_en}
                    data-field="name_en"
                    onChange={(e) => setCatForm({ ...catForm, name_en: e.target.value })} />
                  <FieldError message={catErrors.fields.name_en} />
                </div>
              </div>

              {/* Row 2: slug */}
              <div className="cms-blog-form-row">
                <div className="cms-blog-form-group">
                  <label className="cms-blog-label">{t("cms.blog.fields.slug_optional")}</label>
                  <input className="cms-blog-input" placeholder="auto-generated-slug"
                    value={catForm.slug}
                    onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })} />
                </div>
                <div />
              </div>

              {/* Row 3: color + icon */}
              <div className="cms-blog-form-row">
                <div className="cms-blog-form-group">
                  <label className="cms-blog-label">{t("cms.blog.fields.color")}</label>
                  <div className="cms-blog-color-row">
                    <input type="color" className="cms-blog-color-picker"
                      value={catForm.color}
                      onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} />
                    <input type="text" className="cms-blog-input"
                      value={catForm.color} placeholder="#353C3C"
                      onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} />
                    <div className="cms-blog-color-preview" style={{ background: catForm.color }} />
                  </div>
                </div>
                <div className="cms-blog-form-group">
                  <label className="cms-blog-label">{t("cms.blog.fields.icon")}</label>
                  <input type="file" className="cms-blog-input-file"
                    onChange={(e) => setCatForm({ ...catForm, icon: e.target.files[0] })} />
                </div>
              </div>
            </div>

            <FormError message={catErrors.message} />
            <div className="cms-blog-form-actions">
              <button className="cms-blog-btn-primary" onClick={saveCategory}
                disabled={loading[editingCat ? `cat-update-${editingCat.id}` : "cat-create"]}>
                {loading[editingCat ? `cat-update-${editingCat.id}` : "cat-create"] ? <Spinner /> : <IconSave />}
                {editingCat ? t("cms.blog.actions.update_category") : t("cms.blog.actions.create_category")}
              </button>
              {editingCat && (
                <button className="cms-blog-btn-secondary"
                  onClick={() => { setEditingCat(null); setCatForm({ name_ar: "", name_en: "", slug: "", color: "#353C3C", icon: null }); }}>
                  <IconX />
                  {t("cms.blog.actions.cancel")}
                </button>
              )}
            </div>
          </div>

          {/* List card */}
          <div className="cms-blog-card">
            <div className="cms-blog-card-header">
              <div className="cms-blog-card-header-left">
                <IconList />
                <h2 className="cms-blog-card-title">{t("cms.blog.categories_list")}</h2>
              </div>
              <span className="cms-blog-count-badge">{categories.length}</span>
            </div>

            {categories.length > 0 ? (
              <div className="cms-blog-table-wrapper">
                <table className="cms-blog-table">
                  <thead>
                    <tr>
                      <th>{t("cms.blog.table.id")}</th>
                      <th>{t("cms.blog.fields.category_ar")}</th>
                      <th>{t("cms.blog.fields.category_en")}</th>
                      <th>{t("cms.blog.fields.color")}</th>
                      <th>{t("cms.blog.fields.icon")}</th>
                      <th>{t("cms.blog.fields.slug")}</th>
                      <th>{t("cms.blog.table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => {
                      return (
                        <tr key={c.id}>
                          <td className="cms-blog-td-id">{c.id}</td>
                          <td className="cms-blog-td-name">{c.name_ar}</td>
                          <td className="cms-blog-td-name">{c.name_en}</td>
                          <td>
                            <div className="cms-blog-color-swatch" style={{ background: c.color }} />
                          </td>
                          <td>
                            {c.icon_url && (
                              <img src={c.icon_url} alt="" className="cms-blog-icon-thumb" />
                            )}
                          </td>
                          <td className="cms-blog-td-slug">{c.slug}</td>
                          <td>
                            <div className="cms-blog-table-actions">
                              <Editbtn onClick={() => {
                                setEditingCat(c);
                                setCatForm({ name_ar: c.name_ar, name_en: c.name_en, slug: c.slug, color: c.color || "#353C3C", icon: null });
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }} />
                              <Deletebtn onConfirm={() => handleDeleteCategory(c.id)} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="cms-blog-empty">
                <IconFolder />
                <p>{t("cms.blog.no_categories")}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ TAGS ══════════════ */}
      {activeTab === "tags" && (
        <div className="cms-blog-tab-content" key="tags">
          <div className="cms-blog-card">
            <div className="cms-blog-card-header">
              <div className="cms-blog-card-header-left">
                <IconTag />
                <h2 className="cms-blog-card-title">
                  {editingTag ? t("cms.blog.actions.update_tag") : t("cms.blog.actions.create_tag")}
                </h2>
              </div>
              {editingTag && (
                <button className="cms-blog-btn-secondary"
                  onClick={() => { setEditingTag(null); setTagForm({ name_ar: "", name_en: "", slug: "" }); }}>
                  <IconX />
                  {t("cms.blog.actions.cancel")}
                </button>
              )}
            </div>

            <div className="cms-blog-form-section">
              <div className="cms-blog-form-row">
                <div className="cms-blog-form-group">
                  <label className="cms-blog-label">{t("cms.blog.fields.tag_ar")}</label>
                  <input className="cms-blog-input"
                    placeholder={t("cms.blog.fields.tag_ar_placeholder")}
                    value={tagForm.name_ar}
                    data-field="name_ar"
                    onChange={(e) => setTagForm({ ...tagForm, name_ar: e.target.value })}
                    dir="rtl" />
                  <FieldError message={tagErrors.fields.name_ar} />
                </div>
                <div className="cms-blog-form-group">
                  <label className="cms-blog-label">{t("cms.blog.fields.tag_en")}</label>
                  <input className="cms-blog-input"
                    placeholder={t("cms.blog.fields.tag_en_placeholder")}
                    value={tagForm.name_en}
                    onChange={(e) => setTagForm({ ...tagForm, name_en: e.target.value })} />
                </div>
              </div>

              <div className="cms-blog-form-row">
                <div className="cms-blog-form-group">
                  <label className="cms-blog-label">{t("cms.blog.fields.slug_optional")}</label>
                  <input className="cms-blog-input" placeholder="auto-generated-slug"
                    value={tagForm.slug}
                    onChange={(e) => setTagForm({ ...tagForm, slug: e.target.value })} />
                </div>
                <div />
              </div>
            </div>

            <FormError message={tagErrors.message} />
            <div className="cms-blog-form-actions">
              <button className="cms-blog-btn-primary" onClick={saveTag}
                disabled={loading[editingTag ? `tag-update-${editingTag.id}` : "tag-create"]}>
                {loading[editingTag ? `tag-update-${editingTag.id}` : "tag-create"] ? <Spinner /> : <IconSave />}
                {editingTag ? t("cms.blog.actions.update_tag") : t("cms.blog.actions.create_tag")}
              </button>
              {editingTag && (
                <button className="cms-blog-btn-secondary"
                  onClick={() => { setEditingTag(null); setTagForm({ name_ar: "", name_en: "", slug: "" }); }}>
                  <IconX />
                  {t("cms.blog.actions.cancel")}
                </button>
              )}
            </div>
          </div>

          <div className="cms-blog-card">
            <div className="cms-blog-card-header">
              <div className="cms-blog-card-header-left">
                <IconList />
                <h2 className="cms-blog-card-title">{t("cms.blog.tags_list")}</h2>
              </div>
              <span className="cms-blog-count-badge">{tags.length}</span>
            </div>

            {tags.length > 0 ? (
              <div className="cms-blog-table-wrapper">
                <table className="cms-blog-table">
                  <thead>
                    <tr>
                      <th>{t("cms.blog.table.id")}</th>
                      <th>{t("cms.blog.fields.tag_ar")}</th>
                      <th>{t("cms.blog.fields.tag_en")}</th>
                      <th>{t("cms.blog.fields.slug")}</th>
                      <th>{t("cms.blog.table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tags.map((tItem) => {
                      return (
                        <tr key={tItem.id}>
                          <td className="cms-blog-td-id">{tItem.id}</td>
                          <td className="cms-blog-td-name">{tItem.name_ar}</td>
                          <td className="cms-blog-td-name">{tItem.name_en}</td>
                          <td className="cms-blog-td-slug">{tItem.slug}</td>
                          <td>
                            <div className="cms-blog-table-actions">
                              <Editbtn onClick={() => {
                                setEditingTag(tItem);
                                setTagForm({ name_ar: tItem.name_ar, name_en: tItem.name_en, slug: tItem.slug });
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }} />
                              <Deletebtn onConfirm={() => handleDeleteTag(tItem.id)} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="cms-blog-empty">
                <IconTag />
                <p>{t("cms.blog.no_tags")}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ POSTS ══════════════ */}
      {activeTab === "posts" && (
        <div className="cms-blog-tab-content" key="posts">
          {/* Post form card */}
          <div className="cms-blog-card">
            <div className="cms-blog-card-header">
              <div className="cms-blog-card-header-left">
                <IconDoc />
                <h2 className="cms-blog-card-title">
                  {editPost ? t("cms.blog.actions.update_post") : t("cms.blog.actions.create_post")}
                </h2>
              </div>
              {editPost && (
                <button className="cms-blog-btn-secondary" onClick={resetPostForm}>
                  <IconX />
                  {t("cms.blog.actions.cancel")}
                </button>
              )}
            </div>

            {/* Section: Basic info */}
            <div className="cms-blog-form-section">
              <div className="cms-blog-section-divider">
                <div className="cms-blog-section-divider-line" />
                <span className="cms-blog-section-divider-label">{t("cms.blog.posts.basic_info")}</span>
                <div className="cms-blog-section-divider-line" />
              </div>

              {/* Row 1: titles */}
              <div className="cms-blog-form-row">
                <div className="cms-blog-form-group">
                  <label className="cms-blog-label">{t("cms.blog.fields.title_ar")}</label>
                  <input className="cms-blog-input" name="title_ar"
                    placeholder={t("cms.blog.fields.title_ar_placeholder")}
                    value={postForm.title_ar} onChange={handlePostChange} dir="rtl" />
                  <FieldError message={postErrors.fields.title_ar} />
                </div>
                <div className="cms-blog-form-group">
                  <label className="cms-blog-label">{t("cms.blog.fields.title_en")}</label>
                  <input className="cms-blog-input" name="title_en"
                    placeholder={t("cms.blog.fields.title_en_placeholder")}
                    value={postForm.title_en} onChange={handlePostChange} />
                </div>
              </div>

              {/* Row 2: intro */}
              <div className="cms-blog-form-row">
                <div className="cms-blog-form-group">
                  <label className="cms-blog-label">{t("cms.blog.fields.intro_ar")}</label>
                  <textarea className="cms-blog-textarea" name="intro_ar"
                    placeholder={t("cms.blog.fields.intro_ar_placeholder")}
                    value={postForm.intro_ar} onChange={handlePostChange}
                    rows={5} dir="rtl" />
                </div>
                <div className="cms-blog-form-group">
                  <label className="cms-blog-label">{t("cms.blog.fields.intro_en")}</label>
                  <textarea className="cms-blog-textarea" name="intro_en"
                    placeholder={t("cms.blog.fields.intro_en_placeholder")}
                    value={postForm.intro_en} onChange={handlePostChange}
                    rows={5} />
                </div>
              </div>

              {/* Row 3: category + status */}
              <div className="cms-blog-form-row">
                <div className="cms-blog-form-group">
                  <label className="cms-blog-label">{t("cms.blog.fields.select_category")}</label>
                  <select className="cms-blog-select" name="category"
                    value={postForm.category} onChange={handlePostChange}>
                    <option value="">{t("cms.blog.fields.select_category")}</option>
                    {categories.map((c) => (
                      <option value={c.id} key={c.id}>{c.name_ar}</option>
                    ))}
                  </select>
                </div>
                <div className="cms-blog-form-group">
                  <label className="cms-blog-label">{t("cms.blog.fields.status")}</label>
                  <select className="cms-blog-select" name="status"
                    value={postForm.status} onChange={handlePostChange}>
                    <option value="draft">{t("cms.blog.fields.status_draft")}</option>
                    <option value="published">{t("cms.blog.fields.status_published")}</option>
                    <option value="scheduled">{t("cms.blog.fields.status_scheduled")}</option>
                  </select>
                </div>
              </div>

              {/* Row 4: images */}
              <div className="cms-blog-form-row">
                <div className="cms-blog-form-group">
                  <label className="cms-blog-label">{t("cms.blog.fields.cover_image")}</label>
                  <input className="cms-blog-input-file" type="file"
                    name="cover_image" onChange={handlePostChange} />
                </div>
                <div className="cms-blog-form-group">
                  <label className="cms-blog-label">{t("cms.blog.fields.internal_image")}</label>
                  <input className="cms-blog-input-file" type="file"
                    name="image" onChange={handlePostChange} />
                </div>
              </div>

              {/* Tags */}
              <div className="cms-blog-form-group" style={{ marginTop: 4 }}>
                <label className="cms-blog-label">{t("cms.blog.fields.tags")}</label>
                <div className="cms-blog-tags-selector">
                  {tags.map((tItem) => (
                    <label key={tItem.id}
                      className={`cms-blog-tag-chip${postForm.tags.includes(tItem.id) ? " cms-blog-tag-chip--active" : ""}`}>
                      <input type="checkbox" checked={postForm.tags.includes(tItem.id)}
                        onChange={() => toggleTag(tItem.id)} />
                      <span>{tItem.name_ar}</span>
                    </label>
                  ))}
                  {tags.length === 0 && (
                    <span className="cms-blog-no-tags">{t("cms.blog.no_tags_available")}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Sections builder */}
            <div className="cms-blog-form-section">
              <div className="cms-blog-section-divider">
                <div className="cms-blog-section-divider-line" />
                <span className="cms-blog-section-divider-label">{t("cms.blog.sections.title")}</span>
                <div className="cms-blog-section-divider-line" />
              </div>

              {postForm.sections.map((section, index) => (
                <div key={index} className="cms-blog-section-card">
                  <div className="cms-blog-section-card-header">
                    <div className="cms-blog-section-card-label">
                      <IconSection />
                      <span>{t("cms.blog.sections.item_label")} {index + 1}</span>
                    </div>
                    <div className="cms-blog-section-card-meta">
                      <div className="cms-blog-section-order-wrap">
                        <label className="cms-blog-order-label">{t("cms.blog.fields.order")}</label>
                        <input type="number" className="cms-blog-input-number"
                          value={section.order}
                          onChange={(e) => updateSection(index, "order", Number(e.target.value))} />
                      </div>
                      {postForm.sections.length > 1 && (
                        <button type="button" className="cms-blog-btn-delete"
                          onClick={() => removeSection(index)}>
                          <IconTrash />
                          {t("cms.blog.sections.remove")}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Section titles */}
                  <div className="cms-blog-form-row">
                    <div className="cms-blog-form-group">
                      <label className="cms-blog-label">{t("cms.blog.sections.title_ar")}</label>
                      <input className="cms-blog-input"
                        placeholder={t("cms.blog.sections.title_ar_placeholder")}
                        value={section.title_ar}
                        onChange={(e) => updateSection(index, "title_ar", e.target.value)}
                        dir="rtl" />
                    </div>
                    <div className="cms-blog-form-group">
                      <label className="cms-blog-label">{t("cms.blog.sections.title_en")}</label>
                      <input className="cms-blog-input"
                        placeholder={t("cms.blog.sections.title_en_placeholder")}
                        value={section.title_en}
                        onChange={(e) => updateSection(index, "title_en", e.target.value)} />
                    </div>
                  </div>

                  {/* Section content editors */}
                  <div className="cms-blog-form-row cms-blog-form-row--editors">
                    <div className="cms-blog-form-group">
                      <label className="cms-blog-label">
                        {t("cms.blog.sections.content_ar")}
                      </label>

                      <div className="cms-blog-editor-wrap" dir="rtl">
                        <SunEditor
                          key={`ar-${index}`}
                          setContents={section.content_ar}
                          onChange={(content) =>
                            updateSection(index, "content_ar", content)
                          }
                          setOptions={EDITOR_OPTIONS}
                        />
                      </div>
                    </div>

                    <div className="cms-blog-form-group">
                      <label className="cms-blog-label">
                        {t("cms.blog.sections.content_en")}
                      </label>

                      <div className="cms-blog-editor-wrap" dir="ltr">
                        <SunEditor
                          key={`en-${index}`}
                          setContents={section.content_en}
                          onChange={(content) =>
                            updateSection(index, "content_en", content)
                          }
                          setOptions={EDITOR_OPTIONS}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" className="cms-blog-btn-add-section" onClick={addSection}>
                <IconPlus />
                {t("cms.blog.sections.add")}
              </button>
            </div>

            <FormError message={postErrors.message} />
            <div className="cms-blog-form-actions">
              <button className="cms-blog-btn-primary" onClick={savePost}
                disabled={loading[editPost ? `post-update-${editPost.id}` : "post-create"]}>
                {loading[editPost ? `post-update-${editPost.id}` : "post-create"] ? <Spinner /> : <IconSave />}
                {editPost ? t("cms.blog.actions.update_post") : t("cms.blog.actions.create_post")}
              </button>
              {editPost && (
                <button className="cms-blog-btn-secondary" onClick={resetPostForm}>
                  <IconX />
                  {t("cms.blog.actions.cancel")}
                </button>
              )}
            </div>
          </div>

          {/* Posts list card */}
          <div className="cms-blog-card">
            <div className="cms-blog-card-header">
              <div className="cms-blog-card-header-left">
                <IconList />
                <h2 className="cms-blog-card-title">{t("cms.blog.posts_list")}</h2>
              </div>
              <span className="cms-blog-count-badge">{posts.length}</span>
            </div>

            {posts.length > 0 ? (
              <div className="cms-blog-table-wrapper">
                <table className="cms-blog-table">
                  <thead>
                    <tr>
                      <th>{t("cms.blog.table.id")}</th>
                      <th>{t("cms.blog.table.title_ar")}</th>
                      <th>{t("cms.blog.table.category")}</th>
                      <th>{t("cms.blog.fields.status")}</th>
                      <th>{t("cms.blog.table.cover")}</th>
                      <th>{t("cms.blog.table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((p) => {
                      return (
                        <tr key={p.id}>
                          <td className="cms-blog-td-id">{p.id}</td>
                          <td className="cms-blog-td-name">{p.title_ar}</td>
                          <td className="cms-blog-td-category">{(isAr ? p.category?.name_ar : p.category?.name_en) || "—"}</td>
                          <td>
                            <span className={`cms-blog-status-badge cms-blog-status-badge--${p.status}`}>
                              {p.status === "draft"
                                ? t("cms.blog.fields.status_draft")
                                : p.status === "published"
                                ? t("cms.blog.fields.status_published")
                                : t("cms.blog.fields.status_scheduled")}
                            </span>
                          </td>
                          <td>
                            {p.cover_image_url && (
                              <img className="cms-blog-cover-thumb"
                                src={p.cover_image_url} alt={p.title_ar} />
                            )}
                          </td>
                          <td>
                            <div className="cms-blog-table-actions">
                              <Editbtn onClick={() => loadPostIntoForm(p)} />
                              <Deletebtn onConfirm={() => handleDeletePost(p.id)} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="cms-blog-empty">
                <IconDoc />
                <p>{t("cms.blog.no_posts")}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
