import { useEffect, useState, useCallback } from "react";
import type { Song } from "../types/Song";
import { getMusicList } from "../services/musicApi";

const PAGE_SIZE = 30;

export function useFetchSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const normalize = (data: Song[]) =>
    data.map(song => ({ ...song, coverUrl: song.cover_url }));

  // Initial load
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getMusicList(0, PAGE_SIZE)
      .then(data => {
        if (!mounted) return;
        setSongs(normalize(data));
        setHasMore(data.length === PAGE_SIZE);
        setPage(0);
        setLoading(false);
      })
      .catch(err => {
        if (!mounted) return;
        console.error('Failed to fetch songs:', err);
        setError(err.message || 'Failed to load songs');
        setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  // Load next page
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      const data = await getMusicList(nextPage, PAGE_SIZE);
      setSongs(prev => [...prev, ...normalize(data)]);
      setHasMore(data.length === PAGE_SIZE);
      setPage(nextPage);
    } catch (err) {
      console.error('Failed to load more songs:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore]);

  // Refetch from scratch
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMusicList(0, PAGE_SIZE);
      setSongs(normalize(data));
      setHasMore(data.length === PAGE_SIZE);
      setPage(0);
    } catch (err) {
      console.error('Refetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { songs, loading, loadingMore, hasMore, error, loadMore, refetch };
}
