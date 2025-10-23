// src/app/admin/settings/page.tsx
"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/use-session";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { cx, BTN } from "@/components/ui-helper/buttonStyles";
import IntlPhoneInput from "@/components/forms/IntlPhoneInput";

type TabKey = "profile" | "communication" | "security";

export default function AdminSettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const tab = (params.get("tab") || "profile") as TabKey;

  const { user, loading, refresh } = useSession();

  // Base form model
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    avatar: "",
    company: "",
    website: "",
    address: "",
    timezone: "",
    language: "en",
    notifications: true,
    darkMode: false,
  });
  const digits = (s: string) => s.replace(/\D+/g, "");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Security sub-form states
  const [pwdBusy, setPwdBusy] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [pwdOk, setPwdOk] = useState<boolean | null>(null);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [twoFA, setTwoFA] = useState(false);
  const [twoFAMsg, setTwoFAMsg] = useState<string | null>(null);
  const [twoFAOk, setTwoFAOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.name || "",
        email: user.email || "",
        phone: (user as any).phone || "",
        title: (user as any).title || "",
        avatar: user.avatar?.url || "",
        company: (user as any).company || "",
        website: (user as any).website || "",
        address: (user as any).address || "",
        timezone: (user as any).timezone || "",
        language: (user as any).language || "en",
        notifications:
          typeof (user as any).notifications === "boolean"
            ? (user as any).notifications
            : true,
        darkMode:
          typeof (user as any).darkMode === "boolean"
            ? (user as any).darkMode
            : false,
      }));
      // If you persist twoFA on user, prefill here:
      setTwoFA(Boolean((user as any).twoFA));
    }
  }, [user]);

  const tabs: { key: TabKey; label: string }[] = useMemo(
    () => [
      { key: "profile", label: "Profile" },
      { key: "communication", label: "Communication" },
      { key: "security", label: "Security" },
    ],
    []
  );

  function goTab(next: TabKey) {
    const usp = new URLSearchParams(params);
    usp.set("tab", next);
    router.push(`${pathname}?${usp.toString()}`);
  }

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    // Validation
    if (!form.name.trim()) {
      setMsg("Name is required.");
      setSaving(false);
      return;
    }
    if (!form.email.trim()) {
      setMsg("Email is required.");
      setSaving(false);
      return;
    }
    // Add more field validations as needed

    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        title: form.title,
        avatar: form.avatar,
        company: form.company,
        website: form.website,
        address: form.address,
        timezone: form.timezone,
      };
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      setMsg("Profile updated!");
      refresh?.();
    } catch (err: any) {
      setMsg(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function onSaveCommunication(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    // Validation
    if (!form.language) {
      setMsg("Language is required.");
      setSaving(false);
      return;
    }
    // ...existing code...
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg(null);
    setPwdOk(null);
    if (!newPwd || newPwd.length < 6) {
      setPwdMsg("New password must be at least 6 characters.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg("Passwords do not match.");
      return;
    }
    setPwdBusy(true);
    try {
      // Adjust to your actual change-password endpoint/signature
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPwd,
          newPassword: newPwd,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j?.ok === false) {
        throw new Error(j?.error || "Failed to change password");
      }
      setPwdMsg("Password updated.");
      setPwdOk(true);
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err: any) {
      setPwdMsg(err.message || "Failed to change password.");
      setPwdOk(false);
    } finally {
      setPwdBusy(false);
    }
  }

  async function onToggle2FA(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.checked;
    setTwoFA(next);
    setTwoFAMsg(null);
    setTwoFAOk(null);
    try {
      // Wire to your real 2FA setup/disable endpoints
      const res = await fetch("/api/admin/security/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j?.ok === false) {
        throw new Error(j?.error || "Failed to update 2FA");
      }
      setTwoFAMsg(next ? "Two-factor enabled." : "Two-factor disabled.");
      setTwoFAOk(true);
      refresh?.();
    } catch (err: any) {
      setTwoFAMsg(err.message || "Failed to update 2FA.");
      setTwoFAOk(false);
      setTwoFA(!next); // revert on failure
    }
  }

  if (loading) return null;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-xl font-bold mb-4">Admin Settings</h2>

      {/* Tab bar */}
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => goTab(t.key)}
            className={`rounded-full border px-3 py-1 text-sm cursor-pointer ${
              tab === t.key
                ? "bg-black text-white"
                : "bg-white text-gray-900 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <form onSubmit={onSaveProfile} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Name"
              className="rounded-xl border p-3"
              required
            />
            <input
              value={form.email}
              readOnly
              placeholder="Email"
              className="rounded-xl border p-3 bg-gray-100 text-gray-500"
            />
          </div>
          <IntlPhoneInput
            value={form.phone}
            onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
          />

          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="Phone"
            className="rounded-xl border p-3"
          />

          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Title"
            className="rounded-xl border p-3"
          />

          <input
            value={form.company}
            onChange={(e) =>
              setForm((f) => ({ ...f, company: e.target.value }))
            }
            placeholder="Company"
            className="rounded-xl border p-3"
          />

          <input
            value={form.website}
            onChange={(e) =>
              setForm((f) => ({ ...f, website: e.target.value }))
            }
            placeholder="Website"
            className="rounded-xl border p-3"
          />

          <input
            value={form.address}
            onChange={(e) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
            placeholder="Address"
            className="rounded-xl border p-3"
          />

          <input
            value={form.timezone}
            onChange={(e) =>
              setForm((f) => ({ ...f, timezone: e.target.value }))
            }
            placeholder="Timezone"
            className="rounded-xl border p-3"
          />

          <button
            type="submit"
            className={cx(
              BTN.primary,
              saving && "opacity-70 cursor-not-allowed"
            )}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {msg && (
            <div
              className={
                msg === "Profile updated!" ||
                msg === "Communication settings updated!"
                  ? "text-emerald-700"
                  : "text-red-600"
              }
            >
              {msg}
            </div>
          )}
        </form>
      )}

      {/* Communication tab */}
      {tab === "communication" && (
        <form onSubmit={onSaveCommunication} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <select
              value={form.language}
              onChange={(e) =>
                setForm((f) => ({ ...f, language: e.target.value }))
              }
              className="rounded-xl border p-3"
            >
              <option value="en">English</option>
              <option value="yo">Yorùbá</option>
              <option value="ha">Hausa</option>
              <option value="ig">Igbo</option>
              <option value="pcm">Nigerian Pidgin</option>
              {/* add more as needed */}
            </select>

            <label className="flex items-center gap-2 rounded-xl border p-3">
              <input
                type="checkbox"
                checked={form.notifications}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notifications: e.target.checked }))
                }
              />
              Email notifications
            </label>
          </div>

          <label className="flex items-center gap-2 rounded-xl border p-3 w-max">
            <input
              type="checkbox"
              checked={form.darkMode}
              onChange={(e) =>
                setForm((f) => ({ ...f, darkMode: e.target.checked }))
              }
            />
            Dark mode
          </label>

          <button
            type="submit"
            className="rounded-xl bg-white px-4 py-3 
            font-medium text-gray-700 hover:opacity-90 
            cursor-pointer disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {msg && (
            <div
              className={
                msg === "Communication settings updated!"
                  ? "text-emerald-700"
                  : "text-red-600"
              }
            >
              {msg}
            </div>
          )}
        </form>
      )}

      {/* Security tab */}
      {tab === "security" && (
        <div className="grid gap-8">
          {/* Change Password */}
          <form onSubmit={onChangePassword} className="grid gap-3 max-w-md">
            <div className="text-sm font-semibold">Change password</div>
            <input
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              placeholder="Current password"
              type="password"
              className="rounded-xl border p-3"
              autoComplete="current-password"
              disabled={pwdBusy}
            />
            <input
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="New password"
              type="password"
              className="rounded-xl border p-3"
              autoComplete="new-password"
              disabled={pwdBusy}
            />
            <input
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="Confirm new password"
              type="password"
              className="rounded-xl border p-3"
              autoComplete="new-password"
              disabled={pwdBusy}
            />
            <button
              type="submit"
              className="rounded-xl bg-black px-4 py-3 font-medium text-white disabled:opacity-60"
              disabled={pwdBusy}
            >
              {pwdBusy ? "Updating…" : "Update password"}
            </button>
            {pwdMsg && (
              <div className={pwdOk ? "text-emerald-700" : "text-red-600"}>
                {pwdMsg}
              </div>
            )}
          </form>

          {/* 2FA Toggle (stub) */}
          <div className="grid gap-3 max-w-md">
            <div className="text-sm font-semibold">
              Two-factor authentication
            </div>
            <label className="flex items-center gap-2 rounded-xl border p-3 w-max">
              <input type="checkbox" checked={twoFA} onChange={onToggle2FA} />
              Enable 2FA
            </label>
            {twoFAMsg && (
              <div className={twoFAOk ? "text-emerald-700" : "text-red-600"}>
                {twoFAMsg}
              </div>
            )}
            <p className="text-xs text-gray-600">
              When enabled, you’ll be asked for a one-time code at sign-in.
              (Hook this up to your TOTP or SMS provider.)
            </p>
          </div>

          {/* Session revocation could go here */}
          {/* <SessionsList ... /> */}
        </div>
      )}

      {/* Team management can stay under Profile, or split into a 4th tab if preferred */}
      {tab === "profile" && <TeamBlock />}
    </div>
  );
}

/** Team management block kept from your original page */
function TeamBlock() {
  const { user } = useSession();
  const [subUsers, setSubUsers] = useState<any[]>([]);
  const [invite, setInvite] = useState({ email: "", role: "recruiter" });
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);
  const [inviteOk, setInviteOk] = useState<boolean | null>(null);
  const [inviteBusy, setInviteBusy] = useState(false);

  useEffect(() => {
    async function fetchSubUsers() {
      if (user?.role !== "company" && user?.role !== "admin") return;
      const res = await fetch("/api/admin/sub-users");
      if (res.ok) {
        const j = await res.json();
        setSubUsers(j.users || []);
      }
    }
    fetchSubUsers();
  }, [user]);

  function isEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v.trim());
  }

  // IMPORTANT: keep roles in sync with your backend's allowed values.
  const ALLOWED_ROLES = ["recruiter", "manager", "admin", "company"] as const;

  async function onInvite(e: React.FormEvent) {
    e.preventDefault();
    if (inviteBusy) return;

    setInviteMsg(null);
    setInviteOk(null);

    // Validation
    if (!invite.email.trim()) {
      setInviteMsg("Email is required.");
      return;
    }
    if (!isEmail(invite.email)) {
      setInviteMsg("Enter a valid email.");
      return;
    }
    if (!invite.role || !ALLOWED_ROLES.includes(invite.role as any)) {
      setInviteMsg("Select a valid role.");
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

      // Success: clear form, refresh list, show message
      setInvite({ email: "", role: "recruiter" });
      setInviteMsg("User invited!");
      setInviteOk(true);
      setSubUsers(j.users || subUsers); // if API returns updated list
    } catch (err: any) {
      setInviteMsg(err.message || "Failed to invite user.");
      setInviteOk(false);
    } finally {
      setInviteBusy(false);
    }
  }

  const canInvite = user && ["admin", "company"].includes(user.role);

  if (!user) return null;

  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold mb-2">Manage Team</h3>

      {/* Invite form only for admin/company */}
      {canInvite && (
        <form
          onSubmit={onInvite}
          className="flex flex-col sm:flex-row gap-2 mb-4"
        >
          <input
            value={invite.email}
            onChange={(e) =>
              setInvite((i) => ({ ...i, email: e.target.value }))
            }
            placeholder="Invite email"
            className="rounded-xl border p-3 flex-1 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            type="email"
            required
            disabled={inviteBusy}
          />

          {/* Pretty select with chevron */}
          <div className="relative w-full sm:w-[220px]">
            <select
              value={invite.role}
              onChange={(e) =>
                setInvite((i) => ({ ...i, role: e.target.value }))
              }
              className="w-full appearance-none rounded-xl border p-3 pr-10 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
              disabled={inviteBusy}
            >
              {/* Keep these aligned with ALLOWED_ROLES above and your backend */}
              <option value="recruiter">Recruiter</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            {/* Chevron icon */}
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.169l3.71-2.94a.75.75 0 11.94 1.17l-4.24 3.36a.75.75 0 01-.94 0l-4.24-3.36a.75.75 0 01.02-1.02z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>

          <button
            type="submit"
            className={cx(
              BTN.outline,
              inviteBusy && "opacity-60 cursor-not-allowed"
            )}
            disabled={inviteBusy}
          >
            {inviteBusy ? "Inviting…" : "Invite"}
          </button>
        </form>
      )}

      {inviteMsg && (
        <div
          className={`mb-2 ${inviteOk ? "text-emerald-700" : "text-red-600"}`}
          role="status"
          aria-live="polite"
        >
          {inviteMsg}
        </div>
      )}

      {/* Team list card */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-gray-500">Team members</div>
          <div className="text-xs text-gray-500">
            {subUsers.length + (user ? 1 : 0)} total
          </div>
        </div>

        <ul className="mt-3 divide-y divide-gray-100">
          {user && <TeamRow email={user.email} role={user.role} isYou />}

          {subUsers.map((u) => (
            <TeamRow key={u._id} email={u.email} role={u.role} />
          ))}
        </ul>

        {(!subUsers || subUsers.length === 0) && !user && (
          <div className="text-sm text-gray-500 mt-2">No team members yet.</div>
        )}
      </div>
    </div>
  );
}

function initialsFromEmail(email?: string) {
  const e = (email || "").trim();
  if (!e) return "—";
  const namePart = e.split("@")[0] || "";
  const tokens = namePart.split(/[.\-_]/).filter(Boolean);
  if (tokens.length >= 2) return (tokens[0][0] + tokens[1][0]).toUpperCase();
  return namePart.slice(0, 2).toUpperCase();
}

function roleLabel(role?: string) {
  if (!role) return "Member";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function TeamRow({
  email,
  role,
  isYou,
}: {
  email: string;
  role: string;
  isYou?: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white text-xs font-semibold">
          {initialsFromEmail(email)}
        </div>

        {/* Email + role */}
        <div className="min-w-0">
          <div className="truncate text-sm text-gray-900">{email}</div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-700">
              {roleLabel(role)}
            </span>
            {isYou && <span className="text-[10px] text-gray-500">(You)</span>}
          </div>
        </div>
      </div>

      {/* Optional actions (future) */}
      {/* <button className="text-xs text-gray-500 hover:text-gray-700">Manage</button> */}
    </li>
  );
}
