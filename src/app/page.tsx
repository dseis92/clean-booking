import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-bold tracking-tight">Cleaning Booking</h1>
        <p className="mt-3 text-zinc-600">
          Instant estimate + fast booking. Residential + Commercial.
        </p>
        <div className="mt-8 flex gap-3">
          <Link className="rounded-xl bg-zinc-900 px-5 py-3 text-white" href="/book">
            Book now
          </Link>
        </div>
      </div>
    </main>
  );
}
