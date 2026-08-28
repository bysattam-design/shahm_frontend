// src/pages/dashboard/appointment/AppointmentSlots.jsx
import React, { useEffect, useState } from "react";
import { formatDate, formatMonth } from "../../../utils/format";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Deletebtn from "../../../components/common/dashboard/Deletebtn";
import {
  getAdminSlots,
  generateSlots,
  updateSlot,
  deleteSlot,
  getAdminAppointmentSettings,
} from "../../../api/appointmentsApi";
import usePagination from "../../../hooks/usePagination";
import Pagination from "../../../components/common/dashboard/Pagination";

/* ── Icons ──────────────────────────────────────────────────── */
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
const IcoGenerate = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
    <path d="M9 1.5a7.5 7.5 0 100 15 7.5 7.5 0 000-15zm.75 8.25H12v1.5H9.75v2.25h-1.5V11.25H6v-1.5h2.25V7.5h1.5v2.25z" fill="currentColor" />
  </svg>
);
const IcoToggle = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="5" width="14" height="6" rx="3" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="11" cy="8" r="2" fill="currentColor" />
  </svg>
);
const IcoSun = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const IcoMoon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <path d="M17.5 12.5A7.5 7.5 0 017.5 2.5a7.5 7.5 0 000 15 7.5 7.5 0 0010-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IcoFilter = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
    <path d="M7 13h4v-2H7v2zM2 3v2h14V3H2zm2 6h10V7H4v2z" fill="currentColor" />
  </svg>
);
const IcoSpinner = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="appt-spin">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.8"
      strokeDasharray="28" strokeDashoffset="8" strokeLinecap="round" />
  </svg>
);


export default function AppointmentSlots() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [viewMode, setViewMode] = useState("calendar");
  const [slots, setSlots] = useState([]);
  const [settings, setSettings] = useState({ slot_duration: 60 });
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [generator, setGenerator] = useState({
    date: "", morning_start: "", morning_end: "", evening_start: "", evening_end: "",
  });
  const [filters, setFilters] = useState({
    dateFrom: "", dateTo: "", shift: "all", status: "all",
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps -- local loader is intentionally mount-only.
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [slotsRes, settingsRes] = await Promise.all([
        getAdminSlots(),
        getAdminAppointmentSettings(),
      ]);
      setSlots(slotsRes.data || []);
      setSettings(settingsRes.data || {});
    } catch { toast.error(t("cms.appointments.error.load_failed")); }
    finally { setLoading(false); }
  };

  /* ── Generator ── */
  const generateShift = async (start, end) => {
    if (!generator.date || !start || !end) return;
    await generateSlots({
      date: generator.date,
      start_time: start,
      end_time: end,
      duration: Number(settings.slot_duration || 60),
    });
  };

  const generateDaySlots = async () => {
    if (!generator.date) { toast.error(t("cms.appointments.slots.error.select_date")); return; }
    setGenerating(true);
    try {
      if (generator.morning_start && generator.morning_end)
        await generateShift(generator.morning_start, generator.morning_end);
      if (generator.evening_start && generator.evening_end)
        await generateShift(generator.evening_start, generator.evening_end);
      toast.success(t("cms.appointments.slots.success.generated"));
      loadData();
    } catch { toast.error(t("cms.appointments.slots.error.generation_failed")); }
    finally { setGenerating(false); }
  };

  /* ── Toggle availability ── */
  const toggleSlot = async (slot) => {
    try {
      const res = await updateSlot(slot.id, { is_available: !slot.is_available });
      setSlots(slots.map((s) => (s.id === slot.id ? res.data : s)));
      toast.success(t("cms.appointments.slots.success.toggled"));
    } catch { toast.error(t("cms.appointments.error.update_failed")); }
  };

  /* ── Delete with useSweetAlert ── */
  const handleDeleteSlot = async (id) => {
    try {
      await deleteSlot(id);
      setSlots(slots.filter((s) => s.id !== id));
      toast.success(t("cms.appointments.slots.success.deleted"));
    } catch { toast.error(t("cms.appointments.slots.error.delete_failed")); }
  };

  /* ── Filtering ── */
  const filteredSlots = slots.filter((slot) => {
    if (filters.dateFrom && slot.date < filters.dateFrom) return false;
    if (filters.dateTo && slot.date > filters.dateTo) return false;
    if (filters.shift !== "all" && slot.shift !== filters.shift) return false;
    if (filters.status === "available" && !slot.is_available) return false;
    if (filters.status === "disabled" && slot.is_available) return false;
    return true;
  });

  const { currentPage, totalPages, paginatedData, goToPage } = usePagination(filteredSlots, 15);

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /* ── Calendar helpers ── */
const getSlotsForDate = (date) => {
  const dateStr = formatLocalDate(date);

  return slots.filter(
    (s) => s.date === dateStr
  );
};

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
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

  if (loading) return (
    <div className="appt-loading"><IcoSpinner /><span>{t("cms.appointments.loading")}</span></div>
  );

  return (
    <div className="appt-section-content">

      {/* ── Section header ── */}
      <div className="appt-section-header">
        <span className="appt-section-icon appt-section-icon--teal"><IcoCalendar /></span>
        <div>
          <h2 className="appt-section-title">{t("cms.appointments.slots.title")}</h2>
          <p className="appt-section-subtitle">{t("cms.appointments.slots.subtitle")}</p>
        </div>
      </div>

      {/* ── VIEW TOGGLE ── */}
      <div className="appt-view-toggle">
        <button
          className={`appt-view-btn${viewMode === "calendar" ? " appt-view-btn--active" : ""}`}
          onClick={() => setViewMode("calendar")} type="button">
          <IcoCalendar />
          {t("cms.appointments.view.calendar")}
        </button>
        <button
          className={`appt-view-btn${viewMode === "list" ? " appt-view-btn--active" : ""}`}
          onClick={() => setViewMode("list")} type="button">
          <IcoList />
          {t("cms.appointments.view.list")}
        </button>
      </div>

      {/* ── GENERATOR CARD ── */}
      <div className="appt-card">
        <div className="appt-card-header">
          <span className="appt-card-icon appt-card-icon--green"><IcoGenerate /></span>
          <h3 className="appt-card-title">{t("cms.appointments.slots.generator_title")}</h3>
        </div>
        <div className="appt-form">
          <div className="appt-form-row appt-form-row--1col">
            <div className="appt-form-group">
              <label className="appt-label">{t("cms.appointments.slots.select_date")}</label>
              <input type="date" className="appt-input"
                value={generator.date}
                onChange={(e) => setGenerator({ ...generator, date: e.target.value })} />
            </div>
          </div>

          {/* Morning shift */}
          <div className="appt-shift-block">
            <div className="appt-shift-heading">
              <IcoSun />
              <span>{t("cms.appointments.slots.morning_shift")}</span>
            </div>
            <div className="appt-form-row appt-form-row--2col">
              <div className="appt-form-group">
                <label className="appt-label">{t("cms.appointments.slots.start_time")}</label>
                <input type="time" className="appt-input"
                  value={generator.morning_start}
                  onChange={(e) => setGenerator({ ...generator, morning_start: e.target.value })} />
              </div>
              <div className="appt-form-group">
                <label className="appt-label">{t("cms.appointments.slots.end_time")}</label>
                <input type="time" className="appt-input"
                  value={generator.morning_end}
                  onChange={(e) => setGenerator({ ...generator, morning_end: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Evening shift */}
          <div className="appt-shift-block">
            <div className="appt-shift-heading">
              <IcoMoon />
              <span>{t("cms.appointments.slots.evening_shift")}</span>
            </div>
            <div className="appt-form-row appt-form-row--2col">
              <div className="appt-form-group">
                <label className="appt-label">{t("cms.appointments.slots.start_time")}</label>
                <input type="time" className="appt-input"
                  value={generator.evening_start}
                  onChange={(e) => setGenerator({ ...generator, evening_start: e.target.value })} />
              </div>
              <div className="appt-form-group">
                <label className="appt-label">{t("cms.appointments.slots.end_time")}</label>
                <input type="time" className="appt-input"
                  value={generator.evening_end}
                  onChange={(e) => setGenerator({ ...generator, evening_end: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="appt-form-actions">
            <button className="appt-btn appt-btn--primary" onClick={generateDaySlots} disabled={generating}>
              {generating ? <IcoSpinner /> : <IcoGenerate />}
              {generating ? t("cms.appointments.slots.generating") : t("cms.appointments.slots.generate_button")}
            </button>
          </div>
        </div>
      </div>

      {/* ── FILTERS (list mode only) ── */}
      {viewMode === "list" && (
        <div className="appt-card">
          <div className="appt-card-header">
            <span className="appt-card-icon appt-card-icon--amber"><IcoFilter /></span>
            <h3 className="appt-card-title">{t("cms.appointments.slots.filters_title")}</h3>
          </div>
          <div className="appt-form">
            <div className="appt-form-row appt-form-row--4col">
              <div className="appt-form-group">
                <label className="appt-label">{t("cms.appointments.slots.filter_date_from")}</label>
                <input type="date" className="appt-input"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
              </div>
              <div className="appt-form-group">
                <label className="appt-label">{t("cms.appointments.slots.filter_date_to")}</label>
                <input type="date" className="appt-input"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
              </div>
              <div className="appt-form-group">
                <label className="appt-label">{t("cms.appointments.slots.filter_shift")}</label>
                <select className="appt-input appt-select"
                  value={filters.shift}
                  onChange={(e) => setFilters({ ...filters, shift: e.target.value })}>
                  <option value="all">{t("cms.appointments.slots.shift_all")}</option>
                  <option value="morning">{t("cms.appointments.slots.shift_morning")}</option>
                  <option value="evening">{t("cms.appointments.slots.shift_evening")}</option>
                </select>
              </div>
              <div className="appt-form-group">
                <label className="appt-label">{t("cms.appointments.slots.filter_status")}</label>
                <select className="appt-input appt-select"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                  <option value="all">{t("cms.appointments.slots.status_all")}</option>
                  <option value="available">{t("cms.appointments.slots.status_available")}</option>
                  <option value="disabled">{t("cms.appointments.slots.status_disabled")}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CALENDAR VIEW ── */}
      {viewMode === "calendar" && (
        <div className="appt-card appt-card--calendar">
          {/* Month nav */}
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

          {/* Weekday headers */}
          <div className="appt-cal-weekdays">
            {["sat","sun","mon","tue","wed","thu","fri"].map((d) => (
              <div key={d} className="appt-cal-weekday">{t(`cms.appointments.calendar.${d}`)}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="appt-cal-days">
            {getDaysInMonth(currentMonth).map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} className="appt-cal-day-empty" />;
              const daySlots = getSlotsForDate(day);
              const isToday = day.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
              return (
                <div key={idx}
                  className={`appt-cal-day${isToday ? " appt-cal-day--today" : ""}${isSelected ? " appt-cal-day--selected" : ""}${daySlots.length > 0 ? " appt-cal-day--has-data" : ""}`}
                  onClick={() => setSelectedDate(day)}>
                  <div className="appt-cal-day-num">{day.getDate()}</div>
                  {daySlots.length > 0 && (
                    <div className="appt-cal-day-badge">{daySlots.length} {t("cms.appointments.slots.slots")}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected date slots */}
          {selectedDate && (
            <div className="appt-selected-day">
              <h4 className="appt-selected-day-title">
                {t("cms.appointments.slots.slots_for")}{" "}
                {formatDate(selectedDate, isRtl ? "ar" : "en")}
              </h4>
              {getSlotsForDate(selectedDate).length === 0 ? (
                <p className="appt-empty-hint">{t("cms.appointments.slots.no_slots_day")}</p>
              ) : (
                <div className="appt-slot-cards">
                  {getSlotsForDate(selectedDate).map((slot) => (
                    <div key={slot.id} className="appt-slot-card">
                      <div className="appt-slot-card-top">
                        <span className="appt-slot-time">{slot.start_time} – {slot.end_time}</span>
                        <span className={`appt-badge${slot.is_available ? " appt-badge--available" : " appt-badge--disabled"}`}>
                          <span className="appt-badge-dot" />
                          {slot.is_available ? t("cms.appointments.slots.status_available") : t("cms.appointments.slots.status_disabled")}
                        </span>
                      </div>
                      <div className="appt-slot-card-actions">
                        <button className={`appt-btn appt-btn--sm${slot.is_available ? " appt-btn--amber" : " appt-btn--green"}`}
                          onClick={() => toggleSlot(slot)} type="button">
                          <IcoToggle />
                          {slot.is_available ? t("cms.appointments.actions.disable") : t("cms.appointments.actions.enable")}
                        </button>
                        <Deletebtn
                          onConfirm={() => handleDeleteSlot(slot.id)}
                          className="appt-btn appt-btn--sm appt-btn--danger"
                          iconOnly={false}
                          label={t("cms.appointments.actions.delete")}
                        />
                      </div>
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
            <span className="appt-card-icon appt-card-icon--teal"><IcoList /></span>
            <h3 className="appt-card-title">{t("cms.appointments.slots.list_title")}</h3>
            <span className="appt-count-badge" style={{ marginInlineStart: "auto" }}>{filteredSlots.length}</span>
          </div>

          {filteredSlots.length === 0 ? (
            <div className="appt-empty">
              <IcoCalendar />
              <p>{t("cms.appointments.slots.empty")}</p>
            </div>
          ) : (
            <div className="appt-table-wrapper">
              <table className="appt-table">
                <thead>
                  <tr>
                    <th>{t("cms.appointments.table.date")}</th>
                    <th>{t("cms.appointments.table.shift")}</th>
                    <th>{t("cms.appointments.table.start_time")}</th>
                    <th>{t("cms.appointments.table.end_time")}</th>
                    <th>{t("cms.appointments.table.status")}</th>
                    <th>{t("cms.appointments.table.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((slot) => (
                    <tr key={slot.id} className="appt-table-row">
                      <td>{slot.date}</td>
                      <td>{slot.shift === "morning" ? t("cms.appointments.slots.shift_morning") : t("cms.appointments.slots.shift_evening")}</td>
                      <td>{slot.start_time}</td>
                      <td>{slot.end_time}</td>
                      <td>
                        <span className={`appt-badge${slot.is_available ? " appt-badge--available" : " appt-badge--disabled"}`}>
                          <span className="appt-badge-dot" />
                          {slot.is_available ? t("cms.appointments.slots.status_available") : t("cms.appointments.slots.status_disabled")}
                        </span>
                      </td>
                      <td>
                        <div className="appt-actions-cell">
                          <button className={`appt-btn appt-btn--sm${slot.is_available ? " appt-btn--amber" : " appt-btn--green"}`}
                            onClick={() => toggleSlot(slot)} type="button">
                            <IcoToggle />
                            {slot.is_available ? t("cms.appointments.actions.disable") : t("cms.appointments.actions.enable")}
                          </button>
                          <Deletebtn
                            onConfirm={() => handleDeleteSlot(slot.id)}
                            className="appt-btn appt-btn--sm appt-btn--danger"
                            iconOnly={false}
                            label={t("cms.appointments.actions.delete")}
                          />
                        </div>
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
    </div>
  );
}
