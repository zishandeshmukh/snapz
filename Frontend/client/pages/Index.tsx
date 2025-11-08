'use client';

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { MemoryItem } from "@/types/memory";
import SearchBar from "@/components/memory/SearchBar";
import MemoryCard from "@/components/memory/MemoryCard";
import Timeline from "@/components/memory/Timeline";
import Analytics from "@/components/memory/Analytics";
import QuickAdd from "@/components/memory/QuickAdd";

// --- Data Transformation Helper ---
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
        imageDataUrl: null,
    };
}


export default function Index() {
    const [items, setItems] = useState<MemoryItem[]>([]);
    const [filteredIds, setFilteredIds] = useState<string[] | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [preferences, setPreferences] = useState({ localOnly: true, excludedKeywords: [] });

    // Fetch all data from Supabase when the page loads
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const { data, error } = await supabase
                .from('content_documents')
                .select('*')
                .order('created_at', { ascending: false });

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

    // Handle toggling the favorite status in the UI and database
    const toggleFavorite = async (id: string) => {
        const currentItem = items.find(item => item.id === id);
        if (!currentItem) return;
        const newFavoriteStatus = !currentItem.favorite;

        setItems(items.map(item =>
            item.id === id ? { ...item, favorite: newFavoriteStatus } : item
        ));

        const { error } = await supabase
            .from('content_documents')
            .update({ favorite: newFavoriteStatus })
            .eq('id', id);

        if (error) {
            console.error("Error updating favorite:", error);
            setItems(items.map(item =>
                item.id === id ? { ...item, favorite: !newFavoriteStatus } : item
            ));
        }
    };

    const filteredItems = useMemo(() => {
        if (filteredIds === null) {
            return items;
        }
        const searchIdSet = new Set(filteredIds);
        return items.filter((item) => searchIdSet.has(item.id));
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
    
    const handleSearchResults = (ids: string[] | null) => setFilteredIds(ids);

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-300">Loading your memories...</div>
    }

    return (
        <div className="min-h-screen bg-zinc-950 p-6">
            <div className="mx-auto max-w-7xl space-y-8">
                <section className="rounded-2xl border border-zinc-700/60 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-6 shadow-lg">
                    <div className="mx-auto max-w-3xl text-center">
                        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl">
                            Your personal digital memory
                        </h1>
                        <p className="mt-2 text-zinc-400">
                            SnapMind watches your content interactions, summarizes them with AI,
                            tags by emotion and topic, and keeps everything searchable.
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
                                <h2 className="text-sm font-semibold text-zinc-300">
                                    {filteredIds ? "Search Results" : "Recent"}
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {(filteredIds ? filteredItems : recent).map((m) => (
                                    <MemoryCard key={m.id} item={m} onToggleFav={toggleFavorite} />
                                ))}
                            </div>
                        </section>

                        <section>
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-zinc-300">Timeline</h2>
                            </div>
                            <Timeline
                                items={filteredItems}
                                onToggleFav={toggleFavorite}
                            />
                        </section>
                    </div>
                    <div className="space-y-6">
                        <QuickAdd />

                        <section className="rounded-xl border border-zinc-700/60 bg-zinc-900 p-4 shadow-sm">
                            <h3 className="mb-2 text-sm font-semibold text-zinc-300">Favorites</h3>
                            {favorites.length === 0 && (
                                <p className="text-sm text-zinc-500">No favorites yet.</p>
                            )}
                            <div className="grid grid-cols-1 gap-3">
                                {favorites.map((m) => (
                                    <MemoryCard key={m.id} item={m} onToggleFav={toggleFavorite} />
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

                <Analytics items={items} />
            </div>
        </div>
    );
}