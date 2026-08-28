/**
 * What each role may do, in one place.
 *
 * The dashboard had four roles and enforced none of them: `ProtectedRoute`
 * accepted an `allowedRoles` list that no route ever passed, and the sidebar
 * offered every screen to everyone. A viewer could open user administration
 * and the mail templates; the server refused the requests behind them, so the
 * screen simply came up empty and the reader was left to guess why.
 *
 * Screens ask for a capability rather than naming roles, so a role can be
 * re-cut here without touching a screen. The ranks mirror
 * `backend/apps/accounts/roles.py`; the server remains the authority and this
 * only decides what is worth offering.
 */

export const ROLE_RANKS = Object.freeze({
  viewer: 1,
  editor: 2,
  admin: 3,
  super_admin: 4,
});

/** The lowest role that holds each capability. */
export const CAPABILITIES = Object.freeze({
  // Everyone signed in
  "dashboard.view": "viewer",
  "messages.read": "viewer",

  // The people who edit the site
  "content.edit": "editor",
  "services.manage": "editor",
  "blog.edit": "editor",
  "careers.manage": "editor",
  "seo.manage": "editor",

  // The people who run the account
  "users.manage": "admin",
  "settings.manage": "admin",
  "email.manage": "admin",

  // The general manager alone
  "integrations.manage": "super_admin",
  "audit.read": "super_admin",
});

export function rankOf(role) {
  return ROLE_RANKS[role] || 0;
}

/**
 * Whether `role` holds `capability`.
 *
 * An unknown capability is refused rather than allowed, so a typo closes a
 * door instead of opening one.
 */
export function roleCan(role, capability) {
  const needed = CAPABILITIES[capability];

  if (!needed) return false;

  return rankOf(role) >= rankOf(needed);
}

/** The role a capability needs, for telling a reader why they cannot. */
export function requiredRole(capability) {
  return CAPABILITIES[capability] || null;
}

export default CAPABILITIES;
