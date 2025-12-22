import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function AdminPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const token = typeof searchParams.token === "string" ? searchParams.token : "";
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return (
      <main className="p-10">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="mt-2 text-zinc-600">Unauthorized. Add ?token=YOUR_ADMIN_TOKEN</p>
      </main>
    );
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("bookings")
    .select("id,created_at,booking_type,address_text,estimate_shown,status,scheduled_date,scheduled_window")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return <main className="p-10">Error: {error.message}</main>;
  }

  return (
    <main className="p-10">
      <h1 className="text-2xl font-semibold">Bookings</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Address</th>
              <th className="px-4 py-3 text-left">When</th>
              <th className="px-4 py-3 text-left">Estimate</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((b) => (
              <tr key={b.id} className="border-t">
                <td className="px-4 py-3">{new Date(b.created_at).toLocaleString()}</td>
                <td className="px-4 py-3">{b.booking_type}</td>
                <td className="px-4 py-3">{b.address_text}</td>
                <td className="px-4 py-3">{b.scheduled_date ? `${b.scheduled_date} (${b.scheduled_window ?? ""})` : "—"}</td>
                <td className="px-4 py-3">${b.estimate_shown}</td>
                <td className="px-4 py-3">{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
