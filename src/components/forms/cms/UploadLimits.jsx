import React from "react";
import { useTranslation } from "react-i18next";

/**
 * What this field will take, said before the upload rather than after it.
 *
 * The picture fields refused a file with no warning and no reason: an editor
 * chose a mark, waited, and read «فشل الحفظ». The formats, the ceilings and
 * the size the mark is drawn at now sit under the control, so the answer is
 * there before the file is chosen.
 */

/** The formats every picture field accepts, and the ceilings on each kind. */
export const PICTURE_ACCEPT = ".svg,.png,.jpg,.jpeg,.webp,.gif";
export const MAX_SVG_KB = 512;
export const MAX_RASTER_MB = 2;
export const MAX_PIXELS = 4000;

/** Width by height, in pixels, for the places a picture is used. */
export const RECOMMENDED = {
  logo_full: [480, 128],
  logo_compact: [240, 64],
  icon: [64, 64],
  cover: [1600, 900],
  hero: [1920, 1080],
  partner: [320, 160],
};

export default function UploadLimits({ kind = null, className = "" }) {
  const { t } = useTranslation();
  const size = kind ? RECOMMENDED[kind] : null;

  return (
    <p className={`sf-upload-limits ${className}`.trim()}>
      <span>
        {t("uploads.formats", "SVG أو PNG أو JPG أو WEBP أو GIF")}
      </span>
      <span aria-hidden="true"> · </span>
      <span>
        {t("uploads.max_svg", "حد SVG {{kb}} ك.ب").replace("{{kb}}", MAX_SVG_KB)}
      </span>
      <span aria-hidden="true"> · </span>
      <span>
        {t("uploads.max_raster", "حد الصورة {{mb}} م.ب").replace("{{mb}}", MAX_RASTER_MB)}
      </span>
      {size && (
        <>
          <span aria-hidden="true"> · </span>
          <span>
            {t("uploads.recommended", "المقاس الموصى به {{w}}×{{h}}")
              .replace("{{w}}", size[0])
              .replace("{{h}}", size[1])}
          </span>
        </>
      )}
      <span aria-hidden="true"> · </span>
      <span>
        {t("uploads.max_pixels", "بحد أقصى {{px}} بكسل").replace("{{px}}", MAX_PIXELS)}
      </span>
    </p>
  );
}
