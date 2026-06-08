"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SessionPage() {
  const [scales, setScales] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    loadScales();
  }, []);

  async function loadScales() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("scale_items")
      .select("*")
      .order("name");

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

    if (
      success &&
      scale.current_tempo < scale.abrsm_target_tempo
    ) {
      newTempo += 5;

      if (newTempo > scale.abrsm_target_tempo) {
        newTempo = scale.abrsm_target_tempo;
      }
    }

    const { error } = await supabase
      .from("scale_items")
      .update({
        successful: success,
        current_tempo: newTempo,
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
    };

    setScales(updated);

    if (currentStep < scales.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  if (scales.length === 0) {
    return (
      <main className="min-h-screen p-6">
        <h1 className="text-4xl font-bold">
          Loading...
        </h1>
      </main>
    );
  }

  const scale = scales[currentStep];

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <section className="mx-auto max-w-xl">
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