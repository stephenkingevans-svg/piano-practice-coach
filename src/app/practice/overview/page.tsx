"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PracticeOverview() {
  const [scales, setScales] = useState<any[]>([]);
  const [currentScaleGrade, setCurrentScaleGrade] = useState("Grade 1");
  const [playingLevel, setPlayingLevel] = useState("Grade 3");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDailyScales();
  }, []);

  async function loadDailyScales() {
    const supabase = createClient();

    const { data: settings } = await supabase
      .from("app_settings")
      .select("*")
      .limit(1)
      .single();

    const scaleGrade = settings?.current_scale_grade || "Grade 1";
    const level = settings?.playing_level || "Grade 3";

    setCurrentScaleGrade(scaleGrade);
    setPlayingLevel(level);

    const { data, error } = await supabase
      .from("scale_items")
      .select("*")
      .eq("grade", scaleGrade)
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
            Today&apos;s Practice
          </h1>

          <p className="text-zinc-600">
            Scale consolidation: {currentScaleGrade}
          </p>

          <p className="text-sm text-zinc-500">
            Playing level: {playingLevel}
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
              No scales found for {currentScaleGrade}.
            </p>
          )}

          <div className="space-y-4">
            {scales.map((scale) => {
              const progress = Math.round(
                (scale.current_tempo /
                  scale.abrsm_target_tempo) *
                  100
              );

              return (
                <div
                  key={scale.id}
                  className="rounded-lg bg-zinc-100 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-medium text-lg">
                      {scale.name}
                    </div>

                    <div className="rounded-full bg-white px-3 py-1 text-xs text-zinc-600">
                      {scale.grade}
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-zinc-600">
                    {scale.current_tempo} BPM /{" "}
                    {scale.abrsm_target_tempo} BPM
                  </div>

                  <div className="mt-3 h-4 overflow-hidden rounded-full bg-zinc-300">
                    <div
                      className="h-full bg-black"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 text-sm text-zinc-600">
                    {progress}% complete
                  </div>

                  <div className="mt-2 text-sm text-zinc-600">
                    Successful Sessions At Current Tempo:{" "}
                    {scale.successful_sessions_at_current_tempo} / 3
                  </div>

                  <div className="text-sm text-zinc-600">
                    Last Practised:{" "}
                    {scale.last_practiced
                      ? new Date(
                          scale.last_practiced
                        ).toLocaleDateString()
                      : "Never"}
                  </div>
                </div>
              );
            })}
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