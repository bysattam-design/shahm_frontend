// src/router/DashboardRoutes.jsx
//
// ✅ Uses a single parent <Route element={<ProtectedRoute />}> that wraps
//    ALL dashboard children via nested routes + <Outlet />.
//
//    Benefits:
//    • Zero repetition of <ProtectedRoute> on every single route
//    • Auth check runs once at the layout level
//    • Adding new dashboard pages = just one extra <Route> child
//
// Called as a function  {DashboardRoutes()}  in AppRouter.

import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// ---------------- General ----------------
import DashboardHome from "../pages/dashboard/home/DashboardHome";

// ---------------- Users ----------------
import Users from "../pages/dashboard/users/Users";

// ---------------- CMS ----------------
import CMSHeroes from "../pages/dashboard/cms/Heroes";
import CMSLegal from "../pages/dashboard/cms/Legal";
import CMSFAQ from "../pages/dashboard/cms/FAQ";
import CMSHeader from "../pages/dashboard/cms/Header";
import CMSFooter from "../pages/dashboard/cms/Footer";
import CMSContact from "../pages/dashboard/contact/CMS_Contact";
import CMSAbout from "../pages/dashboard/cms/About";
import CMSForms from "../pages/dashboard/forms/CMSForms";

// ---------------- Services ----------------
import ServicesManage from "../pages/dashboard/services/Services_Manage";

// ---------------- Appointments ----------------
import AppointmentsCMS from "../pages/dashboard/appointments/AppointmentsCMS";

// ---------------- Careers / Jobs ----------------
import CareersCMS from "../pages/dashboard/jobs/CareersCMS";
import CareerApplicationsCMS from "../pages/dashboard/jobs/CareerApplicationsCMS";

// ---------------- Blog ----------------
import BlogManage from "../pages/dashboard/cms/Blog";

// ---------------- Messages ----------------
import MessagesDashboard from "../pages/dashboard/messages/Messages_Dashboard";
import MessageView from "../pages/dashboard/messages/Message_View";

// ---------------- SEO ----------------
import SEOSettings from "../pages/dashboard/cms/SEO";

// ---------------- Settings ----------------
import Settings from "../pages/dashboard/settings/Settings";

// ---------------- Email ----------------
import EmailSettings from "../pages/dashboard/email/EmailSettings";
import EmailTemplates from "../pages/dashboard/email/EmailTemplates";

export default function DashboardRoutes() {
  return (
    /*
     * One guard per capability, so a screen is offered only to a reader who
     * may use it. The paths are unchanged — only the guard above them is.
     *
     * The dashboard used to hang every screen under a single guard that
     * checked nothing but the token, so a viewer could open user
     * administration and the mail templates; the server refused the requests
     * behind them and the screen came up empty with nothing said.
     */
    <>
      {/* ── Anyone signed in ── */}
      <Route element={<ProtectedRoute capability="dashboard.view" />}>
        <Route path="/dashboard" element={<DashboardHome />} />
      </Route>

      <Route element={<ProtectedRoute capability="messages.read" />}>
        <Route path="/dashboard/messages" element={<MessagesDashboard />} />
        <Route path="/dashboard/messages/:id" element={<MessageView />} />
      </Route>

      {/* ── Editing the site ── */}
      <Route element={<ProtectedRoute capability="content.edit" />}>
        <Route path="/dashboard/cms/heroes" element={<CMSHeroes />} />
        <Route path="/dashboard/cms/legal" element={<CMSLegal />} />
        <Route path="/dashboard/cms/faq" element={<CMSFAQ />} />
        <Route path="/dashboard/cms/header" element={<CMSHeader />} />
        <Route path="/dashboard/cms/footer" element={<CMSFooter />} />
        <Route path="/dashboard/cms/contact" element={<CMSContact />} />
        <Route path="/dashboard/cms/about" element={<CMSAbout />} />
        <Route path="/admin/forms" element={<CMSForms />} />
      </Route>

      <Route element={<ProtectedRoute capability="services.manage" />}>
        <Route path="/dashboard/services" element={<ServicesManage />} />
        <Route path="/dashboard/appointments" element={<AppointmentsCMS />} />
      </Route>

      <Route element={<ProtectedRoute capability="blog.edit" />}>
        <Route path="/dashboard/blog" element={<BlogManage />} />
      </Route>

      <Route element={<ProtectedRoute capability="careers.manage" />}>
        <Route path="/dashboard/careers" element={<CareersCMS />} />
        <Route path="/dashboard/careers/applications" element={<CareerApplicationsCMS />} />
      </Route>

      <Route element={<ProtectedRoute capability="seo.manage" />}>
        <Route path="/dashboard/seo" element={<SEOSettings />} />
      </Route>

      {/* ── Running the account ── */}
      <Route element={<ProtectedRoute capability="users.manage" />}>
        <Route path="/dashboard/users" element={<Users />} />
      </Route>

      <Route element={<ProtectedRoute capability="settings.manage" />}>
        <Route path="/dashboard/settings" element={<Settings />} />
      </Route>

      <Route element={<ProtectedRoute capability="email.manage" />}>
        <Route path="/dashboard/email-settings" element={<EmailSettings />} />
        <Route path="/dashboard/email-templates" element={<EmailTemplates />} />
      </Route>
    </>
  );
}
