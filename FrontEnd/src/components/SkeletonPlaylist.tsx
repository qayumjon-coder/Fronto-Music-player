import type { Song } from "../types/Song";

/** Shimmer placeholder for one track row while loading */
function SkeletonRow() {
  return (
    <div className="flex items-center gap-0 px-3 py-3 border-b border-[var(--text-secondary)]/5">
      {/* Cover placeholder */}
      <div className="w-8 h-8 shrink-0 bg-[var(--text-secondary)]/10 animate-pulse mr-3" />
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        {/* Title */}
        <div className="h-2 bg-[var(--text-secondary)]/10 animate-pulse rounded-sm w-3/4" />
        {/* Artist */}
        <div className="h-1.5 bg-[var(--text-secondary)]/6 animate-pulse rounded-sm w-1/2" />
      </div>
      {/* Duration placeholder */}
      <div className="w-8 h-1.5 bg-[var(--text-secondary)]/8 animate-pulse rounded-sm ml-2 shrink-0" />
    </div>
  );
}

interface SkeletonPlaylistProps {
  count?: number;
}

export function SkeletonPlaylist({ count = 8 }: SkeletonPlaylistProps) {
  return (
    <div className="flex flex-col h-full bg-black/20 font-mono w-full overflow-hidden">
      {/* Header shimmer */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--text-secondary)]/10 bg-black/30">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-[var(--accent)]/30 animate-pulse" />
          <div className="h-2 w-16 bg-[var(--text-secondary)]/10 animate-pulse rounded-sm" />
        </div>
        <div className="h-5 w-20 bg-[var(--text-secondary)]/10 animate-pulse rounded-sm" />
      </div>
      {/* Rows */}
      <div className="flex-1 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}

// Re-export Song type for convenience
export type { Song };
