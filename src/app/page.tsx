export default function Home() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <section className="mx-auto max-w-md space-y-6">
        <header>
          <h1 className="text-3xl font-bold">
            Piano Practice Coach
          </h1>

          <p className="mt-1 text-zinc-600">
            Supabase connection test
          </p>
        </header>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Connection Status
          </h2>

          <p className="mt-4 text-zinc-700">
            Supabase URL:
          </p>

          <p className="mt-2 break-all rounded-lg bg-zinc-100 p-3 text-sm">
            {supabaseUrl ?? "Missing"}
          </p>

          <p className="mt-4 text-sm text-zinc-500">
            If you can see your Supabase URL above,
            the environment file is loading correctly.
          </p>
        </div>
      </section>
    </main>
  );
}