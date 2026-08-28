// Dashboard user management page.
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useUsersStore } from "../../../store/useUsersStore";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Modal    from "../../../components/common/dashboard/Modal";
import Editbtn  from "../../../components/common/dashboard/Editbtn";
import Deletebtn from "../../../components/common/dashboard/Deletebtn";
import { useSweetAlert } from "../../../components/common/SweetAlert";
import useListState from "../../../hooks/useListState";
import useSelection from "../../../hooks/useSelection";
import { runQuery } from "../../../utils/listQuery";
import { ROLE_RANKS } from "../../../utils/capabilities";
import {
  Avatar,
  Badge,
  BulkBar,
  Button,
  CellStack,
  Checkbox,
  EmptyState,
  FilterChips,
  ListFilter,
  ListToolbar,
  Pager,
  TBody,
  TD,
  TH,
  TableSkeleton,
  THead,
  TR,
  Table,
} from "../../../components/ui";
import "../../../styles/dashboard/cms/users.css";

/* ── Icons ──────────────────────────────────────────────────── */
const IcoUsers = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 10a4 4 0 100-8 4 4 0 000 8zM2 17c0-3.33 5.33-5 8-5s8 1.67 8 5v1H2v-1z" fill="currentColor"/>
  </svg>
);
const IcoPlus = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const IcoSave = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
    <path d="M15.75 8.063v7.124a.938.938 0 0 1-.937.938H3.187a.938.938 0 0 1-.937-.938V3.563c0-.25.1-.488.255-.663A.937.937 0 0 1 3.187 2.5h7.126"
      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="m13.5 1.5 3 3-8.25 8.25H5.25V9.75L13.5 1.5Z"
      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IcoEmail = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M1 5l7 4.5L15 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const IcoKey = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="6" cy="8" r="4" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M9.5 8H15M13 6v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const IcoRole = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M8 2a3 3 0 100 6 3 3 0 000-6zM2 13c0-2.5 4-4 6-4s6 1.5 6 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const IcoPerson = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M2 14c0-2.2 2.7-4 6-4s6 1.8 6 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const IcoEmpty = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="16" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M4 40c0-8.8 8.95-16 20-16s20 7.2 20 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ── Role meta ─────────────────────────────────────────────── */
/* A role is a rank, so its tone rises with it rather than being a colour
   picked per role. */
const ROLE_TONE = {
  super_admin: "accent",
  admin: "info",
  editor: "success",
  viewer: "neutral",
};

const ROLE_ORDER = ["super_admin", "admin", "editor", "viewer"];

function RoleBadge({ role, t }) {
  return (
    <Badge tone={ROLE_TONE[role] || "neutral"}>
      {t(`cms.users.roles.${role}`, role)}
    </Badge>
  );
}

/* ── What the list is asked ─────────────────────────────────────
   Declared once, outside the component, so the objects keep their identity
   between renders — a filter default that is rebuilt every render restarts
   the list state on every keystroke.  */

const SEARCH_FIELDS = ["name", "email", "id"];

const FILTER_DEFAULTS = { role: "all", state: "all" };

const FILTER_TESTS = {
  role: (user, value) => user.role === value,
  state: (user, value) => (value === "active" ? Boolean(user.is_active) : !user.is_active),
};

/* A cell that shows a badge still sorts on what the badge means: the roles
   run super_admin → viewer, which is a rank and not an alphabet. */
const SORT_ACCESSORS = {
  id: (user) => user.id,
  name: (user) => user.name || user.email || "",
  role: (user) => ROLE_RANKS[user.role] || 0,
  active: (user) => Boolean(user.is_active),
};

const COLUMNS = 6;

/* ── User Form (shared for Create + Edit) ──────────────────── */
function UserForm({ form, setForm, isEdit, saving, onSubmit, onCancel, t }) {
  return (
    <div className="du-form">
      <div className="du-form-grid">

        {/* Email */}
        <div className="du-form-group">
          <label className="du-label">
            <IcoEmail />
            {t("cms.users.fields.email")}
          </label>
          <input
            className="du-input"
            type="email"
            placeholder={t("cms.users.fields.email_placeholder")}
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            autoComplete="off"
          />
        </div>

        {/* Name */}
        <div className="du-form-group">
          <label className="du-label">
            <IcoPerson />
            {t("cms.users.fields.name")}
          </label>
          <input
            className="du-input"
            type="text"
            placeholder={t("cms.users.fields.name_placeholder")}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        {/* Password */}
        <div className="du-form-group">
          <label className="du-label">
            <IcoKey />
            {isEdit ? t("cms.users.fields.new_password") : t("cms.users.fields.password")}
          </label>
          <input
            className="du-input"
            type="password"
            placeholder={
              isEdit
                ? t("cms.users.fields.new_password_placeholder")
                : t("cms.users.fields.password_placeholder")
            }
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            autoComplete="new-password"
          />
        </div>

        {/* Role */}
        <div className="du-form-group">
          <label className="du-label">
            <IcoRole />
            {t("cms.users.fields.role")}
          </label>
          <select
            className="du-input du-select"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          >
            {ROLE_ORDER.map((role) => (
              <option key={role} value={role}>{t(`cms.users.roles.${role}`)}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Actions */}
      <div className="du-form-actions">
        <Button onClick={onSubmit} loading={saving} icon={<IcoSave />}>
          {saving
            ? t("cms.users.actions.saving", "Saving…")
            : isEdit
              ? t("cms.users.actions.save_changes")
              : t("cms.users.actions.save")}
        </Button>
        <Button intent="quiet" onClick={onCancel} disabled={saving}>
          {t("cms.users.actions.cancel")}
        </Button>
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────── */
const EMPTY_FORM = { email: "", name: "", password: "", role: "viewer" };

export default function Users() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { users, fetchUsers, addUser, editUser, removeUser, loading, error } = useUsersStore();
  const { alert: sweetEl, show } = useSweetAlert();

  const [modalMode,  setModalMode]  = useState(null); // "create" | "edit" | null
  const [editTarget, setEditTarget] = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [bulkBusy,   setBulkBusy]   = useState(false);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /* ── The list: searched, narrowed, ordered, paged ── */
  const list = useListState({
    filters: FILTER_DEFAULTS,
    sort: "id",
    direction: "asc",
    size: 10,
  });

  const result = useMemo(
    () =>
      runQuery(users, {
        term: list.term,
        fields: SEARCH_FIELDS,
        filters: list.filters,
        definitions: FILTER_TESTS,
        sort: list.sort,
        direction: list.direction,
        accessors: SORT_ACCESSORS,
        page: list.page,
        size: list.size,
      }),
    [users, list.term, list.filters, list.sort, list.direction, list.page, list.size]
  );

  const pageIds = useMemo(() => result.rows.map((u) => String(u.id)), [result.rows]);
  const matchingIds = useMemo(() => result.all.map((u) => String(u.id)), [result.all]);

  const selection = useSelection({
    pageIds,
    matchingIds,
    resetKey: list.narrowingKey,
  });

  /* ── What is narrowing the list, said in words ── */
  const chips = [];

  if (list.term) {
    chips.push({
      key: "q",
      label: `${t("list.search")}: ${list.term}`,
      onRemove: list.clearTerm,
    });
  }

  if (list.filters.role !== FILTER_DEFAULTS.role) {
    chips.push({
      key: "role",
      label: `${t("cms.users.filters.role")}: ${t(`cms.users.roles.${list.filters.role}`)}`,
      onRemove: () => list.clearFilter("role"),
    });
  }

  if (list.filters.state !== FILTER_DEFAULTS.state) {
    chips.push({
      key: "state",
      label: `${t("cms.users.filters.state")}: ${t(`cms.users.filters.${list.filters.state}`)}`,
      onRemove: () => list.clearFilter("state"),
    });
  }

  /* ── Open modals ── */
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setModalMode("create");
  };

  const openEdit = (user) => {
    setForm({ email: user.email, name: user.name, password: "", role: user.role });
    setEditTarget(user);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditTarget(null);
    setForm(EMPTY_FORM);
  };

  /* ── Submit ── */
  const handleCreate = async () => {
    setSaving(true);
    try {
      const ok = await addUser(form);
      if (ok) {
        toast.success(t("cms.users.success.user_created"));
        closeModal();
      } else {
        toast.error(t("cms.users.errors.create_failed"));
      }
    } finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const ok = await editUser(editTarget.id, form);
      if (ok) {
        toast.success(t("cms.users.success.user_updated"));
        closeModal();
      } else {
        toast.error(t("cms.users.errors.update_failed"));
      }
    } finally { setSaving(false); }
  };

  /* ── Delete — one row, handled by Deletebtn's own confirm ── */
  const handleDelete = async (user) => {
    const ok = await removeUser(user.id);
    if (ok) toast.success(t("cms.users.success.user_deleted"));
    else toast.error(t("cms.users.errors.delete_failed"));
  };

  /* ── Delete — the rows in force ──────────────────────────────
     A deletion cannot be taken back, so this one is the exception the panel
     allows a dialog for, and the dialog's button names the act and its count
     rather than saying «OK». The rows go one at a time and the outcome is
     reported as it actually fell, not as a single cheerful line. */
  const handleBulkDelete = useCallback(async () => {
    const ids = selection.selectedIds;
    if (ids.length === 0) return;

    const confirmed = await show({
      type: "confirm",
      title: t("cms.users.bulk.confirm_title", { count: ids.length }),
      message: t("cms.users.bulk.confirm_text"),
      confirmText: t("cms.users.bulk.delete"),
      cancelText: t("cms.users.actions.cancel"),
      showCancel: true,
    });

    if (!confirmed) return;

    setBulkBusy(true);
    let done = 0;
    let failed = 0;

    for (const id of ids) {
      // eslint-disable-next-line no-await-in-loop
      const ok = await removeUser(Number(id));
      if (ok) done += 1;
      else failed += 1;
    }

    setBulkBusy(false);
    selection.clear();

    if (failed === 0) toast.success(t("cms.users.bulk.done", { count: done }));
    else toast.error(t("cms.users.bulk.partial", { done, failed }));
  }, [selection, show, t, removeUser]);

  /* ── Modal title / subtitle ── */
  const modalTitle = modalMode === "edit"
    ? t("cms.users.actions.edit_title")
    : t("cms.users.actions.create_title");

  const modalSubtitle = modalMode === "edit" && editTarget ? (
    <div className="du-modal-user-meta">
      <Avatar name={editTarget.name} email={editTarget.email} />
      <span className="du-modal-user-name">{editTarget.name || editTarget.email}</span>
      <RoleBadge role={editTarget.role} t={t} />
    </div>
  ) : null;

  /* ── Which of the states the card is in ──────────────────────
     Six, and the order matters: a failure is not an empty list, and an empty
     list under a filter is not an empty list. */
  const state = error
    ? "error"
    : loading
      ? "loading"
      : users.length === 0
        ? "empty"
        : result.total === 0
          ? "no-match"
          : "rows";

  const sortedAs = (key) => (list.sort === key ? list.direction : null);

  const head = (
    <THead>
      <TR>
        <TH>
          <Checkbox
            checked={selection.pageState === "all"}
            indeterminate={selection.pageState === "some"}
            onChange={selection.togglePage}
            ariaLabel={t("list.select_page")}
            disabled={state !== "rows"}
          />
        </TH>
        <TH
          sortable
          sorted={sortedAs("id")}
          onSort={() => list.toggleSort("id")}
          label={t("list.sort_by", { column: t("cms.users.table.id") })}
        >
          {t("cms.users.table.id")}
        </TH>
        <TH
          sortable
          sorted={sortedAs("name")}
          onSort={() => list.toggleSort("name")}
          label={t("list.sort_by", { column: t("cms.users.table.email") })}
        >
          {t("cms.users.table.email")}
        </TH>
        <TH
          sortable
          sorted={sortedAs("role")}
          onSort={() => list.toggleSort("role")}
          label={t("list.sort_by", { column: t("cms.users.table.role") })}
        >
          {t("cms.users.table.role")}
        </TH>
        <TH
          sortable
          sorted={sortedAs("active")}
          onSort={() => list.toggleSort("active")}
          label={t("list.sort_by", { column: t("cms.users.table.active") })}
        >
          {t("cms.users.table.active")}
        </TH>
        <TH>{t("cms.users.table.actions")}</TH>
      </TR>
    </THead>
  );

  return (
    <div
      className="du-root"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {sweetEl}

      {/* ── PAGE HEADER ── */}
      <div className="du-page-header">
        <div className="du-page-header-left">
          <div className="du-page-header-icon"><IcoUsers /></div>
          <div>
            <h1 className="du-page-title">{t("cms.users.title")}</h1>
            <p className="du-page-subtitle">{t("cms.users.subtitle")}</p>
          </div>
        </div>
        <Button onClick={openCreate} icon={<IcoPlus />}>
          {t("cms.users.actions.add")}
        </Button>
      </div>

      {/* ── USERS TABLE CARD ── */}
      <div className="du-card" aria-busy={loading || undefined}>
        {/* Card header */}
        <div className="du-card-header">
          <div className="du-card-header-left">
            <span className="du-card-icon"><IcoUsers /></span>
            <h2 className="du-card-title">{t("cms.users.users_list")}</h2>
          </div>
          <span className="du-count-badge">{result.total}</span>
        </div>

        {/* The bar. It is not offered over a list that has no rows at all —
            there is nothing to search, and a search box over an empty table
            reads as a search that found nothing. */}
        {state !== "empty" && state !== "error" && (
          <>
            <ListToolbar
              value={list.draft}
              onChange={list.setDraft}
              onClear={list.clearTerm}
              hintId="du-search-hint"
              labels={{
                search: t("list.search"),
                placeholder: t("list.search_placeholder"),
                searchIn: t("list.search_in", { fields: t("cms.users.search_fields") }),
                clear: t("list.clear_search"),
              }}
              filters={
                <>
                  <ListFilter
                    id="du-filter-role"
                    label={t("cms.users.filters.role")}
                    value={list.filters.role}
                    onChange={(value) => list.setFilter("role", value)}
                    options={[
                      { value: "all", label: t("list.all") },
                      ...ROLE_ORDER.map((role) => ({
                        value: role,
                        label: t(`cms.users.roles.${role}`),
                      })),
                    ]}
                  />
                  <ListFilter
                    id="du-filter-state"
                    label={t("cms.users.filters.state")}
                    value={list.filters.state}
                    onChange={(value) => list.setFilter("state", value)}
                    options={[
                      { value: "all", label: t("list.all") },
                      { value: "active", label: t("cms.users.filters.active") },
                      { value: "inactive", label: t("cms.users.filters.inactive") },
                    ]}
                  />
                </>
              }
            />

            {chips.length > 0 && (
              <div className="du-chips-row">
                <FilterChips
                  chips={chips}
                  onClearAll={list.reset}
                  labels={{
                    group: t("list.filters"),
                    remove: t("list.remove_filter"),
                    clearAll: t("list.clear_all"),
                  }}
                />
              </div>
            )}

            <BulkBar
              count={selection.count}
              scope={selection.scope}
              onClear={selection.clear}
              onSelectAllMatching={selection.selectAllMatching}
              canSelectAllMatching={selection.canSelectAllMatching}
              labels={{
                region: t("list.selection"),
                count:
                  selection.scope === "matching"
                    ? t("list.selected_matching", { count: selection.count })
                    : t("list.selected", { count: selection.count }),
                selectAllMatching: t("list.select_all_matching", { count: result.total }),
                clear: t("list.clear_selection"),
              }}
            >
              <Button
                intent="danger"
                size="sm"
                onClick={handleBulkDelete}
                loading={bulkBusy}
              >
                {t("cms.users.bulk.delete")}
              </Button>
            </BulkBar>
          </>
        )}

        {/* Table body */}
        {state === "loading" && (
          <>
            <p className="ui-visually-hidden" role="status">{t("states.loading")}</p>
            <Table>
              {head}
              <TableSkeleton columns={COLUMNS} rows={6} />
            </Table>
          </>
        )}

        {state === "error" && (
          <EmptyState
            title={t("cms.users.load_failed")}
            hint={typeof error === "string" ? error : t("states.error_hint")}
            action={
              <Button size="sm" onClick={fetchUsers}>
                {t("states.retry")}
              </Button>
            }
          />
        )}

        {state === "empty" && (
          <EmptyState
            icon={<IcoEmpty />}
            title={t("cms.users.empty")}
            action={
              <Button onClick={openCreate} icon={<IcoPlus />} size="sm">
                {t("cms.users.actions.add")}
              </Button>
            }
          />
        )}

        {state === "no-match" && (
          <EmptyState
            icon={<IcoEmpty />}
            title={t("cms.users.empty_filtered")}
            hint={t("list.no_match_hint")}
            action={
              <Button intent="quiet" size="sm" onClick={list.reset}>
                {t("list.clear_all")}
              </Button>
            }
          />
        )}

        {state === "rows" && (
          <>
            <Table>
              {head}
              <TBody>
                {result.rows.map((u) => (
                  <TR key={u.id} selected={selection.isSelected(u.id)}>
                    <TD>
                      <Checkbox
                        id={`du-row-${u.id}`}
                        checked={selection.isSelected(u.id)}
                        onChange={() => selection.toggle(String(u.id))}
                        ariaLabel={`${t("list.select_row")} — ${u.name || u.email}`}
                      />
                    </TD>
                    <TD muted>
                      <span className="du-id-chip">#{u.id}</span>
                    </TD>
                    <TD>
                      <CellStack
                        media={<Avatar name={u.name} email={u.email} />}
                        title={u.name || "—"}
                        sub={u.email}
                      />
                    </TD>
                    <TD><RoleBadge role={u.role} t={t} /></TD>
                    <TD>
                      <Badge tone={u.is_active ? "success" : "neutral"} dot>
                        {u.is_active
                          ? t("cms.users.filters.active")
                          : t("cms.users.filters.inactive")}
                      </Badge>
                    </TD>
                    <TD>
                      <div className="du-actions-cell">
                        {/* Global Editbtn */}
                        <Editbtn
                          onClick={() => openEdit(u)}
                          className="du-icon-btn du-icon-btn--edit"
                          iconOnly={false}
                          label={t("cms.users.actions.edit")}
                        />
                        {/* Global Deletebtn — SweetAlert built-in */}
                        <Deletebtn
                          onConfirm={() => handleDelete(u)}
                          confirmTitle={t("cms.users.confirm_delete_title")}
                          confirmMessage={t("cms.users.confirm_delete")}
                          className="du-icon-btn du-icon-btn--delete"
                          iconOnly={false}
                          label={t("cms.users.actions.delete")}
                        />
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>

            {/* The one pager, at the foot and nowhere else. */}
            <Pager
              page={result.page}
              pages={result.pages}
              total={result.total}
              size={list.size}
              onPage={list.setPage}
              onSize={list.setSize}
              labels={{
                navigation: t("list.pages"),
                previous: t("list.previous"),
                next: t("list.next"),
                size: t("list.page_size"),
                pageLabel: (page) => t("list.page_number", { page }),
                range: t("list.range", {
                  from: (result.page - 1) * list.size + 1,
                  to: Math.min(result.page * list.size, result.total),
                  total: result.total,
                }),
              }}
            />
          </>
        )}
      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      <Modal
        open={modalMode !== null}
        onClose={closeModal}
        title={modalTitle}
        subtitle={modalSubtitle}
        footer={null}   /* actions are inside UserForm */
        dir={isRtl ? "rtl" : "ltr"}
        width={600}
      >
        <UserForm
          form={form}
          setForm={setForm}
          isEdit={modalMode === "edit"}
          saving={saving}
          onSubmit={modalMode === "edit" ? handleUpdate : handleCreate}
          onCancel={closeModal}
          t={t}
        />
      </Modal>
    </div>
  );
}
