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

/**
 * The lowest role that holds each capability.
 *
 * Every line below is read off the server, not chosen here. The permission
 * class on the endpoints behind a screen is the rule; this only decides what
 * is worth offering, and an offer the server will refuse is worse than no
 * offer at all — the reader presses it, waits, and is told nothing they can
 * act on.
 *
 * The counts are the guarded endpoints found in each app, so a future reader
 * can check the claim rather than trust it.
 */
export const CAPABILITIES = Object.freeze({
  // Everyone signed in. The figures come from an endpoint that asks only for
  // a token.
  "dashboard.view": "viewer",

  // The people who edit the site — `IsEditorOrAbove`
  "content.edit": "editor",        // cms 39 · legal 3
  "forms.manage": "editor",        // form_builder 17
  "services.manage": "editor",     // services 16
  "blog.edit": "editor",           // blog 8
  "careers.manage": "editor",      // services/careers, within the 16
  "team.manage": "editor",         // team 4

  // The people who run the account — `IsAdminOrSuper`
  "messages.read": "admin",        // messaging 9 — every one of them
  "users.manage": "admin",         // accounts 4
  "settings.manage": "admin",      // settings_app 4
  "seo.manage": "admin",           // seo 5
  "email.manage": "admin",         // messaging, within the 9

  // The general manager alone. Nothing answers to these yet; they are the
  // names the integration work will ask for.
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
