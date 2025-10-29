// ================================
// FILE: src/app/admin/leads/page.tsx
// ================================
import dbConnect from "@/lib/db-connect";
import PilotRequest from "@/model/pilot-request";
import { revalidatePath } from "next/cache";
import { getAdminFromCookies } from "@/lib/admin-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

type PilotDoc = {
  _id: unknown;
  name: string;
  email: string;
  company: string;
  message?: string;
  handled?: boolean;
  createdAt: Date | string | number;
};

type Lead = {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  handled: boolean;
  createdAt: string; // ISO
};

async function getLeads(): Promise<Lead[]> {
  await dbConnect();
  const docs = (await PilotRequest.find({})
    .sort({ createdAt: -1 })
    .lean()) as unknown as PilotDoc[];
  return docs.map((d) => ({
    id: String(d._id),
    name: d.name,
    email: d.email,
    company: d.company,
    message: d.message ?? "",
    handled: Boolean(d.handled),
    createdAt: new Date(d.createdAt).toISOString(),
  }));
}

// server action to toggle handled
async function toggleHandled(id: string) {
  "use server";
  await dbConnect();
  const doc = await PilotRequest.findById(id);
  if (!doc) return;
  doc.handled = !doc.handled;
  await doc.save();
  revalidatePath("/admin/leads");
}

// server action to sign out
async function logout() {
  "use server";
  const jar = await cookies(); // <-- await on Next 15+
  // Clear both legacy and unified auth cookies
  jar.set("admin_token", "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });
  jar.set("token", "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });
  redirect("/zuri/start/login?role=client");
}

export default async function AdminLeadsPage() {
  // 🔒 Enforce auth on the server
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/admin/login");

  const leads = await getLeads();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pilot Requests</h1>

        <form action={logout}>
          <button className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 cursor-pointer">
            Sign out
          </button>
        </form>
      </div>

      <p className="mt-1 text-sm text-gray-600">
        Total: {leads.length}. Protected by custom admin login.
      </p>

      <div className="mt-6 grid gap-4">
        {leads.map((l) => (
          <form
            key={l.id}
            action={async () => {
              "use server";
              await toggleHandled(l.id);
            }}
            className="rounded-2xl border p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold">{l.company}</div>
                <div className="text-sm text-gray-600">
                  {l.name} &lt;{l.email}&gt; •{" "}
                  {new Date(l.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                className={`rounded-lg px-3 py-1 text-sm font-medium ${
                  l.handled ? "bg-green-600 text-white" : "bg-black text-white"
                }`}
              >
                {l.handled ? "Handled" : "Mark handled"}
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-800 whitespace-pre-wrap">
              {l.message}
            </p>
          </form>
        ))}
      </div>
    </div>
  );
}
