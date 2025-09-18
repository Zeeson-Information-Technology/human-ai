// /src/app/admin/leads/page.tsx
import dbConnect from "@/lib/db-connect";
import PilotRequest from "@/model/pilot-request";
import { revalidatePath } from "next/cache";

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

  // Type the lean() result so .map() receives a known shape
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

export default async function AdminLeadsPage() {
  const leads = await getLeads();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Pilot Requests</h1>
      <p className="mt-1 text-sm text-gray-600">
        Total: {leads.length}. Protected via basic auth.
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
