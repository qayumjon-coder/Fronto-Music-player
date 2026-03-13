import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Player } from "./components/Player";
import { Settings } from "./components/Settings";
import { Upload } from "./pages/Upload";
import { AdminLogin } from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import { usePlaylist } from "./hooks/usePlaylist";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { SettingsProvider } from "./contexts/SettingsContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Analytics } from "@vercel/analytics/react"
import { LoadingScreen } from "./components/LoadingScreen";
import { useEffect } from "react";
import { HelmetProvider } from 'react-helmet-async';

function MusicApp() {
  const { playlist, loading, error, addToPlaylist, removeFromPlaylist, removeMultipleFromPlaylist } = usePlaylist();
  const player = useAudioPlayer(playlist);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showBoot, setShowBoot] = useState(true);

  // Auto-play from URL ?track=ID
  useEffect(() => {
    if (!loading && playlist.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const trackId = params.get('track');
      if (trackId) {
        const id = parseInt(trackId, 10);
        const idx = playlist.findIndex(s => s.id === id);
        if (idx !== -1 && player.index !== idx) {
          player.selectSong(idx);
          // Optional: Remove query from URL so refresh doesn't loop
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
  }, [loading, playlist.length]);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setShowBoot(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (showBoot) return <LoadingScreen />;

  return (
      <Router>
        <div className="w-full min-h-screen flex items-start justify-center p-2 py-12 md:py-0 relative overflow-y-auto">
          <div className="retro-grid" />
          <div className="scanline" />
          <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
          <Routes>
            <Route path="/" element={
              <Player 
                songs={playlist} 
                loading={loading}
                error={error}
                player={player} 
                onOpenSettings={() => setIsSettingsOpen(true)}
                onAddToPlaylist={addToPlaylist}
                onRemoveFromPlaylist={removeFromPlaylist}
                onBulkRemove={removeMultipleFromPlaylist}
              />
            } />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <HelmetProvider>
          <MusicApp />
          <Analytics 
            debug={true} 
            mode={import.meta.env.MODE === 'development' ? 'development' : 'production'} 
          />
        </HelmetProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
