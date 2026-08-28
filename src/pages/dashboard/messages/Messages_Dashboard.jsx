// src/pages/dashboard/messages/Messages_Dashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { formatDate, formatDateTime } from "../../../utils/format";
import { useMessagesStore } from "../../../store/useMessagesStore";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useSweetAlert } from "../../../components/common/SweetAlert";
import "../../../styles/dashboard/messages.css";
import Deletebtn from "../../../components/common/dashboard/Deletebtn";

// ─── Icon Components ──────────────────────────────────────────
const Icon = {
  ContactRequests: () => (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M10 1a9 9 0 1 0 0 18A9 9 0 0 0 10 1zm0 3.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 10.5a7 7 0 0 1-5.468-2.625A6.494 6.494 0 0 1 10 11c2.062 0 3.882.96 5.068 2.455A6.975 6.975 0 0 1 10 15z" fill="currentColor" />
    </svg>
  ),
  Subscribers: () => (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M13.33 6.67C13.33 8.5 11.83 10 10 10S6.67 8.5 6.67 6.67 8.17 3.33 10 3.33s3.33 1.5 3.33 3.34ZM3.33 15v1.67h13.34V15c0-2.22-4.45-3.33-6.67-3.33S3.33 12.78 3.33 15Z" fill="currentColor" />
    </svg>
  ),
  Broadcast: () => (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M17.5 2.5H2.5C1.4 2.5.51 3.4.51 4.5L.5 15.5c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V4.5c0-1.1-.9-2-2-2Zm0 4-7.5 4.75L2.5 6.5V4.5L10 9.25 17.5 4.5V6.5Z" fill="currentColor" />
    </svg>
  ),
  Logs: () => (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M16 2H4C2.9 2 2 2.9 2 4v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2Zm0 14H4V6h12v10ZM6 8h8v2H6V8Zm0 4h8v2H6v-2Z" fill="currentColor" />
    </svg>
  ),
  Copy: () => (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
      <rect x="7" y="7" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  ),
  WhatsApp: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  ),
  Export: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M14 10v3.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V10M4.5 6.5 8 10m0 0 3.5-3.5M8 10V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Send: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1.333 14 14.667 8 1.333 2v4.667L10.667 8l-9.334 1.333V14Z" fill="currentColor" />
    </svg>
  ),
  Search: () => (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
      <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Trash: () => (
    <svg width="15" height="15" viewBox="0 0 48 48" fill="currentColor">
      <path d="M20 2C18.355 2 17 3.355 17 5L17 7L4 7A1 1 0 1 0 4 9L17.832 9A1 1 0 0 0 18.158 9L29.832 9A1 1 0 0 0 30.158 9L44 9A1 1 0 1 0 44 7L31 7L31 5C31 3.355 29.645 2 28 2L20 2ZM20 4L28 4C28.565 4 29 4.435 29 5L29 7L19 7L19 5C19 4.435 19.435 4 20 4ZM6.98 10.986A1 1 0 0 0 5.994 12.094L8.664 40.463C8.901 43.03 11.061 45 13.641 45L34.359 45C36.939 45 39.099 43.03 39.336 40.463L42.006 12.094A1 1 0 1 0 40.014 11.906L37.344 40.275A1 1 0 0 0 37.344 40.279C37.199 41.851 35.939 43 34.359 43L13.641 43C12.061 43 10.801 41.851 10.656 40.279A1 1 0 0 0 10.656 40.275L7.986 11.906A1 1 0 0 0 6.98 10.986Z" />
    </svg>
  ),
  Open: () => (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
      <path d="M10 3.375C5.25 3.375 2.048 5.708.75 9c1.298 3.292 4.5 5.625 9.25 5.625S17.952 12.292 19.25 9C17.952 5.708 14.75 3.375 10 3.375Zm0 9.375c-2.07 0-3.75-1.68-3.75-3.75S7.93 5.25 10 5.25s3.75 1.68 3.75 3.75-1.68 3.75-3.75 3.75Zm0-6A2.25 2.25 0 1 0 10 12a2.25 2.25 0 0 0 0-4.5Z" fill="currentColor" />
    </svg>
  ),
  Save: () => (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path d="M15.75 8.063v7.124c0 .25-.1.487-.255.663A.937.937 0 0 1 14.813 16H3.187a.938.938 0 0 1-.937-.938V3.563c0-.25.1-.487.255-.663A.937.937 0 0 1 3.187 2.5h7.126" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m13.5 1.5 3 3-8.25 8.25H5.25V9.75L13.5 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Close: () => (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path d="M15 5 5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Status: () => (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path d="M17.5 5.833 7.5 15.833l-5-5 1.075-1.075 3.925 3.925 8.925-8.925 1.075 1.075Z" fill="currentColor" />
    </svg>
  ),
};

// ─── Reusable Pagination ──────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange, i18nLang, t }) {
  if (totalPages <= 1) return null;

  const PrevIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      {i18nLang === "ar" ? (
        <path d="M6 12 10 8 6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M10 12 6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
  const NextIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      {i18nLang === "ar" ? (
        <path d="M10 12 6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M6 12 10 8 6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );

  return (
    <div className="msg-pagination">
      <button className="msg-pagination-btn" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        <PrevIcon />
      </button>
      <span className="msg-pagination-info">
        {t("messages.pagination.page")} <strong>{currentPage}</strong> {t("messages.pagination.of")} <strong>{totalPages}</strong>
      </span>
      <button className="msg-pagination-btn" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        <NextIcon />
      </button>
    </div>
  );
}

// ─── Status badge with dot ────────────────────────────────────
function StatusBadge({ status, t }) {
  return (
    <span className={`msg-badge msg-badge--${status}`}>
      <span className="msg-badge-dot" />
      {t(`messages.status.${status}`)}
    </span>
  );
}

// ─── Message Detail Modal ─────────────────────────────────────
function MessageModal({ message, onClose, onSave, t, isRtl }) {
  const [status, setStatus] = useState(message.status);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.classList.add("msg-modal-open");
    return () => document.body.classList.remove("msg-modal-open");
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSave = () => onSave(message.id, status);

  return (
    // Backdrop — clicking it does NOTHING (trap focus inside modal)
    <div className="msg-modal-backdrop" dir={isRtl ? "rtl" : "ltr"}>
      <div
        className="msg-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="msg-modal-title"
        // Stop clicks inside modal from bubbling to backdrop
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="msg-modal-header">
          <div className="msg-modal-header-left">
            <span className="msg-modal-header-icon">
              <Icon.ContactRequests />
            </span>
            <h2 className="msg-modal-title" id="msg-modal-title">
              {t("messages.details")}
            </h2>
          </div>
          <button className="msg-modal-close" onClick={onClose} title={t("messages.close")}>
            <Icon.Close />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="msg-modal-body">

          {/* Phone */}
          <div>
            <p className="msg-modal-section-label">{t("messages.phone")}</p>
            <div className="msg-modal-phone-row">
              <span className="msg-modal-phone-number">{message.phone}</span>
              {/* Copy */}
              <button
                className="msg-icon-btn msg-icon-btn--copy"
                title={t("messages.copy")}
                onClick={() => {
                  navigator.clipboard.writeText(message.phone);
                  toast.success(t("messages.phone_copied"));
                }}
              >
                <Icon.Copy />
              </button>
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${message.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="msg-icon-btn msg-icon-btn--whatsapp"
                title="WhatsApp"
              >
                <Icon.WhatsApp />
              </a>
            </div>
          </div>

          {/* Current status */}
          <div>
            <p className="msg-modal-section-label">{t("messages.current_status")}</p>
            <div className="msg-modal-status-display">
              <StatusBadge status={message.status} t={t} />
            </div>
          </div>

          {/* Update status */}
          <div>
            <p className="msg-modal-section-label">{t("messages.status_update")}</p>
            <div className="msg-modal-update-row">
              <select
                className="msg-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="new">{t("messages.status.new")}</option>
                <option value="in_progress">{t("messages.status.in_progress")}</option>
                <option value="closed">{t("messages.status.closed")}</option>
              </select>
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="msg-modal-footer">
          <button className="msg-btn msg-btn--ghost" onClick={onClose}>
            {t("messages.cancel")}
          </button>
          <button className="msg-btn msg-btn--primary" onClick={handleSave}>
            <Icon.Save />
            {t("messages.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function Messages_Dashboard() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { alert, show } = useSweetAlert();

  const {
    messages,
    subscribers,
    broadcastLogs,
    loadMessages,
    loadSubscribers,
    loadBroadcastLogs,
    sendBroadcast,
    deleteSubscriber,
    exportSubscribers,
    updateMessage,
  } = useMessagesStore();

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [selectedSubscriberIds, setSelectedSubscriberIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [messagesPage, setMessagesPage] = useState(1);
  const [subscribersPage, setSubscribersPage] = useState(1);
  const [logsPage, setLogsPage] = useState(1);
  const [activeModal, setActiveModal] = useState(null); // message object | null
  const itemsPerPage = 5;

  useEffect(() => {
    loadMessages();
    loadSubscribers();
    loadBroadcastLogs();
  }, [loadMessages, loadSubscribers, loadBroadcastLogs]);

  /* ─── Search & Pagination ──────────────────────────────────── */
  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(subscriberSearch.toLowerCase())
  );

  const paginate = (data, page) => data.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = (len) => Math.ceil(len / itemsPerPage);

  const paginatedMessages = paginate(messages, messagesPage);
  const paginatedSubscribers = paginate(filteredSubscribers, subscribersPage);
  const paginatedLogs = paginate(broadcastLogs, logsPage);

  /* ─── Select all ───────────────────────────────────────────── */
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedSubscriberIds([]);
      setSelectAll(false);
    } else {
      setSelectedSubscriberIds(filteredSubscribers.map((s) => s.id));
      setSelectAll(true);
    }
  };

  const toggleSubscriber = (id) =>
    setSelectedSubscriberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  /* ─── Export ───────────────────────────────────────────────── */
  const handleExport = async () => {
    try {
      const res = await exportSubscribers();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "subscribers.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(t("messages.export_success"));
    } catch {
      toast.error(t("messages.error"));
    }
  };

  /* ─── Delete subscriber ────────────────────────────────────── */
  const handleDeleteSubscriber = async (id) => {
    const confirmed = await show({
      type: "confirm",
      title: t("messages.delete_confirm_title"),
      message: t("messages.delete_confirm_text"),
      confirmText: t("messages.delete"),
      cancelText: t("messages.cancel"),
      showCancel: true,
    });
    if (confirmed) {
      await deleteSubscriber(id);
      toast.success(t("messages.delete_success"));
    }
  };

  /* ─── Broadcast ────────────────────────────────────────────── */
  const handleBroadcast = async () => {
    if (!subject.trim() || !content.trim()) {
      toast.error(t("messages.broadcast_required"));
      return;
    }
    const payload = { subject, html: content };
    if (selectedSubscriberIds.length > 0) payload.subscriber_ids = selectedSubscriberIds;
    const res = await sendBroadcast(payload);
    if (res.success) {
      toast.success(t("messages.broadcast_sent", { count: res.sent }));
      setSubject("");
      setContent("");
      loadBroadcastLogs();
    } else {
      toast.error(t("messages.error"));
    }
  };

  /* ─── Modal save ───────────────────────────────────────────── */
  const handleModalSave = useCallback(async (id, newStatus) => {
    await updateMessage(id, { status: newStatus });
    toast.success(t("messages.updated"));
    // refresh messages list so table reflects new status
    loadMessages();
    setActiveModal(null);
  }, [updateMessage, loadMessages, t]);

  /* ─── Modal close ──────────────────────────────────────────── */
  const handleModalClose = useCallback(() => setActiveModal(null), []);

  return (
    <div className="msg-dashboard" dir={isRtl ? "rtl" : "ltr"}>
      {alert}

      {/* ── MESSAGE DETAIL MODAL ── */}
      {activeModal && (
        <MessageModal
          message={activeModal}
          onClose={handleModalClose}
          onSave={handleModalSave}
          t={t}
          isRtl={isRtl}
        />
      )}

      {/* ── PAGE HEADER ── */}
      <div className="msg-page-header">
        <div className="msg-page-header-left">
          <div className="msg-page-header-icon">
            <Icon.ContactRequests />
          </div>
          <div>
            <h1 className="msg-page-title">{t("messages.dashboard")}</h1>
            <p className="msg-page-subtitle">{t("messages.subtitle")}</p>
          </div>
        </div>
      </div>

      {/* ═════════════════════ CONTACT REQUESTS ═════════════════════ */}
      <div className="msg-card">
        <div className="msg-card-header">
          <div className="msg-card-header-left">
            <span className="msg-card-header-icon msg-card-header-icon--blue">
              <Icon.ContactRequests />
            </span>
            <h2 className="msg-card-title">{t("messages.contact_requests")}</h2>
          </div>
          <span className="msg-count-badge">{messages.length}</span>
        </div>

        <div className="msg-table-wrapper">
          <table className="msg-table">
            <thead>
              <tr>
                <th>{t("messages.phone")}</th>
                <th>{t("messages.status.title")}</th>
                <th>{t("messages.read")}</th>
                <th>{t("messages.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMessages.map((m) => (
                <tr key={m.id}>
                  {/* Phone cell — number grows, icons pinned to end */}
                  <td>
                    <div className="msg-phone-cell">
                      <span className="msg-phone-number">{m.phone}</span>
                      <button
                        className="msg-icon-btn msg-icon-btn--copy"
                        title={t("messages.copy")}
                        onClick={() => {
                          navigator.clipboard.writeText(m.phone);
                          toast.success(t("messages.phone_copied"));
                        }}
                      >
                        <Icon.Copy />
                      </button>
                      <a
                        href={`https://wa.me/${m.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="msg-icon-btn msg-icon-btn--whatsapp"
                        title="WhatsApp"
                      >
                        <Icon.WhatsApp />
                      </a>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={m.status} t={t} />
                  </td>
                  <td>
                    <span className={`msg-badge ${m.is_read ? "msg-badge--read" : "msg-badge--unread"}`}>
                      <span className="msg-badge-dot" />
                      {m.is_read ? t("common.yes") : t("common.no")}
                    </span>
                  </td>
                  <td>
                    <div className="msg-actions-cell">
                      {/* Opens modal — no page navigation */}
                      <button
                        className="msg-icon-btn msg-icon-btn--open"
                        title={t("messages.open")}
                        onClick={() => setActiveModal(m)}
                      >
                        <Icon.Open />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {messages.length === 0 && (
                <tr>
                  <td colSpan={4} className="msg-table-empty">{t("messages.no_messages")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={messagesPage}
          totalPages={totalPages(messages.length)}
          onPageChange={setMessagesPage}
          i18nLang={i18n.language}
          t={t}
        />
      </div>

      {/* ═════════════════════ SUBSCRIBERS ═════════════════════ */}
      <div className="msg-card">
        <div className="msg-card-header">
          <div className="msg-card-header-left">
            <span className="msg-card-header-icon msg-card-header-icon--purple">
              <Icon.Subscribers />
            </span>
            <h2 className="msg-card-title">{t("messages.subscribers")}</h2>
          </div>
          <span className="msg-count-badge">{subscribers.length}</span>
        </div>

        {/* Toolbar */}
        <div className="msg-toolbar">
          <div className="msg-search-wrapper">
            <Icon.Search />
            <input
              className="msg-search-input"
              type="text"
              placeholder={t("messages.search_email")}
              value={subscriberSearch}
              onChange={(e) => {
                setSubscriberSearch(e.target.value);
                setSubscribersPage(1);
              }}
            />
          </div>

          <div className="msg-toolbar-actions">
            <label className="msg-checkbox-label">
              <input
                type="checkbox"
                className="msg-checkbox"
                checked={selectAll}
                onChange={toggleSelectAll}
              />
              {t("messages.select_all")}
            </label>

            <span className="msg-counter">
              {t("messages.selected")} <strong>{selectedSubscriberIds.length}</strong> / {filteredSubscribers.length}
            </span>

            <button className="msg-btn msg-btn--export" onClick={handleExport}>
              <Icon.Export />
              {t("messages.export")}
            </button>
          </div>
        </div>

        <div className="msg-table-wrapper">
          <table className="msg-table">
            <thead>
              <tr>
                <th style={{ width: "44px" }}></th>
                <th>{t("messages.email")}</th>
                <th>{t("messages.date")}</th>
                <th>{t("messages.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubscribers.map((s) => (
                <tr key={s.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="msg-checkbox"
                      checked={selectedSubscriberIds.includes(s.id)}
                      onChange={() => toggleSubscriber(s.id)}
                    />
                  </td>
                  <td className="msg-table-email">{s.email}</td>
                  <td className="msg-table-date">
                    {formatDate(s.created_at, i18n.language)}
                  </td>
                  <td>
                    <div className="msg-actions-cell">
                      <Deletebtn
                        onClick={() => handleDeleteSubscriber(s.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSubscribers.length === 0 && (
                <tr>
                  <td colSpan={4} className="msg-table-empty">
                    {subscriberSearch ? t("messages.no_results") : t("messages.no_subscribers")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={subscribersPage}
          totalPages={totalPages(filteredSubscribers.length)}
          onPageChange={setSubscribersPage}
          i18nLang={i18n.language}
          t={t}
        />
      </div>

      {/* ═════════════════════ BROADCAST ═════════════════════ */}
      <div className="msg-card">
        <div className="msg-card-header">
          <div className="msg-card-header-left">
            <span className="msg-card-header-icon msg-card-header-icon--teal">
              <Icon.Broadcast />
            </span>
            <h2 className="msg-card-title">{t("messages.broadcast")}</h2>
          </div>
        </div>

        <div className="msg-form">
          <div className="msg-form-group">
            <label className="msg-label">{t("messages.broadcast_subject")}</label>
            <input
              className="msg-input"
              placeholder={t("messages.broadcast_subject_placeholder")}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="msg-form-group">
            <label className="msg-label">{t("messages.broadcast_content")}</label>
            <div className="msg-editor-wrapper">
              <SunEditor
                setContents={content}
                onChange={setContent}
                setOptions={{
                  height: 280,
                  buttonList: [
                    ["undo", "redo"],
                    ["bold", "italic", "underline"],
                    ["fontSize", "formatBlock"],
                    ["align", "list"],
                    ["link"],
                    ["codeView"],
                  ],
                }}
              />
            </div>
          </div>

          <div>
            <button className="msg-btn msg-btn--primary" onClick={handleBroadcast}>
              <Icon.Send />
              {t("messages.send")}
            </button>
          </div>
        </div>
      </div>

      {/* ═════════════════════ BROADCAST LOGS ═════════════════════ */}
      <div className="msg-card">
        <div className="msg-card-header">
          <div className="msg-card-header-left">
            <span className="msg-card-header-icon msg-card-header-icon--dark">
              <Icon.Logs />
            </span>
            <h2 className="msg-card-title">{t("messages.logs")}</h2>
          </div>
          <span className="msg-count-badge">{broadcastLogs.length}</span>
        </div>

        <div className="msg-table-wrapper">
          <table className="msg-table">
            <thead>
              <tr>
                <th>{t("messages.date")}</th>
                <th>{t("messages.subject")}</th>
                <th>{t("messages.recipients_count")}</th>
                <th>{t("messages.recipients_list")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log) => (
                <tr key={log.id}>
                  <td className="msg-table-date">{formatDateTime(log.created_at, i18n.language)}</td>
                  <td className="msg-table-subject">{log.subject}</td>
                  <td style={{ textAlign: "center" }}>
                    <span className="msg-count-badge">{log.recipients_count}</span>
                  </td>
                  <td className="msg-table-recipients">
                    {log.recipients_list.length > 100
                      ? log.recipients_list.slice(0, 100) + "…"
                      : log.recipients_list}
                  </td>
                </tr>
              ))}

              {broadcastLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="msg-table-empty">{t("messages.no_logs")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={logsPage}
          totalPages={totalPages(broadcastLogs.length)}
          onPageChange={setLogsPage}
          i18nLang={i18n.language}
          t={t}
        />
      </div>
    </div>
  );
}
