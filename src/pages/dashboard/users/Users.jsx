// Dashboard user management page.
import React, { useEffect, useState } from "react";
import { useUsersStore } from "../../../store/useUsersStore";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Modal    from "../../../components/common/dashboard/Modal";
import Editbtn  from "../../../components/common/dashboard/Editbtn";
import Deletebtn from "../../../components/common/dashboard/Deletebtn";
import { useSweetAlert } from "../../../components/common/SweetAlert";
import {
  Avatar,
  Badge,
  Button,
  CellStack,
  EmptyState,
  Spinner,
  TBody,
  TD,
  TH,
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

/* ── Role meta ─────────────────────────────────────────────── */
/* A role is a rank, so its tone rises with it rather than being a colour
   picked per role. */
const ROLE_TONE = {
  super_admin: "accent",
  admin: "info",
  editor: "success",
  viewer: "neutral",
};

function RoleBadge({ role, t }) {
  return (
    <Badge tone={ROLE_TONE[role] || "neutral"}>
      {t(`cms.users.roles.${role}`, role)}
    </Badge>
  );
}

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
            <option value="super_admin">{t("cms.users.roles.super_admin")}</option>
            <option value="admin">{t("cms.users.roles.admin")}</option>
            <option value="editor">{t("cms.users.roles.editor")}</option>
            <option value="viewer">{t("cms.users.roles.viewer")}</option>
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
  const { users, fetchUsers, addUser, editUser, removeUser, loading } = useUsersStore();
  const { alert: sweetEl } = useSweetAlert();

  const [modalMode,  setModalMode]  = useState(null); // "create" | "edit" | null
  const [editTarget, setEditTarget] = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

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
        toast.success(t("cms.users.success.user_created", "User created successfully"));
        closeModal();
      }
    } finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const ok = await editUser(editTarget.id, form);
      if (ok) {
        toast.success(t("cms.users.success.user_updated", "User updated successfully"));
        closeModal();
      }
    } finally { setSaving(false); }
  };

  /* ── Delete — handled by Deletebtn's own confirm ── */
  const handleDelete = async (user) => {
    const success = await removeUser(user.id);
    if (success) toast.success(t("cms.users.success.user_deleted"));
    else toast.error(t("cms.users.error.delete_failed", "Failed to delete user"));
  };

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
      <div className="du-card">
        {/* Card header */}
        <div className="du-card-header">
          <div className="du-card-header-left">
            <span className="du-card-icon"><IcoUsers /></span>
            <h2 className="du-card-title">{t("cms.users.users_list")}</h2>
          </div>
          <span className="du-count-badge">{users.length}</span>
        </div>

        {/* Table body */}
        {loading ? (
          <div className="du-loading">
            <Spinner size={32} label={t("cms.users.loading")} />
            <p>{t("cms.users.loading")}</p>
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={
              <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="16" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M4 40c0-8.8 8.95-16 20-16s20 7.2 20 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
            title={t("cms.users.empty_state", "No users found")}
            action={
              <Button onClick={openCreate} icon={<IcoPlus />} size="sm">
                {t("cms.users.actions.add")}
              </Button>
            }
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>ID</TH>
                <TH>{t("cms.users.table.email")}</TH>
                <TH>{t("cms.users.table.role")}</TH>
                <TH>{t("cms.users.table.active")}</TH>
                <TH>{t("cms.users.table.actions")}</TH>
              </TR>
            </THead>
            <TBody>
                {users.map((u) => (
                  <TR key={u.id}>
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
                        {u.is_active ? t("common.yes") : t("common.no")}
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
