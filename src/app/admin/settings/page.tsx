"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DashboardShell from "@/components/dashboardBar";
import IntlPhoneInput from "@/components/forms/IntlPhoneInput";
import { BTN, cx } from "@/components/ui-helper/buttonStyles";
import { useSession } from "@/lib/use-session";
import { getAdminNav } from "@/lib/admin-dashboard";

type TabKey = "profile" | "communication" | "security";

type SettingsForm = {
  name: string;
  email: string;
  phone: string;
  title: string;
  avatar: string;
  company: string;
  website: string;
  address: string;
  timezone: string;
  language: string;
  notifications: boolean;
  darkMode: boolean;
};

const initialForm: SettingsForm = {
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
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const tab = (params.get("tab") || "profile") as TabKey;
  const { user, loading, refresh } = useSession();

  const [form, setForm] = useState<SettingsForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

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
    if (!user) return;
    setForm({
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
    });
    setTwoFA(Boolean((user as any).twoFA));
  }, [user]);

  const tabs = useMemo(
    () =>
      [
        { key: "profile", label: "Profile" },
        { key: "communication", label: "Communication" },
        { key: "security", label: "Security" },
      ] satisfies { key: TabKey; label: string }[],
    []
  );

  function goTab(next: TabKey) {
    const usp = new URLSearchParams(params.toString());
    usp.set("tab", next);
    router.push(`${pathname}?${usp.toString()}`);
  }

  async function saveSettings(
    payload: Partial<SettingsForm>,
    successMessage: string
  ) {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || "Failed to update settings.");
      }
      setMsg(successMessage);
      refresh?.();
    } catch (error: any) {
      setMsg(error.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  }

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setMsg("Name is required.");
      return;
    }
    if (!form.email.trim()) {
      setMsg("Email is required.");
      return;
    }

    await saveSettings(
      {
        name: form.name.trim(),
        phone: form.phone.trim(),
        title: form.title.trim(),
        avatar: form.avatar.trim(),
        company: form.company.trim(),
        website: form.website.trim(),
        address: form.address.trim(),
        timezone: form.timezone.trim(),
      },
      "Profile updated."
    );
  }

  async function onSaveCommunication(e: React.FormEvent) {
    e.preventDefault();
    if (!form.language.trim()) {
      setMsg("Language is required.");
      return;
    }

    await saveSettings(
      {
        language: form.language,
        notifications: form.notifications,
        darkMode: form.darkMode,
      },
      "Communication settings updated."
    );
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg(null);
    setPwdOk(null);

    if (!currentPwd) {
      setPwdMsg("Current password is required.");
      return;
    }
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
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPwd,
          newPassword: newPwd,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || "Failed to change password.");
      }
      setPwdMsg("Password updated.");
      setPwdOk(true);
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (error: any) {
      setPwdMsg(error.message || "Failed to change password.");
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
      const res = await fetch("/api/admin/security/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || "Failed to update 2FA.");
      }
      setTwoFAMsg(next ? "Two-factor enabled." : "Two-factor disabled.");
      setTwoFAOk(true);
      refresh?.();
    } catch (error: any) {
      setTwoFAMsg(error.message || "Failed to update 2FA.");
      setTwoFAOk(false);
      setTwoFA(!next);
    }
  }

  if (loading) return null;

  return (
    <DashboardShell
      user={{
        name: user?.name || user?.email || "Admin",
        email: user?.email,
        role: (user?.role as any) || "admin",
      }}
      title="Settings"
      nav={getAdminNav(user?.role)}
    >
    <div className="mx-auto max-w-2xl py-2">
      <h2 className="mb-4 text-xl font-bold">Settings</h2>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => goTab(item.key)}
            className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
              tab === item.key
                ? "bg-black text-white"
                : "bg-white text-gray-900 hover:bg-gray-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <form onSubmit={onSaveProfile} className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              value={form.name}
              onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
              placeholder="Name"
              className="rounded-xl border p-3"
              required
            />
            <input
              value={form.email}
              readOnly
              placeholder="Email"
              className="rounded-xl border bg-gray-100 p-3 text-gray-500"
            />
          </div>

          <IntlPhoneInput
            value={form.phone}
            onChange={(value) => setForm((current) => ({ ...current, phone: value }))}
          />

          <input
            value={form.title}
            onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
            placeholder="Title"
            className="rounded-xl border p-3"
          />
          <input
            value={form.company}
            onChange={(e) => setForm((current) => ({ ...current, company: e.target.value }))}
            placeholder="Company"
            className="rounded-xl border p-3"
          />
          <input
            value={form.website}
            onChange={(e) => setForm((current) => ({ ...current, website: e.target.value }))}
            placeholder="Website"
            className="rounded-xl border p-3"
          />
          <input
            value={form.address}
            onChange={(e) => setForm((current) => ({ ...current, address: e.target.value }))}
            placeholder="Address"
            className="rounded-xl border p-3"
          />
          <input
            value={form.timezone}
            onChange={(e) => setForm((current) => ({ ...current, timezone: e.target.value }))}
            placeholder="Timezone"
            className="rounded-xl border p-3"
          />

          <button
            type="submit"
            className={cx(BTN.primary, saving && "cursor-not-allowed opacity-70")}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save profile"}
          </button>

          {msg && (
            <div className={msg === "Profile updated." ? "text-emerald-700" : "text-red-600"}>
              {msg}
            </div>
          )}
        </form>
      )}

      {tab === "communication" && (
        <form onSubmit={onSaveCommunication} className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <select
              value={form.language}
              onChange={(e) => setForm((current) => ({ ...current, language: e.target.value }))}
              className="rounded-xl border p-3"
            >
              <option value="en">English</option>
              <option value="yo">Yoruba</option>
              <option value="ha">Hausa</option>
              <option value="ig">Igbo</option>
              <option value="pcm">Nigerian Pidgin</option>
            </select>

            <label className="flex items-center gap-2 rounded-xl border p-3">
              <input
                type="checkbox"
                checked={form.notifications}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    notifications: e.target.checked,
                  }))
                }
              />
              Email notifications
            </label>
          </div>

          <label className="flex w-max items-center gap-2 rounded-xl border p-3">
            <input
              type="checkbox"
              checked={form.darkMode}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  darkMode: e.target.checked,
                }))
              }
            />
            Dark mode
          </label>

          <button
            type="submit"
            className="cursor-pointer rounded-xl bg-white px-4 py-3 font-medium text-gray-700 hover:opacity-90 disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save communication settings"}
          </button>

          {msg && (
            <div
              className={
                msg === "Communication settings updated."
                  ? "text-emerald-700"
                  : "text-red-600"
              }
            >
              {msg}
            </div>
          )}
        </form>
      )}

      {tab === "security" && (
        <div className="grid gap-8">
          <form onSubmit={onChangePassword} className="grid max-w-md gap-3">
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
              {pwdBusy ? "Updating..." : "Update password"}
            </button>
            {pwdMsg && (
              <div className={pwdOk ? "text-emerald-700" : "text-red-600"}>
                {pwdMsg}
              </div>
            )}
          </form>

          <div className="grid max-w-md gap-3">
            <div className="text-sm font-semibold">Two-factor authentication</div>
            <label className="flex w-max items-center gap-2 rounded-xl border p-3">
              <input type="checkbox" checked={twoFA} onChange={onToggle2FA} />
              Enable 2FA
            </label>
            {twoFAMsg && (
              <div className={twoFAOk ? "text-emerald-700" : "text-red-600"}>
                {twoFAMsg}
              </div>
            )}
            <p className="text-xs text-gray-600">
              When enabled, you'll be asked for a one-time code at sign-in.
              Hook this up to your TOTP or SMS provider.
            </p>
          </div>
        </div>
      )}
    </div>
    </DashboardShell>
  );
}
