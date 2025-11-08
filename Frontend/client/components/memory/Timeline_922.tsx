'use client'; // This is a client component because it uses hooks

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Make sure this path is correct
import { MemoryItem } from '@/types/memory';   // Make sure this path is correct
import MemoryCard from './MemoryCard';
import { groupByDate } from '@/lib/search';   // Make sure this path is correct

// --- Data Transformation Logic ---
// This converts a database row into the format your components expect.
function deriveTypeFromUrl(url) {
    if (!url) return 'text';
    if (url.includes('youtube.com')) return 'youtube';
    if (url.includes('linkedin.com')) return 'linkedin';
    if (url.includes('x.com')) return 'twitter';
    if (url.endsWith('.pdf')) return 'pdf';
    return 'article';
}

function transformDbItemToMemoryItem(dbItem) {
  const meta = dbItem.metadata;
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

// --- The Main Timeline Component ---
export default function Timeline() {
    // NEW: State to hold the items fetched from the database
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // NEW: useEffect hook to fetch data when the component loads
    useEffect(() => {
        async function fetchMemories() {
            setLoading(true);
            const { data, error } = await supabase
                .from('content_documents')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching memories:", error);
            } else if (data) {
                const transformedItems = data.map(transformDbItemToMemoryItem);
                setItems(transformedItems);
            }
            setLoading(false);
        }

        fetchMemories();
    }, []);

    // NEW: Function to handle the favorite button click
    const handleToggleFavorite = async (id) => {
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
            console.error("Error updating favorite status:", error);
            // Revert UI change on error
            setItems(items.map(item => 
                item.id === id ? { ...item, favorite: !newFavoriteStatus } : item
            ));
        }
    };

    if (loading) {
        return <div>Loading memories...</div>;
    }

    // This part is your original rendering logic, now using the fetched data
    const groups = groupByDate(items);
    const keys = Object.keys(groups)
      .map((k) => new Date(k))
      .sort((a, b) => b.getTime() - a.getTime())
      .map((d) => d.toDateString());

    return (
        <div className="space-y-6">
            {keys.map((k) => (
                <section key={k}>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {k}
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {groups[k].map((m) => (
                            <MemoryCard key={m.id} item={m} onToggleFav={handleToggleFavorite} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}