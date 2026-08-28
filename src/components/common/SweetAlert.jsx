// src/components/SweetAlert.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";

import useFocusTrap from "../../hooks/useFocusTrap";
import "../../styles/common/SweetAlert.css";

/* ─── Icon components ─────────────────────────────── */
const SuccessIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path
      d="M5.5 14.5L11 20L22.5 8"
      stroke="#22c55e"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path
      d="M8 8L20 20M20 8L8 20"
      stroke="#ef4444"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

const WarnIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path
      d="M14 10V15M14 19.5V20"
      stroke="#f59e0b"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M12.1 4.9L2.5 21.5C2.1 22.2 2.6 23 3.4 23H24.6C25.4 23 25.9 22.2 25.5 21.5L15.9 4.9C15.5 4.2 14.5 4.2 14.1 4.9H12.1Z"
      stroke="#f59e0b"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InfoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="10" stroke="#3b82f6" strokeWidth="2" />
    <path
      d="M14 12.5V20M14 9V9.5"
      stroke="#3b82f6"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M13 1L1 13M1 1l12 12"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

/* ─── Icon map ────────────────────────────────────── */
const ICON_MAP = {
  success: { component: <SuccessIcon />, wrapClass: "sweet-alert-icon-wrap--success" },
  error:   { component: <ErrorIcon />,   wrapClass: "sweet-alert-icon-wrap--error" },
  confirm: { component: <WarnIcon />,    wrapClass: "sweet-alert-icon-wrap--confirm" },
  warning: { component: <WarnIcon />,    wrapClass: "sweet-alert-icon-wrap--confirm" },
  info:    { component: <InfoIcon />,    wrapClass: "sweet-alert-icon-wrap--info" },
};

/* ─── Button variant map ──────────────────────────── */
const CONFIRM_VARIANT = {
  success: "sweet-alert-btn--success",
  error:   "sweet-alert-btn--danger",
  confirm: "sweet-alert-btn--danger",
  warning: "sweet-alert-btn--danger",
  info:    "sweet-alert-btn--confirm",
};

/**
 * SweetAlert — reusable glassy CMS alert component
 *
 * Props:
 *  open           {boolean}   — whether the alert is visible
 *  type           {string}    — "success" | "error" | "confirm" | "warning" | "info"
 *  title          {string}    — dialog title
 *  message        {string}    — body text
 *  confirmText    {string}    — confirm button label  (default "Confirm")
 *  cancelText     {string}    — cancel button label   (default "Cancel")
 *  showCancel     {boolean}   — show cancel button    (default false)
 *  onConfirm      {function}  — called on confirm click
 *  onCancel       {function}  — called on cancel / close
 *  isRtl          {boolean}   — flip button order for RTL
 */
export default function SweetAlert({
  open,
  type = "info",
  title = "",
  message = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  showCancel = false,
  onConfirm,
  onCancel,
  isRtl = false,
}) {
  const [exiting, setExiting] = useState(false);
  const overlayRef = useRef(null);

  /* ── close with exit animation ── */
  const handleClose = useCallback(
    (confirmed = false) => {
      setExiting(true);
      setTimeout(() => {
        setExiting(false);
        if (confirmed && onConfirm) onConfirm();
        else if (!confirmed && onCancel) onCancel();
      }, 200);
    },
    [onConfirm, onCancel]
  );

  /* ── keyboard handling ──
     Escape answers no and Enter answers yes, which a confirm should. The trap
     holds everything else inside: Tab used to walk out of the question and
     into the page it was asked about. */
  const box = useFocusTrap({ active: open, onEscape: () => handleClose(false) });

  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (e.key === "Enter") handleClose(true);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleClose]);

  /* ── body scroll lock ── */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open && !exiting) return null;

  const iconEntry = ICON_MAP[type] || ICON_MAP.info;
  const confirmVariant = CONFIRM_VARIANT[type] || "sweet-alert-btn--confirm";

  return (
    <div
      ref={overlayRef}
      className={`sweet-alert-overlay${exiting ? " sweet-alert-overlay--exit" : ""}`}
      onClick={(e) => e.target === overlayRef.current && handleClose(false)}
    >
      <div
        ref={box}
        className="sweet-alert-box"
        dir={isRtl ? "rtl" : "ltr"}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sweet-alert-title"
        aria-describedby="sweet-alert-message"
      >
        {/* Close X */}
        <button
          className="sweet-alert-close"
          onClick={() => handleClose(false)}
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        {/* Icon */}
        <div className={`sweet-alert-icon-wrap ${iconEntry.wrapClass}`}>
          {iconEntry.component}
        </div>

        {/* Title */}
        {title && (
          <h2 className="sweet-alert-title" id="sweet-alert-title">
            {title}
          </h2>
        )}

        {/* Message */}
        {message && (
          <p className="sweet-alert-message" id="sweet-alert-message">
            {message}
          </p>
        )}

        {/* Divider */}
        <div className="sweet-alert-divider" />

        {/* Actions */}
        <div className={`sweet-alert-actions${isRtl ? " sweet-alert-actions--rtl" : ""}`}>
          {showCancel && (
            <button
              className="sweet-alert-btn sweet-alert-btn--cancel"
              onClick={() => handleClose(false)}
            >
              {cancelText}
            </button>
          )}
          <button
            className={`sweet-alert-btn ${confirmVariant}`}
            onClick={() => handleClose(true)}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   useSweetAlert — hook for imperative usage
   
   Usage:
     const { alert, show } = useSweetAlert();
     
     show({
       type: "confirm",
       title: "Delete?",
       message: "This cannot be undone",
       confirmText: "Delete",
       cancelText: "Cancel",
       showCancel: true,
     }).then((confirmed) => {
       if (confirmed) doDelete();
     });
     
     // In JSX:
     {alert}
───────────────────────────────────────────────────── */
export function useSweetAlert() {
  const [config, setConfig] = useState(null);
  const resolveRef = useRef(null);

  const show = useCallback((opts) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setConfig({ ...opts, open: true });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setConfig(null);
    if (resolveRef.current) resolveRef.current(true);
  }, []);

  const handleCancel = useCallback(() => {
    setConfig(null);
    if (resolveRef.current) resolveRef.current(false);
  }, []);

  const alertElement = config ? (
    <SweetAlert
      {...config}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return { alert: alertElement, show };
}