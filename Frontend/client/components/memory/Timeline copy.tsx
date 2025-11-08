import { groupByDate } from "@/lib/search";
import { MemoryItem } from "@/types/memory";
import MemoryCard from "./MemoryCard";

export default function Timeline({
  items,
  onToggleFav,
}: {
  items: MemoryItem[];
  onToggleFav?: (id: string) => void;
}) {
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
              <MemoryCard key={m.id} item={m} onToggleFav={onToggleFav} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
