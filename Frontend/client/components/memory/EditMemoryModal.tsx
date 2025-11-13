'use client';

import { MemoryItem } from "@/types/memory";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function EditMemoryModal({
    item,
    onClose,
    onSave,
}: {
    item: MemoryItem;
    onClose: () => void;
    onSave: (updatedItem: MemoryItem) => void;
}) {
    const [title, setTitle] = useState(item.title);
    const [summary, setSummary] = useState(item.summary);
    const [keywords, setKeywords] = useState(item.keywords?.join(", "));
    const [mood, setMood] = useState(item.mood);

    const handleSave = async () => {
        const updatedItem = {
            ...item,
            title,
            summary,
            keywords: keywords?.split(",").map(k => k.trim()),
            mood,
        };

        try {
            const response = await fetch(`/api/memories/${item.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ metadata: updatedItem }),
            });

            if (!response.ok) {
                throw new Error('Failed to update memory');
            }

            onSave(updatedItem);
        } catch (error) {
            console.error("Error updating memory:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-2xl rounded-2xl border border-zinc-700/60 bg-zinc-900 p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-zinc-100">Edit Memory</h2>
                <div className="mt-4 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-zinc-300">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-zinc-100"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-zinc-300">Summary</label>
                        <textarea
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-zinc-100"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-zinc-300">Keywords (comma-separated)</label>
                        <input
                            type="text"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-zinc-100"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-zinc-300">Mood</label>
                        <input
                            type="text"
                            value={mood}
                            onChange={(e) => setMood(e.target.value)}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-zinc-100"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-600"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
