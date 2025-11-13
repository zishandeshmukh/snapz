'use client';

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { MemoryItem } from "@/types/memory";
import SearchBar from "@/components/memory/SearchBar";
import MemoryCard from "@/components/memory/MemoryCard";
import Timeline from "@/components/memory/Timeline";
import Analytics from "@/components/memory/Analytics";
import QuickAdd from "@/components/memory/QuickAdd";
import MoodInsights from "@/components/memory/MoodInsights";

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
        mood: meta.mood,
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
    const [tags, setTags] = useState<string[]>([]);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    
    const [preferences, setPreferences] = useState({ localOnly: true, excludedKeywords: [] });

    // Fetch all data from Supabase when the page loads
    const PAGE_SIZE = 20;

    const fetchData = async (page = 0) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('content_documents')
            .select('*')
            .order('created_at', { ascending: false })
            .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (error) {
            console.error("Error fetching data:", error);
        } else if (data) {
            const transformedItems = data.map(transformDbItemToMemoryItem);
            setItems(prevItems => page === 0 ? transformedItems : [...prevItems, ...transformedItems]);
            setHasMore(data.length === PAGE_SIZE);
            if (page === 0) {
                const allTags = transformedItems.flatMap(item => item.keywords || []);
                const uniqueTags = [...new Set(allTags)];
                setTags(uniqueTags);
            }
        }
        setLoading(false);
    };

    const fetchMoreData = () => {
        if (hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchData(nextPage);
        }
    };

    useEffect(() => {
        fetchData(0);

        const channel = supabase.channel('content_documents');
        channel
            .on('postgres_changes', { event: '*', schema: 'public', table: 'content_documents' }, (payload) => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
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

    const handleSave = (updatedItem: MemoryItem) => {
        setItems(items.map(item =>
            item.id === updatedItem.id ? updatedItem : item
        ));
    };

    const filteredItems = useMemo(() => {
        let result = items;
        if (filteredIds) {
            const searchIdSet = new Set(filteredIds);
            result = result.filter((item) => searchIdSet.has(item.id));
        }
        if (selectedTag) {
            result = result.filter(item => item.keywords?.includes(selectedTag));
        }
        return result;
    }, [items, filteredIds, selectedTag]);


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
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-300">
                <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-500"></div>
                    <span>Loading your memories...</span>
                </div>
            </div>
        );
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
                                    Filter by Tag
                                </h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedTag(null)}
                                    className={`px-3 py-1 text-sm rounded-full ${!selectedTag ? 'bg-cyan-500 text-white' : 'bg-zinc-800 text-zinc-300'}`}
                                >
                                    All
                                </button>
                                {tags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setSelectedTag(tag)}
                                        className={`px-3 py-1 text-sm rounded-full ${selectedTag === tag ? 'bg-cyan-500 text-white' : 'bg-zinc-800 text-zinc-300'}`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </section>
                        <section>
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-zinc-300">
                                    {filteredIds ? "Search Results" : "Recent"}
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {(filteredIds || selectedTag ? filteredItems : recent).map((m) => (
                                    <MemoryCard key={m.id} item={m} onToggleFav={toggleFavorite} onSave={handleSave} />
                                ))}
                            </div>
                            {hasMore && !filteredIds && !selectedTag && (
                                <div className="mt-4 flex justify-center">
                                    <button
                                        onClick={fetchMoreData}
                                        className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-600"
                                    >
                                        Load More
                                    </button>
                                </div>
                            )}
                        </section>

                        <section>
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-zinc-300">Timeline</h2>
                            </div>
                            <Timeline
                                items={filteredItems}
                                onToggleFav={toggleFavorite}
                                onSave={handleSave}
                            />
                        </section>
                    </div>
                    <div className="space-y-6">
                        <QuickAdd />
                        <MoodInsights />

                        <section className="rounded-xl border border-zinc-700/60 bg-zinc-900 p-4 shadow-sm">
                            <h3 className="mb-2 text-sm font-semibold text-zinc-300">Favorites</h3>
                            {favorites.length === 0 && (
                                <p className="text-sm text-zinc-500">No favorites yet.</p>
                            )}
                            <div className="grid grid-cols-1 gap-3">
                                {favorites.map((m) => (
                                    <MemoryCard key={m.id} item={m} onToggleFav={toggleFavorite} onSave={handleSave} />
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