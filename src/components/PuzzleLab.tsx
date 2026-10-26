import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { PUZZLE_LEVELS } from '../data/puzzleLevels';
import { ALL_BLOCKS } from '../data/codingBlocks';
import { BlockType, Direction, PuzzleLevel } from '../types';
import { PuzzleBoard } from './PuzzleBoard';
import { BlockItem } from './BlockItem';
import { sound } from '../utils/sound';
import {
  Play,
  RotateCcw,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  HelpCircle,
  Code2,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';

interface PuzzleLabProps {
  onLevelComplete: (levelId: number) => void;
  completedLevels: number[];
  onGoToDiploma?: () => void;
}

export const PuzzleLab: React.FC<PuzzleLabProps> = ({
  onLevelComplete,
  completedLevels,
  onGoToDiploma,
}) => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const level: PuzzleLevel = PUZZLE_LEVELS[currentLevelIndex];

  // Robot runtime state
  const [botPos, setBotPos] = useState<{ x: number; y: number; dir: Direction }>(
    level.startPos
  );
  const [program, setProgram] = useState<BlockType[]>(
    level.preloadedBlocks ? [...level.preloadedBlocks] : []
  );
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [collectedItems, setCollectedItems] = useState<string[]>([]);
  const [doorUnlocked, setDoorUnlocked] = useState(false);

  // Status and feedback
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'info' | 'error' | 'success'>('info');
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showCodeInspector, setShowCodeInspector] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const abortControllerRef = useRef<boolean>(false);

  // Reset when level changes
  useEffect(() => {
    resetLevel();
  }, [currentLevelIndex]);

  const resetLevel = () => {
    abortControllerRef.current = true;
    setIsRunning(false);
    setActiveStepIndex(null);
    setIsMoving(false);
    setIsJumping(false);
    setIsCelebrating(false);
    setCollectedItems([]);
    setDoorUnlocked(false);
    setMessage(null);
    setShowVictoryModal(false);
    setBotPos({ ...level.startPos });
    if (level.preloadedBlocks) {
      setProgram([...level.preloadedBlocks]);
    } else {
      setProgram([]);
    }
  };

  const handleAddBlock = (type: BlockType) => {
    if (isRunning) return;
    if (program.length >= level.maxBlocks) {
      sound.playError();
      setMessage(`Tu as atteint la limite de ${level.maxBlocks} blocs pour ce niveau !`);
      setMessageType('info');
      return;
    }
    sound.playClick();
    setProgram([...program, type]);
    setMessage(null);
  };

  const handleRemoveBlock = (index: number) => {
    if (isRunning) return;
    sound.playClick();
    const updated = [...program];
    updated.splice(index, 1);
    setProgram(updated);
  };

  const handleClear = () => {
    if (isRunning) return;
    sound.playClick();
    setProgram([]);
    setMessage(null);
  };

  // Helper to expand loops like repeat_4 + forward
  const compileInstructions = (blocks: BlockType[]): BlockType[] => {
    const flat: BlockType[] = [];
    let i = 0;
    while (i < blocks.length) {
      const b = blocks[i];
      if (b === 'repeat_2' || b === 'repeat_3' || b === 'repeat_4') {
        const count = b === 'repeat_2' ? 2 : b === 'repeat_3' ? 3 : 4;
        const nextBlock = blocks[i + 1] || 'forward';
        for (let c = 0; c < count; c++) {
          flat.push(nextBlock);
        }
        i += 2; // consumed loop and child
      } else {
        flat.push(b);
        i++;
      }
    }
    return flat;
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Run the program step by step
  const runProgram = async () => {
    if (isRunning) return;
    if (program.length === 0) {
      sound.playError();
      setMessage('Ajoute au moins un bloc à ton programme avant de démarrer !');
      setMessageType('info');
      return;
    }

    abortControllerRef.current = false;
    setIsRunning(true);
    setMessage(null);
    setBotPos({ ...level.startPos });
    setCollectedItems([]);
    setDoorUnlocked(false);
    setIsCelebrating(false);

    sound.playRobotBeep();
    await sleep(400);

    let currentPos = { ...level.startPos };
    let currentCollected: string[] = [];
    let currentDoorUnlocked = false;

    // Execution loop over program blocks
    for (let step = 0; step < program.length; step++) {
      if (abortControllerRef.current) break;

      setActiveStepIndex(step);
      const block = program[step];

      // Handle Repeat blocks
      if (block === 'repeat_2' || block === 'repeat_3' || block === 'repeat_4') {
        const count = block === 'repeat_2' ? 2 : block === 'repeat_3' ? 3 : 4;
        const childBlock = program[step + 1] || 'forward';

        for (let sub = 0; sub < count; sub++) {
          if (abortControllerRef.current) break;
          const result = await executeSingleAction(childBlock, currentPos, currentCollected, currentDoorUnlocked);
          if (!result.success) {
            handleFailedRun(result.error || 'Erreur d’exécution !');
            return;
          }
          currentPos = result.newPos;
          currentCollected = result.collected;
          currentDoorUnlocked = result.doorUnlocked;
          await sleep(450);
        }
        step++; // skip child block in outer loop
      } else {
        const result = await executeSingleAction(block, currentPos, currentCollected, currentDoorUnlocked);
        if (!result.success) {
          handleFailedRun(result.error || 'Erreur d’exécution !');
          return;
        }
        currentPos = result.newPos;
        currentCollected = result.collected;
        currentDoorUnlocked = result.doorUnlocked;
        await sleep(500);
      }
    }

    setActiveStepIndex(null);
    setIsRunning(false);

    // Check if goal reached!
    const reachedGoal =
      currentPos.x === level.goalPos.x && currentPos.y === level.goalPos.y;

    // Check if required stars/keys were gathered
    const hasRequiredStars = level.collectibles
      ? level.collectibles.every((c) =>
          currentCollected.includes(`${c.type}-${c.x}-${c.y}`)
        )
      : true;

    if (reachedGoal && hasRequiredStars) {
      // Victory!
      setIsCelebrating(true);
      sound.playSuccess();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setShowVictoryModal(true);
      onLevelComplete(level.id);
    } else if (!reachedGoal) {
      sound.playError();
      setMessage('Botty n’a pas atteint le drapeau d’arrivée ! Réfléchis aux étapes manquantes.');
      setMessageType('error');
    } else if (!hasRequiredStars) {
      sound.playError();
      const hasKeyMissing = level.collectibles?.some(
        (c) => c.type === 'key' && !currentCollected.includes(`${c.type}-${c.x}-${c.y}`)
      );
      if (hasKeyMissing) {
        setMessage('Tu es arrivé au drapeau mais tu as oublié de ramasser la clé dorée 🔑 !');
      } else {
        setMessage('Tu es arrivé au drapeau mais tu as oublié de ramasser l’étoile magique ⭐ !');
      }
      setMessageType('error');
    }
  };

  const executeSingleAction = async (
    type: BlockType,
    pos: { x: number; y: number; dir: Direction },
    collected: string[],
    doorOpen: boolean
  ): Promise<{
    success: boolean;
    newPos: { x: number; y: number; dir: Direction };
    collected: string[];
    doorUnlocked: boolean;
    error?: string;
  }> => {
    let nextPos = { ...pos };
    let nextCollected = [...collected];
    let nextDoorOpen = doorOpen;

    if (type === 'turn_right') {
      const turns: Record<Direction, Direction> = {
        up: 'right',
        right: 'down',
        down: 'left',
        left: 'up',
      };
      nextPos.dir = turns[pos.dir];
      sound.playTurn();
      setBotPos(nextPos);
      return { success: true, newPos: nextPos, collected: nextCollected, doorUnlocked: nextDoorOpen };
    }

    if (type === 'turn_left') {
      const turns: Record<Direction, Direction> = {
        up: 'left',
        left: 'down',
        down: 'right',
        right: 'up',
      };
      nextPos.dir = turns[pos.dir];
      sound.playTurn();
      setBotPos(nextPos);
      return { success: true, newPos: nextPos, collected: nextCollected, doorUnlocked: nextDoorOpen };
    }

    if (type === 'sound_beep') {
      sound.playRobotBeep();
      return { success: true, newPos: nextPos, collected: nextCollected, doorUnlocked: nextDoorOpen };
    }

    if (type === 'jump') {
      // Jump 2 tiles in facing direction
      const deltas: Record<Direction, { dx: number; dy: number }> = {
        right: { dx: 2, dy: 0 },
        left: { dx: -2, dy: 0 },
        up: { dx: 0, dy: -2 },
        down: { dx: 0, dy: 2 },
      };
      const d = deltas[pos.dir];
      const targetX = pos.x + d.dx;
      const targetY = pos.y + d.dy;

      if (
        targetX < 0 ||
        targetX >= level.gridWidth ||
        targetY < 0 ||
        targetY >= level.gridHeight
      ) {
        return {
          success: false,
          newPos: pos,
          collected: nextCollected,
          doorUnlocked: nextDoorOpen,
          error: 'Aïe ! Botty a sauté hors du terrain ! Fais attention au bord !',
        };
      }

      setIsJumping(true);
      sound.playJump();
      nextPos = { x: targetX, y: targetY, dir: pos.dir };
      setBotPos(nextPos);

      await sleep(350);
      setIsJumping(false);

      // Check obstacles on landing tile: the landing cell must NOT be occupied!
      const obs = level.obstacles?.find((o) => o.x === targetX && o.y === targetY);
      if (obs) {
        if (obs.type === 'mud') {
          return {
            success: false,
            newPos: nextPos,
            collected: nextCollected,
            doorUnlocked: nextDoorOpen,
            error: 'Plouf ! Botty a atterri en plein dans la boue ! La case d’arrivée de ton saut ne doit pas être occupée.',
          };
        }
        if (obs.type === 'wall') {
          return {
            success: false,
            newPos: nextPos,
            collected: nextCollected,
            doorUnlocked: nextDoorOpen,
            error: 'Aïe ! Botty a atterri sur un obstacle ! La case d’arrivée du saut doit être libre.',
          };
        }
        if (obs.type === 'door_locked' && !nextDoorOpen) {
          return {
            success: false,
            newPos: nextPos,
            collected: nextCollected,
            doorUnlocked: nextDoorOpen,
            error: 'Aïe ! Botty a atterri contre la porte verrouillée ! La case d’arrivée est occupée.',
          };
        }
      }

      // Check if landed on collectible star (keys require the 'collect' block)
      const jumpItem = level.collectibles?.find(
        (c) => c.x === targetX && c.y === targetY && c.type === 'star'
      );
      if (jumpItem) {
        const itemKey = `${jumpItem.type}-${jumpItem.x}-${jumpItem.y}`;
        if (!nextCollected.includes(itemKey)) {
          nextCollected.push(itemKey);
          setCollectedItems(nextCollected);
          sound.playStarCollect();
        }
      }

      return { success: true, newPos: nextPos, collected: nextCollected, doorUnlocked: nextDoorOpen };
    }

    if (type === 'collect') {
      // Collect item (especially key) at current cell
      const found = level.collectibles?.find((c) => c.x === pos.x && c.y === pos.y);
      if (found) {
        const itemKey = `${found.type}-${found.x}-${found.y}`;
        if (!nextCollected.includes(itemKey)) {
          nextCollected.push(itemKey);
          setCollectedItems(nextCollected);
          sound.playStarCollect();
          if (found.type === 'key') {
            nextDoorOpen = true;
            setDoorUnlocked(true);
            setMessage('Bravo ! Tu as ramassé la clé dorée 🔑 ! La porte magique s’ouvre !');
            setMessageType('info');
          }
        }
      } else {
        sound.playRobotBeep();
      }
      await sleep(300);
      return { success: true, newPos: nextPos, collected: nextCollected, doorUnlocked: nextDoorOpen };
    }

    if (type === 'forward') {
      const deltas: Record<Direction, { dx: number; dy: number }> = {
        right: { dx: 1, dy: 0 },
        left: { dx: -1, dy: 0 },
        up: { dx: 0, dy: -1 },
        down: { dx: 0, dy: 1 },
      };
      const d = deltas[pos.dir];
      const targetX = pos.x + d.dx;
      const targetY = pos.y + d.dy;

      // Check bounds
      if (
        targetX < 0 ||
        targetX >= level.gridWidth ||
        targetY < 0 ||
        targetY >= level.gridHeight
      ) {
        return {
          success: false,
          newPos: pos,
          collected: nextCollected,
          doorUnlocked: nextDoorOpen,
          error: 'Oups ! Botty a failli sortir du terrain ! Essaie de le faire tourner avant.',
        };
      }

      // Check obstacles
      const obs = level.obstacles?.find((o) => o.x === targetX && o.y === targetY);
      if (obs) {
        if (obs.type === 'mud') {
          return {
            success: false,
            newPos: pos,
            collected: nextCollected,
            doorUnlocked: nextDoorOpen,
            error: 'Plouf ! Botty est coincé dans la boue ! Contourne la flaque ou saute par-dessus !',
          };
        }
        if (obs.type === 'wall') {
          return {
            success: false,
            newPos: pos,
            collected: nextCollected,
            doorUnlocked: nextDoorOpen,
            error: 'Aïe ! Botty s’est cogné dans un buisson ! Change sa trajectoire.',
          };
        }
        if (obs.type === 'door_locked' && !nextDoorOpen) {
          return {
            success: false,
            newPos: pos,
            collected: nextCollected,
            doorUnlocked: nextDoorOpen,
            error: 'La porte bleue est fermée à clé ! Va sur la case de la clé et utilise le bloc "Ramasser l’objet" 🔑.',
          };
        }
      }

      setIsMoving(true);
      sound.playStep();
      nextPos = { x: targetX, y: targetY, dir: pos.dir };
      setBotPos(nextPos);

      // Auto collect stars when walking over them (keys require explicit 'collect' block)
      const autoItem = level.collectibles?.find(
        (c) => c.x === targetX && c.y === targetY && c.type === 'star'
      );
      if (autoItem) {
        const itemKey = `${autoItem.type}-${autoItem.x}-${autoItem.y}`;
        if (!nextCollected.includes(itemKey)) {
          nextCollected.push(itemKey);
          setCollectedItems(nextCollected);
          sound.playStarCollect();
        }
      }

      await sleep(250);
      setIsMoving(false);
      return { success: true, newPos: nextPos, collected: nextCollected, doorUnlocked: nextDoorOpen };
    }

    return { success: true, newPos: nextPos, collected: nextCollected, doorUnlocked: nextDoorOpen };
  };

  const handleFailedRun = (errorText: string) => {
    sound.playError();
    setIsRunning(false);
    setActiveStepIndex(null);
    setMessage(errorText);
    setMessageType('error');
  };

  // Generate real code string for the inspector
  const pythonCode = program
    .map((b) => ALL_BLOCKS[b]?.pythonCode || b)
    .join('\n');
  const jsCode = program
    .map((b) => ALL_BLOCKS[b]?.jsCode || b)
    .join('\n');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Level Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/90 backdrop-blur-xs border border-amber-200 rounded-3xl shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentLevelIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentLevelIndex === 0 || isRunning}
            className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-amber-900"
            aria-label="Niveau précédent"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-amber-900">
                {level.title}
              </span>
              {completedLevels.includes(level.id) && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Réussi !
                </span>
              )}
            </div>
            <p className="text-xs text-amber-700">{level.subtitle}</p>
          </div>

          <button
            onClick={() => setCurrentLevelIndex((prev) => Math.min(PUZZLE_LEVELS.length - 1, prev + 1))}
            disabled={currentLevelIndex === PUZZLE_LEVELS.length - 1 || isRunning}
            className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-amber-900"
            aria-label="Niveau suivant"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Level indicator dots */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {PUZZLE_LEVELS.map((lvl, idx) => {
            const isCurrent = idx === currentLevelIndex;
            const isDone = completedLevels.includes(lvl.id);
            return (
              <button
                key={lvl.id}
                onClick={() => {
                  if (!isRunning) setCurrentLevelIndex(idx);
                }}
                disabled={isRunning}
                className={`w-8 h-8 rounded-xl font-display font-bold text-xs flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-amber-500 text-white shadow-md scale-110 ring-2 ring-amber-300'
                    : isDone
                    ? 'bg-emerald-200 text-emerald-800 hover:bg-emerald-300'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {lvl.id}
              </button>
            );
          })}

          {onGoToDiploma && (
            <button
              onClick={() => {
                sound.playClick();
                onGoToDiploma();
              }}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-display font-bold text-xs transition-colors shrink-0 shadow-xs"
              title="Voir mon diplôme officiel de développeur"
            >
              <span>🎓 Diplôme</span>
            </button>
          )}
        </div>
      </div>

      {/* Mission Banner with Text-to-Speech */}
      <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-500 text-white rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shrink-0">
            {level.isBugHunt ? '🐞' : '🎯'}
          </div>
          <div>
            <h2 className="font-display font-bold text-lg sm:text-xl tracking-wide">
              {level.isBugHunt ? 'Alerte Débogage !' : 'Ta Mission :'}
            </h2>
            <p className="text-blue-50 text-sm leading-relaxed mt-0.5">
              {level.missionDescription}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-colors"
            title="Un petit indice ?"
          >
            <Lightbulb className="w-4 h-4" />
            <span>Indice</span>
          </button>
        </div>
      </div>

      {/* Hint Alert if opened */}
      {showHint && (
        <div className="bg-amber-100/90 border border-amber-300 rounded-2xl p-4 text-amber-950 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>Conseil de Botty :</strong> {level.hint}
            </span>
          </div>
          <button
            onClick={() => setShowHint(false)}
            className="text-amber-800 hover:text-amber-950 font-bold px-2 py-1"
          >
            Compris !
          </button>
        </div>
      )}

      {/* Main Workspace: Board on left, Coding Studio on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Game Board Column (7 cols) */}
        <div className="lg:col-span-7 bg-white/95 rounded-3xl border border-amber-200/80 p-5 shadow-xs flex flex-col items-center justify-center min-h-[420px]">
          <PuzzleBoard
            level={level}
            botPos={botPos}
            isMoving={isMoving}
            isJumping={isJumping}
            isCelebrating={isCelebrating}
            collectedItems={collectedItems}
            doorUnlocked={doorUnlocked}
          />

          {/* Feedback & Error Message */}
          {message && (
            <div
              className={`mt-4 px-4 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2 max-w-md text-center animate-bounce-gentle ${
                messageType === 'error'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-blue-100 text-blue-800 border border-blue-300'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Action Execution Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5 w-full pt-4 border-t border-slate-100">
            <button
              onClick={runProgram}
              disabled={isRunning || program.length === 0}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-display font-bold text-base text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{isRunning ? 'Botty est en marche...' : 'Lancer le Programme ! 🚀'}</span>
            </button>

            <button
              onClick={resetLevel}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-3.5 rounded-2xl font-semibold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition-colors"
              title="Remettre Botty au départ"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Recommencer</span>
            </button>

            <button
              onClick={() => setShowCodeInspector(!showCodeInspector)}
              className="flex items-center gap-2 px-3.5 py-3.5 rounded-2xl font-semibold text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
              title="Voir le vrai code informatique"
            >
              <Code2 className="w-4 h-4" />
              <span>{showCodeInspector ? 'Cacher le code' : 'Voir en vrai Code'}</span>
            </button>
          </div>
        </div>

        {/* Coding Workspace Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Blocks Palette (Boîte à outils de blocs) */}
          <div className="bg-white/95 rounded-3xl border border-amber-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <span>🎨 Blocs Disponibles</span>
              </h3>
              <span className="text-xs text-slate-500">Clique pour ajouter</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {level.availableBlocks.map((blockType) => (
                <BlockItem
                  key={blockType}
                  type={blockType}
                  disabled={isRunning}
                  onClick={() => handleAddBlock(blockType)}
                />
              ))}
            </div>
          </div>

          {/* Program Tray (Le Programme de Botty) */}
          <div className="bg-white/95 rounded-3xl border border-amber-200/80 p-5 shadow-xs flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  📜 Mon Programme pour Botty
                </h3>
                <span className="text-xs text-slate-500">
                  {program.length} / {level.maxBlocks} blocs utilisés
                </span>
              </div>

              {program.length > 0 && (
                <button
                  onClick={handleClear}
                  disabled={isRunning}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Tout effacer</span>
                </button>
              )}
            </div>

            {/* Program Blocks Sequence */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[340px]">
              {program.length === 0 ? (
                <div className="h-44 border-2 border-dashed border-amber-300/80 rounded-2xl flex flex-col items-center justify-center p-4 text-center text-slate-500">
                  <span className="text-3xl mb-2">👇</span>
                  <p className="font-medium text-sm text-slate-700">
                    Ton programme est vide !
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                    Clique sur un bloc ci-dessus pour donner des ordres à Botty.
                  </p>
                </div>
              ) : (
                program.map((blockType, idx) => (
                  <BlockItem
                    key={`step-${idx}-${blockType}`}
                    type={blockType}
                    index={idx}
                    isActive={activeStepIndex === idx}
                    showStepNumber={true}
                    onRemove={!isRunning ? () => handleRemoveBlock(idx) : undefined}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Code Inspector (Voir le vrai code comme un pro !) */}
      {showCodeInspector && (
        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-700 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Code2 className="w-5 h-5 text-indigo-400" />
              <h3 className="font-display font-bold text-lg text-white">
                Inspecteur de Code des Grands 👨‍💻
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Regarde comment les ingénieurs écrivent ce que tu as fait !
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Python View */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs text-sky-400 font-mono mb-2">
                <span>🐍 Langage Python</span>
              </div>
              <pre className="font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed">
                {pythonCode || '# Ton programme apparaîtra ici !'}
              </pre>
            </div>

            {/* JavaScript View */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs text-amber-400 font-mono mb-2">
                <span>⚡ Langage JavaScript</span>
              </div>
              <pre className="font-mono text-xs text-amber-300 overflow-x-auto whitespace-pre leading-relaxed">
                {jsCode || '// Ton programme apparaîtra ici !'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Victory Celebration Modal */}
      {showVictoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border-4 border-amber-300 transform animate-in zoom-in-95 duration-200">
            <div className="text-5xl mb-3 animate-bounce">🏆</div>
            <h2 className="font-display font-bold text-2xl text-slate-900 mb-1">
              Génial, tu as réussi !
            </h2>
            <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-4">
              Niveau {level.id} terminé avec succès !
            </p>

            {/* Educational concept learned card */}
            <div className="bg-amber-50 rounded-2xl p-4 text-left border border-amber-200 mb-6">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Ce que tu viens d’apprendre :</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{level.conceptTitle}</h4>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                {level.conceptExplanation}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setShowVictoryModal(false);
                  resetLevel();
                }}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Rejouer ce niveau
              </button>

              {currentLevelIndex < PUZZLE_LEVELS.length - 1 && (
                <button
                  onClick={() => {
                    setShowVictoryModal(false);
                    setCurrentLevelIndex((prev) => prev + 1);
                  }}
                  className="px-6 py-2.5 rounded-xl font-display font-bold text-sm text-white bg-emerald-500 hover:bg-emerald-600 shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>Niveau Suivant !</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => {
                  setShowVictoryModal(false);
                  sound.playSuccess();
                  if (onGoToDiploma) {
                    onGoToDiploma();
                  }
                }}
                className="px-6 py-2.5 rounded-xl font-display font-bold text-sm text-white bg-amber-500 hover:bg-amber-600 shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
              >
                <span>Voir mon Diplôme ! 🎓</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
