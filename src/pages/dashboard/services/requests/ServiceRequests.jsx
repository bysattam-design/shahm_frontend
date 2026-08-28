// src/pages/dashboard/services/requests/ServiceRequests.jsx
import React, { useEffect, useState, useCallback } from "react";
import { formatDate } from "../../../../utils/format";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Openbtn from "../../../../components/common/dashboard/Openbtn";
import Deletebtn from "../../../../components/common/dashboard/Deletebtn";
import {
  getServiceRequests,
  deleteServiceRequest,
  getServiceAdvisoryRequest,
} from "../../../../api/servicesApi";
import {
  SvcContentHeader,
  SvcCardHeader,
  SvcEmpty,
  SvcLoading,
  SvcCountBadge,
  IconSearch,
} from "../_shared";
import RequestDetailsModal from "./components/RequestDetailsModal";
import "./ServiceRequests.css";
import Pagination from "../../../../components/common/dashboard/Pagination";

// ─── Local icons ──────────────────────────────────────────────
const IconRequests = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="2" y="3" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
    <path d="M2 7l7 4 7-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);
const IconX = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <path d="M10 2L2 10M2 2l8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const IconRefresh = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <path d="M12 7A5 5 0 112 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M12 3v4h-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Status config ────────────────────────────────────────────
const STATUS_CONFIG = {
  new: { color: "#3B82F6", bg: "rgba(59,130,246,0.09)", border: "rgba(59,130,246,0.25)" },
  reviewing: { color: "#8B5CF6", bg: "rgba(139,92,246,0.09)", border: "rgba(139,92,246,0.25)" },
  awaiting_client: { color: "#F59E0B", bg: "rgba(245,158,11,0.09)", border: "rgba(245,158,11,0.25)" },
  client_updated: { color: "#14B8A6", bg: "rgba(20,184,166,0.09)", border: "rgba(20,184,166,0.25)" },
  contracting: { color: "#6366F1", bg: "rgba(99,102,241,0.09)", border: "rgba(99,102,241,0.25)" },
  closed: { color: "#10B981", bg: "rgba(16,185,129,0.09)", border: "rgba(16,185,129,0.25)" },
  cancelled: { color: "#EF4444", bg: "rgba(239,68,68,0.09)", border: "rgba(239,68,68,0.25)" },
};

function StatusBadge({ status, t }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return (
    <span
      className="cms-services-status-badge cms-services-status-badge--request"
      style={{ "--status-color": cfg.color, "--status-bg": cfg.bg, "--status-border": cfg.border }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, flexShrink: 0, display: "inline-block" }} />
      {t(`cms.requestservices.status.${status}`, status)}
    </span>
  );
}

// ─── Resolve full name ────────────────────────────────────────
function resolveFullName(req) {
  const first = req?.first_name || req?.snapshot?.first_name?.value || "";
  const last = req?.last_name || req?.snapshot?.last_name?.value || "";
  const combined = `${first} ${last}`.trim();
  if (combined) return combined;
  return req?.full_name || req?.name || "—";
}
function avatarLetter(req) {
  return resolveFullName(req)[0]?.toUpperCase() || "?";
}

// ─── Main ─────────────────────────────────────────────────────
export default function ServiceRequests() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState({});

  const PAGE_SIZE = 15;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        page_size: PAGE_SIZE,
      };

      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await getServiceRequests(params);

      const data = res.data;

      setRequests(data?.results ?? []);
      const total = data?.count || 0;

setTotalCount(total);
setStatusCounts(data?.status_counts || {});

setTotalPages(
  Math.ceil(total / PAGE_SIZE)
);
    } catch {
      setError(t("cms.requestservices.error.load_failed"));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, currentPage, t]);

  useEffect(() => { load(); }, [load]);

  const openModal = (req) => setSelected(req);
  const closeModal = () => setSelected(null);

  const handleDelete = async (id) => {
    // Deletebtn handles its own confirm — this is just the confirmed action
    try {
      await deleteServiceRequest(id);
      toast.success(t("cms.requestservices.success.deleted"));
      setRequests((prev) => prev.filter((r) => r.id !== id));
      if (selected?.id === id) closeModal();
    } catch {
      toast.error(t("cms.requestservices.error.delete_failed"));
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: newStatus } : r));
    setSelected((prev) => prev ? { ...prev, status: newStatus } : prev);
  };

  const handleRequestUpdated = async (requestId) => {
    try {
      const res = await getServiceAdvisoryRequest(requestId);
      const fresh = res.data;
      setRequests((prev) => prev.map((r) => r.id === requestId ? fresh : r));
      setSelected(fresh);
    } catch (err) { console.error(err); }
  };

  const fmtDate = (d) =>
    d ? formatDate(d, isRtl ? "ar" : "en") : "—";

  return (
    <div className="cms-services-content" dir={isRtl ? "rtl" : "ltr"}>

      {/* ── Page header ── */}
      <SvcContentHeader
        icon={<IconRequests />}
        title={t("cms.requestservices.title")}
        subtitle={t("cms.requestservices.subtitle")}
      />

      {/* ── Stats row ── */}
      <div className="cms-services-requests-stats-row">
        <div className="cms-services-requests-stat-pill">
<span className="cms-services-requests-stat-value">
  {totalCount}
</span>
          <span className="cms-services-requests-stat-label">{t("cms.requestservices.total")}</span>
        </div>
        {["new", "reviewing", "awaiting_client"].map((s) => (
          <div key={s} className="cms-services-requests-stat-pill">
            <span className="cms-services-requests-stat-value" style={{ color: STATUS_CONFIG[s].color }}>
              {statusCounts[s] ?? 0}
            </span>
            <span className="cms-services-requests-stat-label">{t(`cms.requestservices.status.${s}`)}</span>
          </div>
        ))}
      </div>

      {/* ── Main card ── */}
      <div className="cms-services-card">
        <SvcCardHeader
          icon={<IconRequests />}
          accent="blue"
          title={t("cms.requestservices.list_title")}
          right={<SvcCountBadge count={totalCount} />}
        />

        {/* Toolbar */}
        <div className="cms-services-filter-bar">
          <div className="cms-services-search-wrap">
            <IconSearch />
            <input
              className="cms-services-search-input"
              placeholder={t("cms.requestservices.search_placeholder")}
              value={search}
              onChange={(e) => {
  setCurrentPage(1);
  setSearch(e.target.value);
}}
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
            {search && (
              <button className="cms-services-search-clear" onClick={() => setSearch("")} type="button">
                <IconX />
              </button>
            )}
          </div>

          <select
            className="cms-services-select cms-services-select--sm"
            value={statusFilter}
            onChange={(e) => {
  setCurrentPage(1);
  setStatusFilter(e.target.value);
}}
          >
            <option value="">{t("cms.requestservices.filter_all")}</option>
            {Object.keys(STATUS_CONFIG).map((s) => (
              <option key={s} value={s}>{t(`cms.requestservices.status.${s}`)}</option>
            ))}
          </select>

          <button className="cms-services-btn cms-services-btn--ghost cms-services-btn--sm" onClick={load} type="button">
            <IconRefresh />
            {t("cms.requestservices.refresh")}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <SvcLoading />
        ) : error ? (
          <div className="cms-services-error-state">
            <p>{error}</p>
            <button className="cms-services-btn cms-services-btn--ghost cms-services-btn--sm" onClick={load} type="button">
              <IconRefresh />{t("cms.requestservices.retry")}
            </button>
          </div>
        ) : requests.length === 0 ? (
          <SvcEmpty
            message={
              statusFilter || search
                ? t("cms.requestservices.empty_filtered")
                : t("cms.requestservices.empty_default")
            }
          />
        ) : (
          <div className="cms-services-table-wrapper">
            <table className="cms-services-table">
              <thead>
                <tr>
                  <th>{t("cms.requestservices.table.ref")}</th>
                  <th>{t("cms.requestservices.table.name")}</th>
                  <th>{t("cms.requestservices.table.email")}</th>
                  <th>{t("cms.requestservices.table.phone")}</th>
                  <th>{t("cms.requestservices.table.services")}</th>
                  <th>{t("cms.requestservices.table.date")}</th>
                  <th>{t("cms.requestservices.table.status")}</th>
                  <th>{t("cms.requestservices.table.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="cms-services-table-row"
                    onClick={() => openModal(req)}
                  >
                    <td>
                      <span className="cms-services-code-chip">
                        {req.reference_code || req.reference || `#${req.id}`}
                      </span>
                    </td>

                    {/* Name: first_name + last_name */}
                    <td>
                      <div className="cms-services-requests-name-cell">
                        <div className="cms-services-requests-avatar">
                          {avatarLetter(req)}
                        </div>
                        <span className="cms-request-services-info-value">{resolveFullName(req)}</span>
                      </div>
                    </td>

                    <td><span className="cms-services-muted">{req.email || "—"}</span></td>
                    <td><span className="cms-services-muted" dir="ltr">{req.phone || "—"}</span></td>
                    <td>
                      <span className="cms-services-table-cell-sm">
                        {Array.isArray(req.services)
                          ? req.services.map((s) => isRtl ? (s.title_ar || s.title_en) : (s.title_en || s.title_ar)).join(", ")
                          : (req.services_display || "—")}
                      </span>
                    </td>
                    <td><span className="cms-services-muted">{fmtDate(req.created_at)}</span></td>
                    <td><StatusBadge status={req.status} t={t} /></td>

                    {/* Actions — stop row click */}
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="cms-services-actions-cell">
                        {/* Global Openbtn — icon-only, services table style */}
                        <Openbtn onClick={() => openModal(req)} />

                        {/* Global Deletebtn — SweetAlert built-in */}
                        <Deletebtn onConfirm={() => handleDelete(req.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

      </div>

      {/* ── Modal ── */}
      {selected && (
        <RequestDetailsModal
          request={selected}
          onClose={closeModal}
          onStatusChange={handleStatusChange}
          onRequestUpdated={handleRequestUpdated}
        />
      )}
    </div>
  );
}