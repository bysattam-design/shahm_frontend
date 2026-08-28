import React from "react";
import { formatDateTime } from "../../../utils/format";
import { useTranslation } from "react-i18next";

/**
 * Offers back an edit that was interrupted before it reached the server.
 */
export default function DraftNotice({ draft, onRestore, onDiscard }) {
  const { t } = useTranslation();

  if (!draft) return null;

  const savedAt = draft.savedAt ? new Date(draft.savedAt) : null;
  const stamp = savedAt && !Number.isNaN(savedAt.getTime())
    ? formatDateTime(savedAt)
    : "";

  return (
    <div className="sf-draft" role="status">
      <span className="sf-draft__text">
        {t("form_layer.draft_found", "لديك تعديل لم يحفظ")}
        {stamp && <span className="sf-draft__stamp">{stamp}</span>}
      </span>

      <span className="sf-draft__actions">
        <button type="button" className="sf-btn sf-btn--small" onClick={onRestore}>
          {t("form_layer.draft_restore", "استعده")}
        </button>
        <button type="button" className="sf-btn sf-btn--small sf-btn--quiet" onClick={onDiscard}>
          {t("form_layer.draft_discard", "احذفه")}
        </button>
      </span>
    </div>
  );
}
