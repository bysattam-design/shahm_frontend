// src/components/layout/DashboardSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import { useTranslation } from "react-i18next";
import useCan from "../../../hooks/useCan";
import "../../../styles/layout/dashboard/sidebar.css";

const SectionIcons = {
  general: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  content: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  management: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};

const CollapseIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" width="16" height="16">
    <path d="M4 13h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1zm-1 7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v4zm10 0a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v7zm1-10h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1z" />
  </svg>
);

export default function DashboardSidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  openSections = {},
  onToggleSection = () => {},
}) {
  const { logout } = useAuthStore();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const handleLinkClick = () => {
    if (window.innerWidth <= 1024) onClose();
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
  };

  const { can } = useCan();

  const sections = [
    {
      title: t("sidebar.general"),
      iconKey: "general",
      items: [
        { to: "/dashboard", label: t("sidebar.home"), end: true, cap: "dashboard.view" },
        { to: "/dashboard/messages", label: t("sidebar.messages"), cap: "messages.read" },
      ],
    },
    {
      title: t("sidebar.content"),
      iconKey: "content",
      items: [
        { to: "/dashboard/cms/heroes", label: t("sidebar.cms_heroes"), cap: "content.edit" },
        { to: "/dashboard/cms/about", label: t("sidebar.cms_about"), cap: "content.edit" },
        { to: "/admin/forms", label: t("sidebar.forms"), cap: "content.edit" },
        // { to: "/dashboard/cms/pages", label: t("sidebar.cms_pages") },
        { to: "/dashboard/cms/legal", label: t("sidebar.cms_legal"), cap: "content.edit" },
        { to: "/dashboard/cms/faq", label: t("sidebar.cms_faq"), cap: "content.edit" },
        { to: "/dashboard/cms/contact", label: t("sidebar.cms_contact"), cap: "content.edit" },
        { to: "/dashboard/cms/header", label: t("sidebar.cms_header"), cap: "content.edit" },
        { to: "/dashboard/cms/footer", label: t("sidebar.cms_footer"), cap: "content.edit" },
      ],
    },
    {
      title: t("sidebar.management"),
      iconKey: "management",
      items: [
        { to: "/dashboard/services", label: t("sidebar.services"), cap: "services.manage" },
        { to: "/dashboard/appointments", label: t("sidebar.appointments"), cap: "services.manage" },
        { to: "/dashboard/blog", label: t("sidebar.blog"), cap: "blog.edit" },
        { to: "/dashboard/careers", label: t("sidebar.careers"), cap: "careers.manage" },
        { to: "/dashboard/careers/applications", label: t("sidebar.applications"), cap: "careers.manage" },
        { to: "/dashboard/users", label: t("sidebar.users"), cap: "users.manage" },
      ],
    },
    {
      title: t("sidebar.settings"),
      iconKey: "settings",
      items: [
        { to: "/dashboard/seo", label: t("sidebar.seo"), cap: "seo.manage" },
        { to: "/dashboard/settings", label: t("sidebar.system_settings"), cap: "settings.manage" },
        { to: "/dashboard/email-settings", label: t("sidebar.email_settings"), cap: "email.manage" },
        { to: "/dashboard/email-templates", label: t("sidebar.email_templates"), cap: "email.manage" },
      ],
    },
  ];

  // A reader is not offered a door they cannot open. The screens behind these
  // links refuse the requests anyway, so an unfiltered sidebar only led a
  // viewer to an empty page with nothing said. A group left with no item at
  // all disappears with its heading.
  const visibleSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.cap || can(item.cap)),
    }))
    .filter((section) => section.items.length > 0);

  const arrowPath = isRTL ? "M9 3L5 7L9 11" : "M5 3L9 7L5 11";

  const sidebarClass = [
    "dashboard-sidebar",
    isOpen ? "dashboard-sidebar-active" : "",
    isCollapsed ? "dashboard-sidebar-collapsed" : "",
  ].filter(Boolean).join(" ");

  return (
    <aside
      className={sidebarClass}
      dir={isRTL ? "rtl" : "ltr"}
      style={isRTL ? { animation: "sidebarSlideInRTL 0.45s cubic-bezier(0.34,1.2,0.64,1) both" } : undefined}
    >
      {/* ── Collapse toggle row ── */}
      <div className="dashboard-sidebar-toggle-row">
        <button
          className="dashboard-sidebar-collapse-btn"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? t("sidebar.open_sidebar") : t("sidebar.close_sidebar")}
          title={isCollapsed ? t("sidebar.open_sidebar") : t("sidebar.close_sidebar")}
          type="button"
        >
          <CollapseIcon />
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="dashboard-sidebar-nav">
        <div className="dashboard-sidebar-nav-scroll">
        {visibleSections.map((section, idx) => {
          // Keyed by the section itself, not by its position: the list is
          // filtered by what the reader may open, so positions shift from one
          // role to the next and a collapsed group would carry its state over
          // to whichever group happened to land in its place.
          const isExpanded = openSections?.[section.iconKey] !== false;
          return (
            <div
              key={section.iconKey}
              className={`dashboard-sidebar-nav-section ${isExpanded && !isCollapsed ? "section-expanded" : "section-collapsed"}`}
              style={{ animationDelay: `${0.08 + idx * 0.06}s` }}
            >
              <button
                className="dashboard-sidebar-nav-title"
                onClick={() => onToggleSection(section.iconKey)}
                aria-expanded={isExpanded && !isCollapsed}
                title={isCollapsed ? section.title : undefined}
                type="button"
              >
                <span className="section-icon">{SectionIcons[section.iconKey]}</span>
                <span className="section-title-text">{section.title}</span>
                <svg
                  className={`section-chevron ${isExpanded && !isCollapsed ? "chevron-open" : "chevron-closed"}`}
                  width="14" height="14" viewBox="0 0 14 14" fill="none"
                >
                  <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className={`section-items-wrapper ${isExpanded && !isCollapsed ? "items-open" : "items-closed"}`}>
                <div
                  className="section-items-inner"
                  style={isRTL ? { animation: "itemSlideInRTL 0.28s cubic-bezier(0.34,1.1,0.64,1) both" } : undefined}
                >
                  {section.items.map((item, itemIdx) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `dashboard-sidebar-link ${isActive ? "dashboard-sidebar-link-active" : ""}`
                      }
                      onClick={handleLinkClick}
                      style={{ animationDelay: `${itemIdx * 0.04}s` }}
                    >
                      <span className="dashboard-sidebar-link-text">{item.label}</span>
                      <svg className="dashboard-sidebar-link-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d={arrowPath} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </nav>

      {/* ── Footer: language + logout — always last, icon-only when collapsed ── */}
      <div className="dashboard-sidebar-footer">
        <button
          className="dashboard-sidebar-language-toggle"
          onClick={toggleLanguage}
          title={t("sidebar.change_language")}
          type="button"
        >
          <span className="sidebar-footer-icon">
            <svg fill="currentColor" viewBox="0 0 256 256" width="18" height="18">
              <path d="M235.57178,214.21094l-56-112a4.00006,4.00006,0,0,0-7.15528,0l-22.854,45.708a92.04522,92.04522,0,0,1-55.57275-20.5752A99.707,99.707,0,0,0,123.90723,60h28.08691a4,4,0,0,0,0-8h-60V32a4,4,0,0,0-8,0V52h-60a4,4,0,0,0,0,8h91.90772a91.74207,91.74207,0,0,1-27.91895,62.03357A91.67371,91.67371,0,0,1,65.23389,86.667a4,4,0,0,0-7.542,2.668,99.63009,99.63009,0,0,0,24.30469,38.02075A91.5649,91.5649,0,0,1,23.99414,148a4,4,0,0,0,0,8,99.54451,99.54451,0,0,0,63.99951-23.22461,100.10427,100.10427,0,0,0,57.65479,22.97192L116.4165,214.21094a4,4,0,1,0,7.15528,3.57812L138.46631,188H213.522l14.89453,29.78906a4,4,0,1,0,7.15528-3.57812ZM142.46631,180l33.52783-67.05566L209.522,180Z" />
            </svg>
          </span>
          <span className="dashboard-sidebar-language-text">
            {i18n.language === "en" ? "عربي" : "EN"}
          </span>
        </button>

        <button className="dashboard-sidebar-logout" onClick={logout} type="button">
          <span className="sidebar-footer-icon">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path
                d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5M13.3333 14.1667L17.5 10M17.5 10L13.3333 5.83333M17.5 10H7.5"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="dashboard-sidebar-logout-text">{t("sidebar.logout")}</span>
        </button>
      </div>
    </aside>
  );
}
