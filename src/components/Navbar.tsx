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
  ChevronDown,
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
    {
      id: 'puzzle' as const,
      label: 'Missions',
      mobileLabel: '🧩 Missions de Code (Défis pas à pas)',
      emoji: '🧩',
    },
    {
      id: 'studio' as const,
      label: 'Studio de Jeu',
      mobileLabel: '🎨 Mon Studio de Jeu (Créateur interactif)',
      emoji: '🎨',
    },
    {
      id: 'bugs' as const,
      label: 'Chasse aux Bugs',
      mobileLabel: '🐞 Chasse aux Bugs (Détective d’erreurs)',
      emoji: '🐞',
    },
    {
      id: 'learn' as const,
      label: 'Comment ça marche ?',
      mobileLabel: '💡 Comment ça marche ? (Les secrets du code)',
      emoji: '💡',
    },
    {
      id: 'diploma' as const,
      label: 'Mon Diplôme',
      mobileLabel: '🎓 Mon Diplôme Officiel (Certificat chat)',
      emoji: '🎓',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
        {/* Top Row: Logo on left, Star Count & Sound Toggle on right (and Desktop Tabs in center) */}
        <div className="flex items-center justify-between gap-4">
          {/* Brand / Logo */}
          <div
            onClick={() => {
              sound.playClick();
              onSelectTab('puzzle');
            }}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-xl sm:text-2xl shadow-sm group-hover:scale-105 transition-transform">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
                  RoboStudio
                </span>
                <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded-md">
                  Dès 7 ans
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 -mt-0.5">
                L’Atelier des Petits Développeurs
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Hidden on mobile, visible from md:) */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-amber-100/60 rounded-2xl">
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
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right side tools: Stars collected & Audio mute */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
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
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center transition-colors"
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

        {/* Second Row for Mobile (< md): Dedicated full-width select menu */}
        <div className="block md:hidden mt-2.5 pt-2 border-t border-amber-200/60">
          <div className="relative w-full">
            <select
              value={currentTab}
              onChange={(e) => {
                sound.playClick();
                onSelectTab(e.target.value as NavbarProps['currentTab']);
              }}
              className="w-full appearance-none bg-amber-100/90 hover:bg-amber-100 text-amber-950 border-2 border-amber-300 font-display font-bold text-sm rounded-2xl h-12 pl-4 pr-10 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 cursor-pointer transition-colors"
              aria-label="Choisir une activité ou un jeu"
            >
              {navItems.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                  className="font-sans font-semibold text-slate-900 py-2 text-sm"
                >
                  {item.mobileLabel}
                </option>
              ))}
            </select>

            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-amber-800 flex items-center gap-1">
              <ChevronDown className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
