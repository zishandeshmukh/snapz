import { MemoryItem } from "@/types/memory";
import { cn } from "@/lib/utils";
import { useState } from "react";
import EditMemoryModal from "./EditMemoryModal";

function TypeBadge({ type }: { type: MemoryItem["type"] }) {
    const label = type[0].toUpperCase() + type.slice(1);
    return (
        <span className="text-xs font-medium text-muted-foreground text-zinc-400">
            {label}
        </span>
    );
}

function MoodBadge({ mood }: { mood?: string }) {
    if (!mood) return null;
    return (
        <span className="text-xs font-medium text-green-400">
            • {mood}
        </span>
    );
}

function EmotionBadge({ emotion }: { emotion?: string }) {
    if (!emotion) return null;
    return (
        <span className="text-xs font-medium text-cyan-400">
            • {emotion}
        </span>
    );
}

function getImageForType(type: MemoryItem["type"]) {
    switch (type) {
        case "youtube":
            return "/images/youtube.png";
        case "linkedin":
            return "/images/linkedin.png";
        case "twitter":
            return "/images/twitter.jpeg";
        case "text":
            return "/images/article.jpeg";
        case "reddit":
            return "/images/reddit.png";
        case "quora":
            return "/images/quora.png";
        case "instagram":
            return "/images/instagram.png";
        case "article":
        default:
            return "/images/article.jpeg";
    }
}

export default function MemoryCard({
    item,
    onToggleFav,
}: {
    item: MemoryItem;
    onToggleFav?: (id: string) => void;
    onSave?: (updatedItem: MemoryItem) => void;
}) {
    const imageUrl = getImageForType(item.type);
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = (updatedItem: MemoryItem) => {
        onSave?.(updatedItem);
        setIsEditing(false);
    };

    return (
        <>
            <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900 p-6 shadow-sm transition-all hover:border-zinc-600 hover:shadow-md">
                
                <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 text-xs">
                    <TypeBadge type={item.type} />
                    <EmotionBadge emotion={item.emotion} />
                    <MoodBadge mood={item.mood} />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <img
                        src={imageUrl}
                        alt={`${item.type} icon`}
                        className="h-16 w-16 rounded-lg object-cover"
                    />
                    {item.favorite && (
                        <span className="text-lg leading-none text-cyan-400">★</span>
                    )}
                </div>
            </div>

            <h3 className="mb-3 line-clamp-2 text-lg font-bold leading-tight text-zinc-400">
                {item.title}
            </h3>

            {item.summary && (
                <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-zinc-400">
                    {item.summary}
                </p>
            )}

            {item.keywords && item.keywords.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                    {item.keywords.slice(0, 4).map((k) => (
                        <span
                            key={k}
                            className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300"
                        >
                            {k}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                <time className="text-xs text-zinc-500">
                    {new Date(item.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </time>
                <div className="flex items-center gap-3">
                    {item.url && (
                        <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-semibold text-zinc-400 transition-colors hover:text-cyan-400"
                        >
                            View →
                        </a>
                    )}
                    <button
                        onClick={() => onToggleFav?.(item.id)}
                        className={cn(
                            "rounded-lg border  border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 font-semibold transition-all hover:border-cyan-500/50 hover:bg-zinc-800",
                            item.favorite && "border-cyan-500 text-cyan-400"
                        )}
                    >
                        {item.favorite ? "★ Unfavorite" : "☆ Favorite"}
                    </button>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 font-semibold transition-all hover:border-cyan-500/50 hover:bg-zinc-800"
                    >
                        Edit
                    </button>
                </div>
            </div>
        </article>
        {isEditing && (
            <EditMemoryModal
                item={item}
                onClose={() => setIsEditing(false)}
                onSave={handleSave}
            />
        )}
        </>
    );
}