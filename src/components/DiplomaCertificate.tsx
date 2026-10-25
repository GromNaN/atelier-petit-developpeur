import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';
import { Award, Printer, Sparkles, Check, Heart } from 'lucide-react';

interface DiplomaCertificateProps {
  completedLevelsCount: number;
  bugsSolvedCount?: number;
  onBackToMissions?: () => void;
}

// Cute SVG Mascot: Cat Developer with Graduation Cap & Whiskers
const CatCoderMascot: React.FC<{ size?: number }> = ({ size = 96 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-md select-none inline-block"
  >
    {/* Cat Ears */}
    <polygon points="25,42 14,14 44,28" fill="#f97316" stroke="#c2410c" strokeWidth="2.5" />
    <polygon points="25,38 18,20 38,29" fill="#fed7aa" />
    <polygon points="75,42 86,14 56,28" fill="#f97316" stroke="#c2410c" strokeWidth="2.5" />
    <polygon points="75,38 82,20 62,29" fill="#fed7aa" />

    {/* Graduation Cap on top of cat head */}
    <polygon points="50,8 78,20 50,30 22,20" fill="#1e293b" />
    <rect x="42" y="24" width="16" height="8" rx="2" fill="#0f172a" />
    <line x1="50" y1="18" x2="72" y2="26" stroke="#f59e0b" strokeWidth="2.5" />
    <circle cx="72" cy="26" r="3" fill="#f59e0b" />

    {/* Cat Head */}
    <circle cx="50" cy="54" r="32" fill="#f97316" stroke="#c2410c" strokeWidth="2.5" />
    {/* Soft Muzzle */}
    <ellipse cx="50" cy="62" rx="16" ry="12" fill="#fff7ed" />

    {/* Big Shiny Happy Eyes */}
    <circle cx="38" cy="48" r="5.5" fill="#0f172a" />
    <circle cx="40" cy="46" r="2" fill="#ffffff" />
    <circle cx="62" cy="48" r="5.5" fill="#0f172a" />
    <circle cx="64" cy="46" r="2" fill="#ffffff" />

    {/* Rosy Cheeks */}
    <circle cx="28" cy="58" r="4.5" fill="#fda4af" opacity="0.85" />
    <circle cx="72" cy="58" r="4.5" fill="#fda4af" opacity="0.85" />

    {/* Little Pink Triangle Nose & Mouth */}
    <polygon points="47.5,57 52.5,57 50,60" fill="#ec4899" />
    <path
      d="M 45 62 Q 50 67 50 62 Q 50 67 55 62"
      stroke="#7c2d12"
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
    />

    {/* Cute Whiskers */}
    <line x1="20" y1="57" x2="34" y2="59" stroke="#7c2d12" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="18" y1="63" x2="33" y2="63" stroke="#7c2d12" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="80" y1="57" x2="66" y2="59" stroke="#7c2d12" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="82" y1="63" x2="67" y2="63" stroke="#7c2d12" strokeWidth="1.8" strokeLinecap="round" />

    {/* Cat Little Paws holding a Star */}
    <ellipse cx="38" cy="82" rx="7.5" ry="6" fill="#fff7ed" stroke="#c2410c" strokeWidth="1.5" />
    <ellipse cx="62" cy="82" rx="7.5" ry="6" fill="#fff7ed" stroke="#c2410c" strokeWidth="1.5" />
    <text x="50" y="86" textAnchor="middle" fontSize="16" className="animate-pulse">
      ⭐
    </text>
  </svg>
);

export const DiplomaCertificate: React.FC<DiplomaCertificateProps> = ({
  completedLevelsCount,
  bugsSolvedCount = 0,
  onBackToMissions,
}) => {
  const [childName, setChildName] = useState('Super Codeur');
  // Default avatar is the cute Cat 🐱!
  const [selectedAvatar, setSelectedAvatar] = useState('🐱');

  const avatars = [
    { emoji: '🐱', label: 'Chat Astronaute' },
    { emoji: '😺', label: 'Chat Joyeux' },
    { emoji: '😻', label: 'Chat d’Amour' },
    { emoji: '🐈', label: 'Chat Roux' },
    { emoji: '🤖', label: 'Robot Botty' },
    { emoji: '🚀', label: 'Fusée Turbo' },
  ];

  // Launch celebratory confetti upon arrival on the diploma!
  React.useEffect(() => {
    sound.playSuccess();
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.5 },
    });
  }, []);

  const handlePrint = () => {
    sound.playSuccess();
    confetti({
      particleCount: 80,
      spread: 70,
    });
    window.print();
  };

  const todayStr = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
  }).format(new Date());

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner - hidden when printing */}
      <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-4xl shrink-0">
            🐱
          </div>
          <div>
            <h2 className="font-display font-bold text-xl sm:text-2xl flex items-center gap-2">
              <span>Ton Diplôme Officiel de Développeur</span>
              <span className="text-xl">🎓</span>
            </h2>
            <p className="text-amber-100 text-xs sm:text-sm mt-0.5">
              Certifié par Moustache le Chat Codeur et Botty le Robot ! Imprime-le pour l’accrocher dans ta chambre.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBackToMissions && (
            <button
              onClick={() => {
                sound.playClick();
                onBackToMissions();
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-display font-bold text-sm transition-all"
            >
              <span>🧩 Retour aux Missions</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-amber-950 font-display font-bold text-sm shadow-md hover:bg-amber-50 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4 text-amber-600" />
            <span>Imprimer mon Diplôme 🖨️</span>
          </button>
        </div>
      </div>

      {/* Customization controls - hidden when printing */}
      <div className="bg-white/95 rounded-3xl border border-amber-200/80 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <label htmlFor="child-name-input" className="text-xs font-bold text-slate-700">
            Ton Prénom :
          </label>
          <input
            id="child-name-input"
            type="text"
            value={childName}
            maxLength={25}
            onChange={(e) => setChildName(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl border border-amber-300 font-display font-bold text-base text-slate-900 bg-amber-50/50 focus:outline-hidden focus:border-amber-500"
            placeholder="Ex: Emma, Lucas, Gabriel..."
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Ton Badge :</span>
          <div className="flex items-center gap-1.5">
            {avatars.map((av) => (
              <button
                key={av.emoji}
                onClick={() => {
                  sound.playClick();
                  setSelectedAvatar(av.emoji);
                }}
                title={av.label}
                className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all ${
                  selectedAvatar === av.emoji
                    ? 'bg-amber-400 ring-2 ring-amber-500 scale-110 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                {av.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* The Printable Official Certificate Frame - Scaled to fit single A4 page */}
      <div
        id="diploma-canvas"
        className="relative bg-gradient-to-b from-amber-50/90 via-white to-amber-50/90 border-6 sm:border-8 border-double border-amber-400 rounded-3xl p-6 sm:p-9 print:p-6 print:py-5 shadow-xl select-none print:m-0 print:border-4 print:shadow-none print:w-full overflow-hidden"
      >
        {/* Corner Ornaments */}
        <div className="absolute top-3 left-3 text-xl text-amber-500 print:text-lg">🐾</div>
        <div className="absolute top-3 right-3 text-xl text-amber-500 print:text-lg">🐾</div>
        <div className="absolute bottom-3 left-3 text-xl text-amber-500 print:text-lg">🐾</div>
        <div className="absolute bottom-3 right-3 text-xl text-amber-500 print:text-lg">🐾</div>

        <div className="text-center space-y-3 print:space-y-2">
          {/* Header Tag */}
          <div className="inline-flex items-center gap-1.5 text-[11px] print:text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-100/80 px-3 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3 text-amber-600" />
            Académie RoboStudio · Club des Chats Codeurs
          </div>

          {/* Cute Cat Mascot Illustrated on the Diploma */}
          <div className="flex items-center justify-center pt-0.5">
            <CatCoderMascot size={74} />
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl print:text-2xl text-amber-950 tracking-wide leading-tight">
            DIPLÔME DE CRÉATEUR DE LOGICIELS
          </h1>

          <p className="text-xs sm:text-sm print:text-xs text-slate-600 italic">
            Ce diplôme certifie solennellement que le jeune champion :
          </p>

          {/* Child Name Callout */}
          <div className="py-1">
            <span className="font-display font-bold text-2xl sm:text-4xl print:text-3xl text-amber-600 border-b-2 border-amber-400 px-6 pb-0.5 inline-block">
              {childName || 'Petit Génie'}
            </span>
          </div>

          <p className="text-xs sm:text-sm print:text-xs text-slate-700 max-w-lg mx-auto leading-relaxed">
            A découvert avec brio comment pensent les ordinateurs et a appris à écrire des
            <strong> séquences d’instructions</strong>, maîtriser les <strong>boucles</strong>,
            chasser les <strong>bugs</strong> et créer ses propres programmes avec son ami le chat !
          </p>

          {/* Stars & Missions summary */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 py-1">
            <div className="flex items-center gap-0.5 text-xl print:text-lg">
              ⭐⭐⭐⭐⭐
            </div>
            <div className="text-xs print:text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-xl flex items-center gap-1">
              <span>🏆 {completedLevelsCount} Missions Réussies</span>
            </div>
            {bugsSolvedCount > 0 && (
              <div className="text-xs print:text-[11px] font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-xl flex items-center gap-1">
                <span>🐞 {bugsSolvedCount}/5 Bugs Démasqués</span>
              </div>
            )}
            <div className="text-xs print:text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-xl flex items-center gap-1">
              <span>🐾 Chat Certifié Conforme</span>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-4 print:pt-2 border-t border-amber-200/80 flex items-center justify-between px-4 sm:px-8 print:px-6">
            {/* Left: Date */}
            <div className="text-left">
              <span className="text-[10px] text-slate-500 block">Délivré le :</span>
              <span className="font-semibold text-xs print:text-[11px] text-slate-800">{todayStr}</span>
            </div>

            {/* Official Golden Seal with the Cat! */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 print:w-14 print:h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-4 border-amber-600 shadow-md flex flex-col items-center justify-center text-amber-950 font-display font-bold text-center leading-tight">
              <span className="text-xl print:text-lg drop-shadow-xs">{selectedAvatar}</span>
              <span className="text-[7.5px] uppercase tracking-wider font-extrabold mt-0.5">
                CERTIFIÉ
              </span>
            </div>

            {/* Right: Signature */}
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Signé par :</span>
              <span className="font-display font-bold text-xs print:text-[11px] text-amber-900 block">
                Moustache le Chat 🐱
              </span>
              <span className="text-[9px] text-slate-500 block font-medium">
                & Botty le Robot 🤖
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
