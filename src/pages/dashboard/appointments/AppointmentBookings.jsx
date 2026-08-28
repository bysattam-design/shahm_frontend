// src/pages/dashboard/appointment/AppointmentBookings.jsx
import React, { useEffect, useState, useMemo } from "react";
import { formatDate, formatMonth } from "../../../utils/format";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Modal from "../../../components/common/dashboard/Modal";
import Openbtn from "../../../components/common/dashboard/Openbtn";
import { getAdminBookings, updateBookingStatus } from "../../../api/appointmentsApi";
import usePagination from "../../../hooks/usePagination";
import Pagination from "../../../components/common/dashboard/Pagination";

/* ── Icons ──────────────────────────────────────────────────── */
const IcoBookings = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <path d="M14 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2zM9 16H7v-2h2v2zm0-3H7v-2h2v2zm0-3H7V8h2v2zm4 6h-2v-2h2v2zm0-3h-2v-2h2v2zm0-3h-2V8h2v2z" fill="currentColor" />
  </svg>
);
const IcoCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <path d="M14 2h-1V1h-2v1H7V1H5v1H4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2h-2zm2 14H4V8h12v8zm0-10H4V4h1v1h2V4h4v1h2V4h1v2z" fill="currentColor" />
  </svg>
);
const IcoList = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M2 3h14v2H2V3zm0 4h14v2H2V7zm0 4h14v2H2v-2zm0 4h14v2H2v-2z" fill="currentColor" />
  </svg>
);
const IcoFilter = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
    <path d="M7 13h4v-2H7v2zM2 3v2h14V3H2zm2 6h10V7H4v2z" fill="currentColor" />
  </svg>
);
const IcoUser = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" />
    <path d="M2 14c0-2.2 2.7-4 6-4s6 1.8 6 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);
const IcoTime = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
    <path d="M8 5v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);
const IcoFile = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <path d="M8 1H3a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V5L8 1zm0 1.5L11.5 5H8V2.5z" fill="currentColor" />
  </svg>
);
const IcoSpinner = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="appt-spin">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.8"
      strokeDasharray="28" strokeDashoffset="8" strokeLinecap="round" />
  </svg>
);

/* ── Helpers ────────────────────────────────────────────────── */
const getFieldValue = (booking, key) => {
  const field = booking.dynamic_fields?.find(
    (f) =>
      f.key === key ||
      f.system_key === key
  );

  if (!field) {
    return "—";
  }

  return (
    field.display_value ??
    field.value ??
    "—"
  );
};

const formatFieldValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  if (
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    if (
      "country_code" in value ||
      "number" in value
    ) {
      return `${value.country_code || ""} ${value.number || ""}`;
    }

    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return String(value);
};

const renderFieldValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  if (
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    if (
      "country_code" in value ||
      "number" in value
    ) {
      return `${value.country_code || ""} ${value.number || ""}`;
    }

    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return String(value);
};

const getPrimaryDisplayName = (booking) => {
  const first = getFieldValue(booking, "first_name");
  const last = getFieldValue(booking, "last_name");
  const full = `${first} ${last}`.trim().replace(/^— —$/, "").replace(/^—$/, "");
  return full || booking.reference || `#${booking.id}`;
};

const STATUS_META = {
  pending: { color: "#F59E0B", bg: "rgba(245,158,11,0.09)", border: "rgba(245,158,11,0.25)" },
  confirmed: { color: "#22C55E", bg: "rgba(34,197,94,0.09)", border: "rgba(34,197,94,0.25)" },
  cancelled: { color: "#EF4444", bg: "rgba(239,68,68,0.09)", border: "rgba(239,68,68,0.25)" },
};

function StatusBadge({ status, t }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className="appt-status-badge"
      style={{ "--sb-color": m.color, "--sb-bg": m.bg, "--sb-border": m.border }}>
      <span className="appt-status-dot" />
      {t(`cms.appointments.bookings.status_${status}`, status)}
    </span>
  );
}

/* ── Main ───────────────────────────────────────────────────── */
export default function AppointmentBookings() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("calendar");
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [filters, setFilters] = useState({
    dateFrom: "", dateTo: "", status: "all", search: "",
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps -- local loader is intentionally mount-only.
  useEffect(() => { loadBookings(); }, []);

  const loadBookings = async () => {
    try {
      const res = await getAdminBookings();
      setBookings(res.data || []);
    } catch { toast.error(t("cms.appointments.error.load_failed")); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, { status: newStatus });
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: newStatus } : b));
      if (selectedBooking?.id === id)
        setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
      toast.success(t("cms.appointments.bookings.success.status_updated"));
    } catch { toast.error(t("cms.appointments.error.update_failed")); }
  };

  const filteredBookings = useMemo(() => bookings.filter((b) => {
    if (filters.dateFrom && b.slot_date < filters.dateFrom) return false;
    if (filters.dateTo && b.slot_date > filters.dateTo) return false;
    if (filters.status !== "all" && b.status !== filters.status) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!getPrimaryDisplayName(b).toLowerCase().includes(q) &&
        !String(getFieldValue(b, "email")).toLowerCase().includes(q)) return false;
    }
    return true;
  }), [bookings, filters]);

  const { currentPage, totalPages, paginatedData, goToPage } = usePagination(filteredBookings, 15);

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /* ── Calendar helpers ── */
  const getBookingsForDate = (date) => {
    const ds = formatLocalDate(date);

    return bookings.filter(
      (b) => b.slot_date === ds
    );
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear(), month = date.getMonth();
    const firstDay = (new Date(year, month, 1).getDay() + 1) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const navigateMonth = (dir) => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + dir);
    setCurrentMonth(d);
  };

  /* ── Modal subtitle ── */
  const modalSubtitle = selectedBooking ? (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <StatusBadge status={selectedBooking.status} t={t} />
      <span style={{ fontSize: 12, color: "#97A5A5", fontFamily: "Noto Kufi Arabic,sans-serif" }}>
        {selectedBooking.slot_date} · {selectedBooking.slot_start} – {selectedBooking.slot_end}
      </span>
    </div>
  ) : null;

  /* ── Modal footer ── */
  const modalFooter = selectedBooking ? (
    <button className="appt-btn appt-btn--ghost" onClick={() => setSelectedBooking(null)} type="button">
      {t("cms.appointments.actions.close")}
    </button>
  ) : null;

  if (loading) return (
    <div className="appt-loading"><IcoSpinner /><span>{t("cms.appointments.loading")}</span></div>
  );

  return (
    <div className="appt-section-content">

      {/* ── Section header ── */}
      <div className="appt-section-header">
        <span className="appt-section-icon appt-section-icon--purple"><IcoBookings /></span>
        <div>
          <h2 className="appt-section-title">{t("cms.appointments.bookings.title")}</h2>
          <p className="appt-section-subtitle">{t("cms.appointments.bookings.subtitle")}</p>
        </div>
      </div>

      {/* ── VIEW TOGGLE ── */}
      <div className="appt-view-toggle">
        <button className={`appt-view-btn${viewMode === "calendar" ? " appt-view-btn--active" : ""}`}
          onClick={() => setViewMode("calendar")} type="button">
          <IcoCalendar />{t("cms.appointments.view.calendar")}
        </button>
        <button className={`appt-view-btn${viewMode === "list" ? " appt-view-btn--active" : ""}`}
          onClick={() => setViewMode("list")} type="button">
          <IcoList />{t("cms.appointments.view.list")}
        </button>
      </div>

      {/* ── FILTERS (list mode) ── */}
      {viewMode === "list" && (
        <div className="appt-card">
          <div className="appt-card-header">
            <span className="appt-card-icon appt-card-icon--amber"><IcoFilter /></span>
            <h3 className="appt-card-title">{t("cms.appointments.bookings.filters_title")}</h3>
          </div>
          <div className="appt-form">
            <div className="appt-form-row appt-form-row--4col">
              <div className="appt-form-group">
                <label className="appt-label">{t("cms.appointments.bookings.filter_search")}</label>
                <input type="text" className="appt-input"
                  placeholder={t("cms.appointments.bookings.placeholder_search")}
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
              </div>
              <div className="appt-form-group">
                <label className="appt-label">{t("cms.appointments.bookings.filter_date_from")}</label>
                <input type="date" className="appt-input"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
              </div>
              <div className="appt-form-group">
                <label className="appt-label">{t("cms.appointments.bookings.filter_date_to")}</label>
                <input type="date" className="appt-input"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
              </div>
              <div className="appt-form-group">
                <label className="appt-label">{t("cms.appointments.bookings.filter_status")}</label>
                <select className="appt-input appt-select"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                  <option value="all">{t("cms.appointments.bookings.status_all")}</option>
                  <option value="pending">{t("cms.appointments.bookings.status_pending")}</option>
                  <option value="confirmed">{t("cms.appointments.bookings.status_confirmed")}</option>
                  <option value="cancelled">{t("cms.appointments.bookings.status_cancelled")}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CALENDAR VIEW ── */}
      {viewMode === "calendar" && (
        <div className="appt-card appt-card--calendar">
          <div className="appt-cal-nav">
            <button className="appt-cal-nav-btn" onClick={() => navigateMonth(-1)} type="button">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                {isRtl
                  ? <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  : <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
              </svg>
            </button>
            <h3 className="appt-cal-month">
              {formatMonth(currentMonth, isRtl ? "ar" : "en")}
            </h3>
            <button className="appt-cal-nav-btn" onClick={() => navigateMonth(1)} type="button">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                {isRtl
                  ? <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  : <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
              </svg>
            </button>
          </div>
          <div className="appt-cal-weekdays">
            {["sat", "sun", "mon", "tue", "wed", "thu", "fri"].map((d) => (
              <div key={d} className="appt-cal-weekday">{t(`cms.appointments.calendar.${d}`)}</div>
            ))}
          </div>
          <div className="appt-cal-days">
            {getDaysInMonth(currentMonth).map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} className="appt-cal-day-empty" />;
              const dayBookings = getBookingsForDate(day);
              const isToday = day.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
              return (
                <div key={idx}
                  className={`appt-cal-day${isToday ? " appt-cal-day--today" : ""}${isSelected ? " appt-cal-day--selected" : ""}${dayBookings.length > 0 ? " appt-cal-day--has-data" : ""}`}
                  onClick={() => setSelectedDate(day)}>
                  <div className="appt-cal-day-num">{day.getDate()}</div>
                  {dayBookings.length > 0 && (
                    <div className="appt-cal-day-badge">{dayBookings.length} {t("cms.appointments.bookings.bookings")}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected date bookings */}
          {selectedDate && (
            <div className="appt-selected-day">
              <h4 className="appt-selected-day-title">
                {t("cms.appointments.bookings.bookings_for")}{" "}
                {formatDate(selectedDate, isRtl ? "ar" : "en")}
              </h4>
              {getBookingsForDate(selectedDate).length === 0 ? (
                <p className="appt-empty-hint">{t("cms.appointments.bookings.no_bookings_day")}</p>
              ) : (
                <div className="appt-booking-cards">
                  {getBookingsForDate(selectedDate).map((b) => (
                    <div key={b.id} className="appt-booking-card">
                      <div className="appt-booking-card-top">
                        <div className="appt-booking-card-name">
                          <IcoUser />
                          <span>{getPrimaryDisplayName(b)}</span>
                        </div>
                        <StatusBadge status={b.status} t={t} />
                      </div>
                      <div className="appt-booking-card-meta">
                        <IcoTime />
                        <span>{b.slot_label || `${b.slot_start} – ${b.slot_end}`}</span>
                      </div>
                      <Openbtn
                        onClick={() => setSelectedBooking(b)}
                        className="appt-btn appt-btn--sm appt-btn--view"
                        iconOnly={false}
                        label={t("cms.appointments.actions.view_details")}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {viewMode === "list" && (
        <div className="appt-card">
          <div className="appt-card-header">
            <span className="appt-card-icon appt-card-icon--purple"><IcoList /></span>
            <h3 className="appt-card-title">{t("cms.appointments.bookings.list_title")}</h3>
            <span className="appt-count-badge" style={{ marginInlineStart: "auto" }}>{filteredBookings.length}</span>
          </div>
          {filteredBookings.length === 0 ? (
            <div className="appt-empty"><IcoBookings /><p>{t("cms.appointments.bookings.empty")}</p></div>
          ) : (
            <div className="appt-table-wrapper">
              <table className="appt-table">
                <thead>
                  <tr>
                    <th>{t("cms.appointments.table.name")}</th>
                    <th>{t("cms.appointments.table.date")}</th>
                    <th>{t("cms.appointments.table.time")}</th>
                    <th>{t("cms.appointments.table.phone")}</th>
                    <th>{t("cms.appointments.table.email")}</th>
                    <th>{t("cms.appointments.table.status")}</th>
                    <th>{t("cms.appointments.table.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((b) => (
                    <tr key={b.id} className="appt-table-row">
                      <td className="appt-table-name">{getPrimaryDisplayName(b)}</td>
                      <td>{b.slot_date}</td>
                      <td>{b.slot_label || `${b.slot_start} – ${b.slot_end}`}</td>
                      <td>
                        {formatFieldValue(
                          getFieldValue(b, "phone")
                        )}
                      </td>
                      <td>{getFieldValue(b, "email")}</td>
                      <td>
                        <select className="appt-status-select"
                          value={b.status}
                          style={{ "--sb-color": (STATUS_META[b.status] || STATUS_META.pending).color }}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}>
                          <option value="pending">{t("cms.appointments.bookings.status_pending")}</option>
                          <option value="confirmed">{t("cms.appointments.bookings.status_confirmed")}</option>
                          <option value="cancelled">{t("cms.appointments.bookings.status_cancelled")}</option>
                        </select>
                      </td>
                      <td>
                        <Openbtn
                          onClick={() => setSelectedBooking(b)}
                          className="appt-btn appt-btn--sm appt-btn--view"
                          iconOnly={false}
                          label={t("cms.appointments.actions.view")}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
            </div>
          )}
        </div>
      )}

      {/* ── BOOKING DETAILS MODAL ── */}
      <Modal
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title={selectedBooking ? `${t("cms.appointments.bookings.modal.title")} #${selectedBooking.id}` : ""}
        subtitle={modalSubtitle}
        footer={modalFooter}
        dir={isRtl ? "rtl" : "ltr"}
        width={640}
      >
        {selectedBooking && (
          <div className="appt-booking-modal-body">

            {/* Dynamic fields */}
            <div className="appt-modal-section">
              <h4 className="appt-modal-section-title">{t("cms.appointments.bookings.modal.details")}</h4>
              <div className="appt-modal-grid">
                {selectedBooking.dynamic_fields?.map((field) => {
                  const label = i18n.language === "ar" ? field.label_ar : field.label_en;
                  const value =
                    field.display_value ??
                    field.value;
                  const isFile = typeof value === "string" && (value.includes("/media/") || value.includes("http"));
                  return (
                    <div key={field.key} className="appt-modal-field">
                      <span className="appt-modal-field-label">{label}</span>
                      {isFile ? (
                        <a href={value} target="_blank" rel="noreferrer" className="appt-file-link">
                          <IcoFile />
                          {t("cms.appointments.bookings.modal.open_file")}
                        </a>
                      ) : (
                        <span className="appt-modal-field-value">
                          {renderFieldValue(value)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Appointment details */}
            <div className="appt-modal-section">
              <h4 className="appt-modal-section-title">{t("cms.appointments.bookings.modal.appointment_details")}</h4>
              <div className="appt-modal-grid">
                <div className="appt-modal-field">
                  <span className="appt-modal-field-label">{t("cms.appointments.bookings.modal.date")}</span>
                  <span className="appt-modal-field-value">{selectedBooking.slot_date}</span>
                </div>
                <div className="appt-modal-field">
                  <span className="appt-modal-field-label">{t("cms.appointments.bookings.modal.time")}</span>
                  <span className="appt-modal-field-value">{selectedBooking.slot_start} – {selectedBooking.slot_end}</span>
                </div>
                <div className="appt-modal-field">
                  <span className="appt-modal-field-label">{t("cms.appointments.bookings.modal.status")}</span>
                  <select className="appt-status-select"
                    value={selectedBooking.status}
                    style={{ "--sb-color": (STATUS_META[selectedBooking.status] || STATUS_META.pending).color }}
                    onChange={(e) => handleStatusChange(selectedBooking.id, e.target.value)}>
                    <option value="pending">{t("cms.appointments.bookings.status_pending")}</option>
                    <option value="confirmed">{t("cms.appointments.bookings.status_confirmed")}</option>
                    <option value="cancelled">{t("cms.appointments.bookings.status_cancelled")}</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
}
