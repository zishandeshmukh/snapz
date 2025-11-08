'use client';

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // Make sure this path is correct
import { MemoryItem } from "@/types/memory";     // Make sure this path is correct

import SearchBar from "@/components/memory/SearchBar";
import MemoryCard from "@/components/memory/MemoryCard";
import Timeline from "@/components/memory/Timeline";
import Analytics from "@/components/memory/Analytics";
import QuickAdd from "@/components/memory/QuickAdd";

// --- Data Transformation Helper ---
// This converts the data from your database into the format your components need.
function transformDbItemToMemoryItem(dbItem) {
    const meta = dbItem.metadata;

    function deriveTypeFromUrl(url) {
        if (!url) return 'text';
        if (url.includes('youtube.com')) return 'youtube';
        if (url.includes('linkedin.com')) return 'linkedin';
        if (url.includes('x.com')) return 'twitter';
        if (url.endsWith('.pdf')) return 'pdf';
        return 'article';
    }

    return {
        id: String(dbItem.id),
        title: meta.title,
        summary: meta.summary,
        keywords: meta.keywords,
        emotion: meta.emotions ? meta.emotions[0] : undefined,
        timestamp: meta.timestamp,
        url: meta.source_url,
        type: deriveTypeFromUrl(meta.source_url),
        favorite: dbItem.favorite,
        imageDataUrl: null, // You can add logic for this later
    };
}


export default function Index() {
    // --- NEW: State managed directly in the component ---
    const [items, setItems] = useState<MemoryItem[]>([]);
    const [preferences, setPreferences] = useState({ localOnly: true, excludedKeywords: [] });
    const [filteredIds, setFilteredIds] = useState<string[] | null>(null);
    const [loading, setLoading] = useState(true);

    // --- NEW: useEffect to fetch data from Supabase on page load ---
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const { data, error } = await supabase
                .from('content_documents')
                .select('*')
                .order('created_at', { ascending: false }); // Fetch newest first

            if (error) {
                console.error("Error fetching data:", error);
            } else if (data) {
                const transformedItems = data.map(transformDbItemToMemoryItem);
                setItems(transformedItems);
            }
            setLoading(false);
        }
        fetchData();
    }, []);

    // --- NEW: Function to handle toggling favorites in the UI and database ---
    const toggleFavorite = async (id: string) => {
        const currentItem = items.find(item => item.id === id);
        if (!currentItem) return;
        const newFavoriteStatus = !currentItem.favorite;

        // Optimistically update the UI for a fast response
        setItems(items.map(item =>
            item.id === id ? { ...item, favorite: newFavoriteStatus } : item
        ));

        // Update the database in the background
        const { error } = await supabase
            .from('content_documents')
            .update({ favorite: newFavoriteStatus })
            .eq('id', id);

        if (error) {
            console.error("Error updating favorite:", error);
            // If the database update fails, revert the UI change
            setItems(items.map(item =>
                item.id === id ? { ...item, favorite: !newFavoriteStatus } : item
            ));
        }
    };

    // --- Memoized calculations for different views ---
    const filtered = useMemo(() => {
        if (!filteredIds) return items;
        const set = new Set(filteredIds);
        return items.filter((m) => set.has(m.id));
    }, [items, filteredIds]);

    const recent = useMemo(
        () => [...items]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 6),
        [items],
    );

    const favorites = useMemo(
        () => items.filter((m) => m.favorite).slice(0, 6),
        [items],
    );

    const handleSearchResults = (ids: string[]) => setFilteredIds(ids);

    if (loading) {
        return <div>Loading your memories...</div>
    }

    // --- JSX (Your existing layout, now fully functional) ---
    return (
        <div className="space-y-8">
            <section className="rounded-2xl border border-border bg-gradient-to-br from-[hsl(var(--brand-start)/0.12)] to-[hsl(var(--brand-end)/0.12)] p-6 shadow-sm">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Your personal digital memory
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        SnapMind watches your content interactions, summarizes them with AI,
                        tags by emotion and topic, and keeps everything searchable—privately
                        on your device.
                    </p>
                </div>
                <div className="mx-auto mt-4 max-w-4xl">
                    <SearchBar onResults={handleSearchResults} />
                </div>
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-sm font-semibold">Recent</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {(filteredIds ? filtered : recent).map((m) => (
                                <MemoryCard key={m.id} item={m} onToggleFav={toggleFavorite} />
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-sm font-semibold">Timeline</h2>
                        </div>
                        <Timeline
                            items={filteredIds ? filtered : items}
                            onToggleFav={toggleFavorite}
                        />
                    </section>
                </div>
                <div className="space-y-6">
                    <QuickAdd />

                    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <h3 className="mb-2 text-sm font-semibold">Favorites</h3>
                        {favorites.length === 0 && (
                            <p className="text-sm text-muted-foreground">No favorites yet.</p>
                        )}
                        <div className="grid grid-cols-1 gap-3">
                            {favorites.map((m) => (
                                <MemoryCard key={m.id} item={m} onToggleFav={toggleFavorite} />
                            ))}
                        </div>
                    </section>

                    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
                         {/* ... Your privacy controls JSX ... */}
                    </section>
                </div>
            </div>

            <Analytics items={items} />
        </div>
    );
}