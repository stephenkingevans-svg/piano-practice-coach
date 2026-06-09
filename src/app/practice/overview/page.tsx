"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PracticeOverview() {
  const [scales, setScales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDailyScales();
  }, []);

  async function loadDailyScales() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("scale_items")
      .select("*")
      .order("successful_sessions_at_current_tempo", {
        ascending: true,
      })
      .order("last_practiced", {
        ascending: true,
        nullsFirst: true,
      })
      .limit(3);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setScales(data || []);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <section className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="text-4xl font-bold">
            Today's Practice
          </h1>

          <p className="text-zinc-600">
            Your daily session has been generated.
          </p>
        </header>

        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Scales Due Today
          </h2>

          {loading && (
            <p className="text-zinc-500">
              Loading scales...
            </p>
          )}

          {!loading && scales.length === 0 && (
            <p className="text-zinc-500">
              No scales found.
            </p>
          )}

          <div className="space-y-3">
            {scales.map((scale) => (
              <div
                key={scale.id}
                className="rounded-lg bg-zinc-100 p-4"
              >
                <div className="font-medium text-lg">
                  {scale.name}
                </div>

                <div className="text-sm text-zinc-600">
                  Current Tempo: {scale.current_tempo} BPM
                </div>

                <div className="text-sm text-zinc-600">
                  Target Tempo: {scale.abrsm_target_tempo} BPM
                </div>

                <div className="text-sm text-zinc-600">
                  Successful Sessions At Current Tempo:{" "}
                  {scale.successful_sessions_at_current_tempo}
                </div>

                <div className="text-sm text-zinc-600">
                  Last Practised:{" "}
                  {scale.last_practiced
                    ? new Date(scale.last_practiced).toLocaleDateString()
                    : "Never"}
                </div>
              </div>
            ))}
          </div>
        </div>

        <a
          href="/practice/session"
          className="block w-full rounded-xl bg-black py-4 text-center text-white font-semibold"
        >
          Begin Session
        </a>
      </section>
    </main>
  );
}