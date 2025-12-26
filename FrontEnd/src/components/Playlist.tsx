import { useState, useEffect, useRef } from "react";
import type { Song } from "../types/Song";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { Trash2, MoreVertical, Check, Square, CheckSquare2, X } from "lucide-react";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

interface PlaylistProps {
  songs: Song[];
  currentSong: Song;
  onSelectSong: (song: Song) => void;
  onRemove?: (id: number) => void;
  onBulkRemove?: (ids: number[]) => void;
}

export function Playlist({ songs, currentSong, onSelectSong, onRemove, onBulkRemove }: PlaylistProps) {
  const { playClick, playHover } = useSoundEffects();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single' | 'bulk', id?: number, title?: string } | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-scroll to active song
  useEffect(() => {
    if (currentSong && scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentSong?.id]);

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    setActiveMenuId(null);
  };

  const handleBulkDelete = () => {
    if (onBulkRemove && selectedIds.size > 0) {
      setDeleteTarget({ type: 'bulk' });
      setDeleteModalOpen(true);
    }
  };

  const handleSingleDelete = (id: number, title: string) => {
    setDeleteTarget({ type: 'single', id, title });
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    
    if (deleteTarget.type === 'bulk' && onBulkRemove) {
      onBulkRemove(Array.from(selectedIds));
      setSelectedIds(new Set());
    } else if (deleteTarget.type === 'single' && deleteTarget.id && onRemove) {
      onRemove(deleteTarget.id);
    }
    
    setDeleteTarget(null);
    setActiveMenuId(null);
  };

  const selectAll = () => {
    if (selectedIds.size === songs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(songs.map(s => s.id)));
    }
  };

  const isSelectionMode = selectedIds.size > 0;

  function formatDuration(d?: number) {
    if (!d) return '--:--';
    const mins = Math.floor(d / 60);
    const secs = Math.floor(d % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  return (
    <div className="flex flex-col h-full bg-black/20 font-mono w-full overflow-hidden">
      {/* Playlist Header/Actions */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--text-secondary)]/10 bg-black/30 backdrop-blur-md sticky top-0 z-30 w-full">
        <div className="flex items-center gap-2 overflow-hidden">
            {isSelectionMode ? (
                <button 
                  onClick={() => { playClick(); selectAll(); }}
                  className="flex items-center gap-2 p-1 text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors border border-[var(--accent)]/30 px-2 shrink-0"
                >
                  <CheckSquare2 size={12} />
                  <span className="text-[8px] font-bold uppercase tracking-widest whitespace-nowrap">
                      {selectedIds.size === songs.length ? 'NONE' : 'ALL'}
                  </span>
                </button>
            ) : (
                <div className="flex items-center gap-2 pl-1 truncate">
                    <div className="w-1 h-1 bg-[var(--accent)] animate-pulse shrink-0"></div>
                    <span className="text-[9px] text-[var(--accent)]/60 tracking-widest uppercase truncate">
                        {songs.length} TRACKS
                    </span>
                </div>
            )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
            {isSelectionMode && onBulkRemove && (
                <button
                  onClick={() => { playClick(); handleBulkDelete(); }}
                  className="p-1.5 bg-[var(--danger)] text-black hover:bg-white transition-all shadow-[0_0_10px_rgba(255,0,85,0.3)] shrink-0"
                  title="Purge Selected"
                >
                  <Trash2 size={12} />
                </button>
            )}
            {isSelectionMode && (
                 <button 
                    onClick={() => { playClick(); setSelectedIds(new Set()); }}
                    className="p-1.5 text-[var(--text-secondary)] hover:text-white transition-colors shrink-0"
                  >
                    <X size={14} />
                  </button>
            )}
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex flex-col gap-0.5 overflow-y-auto custom-scrollbar flex-1 p-1 w-full"
      >
        {songs.map((song) => {
          const isActive = song.id === currentSong?.id;
          const isSelected = selectedIds.has(song.id);
          const isMenuOpen = activeMenuId === song.id;

          return (
            <div 
                key={song.id} 
                data-active={isActive}
                className={`relative group/item flex items-center w-full transition-all duration-300 ${isActive ? 'playlist-active-bg' : 'hover:bg-white/5'} ${isSelected ? 'bg-[var(--accent)]/10' : ''}`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-[var(--accent)] shadow-[0_0_10px_var(--accent)] z-10"></div>
              )}

              {/* Selection Checkbox */}
              {(isSelectionMode || isSelected) && (
                <button
                  onClick={() => { playClick(); toggleSelect(song.id); }}
                  className={`pl-2 pr-1 py-4 transition-colors shrink-0 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]/30 hover:text-[var(--accent)]'}`}
                >
                  {isSelected ? <CheckSquare2 size={16} /> : <Square size={16} />}
                </button>
              )}

              <button
                onClick={() => { 
                  if (isSelectionMode) {
                    toggleSelect(song.id);
                  } else {
                    playClick(); onSelectSong(song); 
                  }
                }}
                onMouseEnter={playHover}
                className={`flex-1 flex flex-col items-start gap-0.5 py-3 pr-8 pl-3 transition-all duration-300 overflow-hidden text-left ${isActive ? 'pl-4' : ''}`}
              >
                {/* Title Row */}
                <div className={`w-full truncate text-[10px] font-bold font-mono tracking-tight uppercase ${isActive ? 'text-[var(--accent)] text-glow' : 'text-[var(--text-secondary)] group-hover/item:text-[var(--text-primary)]'}`}>
                  {song.title}
                </div>
                
                {/* Artist & Info Row */}
                <div className="flex items-center justify-between w-full gap-2">
                  <div className={`text-[8px] truncate font-mono uppercase tracking-wider flex-1 ${isActive ? 'opacity-80' : 'opacity-30 group-hover/item:opacity-60'}`}>
                    {song.artist}
                  </div>
                  <div className={`text-[8px] font-mono shrink-0 opacity-40 ${isActive ? 'text-[var(--accent)] opacity-80' : ''}`}>
                    {formatDuration(song.duration)}
                  </div>
                </div>
              </button>
              
              {/* More Actions Toggle */}
              <div 
                className="absolute right-1 top-1/2 -translate-y-1/2 z-20" 
                ref={isMenuOpen ? menuRef : null}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playClick();
                    setActiveMenuId(isMenuOpen ? null : song.id);
                  }}
                  className={`p-1.5 transition-colors ${
                    isMenuOpen 
                      ? 'text-[var(--accent)]' 
                      : 'text-[var(--text-secondary)]/20 hover:text-[var(--accent)]'
                  }`}
                >
                  <MoreVertical size={14} />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-[var(--bg-main)] border border-[var(--text-secondary)]/30 z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelect(song.id); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors border-b border-[var(--text-secondary)]/10"
                    >
                      <Check size={12} />
                      <span>{isSelected ? 'Unselect' : 'Select'}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playClick();
                        handleSingleDelete(song.id, song.title);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors"
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        songTitle={deleteTarget?.title}
        count={deleteTarget?.type === 'bulk' ? selectedIds.size : undefined}
      />
    </div>
  );
}
