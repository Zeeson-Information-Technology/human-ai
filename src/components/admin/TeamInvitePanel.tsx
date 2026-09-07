"use client";

import { useEffect, useMemo, useState } from "react";
import BrandLoader from "@/components/brand-loader";
import PremiumToast from "@/components/feedback/PremiumToast";
import { useTimedToast } from "@/components/feedback/useTimedToast";
import PremiumSelect from "@/components/forms/PremiumSelect";
import { useSession } from "@/lib/use-session";
import { cx, BTN } from "@/components/ui-helper/buttonStyles";

type TeamMember = {
  _id: string;
  email?: string;
  role?: string;
  name?: string;
  accessRevokedAt?: string | null;
  permissions?: {
    canCreateOpportunity?: boolean;
    canManageInquiries?: boolean;
  };
};

type ConfirmState =
  | null
  | {
      action: "revoke" | "delete" | "reinvite";
      member: TeamMember;
    };

type PermissionState =
  | null
  | {
      member: TeamMember;
      canCreateOpportunity: boolean;
      canManageInquiries: boolean;
    };

export default function TeamInvitePanel() {
  const { user } = useSession();
  const [subUsers, setSubUsers] = useState<TeamMember[]>([]);
  const [invite, setInvite] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "staff",
  });
  const [inviteBusy, setInviteBusy] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [permissionModal, setPermissionModal] = useState<PermissionState>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [permissionBusyFor, setPermissionBusyFor] = useState<string | null>(null);
  const { toast, showToast } = useTimedToast();

  async function fetchSubUsers() {
    if (user?.role !== "company" && user?.role !== "admin") return;
    const res = await fetch("/api/admin/sub-users", { cache: "no-store" });
    if (res.ok) {
      const j = await res.json().catch(() => ({}));
      setSubUsers(j.users || []);
    }
  }

  useEffect(() => {
    fetchSubUsers();
  }, [user]);

  function isEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v.trim());
  }

  const ALLOWED_ROLES = ["staff", "admin"] as const;

  async function onInvite(e: React.FormEvent) {
    e.preventDefault();
    if (inviteBusy) return;

    if (!invite.email.trim()) {
      showToast("Email is required.", "error");
      return;
    }
    if (!invite.firstName.trim() || !invite.lastName.trim()) {
      showToast("First name and last name are required.", "error");
      return;
    }
    if (!isEmail(invite.email)) {
      showToast("Enter a valid email.", "error");
      return;
    }
    if (!invite.role || !ALLOWED_ROLES.includes(invite.role as any)) {
      showToast("Select a valid role.", "error");
      return;
    }

    setInviteBusy(true);
    try {
      const res = await fetch("/api/admin/sub-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invite),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j?.ok === false) {
        throw new Error(j?.error || "Failed to invite user.");
      }

      setInvite({ firstName: "", lastName: "", email: "", role: "staff" });
      showToast(j?.resent ? "Invite sent again." : "User invited.", "success");
      setSubUsers(j.users || subUsers);
    } catch (err: any) {
      showToast(err.message || "Failed to invite user.", "error");
    } finally {
      setInviteBusy(false);
    }
  }

  async function handleMemberAction() {
    if (!confirm) return;
    setActionBusy(true);
    try {
      let res: Response;
      if (confirm.action === "revoke") {
        res = await fetch("/api/admin/sub-users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: confirm.member._id,
            action: "revoke",
          }),
        });
      } else if (confirm.action === "reinvite") {
        res = await fetch("/api/admin/sub-users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: confirm.member._id,
            action: "reinvite",
          }),
        });
      } else {
        res = await fetch(
          `/api/admin/sub-users?userId=${encodeURIComponent(confirm.member._id)}`,
          {
            method: "DELETE",
          }
        );
      }

      const j = await res.json().catch(() => ({}));
      if (!res.ok || j?.ok === false) {
        throw new Error(j?.error || "Action failed.");
      }
      setSubUsers(j.users || []);
      showToast(
        confirm.action === "revoke"
          ? "Access revoked and email sent."
          : confirm.action === "reinvite"
            ? "Invite sent again and access restored."
            : "User deleted and email sent.",
        "success"
      );
      setConfirm(null);
    } catch (err: any) {
      showToast(err.message || "Action failed.", "error");
    } finally {
      setActionBusy(false);
    }
  }

  async function updatePermissions(
    member: TeamMember,
    permissions: { canCreateOpportunity: boolean; canManageInquiries: boolean }
  ) {
    setPermissionBusyFor(member._id);
    try {
      const res = await fetch("/api/admin/sub-users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: member._id,
          action: "update_permissions",
          permissions,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j?.ok === false) {
        throw new Error(j?.error || "Failed to update permissions.");
      }
      setSubUsers((current) => {
        if (Array.isArray(j.users) && j.users.length) {
          return j.users;
        }
        return current.map((item) =>
          item._id === member._id
            ? {
                ...item,
                permissions: {
                  canCreateOpportunity: permissions.canCreateOpportunity,
                  canManageInquiries: permissions.canManageInquiries,
                },
              }
            : item
        );
      });
      showToast("Permissions updated.", "success");
      return true;
    } catch (err: any) {
      showToast(err.message || "Failed to update permissions.", "error");
      return false;
    } finally {
      setPermissionBusyFor(null);
    }
  }

  async function savePermissionModal() {
    if (!permissionModal) return;
    const ok = await updatePermissions(permissionModal.member, {
      canCreateOpportunity: permissionModal.canCreateOpportunity,
      canManageInquiries: permissionModal.canManageInquiries,
    });
    if (ok) setPermissionModal(null);
  }

  const totalMembers = useMemo(() => subUsers.length + 1, [subUsers.length]);

  if (!user || user.role !== "admin") return null;

  return (
    <>
      {toast && <PremiumToast message={toast.msg} type={toast.type} />}
      {inviteBusy && <BrandLoader label="Sending team invite..." />}

      <div className="mt-6 rounded-2xl border p-4">
        <div className="text-sm font-medium">Team Access</div>
        <p className="mt-1 text-sm text-gray-600">
          Invite staff or another admin directly from operations. Staff only sees
          assigned client work.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={cx(BTN.outline)}
            onClick={() => {
              setShowInviteForm((prev) => !prev);
            }}
          >
            {showInviteForm ? "Close invite" : "Add team member"}
          </button>
        </div>

        {showInviteForm && (
          <form
            onSubmit={onInvite}
            className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
          >
            <input
              value={invite.firstName}
              onChange={(e) =>
                setInvite((i) => ({ ...i, firstName: e.target.value }))
              }
              placeholder="First name"
              className="rounded-xl border p-3 sm:w-[180px]"
              required
              disabled={inviteBusy}
            />

            <input
              value={invite.lastName}
              onChange={(e) =>
                setInvite((i) => ({ ...i, lastName: e.target.value }))
              }
              placeholder="Last name"
              className="rounded-xl border p-3 sm:w-[180px]"
              required
              disabled={inviteBusy}
            />

            <input
              value={invite.email}
              onChange={(e) =>
                setInvite((i) => ({ ...i, email: e.target.value }))
              }
              placeholder="Invite email"
              className="flex-1 rounded-xl border p-3 sm:min-w-[240px]"
              type="email"
              required
              disabled={inviteBusy}
            />

            <div className="sm:w-[240px]">
              <PremiumSelect
                value={invite.role}
                onChange={(e) =>
                  setInvite((i) => ({ ...i, role: e.target.value }))
                }
                wrapperClassName="group relative inline-block w-full rounded-3xl ring-1 ring-neutral-200 shadow-sm hover:shadow transition"
                className="rounded-3xl px-4 py-3 pr-10 text-sm"
                appearance="light"
                disabled={inviteBusy}
              >
                <option value="staff">Staff - Assigned work only</option>
                <option value="admin">Admin - Full operations access</option>
              </PremiumSelect>
            </div>

            <button
              type="submit"
              className={cx(
                BTN.outline,
                inviteBusy && "opacity-60 cursor-not-allowed"
              )}
              disabled={inviteBusy}
            >
              {inviteBusy ? "Inviting..." : "Send invite"}
            </button>
          </form>
        )}

        <div className="mt-4 rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-gray-500">Team members</div>
            <div className="text-xs text-gray-500">{totalMembers} total</div>
          </div>

          <ul className="mt-3 divide-y divide-gray-100">
            <TeamRow email={user.email} role={user.role} isYou />
            {subUsers.map((member) => (
              <TeamRow
                key={member._id}
              email={member.email}
              role={member.role}
              name={member.name}
              revoked={Boolean(member.accessRevokedAt)}
              permissions={member.permissions}
              permissionBusy={permissionBusyFor === member._id}
              onOpenPermissions={() =>
                setPermissionModal({
                  member,
                  canCreateOpportunity: Boolean(
                    member.permissions?.canCreateOpportunity
                  ),
                  canManageInquiries:
                    member.permissions?.canManageInquiries !== false,
                })
              }
              onReinvite={() => setConfirm({ action: "reinvite", member })}
              onRevoke={() => setConfirm({ action: "revoke", member })}
              onDelete={() => setConfirm({ action: "delete", member })}
            />
            ))}
          </ul>
        </div>

        {confirm && (
          <ConfirmModal
          title={
            confirm.action === "revoke"
              ? "Revoke access?"
              : confirm.action === "reinvite"
                ? "Send invite again?"
              : "Delete team member?"
          }
          description={
            confirm.action === "revoke"
              ? `This will block ${memberLabel(confirm.member)} from logging in and send them an email notification.`
              : confirm.action === "reinvite"
                ? `This will send a new onboarding email to ${memberLabel(confirm.member)} and restore their access.`
              : `This will permanently delete ${memberLabel(confirm.member)} and send them an email notification.`
          }
          confirmLabel={
            confirm.action === "revoke"
              ? "Revoke access"
              : confirm.action === "reinvite"
                ? "Send invite again"
                : "Delete user"
          }
          busy={actionBusy}
          destructive={confirm.action === "delete"}
            onCancel={() => (actionBusy ? undefined : setConfirm(null))}
            onConfirm={handleMemberAction}
          />
        )}

        {permissionModal && (
          <PermissionModal
            member={permissionModal.member}
            busy={permissionBusyFor === permissionModal.member._id}
            canCreateOpportunity={permissionModal.canCreateOpportunity}
            canManageInquiries={permissionModal.canManageInquiries}
            onChange={(next) =>
              setPermissionModal((current) =>
                current
                  ? {
                      ...current,
                      ...next,
                    }
                  : current
              )
            }
            onCancel={() =>
              permissionBusyFor === permissionModal.member._id
                ? undefined
                : setPermissionModal(null)
            }
            onSave={savePermissionModal}
          />
        )}
      </div>
    </>
  );
}

function initialsFromEmail(email?: string) {
  const e = (email || "").trim();
  if (!e) return "--";
  const namePart = e.split("@")[0] || "";
  const tokens = namePart.split(/[.\-_]/).filter(Boolean);
  if (tokens.length >= 2) return (tokens[0][0] + tokens[1][0]).toUpperCase();
  return namePart.slice(0, 2).toUpperCase();
}

function roleLabel(role?: string) {
  if (!role) return "Member";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function memberLabel(member: TeamMember) {
  return member.name?.trim() || member.email || "this team member";
}

function TeamRow({
  email,
  role,
  name,
  isYou,
  revoked,
  permissions,
  permissionBusy,
  onOpenPermissions,
  onReinvite,
  onRevoke,
  onDelete,
}: {
  email?: string;
  role?: string;
  name?: string;
  isYou?: boolean;
  revoked?: boolean;
  permissions?: {
    canCreateOpportunity?: boolean;
    canManageInquiries?: boolean;
  };
  permissionBusy?: boolean;
  onOpenPermissions?: () => void;
  onReinvite?: () => void;
  onRevoke?: () => void;
  onDelete?: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white text-xs font-semibold">
          {initialsFromEmail(email)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm text-gray-900">
            {name || email || "-"}
          </div>
          <div className="truncate text-xs text-gray-500">{email || "-"}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-700">
              {roleLabel(role)}
            </span>
            {revoked && (
              <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-red-700">
                Revoked
              </span>
            )}
            {isYou && <span className="text-[10px] text-gray-500">(You)</span>}
          </div>
          {role === "staff" && !isYou && (
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 ${
                  permissions?.canCreateOpportunity
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-gray-50 text-gray-600"
                }`}
              >
                {permissions?.canCreateOpportunity
                  ? "Can create opportunities"
                  : "Cannot create opportunities"}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 ${
                  permissions?.canManageInquiries !== false
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-gray-50 text-gray-600"
                }`}
              >
                {permissions?.canManageInquiries !== false
                  ? "Can manage inquiries"
                  : "Cannot manage inquiries"}
              </span>
              {permissionBusy && <span className="text-gray-500">Saving...</span>}
            </div>
          )}
        </div>
      </div>
      {!isYou && (
        <div className="flex items-center gap-2">
          {role === "staff" && (
            <button
              type="button"
              onClick={onOpenPermissions}
              className="cursor-pointer rounded-lg border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 transition hover:bg-sky-100"
            >
              Permissions
            </button>
          )}
          {revoked ? (
            <button
              type="button"
              onClick={onReinvite}
              className="cursor-pointer rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
            >
              Re-invite
            </button>
          ) : (
            <button
              type="button"
              onClick={onRevoke}
              className="cursor-pointer rounded-lg border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 transition hover:bg-amber-100"
            >
              Revoke
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      )}
    </li>
  );
}

function PermissionModal({
  member,
  canCreateOpportunity,
  canManageInquiries,
  onChange,
  onCancel,
  onSave,
  busy,
}: {
  member: TeamMember;
  canCreateOpportunity: boolean;
  canManageInquiries: boolean;
  onChange: (next: {
    canCreateOpportunity?: boolean;
    canManageInquiries?: boolean;
  }) => void;
  onCancel: () => void;
  onSave: () => void;
  busy?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900">
          Team member permissions
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Review and update access for {memberLabel(member)}.
        </p>

        <div className="mt-5 grid gap-3">
          <label className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200 p-4">
            <div>
              <div className="text-sm font-medium text-gray-900">
                Create opportunities
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Allow this team member to open new opportunities directly from
                the admin area.
              </div>
            </div>
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-emerald-600"
              checked={canCreateOpportunity}
              disabled={busy}
              onChange={(e) =>
                onChange({ canCreateOpportunity: e.target.checked })
              }
            />
          </label>

          <label className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200 p-4">
            <div>
              <div className="text-sm font-medium text-gray-900">
                Manage inquiries
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Allow this team member to open and work through assigned
                proposal inquiries.
              </div>
            </div>
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-emerald-600"
              checked={canManageInquiries}
              disabled={busy}
              onChange={(e) =>
                onChange({ canManageInquiries: e.target.checked })
              }
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={busy}
            className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:bg-gray-900 disabled:opacity-60"
          >
            {busy ? "Saving..." : "Save permissions"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
  busy,
  destructive,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
  destructive?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-xl px-4 py-2 text-sm text-white disabled:opacity-60 ${
              destructive ? "bg-red-600 hover:bg-red-700" : "bg-black hover:bg-gray-900"
            }`}
          >
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
