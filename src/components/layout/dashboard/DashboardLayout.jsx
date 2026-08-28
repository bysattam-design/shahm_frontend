// src/components/layout/DashboardLayout.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardSidebar from "./DashboardSidebar";
import DashboardNavbar from "./DashboardNavbar";
import "../../../styles/layout/dashboard/layout.css";

const QUICK_LINKS = [
  { href: "/",             key: "sidebar.footer_link_home" },
  { href: "/services",     key: "sidebar.footer_link_services" },
  { href: "/about",        key: "sidebar.footer_link_about" },
  { href: "/blog",         key: "sidebar.footer_link_blog" },
  { href: "/contact",      key: "sidebar.footer_link_contact" },
  { href: "/faq",          key: "sidebar.footer_link_faq" },
];

export default function DashboardLayout({ children }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [isCollapsed, setIsCollapsed] = useState(false);
  // Keyed by section, not by position — the sidebar hides groups the reader
  // may not open, so positions differ from one role to the next.
  const [openSections, setOpenSections] = useState({
    general: true,
    content: true,
    management: true,
    settings: true,
  });

  const toggleCollapse = () => setIsCollapsed((v) => !v);

  const toggleSection = (key) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setOpenSections((prev) => ({ ...prev, [key]: true }));
    } else {
      setOpenSections((prev) => ({ ...prev, [key]: prev[key] === false }));
    }
  };

  return (
    <div
      className={[
        "dashboard-layout-root",
        isCollapsed ? "layout-sidebar-collapsed" : "",
      ].filter(Boolean).join(" ")}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <DashboardSidebar
        isOpen={true}
        onClose={() => {}}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        openSections={openSections}
        onToggleSection={toggleSection}
      />

      <div className="dashboard-layout-main">
        <DashboardNavbar />

        <main className="dashboard-layout-content">{children}</main>

        <footer className="dashboard-layout-footer">
          <div className="dashboard-layout-footer-content">
            <p className="dashboard-layout-footer-text">
              © {new Date().getFullYear()} Shahm. {t("sidebar.footer_rights")}
            </p>

            <nav
              className="dashboard-layout-footer-links"
              aria-label={t("sidebar.footer_quick_links")}
            >
              {QUICK_LINKS.map((link, i) => (
                <React.Fragment key={link.href}>
                  {i > 0 && <span className="dashboard-layout-footer-divider">·</span>}
                  <a
                    href={link.href}
                    className="dashboard-layout-footer-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t(link.key)}
                  </a>
                </React.Fragment>
              ))}
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
