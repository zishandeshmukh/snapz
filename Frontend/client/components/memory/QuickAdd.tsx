'use client';

import { useState } from "react";
import { MemoryType } from "@/types/memory"; // Make sure this path is correct

export default function QuickAdd() {
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [type, setType] = useState<MemoryType>("article");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    async function onAdd() {
        if (!title.trim()) return;
        setLoading(true);
        try {
            const textForAI = `Title: ${title}\nURL: ${url}\n\n${content}`;
            const response = await fetch('http://localhost:3001/receive_data', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: textForAI
            });
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            const result = await response.json();
            console.log("Successfully added and processed by backend:", result);
            setTitle("");
            setUrl("");
            setContent("");
            setType("article");
        } catch (error) {
            console.error("Failed to add memory:", error);
        } finally {
            setLoading(false);
        }
    }

    // This JSX uses standard theme classes that should respect dark mode
    return (
        <div className="">
             <div className="mb-3 text-sm  text-zinc-100  font-semibold">Quick Add</div>
        <div className="rounded-xl border border-border border-zinc-700  bg-zinc-900 p-4 shadow-sm">
           
            <div className="grid gap-2 md:grid-cols-2">
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    className="h-10 rounded-md border border-border border-zinc-700 bg-zinc-900 px-3 text-sm  text-zinc-400  outline-none focus:ring-1 focus:ring-zinc-700"
                />
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as MemoryType)}
                    className="h-10 rounded-md border border-border border-zinc-700  bg-zinc-900 text-zinc-400  px-3 text-sm  outline-none focus:ring-1 focus:ring-zinc-700"
                >
                    <option value="article">Article</option>
                    <option value="video">Video</option>
                    <option value="image">Image</option>
                    <option value="note">Note</option>
                </select>
                <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="URL (optional)"
                    className="h-10 rounded-md border border-border bg-zinc-900 border-zinc-700  px-3 text-sm  text-zinc-400  md:col-span-2  outline-none focus:ring-1 focus:ring-zinc-700"
                />
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Content or notes (optional)"
                    rows={3}
                    className="w-full resize-none rounded-md border border-border  bg-zinc-900 border-zinc-700  p-3 text-sm  text-zinc-400  md:col-span-2  outline-none focus:ring-1 focus:ring-zinc-700"
                />
            </div>
            <div className="mt-3 flex justify-end">
                <button
                    onClick={onAdd}
                  className="rounded-lg border border-cyan-700/50 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-400 transition-colors hover:bg-cyan-500/20 hover:border-cyan-600"
        disabled={loading || !title.trim()}
                >
                    {loading ? "Adding…" : "Add"}
                </button>
            </div>
        </div>
        </div>
    );
}