import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { GameWorld, HeroSprite, GameEventRule } from '../types';
import { sound } from '../utils/sound';
import {
  Play,
  RotateCcw,
  Sparkles,
  Gamepad2,
  Code2,
  Plus,
  Trash2,
  Trophy,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  Volume2,
} from 'lucide-react';

export const GameStudio: React.FC = () => {
  // Game Configuration State
  const [world, setWorld] = useState<GameWorld>('forest');
  const [hero, setHero] = useState<HeroSprite>('cat');
  const [gameTitle, setGameTitle] = useState('Mon Super Jeu');

  // Rules (Events & Actions) - Starting with only right arrow and the star-click rule for the child to build upon
  const [rules, setRules] = useState<GameEventRule[]>([
    {
      id: 'r_key_right',
      trigger: 'on_key_right',
      triggerLabel: 'Quand on appuie sur Flèche Droite ➡️',
      action: 'move_right',
      actionLabel: 'Courir vers la droite ➡️',
    },
    {
      id: 'r_click_star',
      trigger: 'on_click_star',
      triggerLabel: 'Quand on clique sur l’Étoile ⭐',
      action: 'add_score_2',
      actionLabel: 'Gagner +2 Points ⭐⭐',
    },
  ]);

  // Live Play / Test Runtime State
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [heroX, setHeroX] = useState(120);
  const [isJumping, setIsJumping] = useState(false);
  const [heroSpeech, setHeroSpeech] = useState<string | null>(null);
  const [hasWon, setHasWon] = useState(false);
  const [starPos, setStarPos] = useState({ x: 340, y: 195 }); // 195 is on ground level
  const [showCode, setShowCode] = useState(false);
  const [floatingPoint, setFloatingPoint] = useState<{ text: string; x: number; y: number } | null>(null);

  // DOM Refs for Real Pixel Bounding Box Collision
  const heroRef = useRef<HTMLDivElement | null>(null);
  const starRef = useRef<HTMLDivElement | null>(null);
  const isCollectingRef = useRef(false);

  // Available triggers and actions for kids to create custom rules
  const availableTriggers = [
    { id: 'on_touch_item', label: 'Quand le Héros rentre en contact avec l’Étoile ⭐' },
    { id: 'on_click_star', label: 'Quand on clique sur l’Étoile ⭐' },
    { id: 'on_click_hero', label: 'Quand on clique sur mon Héros' },
    { id: 'on_key_right', label: 'Quand on appuie sur Flèche Droite ➡️' },
    { id: 'on_key_left', label: 'Quand on appuie sur Flèche Gauche ⬅️' },
    { id: 'on_key_jump', label: 'Quand on appuie sur le bouton Saut 🦘' },
  ];

  const availableActions = [
    { id: 'add_score_2', label: 'Gagner +2 Points ⭐⭐' },
    { id: 'add_score_1', label: 'Gagner +1 Point ⭐' },
    { id: 'add_score_5', label: 'Gagner +5 Points 🌟' },
    { id: 'jump', label: 'Faire un bond en l’air 🦘' },
    { id: 'move_right', label: 'Avancer vers la droite ➡️' },
    { id: 'move_left', label: 'Reculer vers la gauche ⬅️' },
    { id: 'make_sound', label: 'Jouer un son magique 🎵' },
    { id: 'confetti', label: 'Lancer des confettis multicolores 🎉' },
    { id: 'say_hello', label: 'Dire : "Bonjour les amis !" 💬' },
  ];

  const [newTrigger, setNewTrigger] = useState(availableTriggers[0].id);
  const [newAction, setNewAction] = useState(availableActions[0].id);

  // Accurate Real Collision Detection via getBoundingClientRect()
  const checkCollisionFrame = () => {
    if (!isPlaying || isCollectingRef.current) return;
    if (!heroRef.current || !starRef.current) return;

    const h = heroRef.current.getBoundingClientRect();
    const s = starRef.current.getBoundingClientRect();

    // Forgiving hitbox for young children (5-8px tolerance)
    const margin = 6;
    const isColliding =
      h.right - margin > s.left &&
      h.left + margin < s.right &&
      h.bottom - margin > s.top &&
      h.top + margin < s.bottom;

    if (isColliding) {
      isCollectingRef.current = true;

      // Trigger the "when hero touches star" rule
      handleTriggerAction('on_touch_item');

      // Respawn star at a new exciting position (alternating ground / jump height)
      respawnStar();

      setTimeout(() => {
        isCollectingRef.current = false;
      }, 400);
    }
  };

  const respawnStar = () => {
    setStarPos((prev) => {
      // Pick next X sufficiently far from previous to avoid instant collision
      const newX = Math.floor(Math.random() * 380) + 70;
      // Alternate between ground level (195) and jump air height (125)
      const newY = prev.y === 195 ? 125 : 195;
      return { x: newX, y: newY };
    });
  };

  // Continuous animation frame loop during play for 100% collision precision
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    const loop = () => {
      checkCollisionFrame();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, rules, heroX, isJumping, starPos]);

  // Keyboard controls listener when playing
  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleTriggerAction('on_key_right');
      } else if (e.key === 'ArrowLeft') {
        handleTriggerAction('on_key_left');
      } else if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        handleTriggerAction('on_key_jump');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, rules]);

  // Execute rules mapped to a specific trigger
  const handleTriggerAction = (triggerId: string) => {
    const matchedRules = rules.filter((r) => r.trigger === triggerId);
    if (matchedRules.length === 0) return;

    matchedRules.forEach((rule) => {
      switch (rule.action) {
        case 'jump':
          if (!isJumping) {
            setIsJumping(true);
            sound.playJump();
            setTimeout(() => setIsJumping(false), 450);
          }
          break;

        case 'move_right':
          setHeroX((prev) => Math.min(480, prev + 36));
          sound.playStep();
          break;

        case 'move_left':
          setHeroX((prev) => Math.max(40, prev - 36));
          sound.playStep();
          break;

        case 'add_score_2':
          addPoints(2);
          break;

        case 'add_score_1':
        case 'add_score':
          addPoints(1);
          break;

        case 'add_score_5':
          addPoints(5);
          break;

        case 'make_sound':
          sound.playRobotBeep();
          break;

        case 'confetti':
          confetti({ particleCount: 50, spread: 70, origin: { x: 0.5, y: 0.6 } });
          sound.playStarCollect();
          break;

        case 'say_hello':
          setHeroSpeech('Bonjour ! Je suis vivant grâce à ton code ! ✨');
          sound.playClick();
          setTimeout(() => setHeroSpeech(null), 3000);
          break;
      }
    });
  };

  const addPoints = (points: number) => {
    sound.playStarCollect();
    setScore((prev) => {
      const nextScore = prev + points;
      if (nextScore >= 10 && !hasWon) {
        setHasWon(true);
        sound.playSuccess();
        confetti({ particleCount: 100, spread: 80 });
      }
      return nextScore;
    });

    // Display floating +2 or +1 text
    setFloatingPoint({
      text: `+${points} pts ! ⭐`,
      x: starPos.x,
      y: starPos.y - 15,
    });
    setTimeout(() => setFloatingPoint(null), 900);
  };

  const handleStartPlay = () => {
    sound.playClick();
    setIsPlaying(true);
    setScore(0);
    setHeroX(100);
    setStarPos({ x: 340, y: 195 });
    setHasWon(false);
    isCollectingRef.current = false;
    setHeroSpeech('C’est parti ! Guide ton héros vers l’étoile !');
    setTimeout(() => setHeroSpeech(null), 2500);
  };

  const handleStopPlay = () => {
    sound.playClick();
    setIsPlaying(false);
    setHasWon(false);
    isCollectingRef.current = false;
  };

  const handleAddRule = () => {
    const triggerItem = availableTriggers.find((t) => t.id === newTrigger);
    const actionItem = availableActions.find((a) => a.id === newAction);

    if (triggerItem && actionItem) {
      sound.playClick();
      setRules([
        ...rules,
        {
          id: `r-${Date.now()}`,
          trigger: newTrigger as GameEventRule['trigger'],
          triggerLabel: triggerItem.label,
          action: newAction as GameEventRule['action'],
          actionLabel: actionItem.label,
        },
      ]);
    }
  };

  const handleRemoveRule = (id: string) => {
    sound.playClick();
    setRules(rules.filter((r) => r.id !== id));
  };

  // World visual themes
  const worldThemes: Record<
    GameWorld,
    { name: string; bgGradient: string; groundColor: string; icon: string }
  > = {
    forest: {
      name: '🌲 La Forêt Magique',
      bgGradient: 'from-emerald-300 via-sky-200 to-amber-100',
      groundColor: 'bg-emerald-600 border-emerald-700',
      icon: '🌲',
    },
    space: {
      name: '🌌 L’Espace Cosmique',
      bgGradient: 'from-slate-900 via-indigo-950 to-purple-900',
      groundColor: 'bg-indigo-900 border-indigo-700',
      icon: '🌌',
    },
    candy: {
      name: '🍬 Le Monde des Bonbons',
      bgGradient: 'from-pink-300 via-rose-200 to-amber-100',
      groundColor: 'bg-rose-500 border-rose-600',
      icon: '🍬',
    },
    ocean: {
      name: '🌊 Le Monde Sous-Marin',
      bgGradient: 'from-cyan-400 via-sky-300 to-blue-500',
      groundColor: 'bg-amber-300 border-amber-400',
      icon: '🌊',
    },
    city: {
      name: '🏙️ La Ville Futuriste',
      bgGradient: 'from-sky-300 via-blue-200 to-amber-200',
      groundColor: 'bg-slate-700 border-slate-800',
      icon: '🏙️',
    },
  };

  // Hero emoji / visual
  const heroAvatars: Record<HeroSprite, { name: string; emoji: string; color: string }> = {
    cat: { name: 'Chat Astronaute', emoji: '🐱', color: 'bg-amber-100' },
    robot: { name: 'Botty Robot', emoji: '🤖', color: 'bg-sky-100' },
    dino: { name: 'Dino Rigolo', emoji: '🦖', color: 'bg-emerald-100' },
    star: { name: 'Licorne Stella', emoji: '🦄', color: 'bg-pink-100' },
    rocket: { name: 'Fusée Turbo', emoji: '🚀', color: 'bg-rose-100' },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Studio Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
            🎨
          </div>
          <div>
            <h2 className="font-display font-bold text-xl sm:text-2xl">
              Mon Studio de Création de Jeu
            </h2>
            <p className="text-purple-100 text-xs sm:text-sm mt-0.5">
              Ici, c’est TOI le développeur ! Choisis ton univers, invente des règles et teste ton jeu en direct.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCode(!showCode)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors"
        >
          <Code2 className="w-4 h-4" />
          <span>{showCode ? 'Masquer le code' : 'Code du jeu'}</span>
        </button>
      </div>

      {/* Main Grid: Game Stage (left/top) + Rules Studio (right/bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Game Stage Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-white/95 rounded-3xl border border-amber-200/80 p-5 shadow-xs flex flex-col items-center">
          {/* Game Title & Score display */}
          <div className="w-full flex items-center justify-between mb-3 px-2">
            <input
              type="text"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              className="font-display font-bold text-lg text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-purple-500 focus:outline-hidden px-1"
              title="Clique pour modifier le titre de ton jeu"
            />
            <div className="flex items-center gap-2 bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-xl text-sm border border-amber-200 shadow-xs">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Score : {score} pts</span>
            </div>
          </div>

          {/* Interactive Stage Canvas */}
          <div
            className={`relative w-full h-[320px] rounded-3xl overflow-hidden shadow-inner border-4 border-slate-200 bg-gradient-to-b ${worldThemes[world].bgGradient} select-none`}
          >
            {/* Background decorative elements */}
            {world === 'space' ? (
              <div className="absolute inset-0 opacity-40 pointer-events-none">
                <span className="absolute top-4 left-10 text-xs text-white">✨</span>
                <span className="absolute top-12 left-60 text-sm text-yellow-200">⭐</span>
                <span className="absolute top-20 right-20 text-xs text-white">✨</span>
                <span className="absolute top-8 right-64 text-base text-pink-300">🪐</span>
              </div>
            ) : (
              <div className="absolute inset-0 opacity-40 pointer-events-none">
                <span className="absolute top-4 left-12 text-2xl text-white">☁️</span>
                <span className="absolute top-8 right-16 text-2xl text-white">☁️</span>
              </div>
            )}

            {/* Collectible Star / Treasure with DOM Ref */}
            <div
              ref={starRef}
              className="absolute text-4xl animate-bounce cursor-pointer transition-all duration-300 drop-shadow-md z-10"
              style={{ left: starPos.x, top: starPos.y }}
              onClick={() => {
                // Clicking star triggers 'on_click_star' ONLY
                // If user deleted the rule, clicking does nothing!
                if (isPlaying) {
                  handleTriggerAction('on_click_star');
                }
              }}
              title="Étoile Magique"
            >
              ⭐
            </div>

            {/* Floating Point Pop Effect (+2 pts!) */}
            {floatingPoint && (
              <div
                className="absolute font-display font-extrabold text-base text-yellow-300 bg-slate-900/80 px-2.5 py-0.5 rounded-full shadow-lg border border-yellow-400 animate-bounce pointer-events-none z-30 whitespace-nowrap"
                style={{ left: floatingPoint.x, top: floatingPoint.y }}
              >
                {floatingPoint.text}
              </div>
            )}

            {/* Ground line */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-16 border-t-4 ${worldThemes[world].groundColor} flex items-center justify-around text-xs text-white/50`}
            >
              <span>🌱</span>
              <span>🌿</span>
              <span>🍄</span>
              <span>🌿</span>
            </div>

            {/* Playable Hero with DOM Ref */}
            <div
              ref={heroRef}
              onClick={() => {
                if (isPlaying) handleTriggerAction('on_click_hero');
              }}
              className={`absolute bottom-16 flex flex-col items-center cursor-pointer transition-all duration-150 z-20 ${
                isJumping ? 'transform -translate-y-20 scale-110' : ''
              }`}
              style={{ left: heroX }}
            >
              {/* Speech bubble */}
              {heroSpeech && (
                <div className="mb-1 bg-white text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-xl shadow-md border border-slate-200 whitespace-nowrap animate-bounce-gentle">
                  {heroSpeech}
                </div>
              )}

              {/* Avatar Emoji */}
              <div className="w-14 h-14 rounded-2xl bg-white/70 backdrop-blur-xs border-2 border-white/80 shadow-md flex items-center justify-center text-3xl hover:scale-110 transition-transform">
                {heroAvatars[hero].emoji}
              </div>
            </div>

            {/* Win overlay */}
            {hasWon && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 z-40">
                <div className="text-5xl animate-bounce mb-2">🎉</div>
                <h3 className="font-display font-bold text-2xl">Bravo, tu as gagné !</h3>
                <p className="text-xs text-amber-200 mt-1 text-center max-w-xs">
                  Ton programme fonctionne parfaitement ! Tu as atteint 10 points avec tes propres règles !
                </p>
                <button
                  onClick={handleStartPlay}
                  className="mt-3 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-sm text-slate-950 transition-colors shadow-md"
                >
                  Rejouer une partie 🔄
                </button>
              </div>
            )}
          </div>

          {/* Interactive Gamepad / Controls */}
          <div className="w-full mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            {/* Play / Pause toggle */}
            {!isPlaying ? (
              <button
                onClick={handleStartPlay}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-display font-bold text-base text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 shadow-md hover:shadow-lg transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Tester mon Jeu ! 🎮</span>
              </button>
            ) : (
              <button
                onClick={handleStopPlay}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl font-display font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Arrêter le test</span>
              </button>
            )}

            {/* Giant Touch Buttons for Kids */}
            {isPlaying && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTriggerAction('on_key_left')}
                  className="w-12 h-12 rounded-2xl bg-amber-200 hover:bg-amber-300 active:scale-95 text-amber-950 flex items-center justify-center shadow-xs font-bold transition-all"
                  title="Gauche"
                  aria-label="Gauche"
                >
                  <ArrowLeft className="w-6 h-6 stroke-[3]" />
                </button>

                <button
                  onClick={() => handleTriggerAction('on_key_jump')}
                  className="px-4 h-12 rounded-2xl bg-purple-200 hover:bg-purple-300 active:scale-95 text-purple-950 flex items-center gap-1 shadow-xs font-bold text-sm transition-all"
                  title="Sauter"
                >
                  <ArrowUp className="w-5 h-5 stroke-[3]" />
                  <span>Saut !</span>
                </button>

                <button
                  onClick={() => handleTriggerAction('on_key_right')}
                  className="w-12 h-12 rounded-2xl bg-amber-200 hover:bg-amber-300 active:scale-95 text-amber-950 flex items-center justify-center shadow-xs font-bold transition-all"
                  title="Droite"
                  aria-label="Droite"
                >
                  <ArrowRight className="w-6 h-6 stroke-[3]" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Studio Controls & Event Rules (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Pick Hero & World */}
          <div className="bg-white/95 rounded-3xl border border-amber-200/80 p-5 shadow-xs space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">
              1. Choisis ton Héros & ton Décor
            </h3>

            {/* Hero selector */}
            <div>
              <span className="text-xs font-semibold text-slate-600 block mb-2">
                Mon Héros :
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {(Object.keys(heroAvatars) as HeroSprite[]).map((key) => {
                  const h = heroAvatars[key];
                  const isSelected = hero === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        sound.playClick();
                        setHero(key);
                      }}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border-2 transition-all shrink-0 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 shadow-xs scale-105'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="text-2xl">{h.emoji}</span>
                      <span className="text-[11px] font-medium text-slate-700">{h.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* World selector */}
            <div>
              <span className="text-xs font-semibold text-slate-600 block mb-2">
                Mon Décor :
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {(Object.keys(worldThemes) as GameWorld[]).map((key) => {
                  const w = worldThemes[key];
                  const isSelected = world === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        sound.playClick();
                        setWorld(key);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all shrink-0 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 text-purple-900'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span>{w.icon} {w.name.split(' ')[1]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Event-Action Rules (Les Règles Magiques du Jeu) */}
          <div className="bg-white/95 rounded-3xl border border-amber-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  2. Les Règles de ton Jeu (Événements)
                </h3>
                <p className="text-xs text-slate-500">
                  Supprime ou ajoute des règles pour personnaliser ton jeu !
                </p>
              </div>
            </div>

            {/* Pedagogical tip for the child */}
            {rules.some((r) => r.trigger === 'on_click_star') && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>À toi de jouer, Développeur !</strong>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Pour l’instant, il faut cliquer sur l’étoile pour avoir des points. Supprime cette règle avec la corbeille 🗑️ et ajoute la vraie règle <em>« Quand le Héros rentre en contact avec l’Étoile »</em> ci-dessous !
                  </p>
                </div>
              </div>
            )}

            {/* Existing rules list */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-2xl flex items-center justify-between gap-2 text-xs hover:bg-purple-50 transition-colors"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-purple-950 block truncate">
                      ⚡ {rule.triggerLabel}
                    </span>
                    <span className="text-purple-700 block truncate">
                      ➡️ {rule.actionLabel}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveRule(rule.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors shrink-0"
                    title="Supprimer cette règle"
                    aria-label="Supprimer cette règle"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new rule form */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <span className="font-bold text-slate-700 block">
                Ajouter une nouvelle règle :
              </span>
              <div className="space-y-1.5">
                <select
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-medium text-slate-800 focus:outline-hidden focus:border-purple-500"
                >
                  {availableTriggers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>

                <select
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-medium text-slate-800 focus:outline-hidden focus:border-purple-500"
                >
                  {availableActions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddRule}
                className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter cette règle au jeu !</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Code Inspector */}
      {showCode && (
        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Code2 className="w-5 h-5 text-purple-400" />
            <h3 className="font-display font-bold text-base text-white">
              Le Vrai Code de ton Jeu Vidéo 💻
            </h3>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Voici les écouteurs d’événements (Event Listeners) que tu as programmés :
          </p>
          <pre className="font-mono text-xs text-emerald-400 bg-slate-950 p-4 rounded-2xl overflow-x-auto leading-relaxed border border-slate-800">
{`// Initialisation de l'univers : "${worldThemes[world].name}"
const hero = new Character("${heroAvatars[hero].name}");
let score = 0;

// Règles programmées par l'enfant :
${rules
  .map(
    (r) => `// ${r.triggerLabel}
hero.${r.trigger}(() => {
  hero.${r.action}();
});`
  )
  .join('\n\n')}
`}
          </pre>
        </div>
      )}
    </div>
  );
};
