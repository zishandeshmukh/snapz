'use client';

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // Make sure this path is correct

export default function SearchBar({
  onResults,
}: {
  onResults: (ids: string[]) => void;
}) {
  const [mode, setMode] = useState<"text" | "emotion">("text");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // A simple list of emotions for the UI buttons
  const emotions = ["Positive", "Informative", "Analytical","Text","Article" ,"Urgent","Frustrated"];

  // --- NEW: Text search that queries the database ---
  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_documents')
        .select('id')
        .textSearch('fts', query, { // Uses the new 'fts' column
          type: 'websearch',
          config: 'english'
        });

      if (error) {
        console.error("Error during text search:", error);
        onResults([]);
        return;
      }

      const results = data.map((item) => String(item.id));
      onResults(results);

    } finally {
      setLoading(false);
    }
  }

  // --- NEW: Emotion search that queries the database ---
 // --- NEW: Case-insensitive emotion search ---
  async function handleEmotion(emotion: string) {
    setLoading(true);
    try {
        // Use .rpc() to call the custom database function we just created
        const { data, error } = await supabase
          .rpc('search_by_emotion', { emotion_query: emotion })
          .select('id');
        
        if (error) {
            console.error("Error during emotion search:", error);
            onResults([]);
            return;
        }

        const results = data.map((item) => String(item.id));
        onResults(results);
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="w-full rounded-xl border border-border bg-card p-3 shadow-sm md:p-4">
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-lg border border-border p-1">
          {[
            { k: "text", label: "Text" },
            { k: "emotion", label: "Emotion" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setMode(t.k as any)}
              className={`rounded-md px-3 py-1.5 text-sm ${mode === t.k ? "bg-gradient-to-br from-[hsl(var(--brand-start)/0.2)] to-[hsl(var(--brand-end)/0.2)]" : "hover:bg-accent"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {mode === "text" && (
          <form
            onSubmit={handleSubmit}
            className="flex w-full items-center gap-2"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keyword…"
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--brand-start))]"
            />
            <button type="submit" className="rounded-md bg-gradient-to-br from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] px-4 py-2 text-sm font-medium text-white shadow-sm">
              {loading ? "Searching…" : "Search"}
            </button>
          </form>
        )}
      </div>

      {mode === "emotion" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {emotions.map((e) => (
            <button
              key={e}
              onClick={() => handleEmotion(e)}
              className="rounded-full bg-secondary px-3 py-1 text-xs capitalize hover:bg-gradient-to-br hover:from-[hsl(var(--brand-start)/0.2)] hover:to-[hsl(var(--brand-end)/0.2)]"
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}