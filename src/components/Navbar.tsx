import React, { useState } from 'react';
import { sound } from '../utils/sound';
import {
  Gamepad2,
  Puzzle,
  Bug,
  HelpCircle,
  Award,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'puzzle' | 'studio' | 'bugs' | 'learn' | 'diploma';
  onSelectTab: (tab: 'puzzle' | 'studio' | 'bugs' | 'learn' | 'diploma') => void;
  starsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  starsCount,
}) => {
  const [isMuted, setIsMuted] = useState(sound.isMuted());

  const handleToggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const navItems = [
    { id: 'puzzle' as const, label: 'Missions', icon: Puzzle, emoji: '🧩' },
    { id: 'studio' as const, label: 'Studio de Jeu', icon: Gamepad2, emoji: '🎨' },
    { id: 'bugs' as const, label: 'Chasse aux Bugs', icon: Bug, emoji: '🐞' },
    { id: 'learn' as const, label: 'Comment ça marche ?', icon: HelpCircle, emoji: '💡' },
    { id: 'diploma' as const, label: 'Mon Diplôme', icon: Award, emoji: '🎓' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-200/80 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div
          onClick={() => {
            sound.playClick();
            onSelectTab('puzzle');
          }}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-xl text-slate-900 tracking-tight">
                RoboStudio
              </span>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded-md">
                Dès 7 ans
              </span>
            </div>
            <p className="text-[11px] text-slate-500 -mt-0.5">
              L’Atelier des Petits Développeurs
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 p-1 bg-amber-100/60 rounded-2xl overflow-x-auto">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  onSelectTab(item.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span>{item.emoji}</span>
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right side tools: Stars collected & Audio mute */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Star counter */}
          <div
            className="flex items-center gap-1.5 bg-amber-100 text-amber-950 px-3 py-1.5 rounded-xl font-display font-bold text-xs sm:text-sm border border-amber-300 shadow-xs"
            title="Étoiles gagnées dans tes missions"
          >
            <span className="text-base">⭐</span>
            <span>{starsCount}</span>
          </div>

          {/* Sound toggle button */}
          <button
            onClick={handleToggleSound}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center transition-colors"
            title={isMuted ? 'Activer le son' : 'Désactiver le son'}
            aria-label={isMuted ? 'Activer le son' : 'Désactiver le son'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-slate-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-emerald-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
