/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PuzzleLab } from './components/PuzzleLab';
import { GameStudio } from './components/GameStudio';
import { BugHunterArcade } from './components/BugHunterArcade';
import { HowSoftwareWorks } from './components/HowSoftwareWorks';
import { DiplomaCertificate } from './components/DiplomaCertificate';
import { Sparkles, Heart } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'puzzle' | 'studio' | 'bugs' | 'learn' | 'diploma'>('puzzle');
  const [completedLevels, setCompletedLevels] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('robostudio_completed_levels');
      return saved ? JSON.parse(saved) : [1]; // Start with level 1 already unlocked
    } catch {
      return [1];
    }
  });

  const [solvedBugs, setSolvedBugs] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('robostudio_solved_bugs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleLevelComplete = (levelId: number) => {
    if (!completedLevels.includes(levelId)) {
      const updated = [...completedLevels, levelId];
      setCompletedLevels(updated);
      try {
        localStorage.setItem('robostudio_completed_levels', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  };

  // Calculate stars: 3 stars per completed level + 2 stars per solved bug!
  const totalStars = completedLevels.length * 3 + solvedBugs.length * 2;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-amber-50/60">
      {/* Playful Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        starsCount={totalStars}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentTab === 'puzzle' && (
          <PuzzleLab
            onLevelComplete={handleLevelComplete}
            completedLevels={completedLevels}
            onGoToDiploma={() => setCurrentTab('diploma')}
          />
        )}

        {currentTab === 'studio' && <GameStudio />}

        {currentTab === 'bugs' && (
          <BugHunterArcade
            onGoToDiploma={() => setCurrentTab('diploma')}
            onBugsUpdated={setSolvedBugs}
          />
        )}

        {currentTab === 'learn' && <HowSoftwareWorks />}

        {currentTab === 'diploma' && (
          <DiplomaCertificate
            completedLevelsCount={completedLevels.length}
            bugsSolvedCount={solvedBugs.length}
            onBackToMissions={() => setCurrentTab('puzzle')}
          />
        )}
      </main>

      {/* Soft Kid & Parent Friendly Footer */}
      <footer className="mt-auto py-6 border-t border-amber-200/60 bg-white/60 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <span>RoboStudio</span>
            <span>·</span>
            <span>Apprendre à coder en s’amusant dès 7 ans</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span>Séquences</span>
            <span>·</span>
            <span>Boucles</span>
            <span>·</span>
            <span>Débogage</span>
            <span>·</span>
            <span>Événements</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
