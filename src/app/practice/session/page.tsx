"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SessionPage() {
  const [scales, setScales] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    loadScales();
  }, []);

  async function loadScales() {
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
      return;
    }

    setScales(data || []);
  }

  async function completeStep(success: boolean) {
    const scale = scales[currentStep];

    if (!scale) return;

    const supabase = createClient();

    let newTempo = scale.current_tempo;
    let newSuccessfulSessions = scale.successful_sessions_at_current_tempo;

    if (success) {
      newSuccessfulSessions += 1;

      if (
        newSuccessfulSessions >= 3 &&
        scale.current_tempo < scale.abrsm_target_tempo
      ) {
        newTempo = scale.current_tempo + 5;

        if (newTempo > scale.abrsm_target_tempo) {
          newTempo = scale.abrsm_target_tempo;
        }

        newSuccessfulSessions = 0;
      }
    } else {
      newSuccessfulSessions = 0;
    }

    const { error } = await supabase
      .from("scale_items")
      .update({
        successful: success,
        current_tempo: newTempo,
        successful_sessions_at_current_tempo: newSuccessfulSessions,
        last_practiced: new Date().toISOString(),
      })
      .eq("id", scale.id);

    if (error) {
      console.error(error);
      return;
    }

    const updated = [...scales];

    updated[currentStep] = {
      ...scale,
      current_tempo: newTempo,
      successful: success,
      successful_sessions_at_current_tempo: newSuccessfulSessions,
      last_practiced: new Date().toISOString(),
    };

    setScales(updated);

    if (currentStep < scales.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setSessionComplete(true);
    }
  }

  if (scales.length === 0) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6">
        <section className="mx-auto max-w-xl">
          <h1 className="text-4xl font-bold">
            Loading session...
          </h1>
        </section>
      </main>
    );
  }

  if (sessionComplete) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6">
        <section className="mx-auto max-w-xl space-y-6">
          <h1 className="text-4xl font-bold">
            Session Complete
          </h1>

          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-2xl font-semibold">
              Today&apos;s Scale Work
            </h2>

            <div className="mt-4 space-y-3">
              {scales.map((scale) => (
                <div
                  key={scale.id}
                  className="rounded-lg bg-zinc-100 p-4"
                >
                  <div className="font-medium">
                    {scale.name}
                  </div>

                  <div className="text-sm text-zinc-600">
                    Current Tempo: {scale.current_tempo} BPM
                  </div>

                  <div className="text-sm text-zinc-600">
                    Successful Sessions At Current Tempo:{" "}
                    {scale.successful_sessions_at_current_tempo} / 3
                  </div>
                </div>
              ))}
            </div>
          </div>

          <a
            href="/practice/overview"
            className="block w-full rounded-xl bg-black py-4 text-center text-white font-semibold"
          >
            Back to Today&apos;s Practice
          </a>
        </section>
      </main>
    );
  }

  const scale = scales[currentStep];

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <section className="mx-auto max-w-xl">
        <p className="mb-2 text-zinc-500">
          Scale {currentStep + 1} of {scales.length}
        </p>

        <h1 className="text-4xl font-bold mb-6">
          Practice Session
        </h1>

        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-3xl font-bold">
            {scale.name}
          </h2>

          <p className="mt-6 text-xl">
            Current Tempo: {scale.current_tempo} BPM
          </p>

          <p className="text-zinc-500">
            Target Tempo: {scale.abrsm_target_tempo} BPM
          </p>

          <div className="mt-6">
            <p className="text-sm text-zinc-600">
              Tempo Progress
            </p>

            <div className="mt-2 h-4 overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full bg-black"
                style={{
                  width: `${Math.min(
                    100,
                    (scale.successful_sessions_at_current_tempo / 3) * 100
                  )}%`,
                }}
              />
            </div>

            <p className="mt-2 text-sm text-zinc-600">
              {scale.successful_sessions_at_current_tempo} / 3 successful
              sessions at this tempo
            </p>
          </div>

          <div className="mt-10 flex gap-4">
            <button
              onClick={() => completeStep(false)}
              className="flex-1 rounded-xl bg-red-600 py-4 text-white"
            >
              Needs Work
            </button>

            <button
              onClick={() => completeStep(true)}
              className="flex-1 rounded-xl bg-green-600 py-4 text-white"
            >
              Successful
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}