import React, { useState } from 'react';
import { sound } from '../utils/sound';
import { Sparkles, Lightbulb, HelpCircle, Users, Binary, BookOpen } from 'lucide-react';

export const HowSoftwareWorks: React.FC = () => {
  // Binary bulbs interactive demo
  const [bulbs, setBulbs] = useState<[boolean, boolean, boolean, boolean]>([false, true, false, true]);

  const toggleBulb = (index: number) => {
    sound.playClick();
    const updated = [...bulbs] as [boolean, boolean, boolean, boolean];
    updated[index] = !updated[index];
    setBulbs(updated);
  };

  // Binary calculation (8, 4, 2, 1)
  const binaryValue =
    (bulbs[0] ? 8 : 0) +
    (bulbs[1] ? 4 : 0) +
    (bulbs[2] ? 2 : 0) +
    (bulbs[3] ? 1 : 0);

  const [activeTab, setActiveTab] = useState<'what_is' | 'binary' | 'moth' | 'team'>('what_is');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
            💡
          </div>
          <div>
            <h2 className="font-display font-bold text-xl sm:text-2xl">
              L’Encyclopédie des Petits Curieux
            </h2>
            <p className="text-amber-100 text-xs sm:text-sm mt-0.5">
              Découvre comment fonctionnent les ordinateurs, les jeux et les robots !
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white/90 border border-amber-200 rounded-2xl overflow-x-auto shadow-xs">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('what_is');
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'what_is'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          🖥️ C’est quoi un logiciel ?
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('binary');
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'binary'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          💡 Le secret des 0 et des 1
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('moth');
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'moth'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          🦋 L’histoire du vrai bug
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('team');
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'team'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          👥 Qui fabrique les jeux ?
        </button>
      </div>

      {/* Tab 1: C'est quoi un logiciel ? */}
      {activeTab === 'what_is' && (
        <div className="bg-white/95 rounded-3xl border border-amber-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🍳</span>
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900">
                L’analogie de la cuisine magique !
              </h3>
              <p className="text-xs text-slate-500">Pour tout comprendre en 1 minute</p>
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            Imagine que tu veuilles faire un bon gâteau au chocolat :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hardware */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
              <div className="text-2xl">🔌</div>
              <h4 className="font-bold text-base text-slate-900">
                1. Le Matériel (Le « Hardware »)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ce sont les objets physiques que tu peux toucher : le four, le moule à gâteau,
                le fouet, ou ta console, ton écran et ta tablette. Sans recette, le four ne sait
                pas quoi faire tout seul !
              </p>
            </div>

            {/* Software */}
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 space-y-2">
              <div className="text-2xl">📜</div>
              <h4 className="font-bold text-base text-amber-950">
                2. Le Logiciel (Le « Software »)
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                C’est <strong>la recette secrète</strong> ! La liste d’instructions écrites par
                le chef : « Mets 200g de chocolat, mélange, cuis 20 minutes ». Le logiciel donne vie
                au matériel !
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 leading-relaxed flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <strong>Le savais-tu ?</strong> Ton jeu vidéo préféré (comme Mario ou Minecraft)
              est un logiciel composé de millions de petites instructions écrites par des humains !
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Le binaire interactif */}
      {activeTab === 'binary' && (
        <div className="bg-white/95 rounded-3xl border border-amber-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">💡</span>
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900">
                Le Langage Secret des Ampoules (0 et 1)
              </h3>
              <p className="text-xs text-slate-500">
                Allume et éteins les ampoules pour fabriquer des nombres !
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            Un ordinateur ne comprend pas les mots comme nous. À l’intérieur de ses puces, il y a
            des milliards de minuscules interrupteurs électriques :
            <br />
            <strong>0 = Éteint ⚫</strong> et <strong>1 = Allumé 💡</strong>.
          </p>

          {/* Interactive Bulbs Machine */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 flex flex-col items-center">
            <span className="text-xs font-mono text-slate-400 mb-4 uppercase tracking-wider">
              Touche les ampoules pour les allumer :
            </span>

            <div className="grid grid-cols-4 gap-4 sm:gap-6 mb-6">
              {[8, 4, 2, 1].map((weight, idx) => {
                const isOn = bulbs[idx];
                return (
                  <button
                    key={`bulb-${weight}`}
                    onClick={() => toggleBulb(idx)}
                    className="flex flex-col items-center gap-2 group focus:outline-hidden"
                  >
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 flex items-center justify-center text-3xl sm:text-4xl transition-all ${
                        isOn
                          ? 'bg-amber-400 border-amber-300 text-amber-950 shadow-lg shadow-amber-500/50 scale-105'
                          : 'bg-slate-800 border-slate-700 text-slate-600 opacity-60'
                      }`}
                    >
                      {isOn ? '💡' : '⚫'}
                    </div>

                    <span className="font-mono font-bold text-lg text-emerald-400">
                      {isOn ? '1' : '0'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Valeur : {weight}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Result Box */}
            <div className="bg-slate-800/80 px-6 py-3 rounded-2xl border border-slate-700 flex items-center gap-3">
              <span className="text-xs text-slate-300 font-medium">Nombre secret calculé :</span>
              <span className="font-display font-bold text-3xl text-amber-400 animate-pulse-subtle">
                {binaryValue}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: L'histoire du premier Bug */}
      {activeTab === 'moth' && (
        <div className="bg-white/95 rounded-3xl border border-amber-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🦋</span>
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900">
                La Vraie Histoire du Papillon de Nuit
              </h3>
              <p className="text-xs text-slate-500">Une histoire vraie de 1947 !</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-sm text-slate-800 leading-relaxed space-y-3">
            <p>
              En 1947, les ordinateurs n’étaient pas des petits téléphones de poche, mais
              d’immenses machines de la taille d’une pièce de maison entière !
            </p>
            <p>
              Une brillante scientifique appelée <strong>Grace Hopper</strong> travaillait sur
              l’ordinateur « Mark II ». Soudain, la machine s’est arrêtée de calculer.
            </p>
            <p>
              En ouvrant la porte de la machine, l’équipe a trouvé... <strong>un vrai papillon de
              nuit</strong> coincé entre deux contacteurs électriques !
            </p>
            <p className="font-semibold text-amber-950">
              Grace Hopper a retiré l’insecte avec une pince et a écrit dans son carnet de bord :
              « Premier cas réel de bug trouvé ! » (En anglais, <em>bug</em> veut dire insecte).
            </p>
          </div>

          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
            <span className="text-2xl">✨</span>
            <span>
              Depuis ce jour, quand un logiciel a une erreur, tous les ingénieurs du monde disent :
              « Il y a un bug ! » et réparer l’erreur s’appelle « déboguer » !
            </span>
          </div>
        </div>
      )}

      {/* Tab 4: Qui fabrique les logiciels ? */}
      {activeTab === 'team' && (
        <div className="bg-white/95 rounded-3xl border border-amber-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🎪</span>
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900">
                Les Super-Héros d’un Studio de Création
              </h3>
              <p className="text-xs text-slate-500">Pour fabriquer un jeu, chacun apporte son talent !</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
              <span className="text-3xl mb-1 block">💻</span>
              <h4 className="font-bold text-slate-900 text-sm">Le Développeur (Codeur)</h4>
              <p className="text-xs text-slate-600 mt-1">
                Il écrit le cerveau du jeu ! C’est lui qui dit : « Quand on appuie sur la touche,
                le héros saute ».
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200">
              <span className="text-3xl mb-1 block">🎨</span>
              <h4 className="font-bold text-slate-900 text-sm">L’Artiste & Graphiste</h4>
              <p className="text-xs text-slate-600 mt-1">
                Il dessine les décors enchantés, les monstres rigolos et les héros étincelants !
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-3xl mb-1 block">🎵</span>
              <h4 className="font-bold text-slate-900 text-sm">Le Compositeur de Musique</h4>
              <p className="text-xs text-slate-600 mt-1">
                Il crée les sons bips de victoire, les bruits de pas et les musiques épiques !
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-3xl mb-1 block">🕵️</span>
              <h4 className="font-bold text-slate-900 text-sm">Le Testeur de Jeu</h4>
              <p className="text-xs text-slate-600 mt-1">
                Son métier est de jouer toute la journée pour chasser les bugs avant que les enfants
                ne découvrent le jeu !
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
