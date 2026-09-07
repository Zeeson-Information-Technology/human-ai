"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import PremiumToast from "@/components/feedback/PremiumToast";
import { useTimedToast } from "@/components/feedback/useTimedToast";
import { BTN, cx } from "@/components/ui-helper/buttonStyles";

type ClientRow = {
  id: string;
  name: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  createdAt?: string;
};

const EMPTY_FORM = {
  name: "",
  primaryContactName: "",
  primaryContactEmail: "",
  notes: "",
};

export default function ClientsPanel() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const { toast, showToast } = useTimedToast();

  async function loadClients() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/clients", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to load clients.");
      }
      setClients(data.clients || []);
    } catch (error: any) {
      showToast(error?.message || "Failed to load clients.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadClients();
  }, []);

  async function createClient(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast("Client name is required.", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          primaryContactName: form.primaryContactName.trim(),
          primaryContactEmail: form.primaryContactEmail.trim(),
          notes: form.notes.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to create client.");
      }

      setForm(EMPTY_FORM);
      await loadClients();
      showToast(data?.reused ? "Client reused." : "Client created.", "success");
    } catch (error: any) {
      showToast(error?.message || "Failed to create client.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {toast ? <PremiumToast message={toast.msg} type={toast.type} /> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <form
          onSubmit={createClient}
          className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-lg backdrop-blur"
        >
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/45">
            New client
          </div>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Create a client record
          </h2>
          <p className="mt-2 text-sm text-white/65">
            Add the client now so it appears in opportunity intake later.
          </p>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm text-white/85">
              Client name
              <input
                value={form.name}
                onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                placeholder="e.g. Olade Consulting"
                className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/10"
              />
            </label>
            <label className="grid gap-2 text-sm text-white/85">
              Primary contact name
              <input
                value={form.primaryContactName}
                onChange={(e) =>
                  setForm((current) => ({ ...current, primaryContactName: e.target.value }))
                }
                placeholder="e.g. Ibrahim Saliman"
                className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/10"
              />
            </label>
            <label className="grid gap-2 text-sm text-white/85">
              Primary contact email
              <input
                value={form.primaryContactEmail}
                onChange={(e) =>
                  setForm((current) => ({ ...current, primaryContactEmail: e.target.value }))
                }
                placeholder="client@company.com"
                type="email"
                className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/10"
              />
            </label>
            <label className="grid gap-2 text-sm text-white/85">
              Notes
              <textarea
                value={form.notes}
                onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))}
                placeholder="Optional internal notes"
                className="min-h-[120px] rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/10"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className={cx(
                BTN.primary,
                "rounded-xl px-4 py-2 text-sm",
                saving && "cursor-not-allowed opacity-60"
              )}
            >
              {saving ? "Saving..." : "Create client"}
            </button>
            <Link
              href="/admin/opportunities/new"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
            >
              Create opportunity
            </Link>
          </div>
        </form>

        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-lg backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/45">
                Clients
              </div>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Available client records
              </h2>
            </div>
            <div className="text-sm text-white/60">
              {clients.length} record{clients.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">
                Loading clients...
              </div>
            ) : clients.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">
                No clients yet. Create the first client on the left.
              </div>
            ) : (
              clients.map((client) => (
                <div
                  key={client.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold text-white">
                        {client.name}
                      </div>
                      <div className="mt-1 text-sm text-white/65">
                        {client.primaryContactName || "Primary contact not set"}
                        {client.primaryContactEmail
                          ? ` • ${client.primaryContactEmail}`
                          : ""}
                      </div>
                    </div>
                    <Link
                      href={`/admin/opportunities/new?clientId=${encodeURIComponent(client.id)}`}
                      className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
                    >
                      Use in opportunity
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
