import React from 'react';
import { Direction, PuzzleLevel } from '../types';
import { RobotSprite } from './RobotSprite';

interface PuzzleBoardProps {
  level: PuzzleLevel;
  botPos: { x: number; y: number; dir: Direction };
  isMoving: boolean;
  isJumping: boolean;
  isCelebrating: boolean;
  collectedItems: string[]; // e.g., 'star-3-1', 'key-2-0'
  doorUnlocked: boolean;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  level,
  botPos,
  isMoving,
  isJumping,
  isCelebrating,
  collectedItems,
  doorUnlocked,
}) => {
  const cellSize = 68; // comfortable square size for kids
  const widthPx = level.gridWidth * cellSize;
  const heightPx = level.gridHeight * cellSize;

  return (
    <div className="flex flex-col items-center">
      {/* Container with playful board frame */}
      <div
        className="relative bg-emerald-100/80 border-4 border-emerald-300 rounded-3xl p-3 shadow-inner select-none overflow-hidden"
        style={{
          width: widthPx + 24,
          height: heightPx + 24,
        }}
      >
        {/* Soft background grid pattern */}
        <div
          className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-emerald-50 to-emerald-100"
          style={{ width: widthPx, height: heightPx }}
        >
          {/* Grid lines and background tiles */}
          {Array.from({ length: level.gridHeight }).map((_, y) => (
            <div key={`row-${y}`} className="flex">
              {Array.from({ length: level.gridWidth }).map((__, x) => {
                const isEven = (x + y) % 2 === 0;
                return (
                  <div
                    key={`tile-${x}-${y}`}
                    className={`border border-emerald-200/50 flex items-center justify-center transition-colors ${
                      isEven ? 'bg-emerald-50/60' : 'bg-emerald-100/40'
                    }`}
                    style={{ width: cellSize, height: cellSize }}
                  >
                    {/* Subtle dot at tile center */}
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300/40" />
                  </div>
                );
              })}
            </div>
          ))}

          {/* Goal position (Target Flag) */}
          <div
            className="absolute flex items-center justify-center transition-transform"
            style={{
              left: level.goalPos.x * cellSize,
              top: level.goalPos.y * cellSize,
              width: cellSize,
              height: cellSize,
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-200/80 border-2 border-dashed border-amber-400 flex items-center justify-center animate-pulse-subtle">
              <span className="text-2xl" role="img" aria-label="Arrivée">
                🏁
              </span>
            </div>
          </div>

          {/* Collectibles (Stars, Keys) */}
          {level.collectibles?.map((item) => {
            const itemKey = `${item.type}-${item.x}-${item.y}`;
            const isCollected = collectedItems.includes(itemKey);

            if (isCollected) return null;

            return (
              <div
                key={itemKey}
                className="absolute flex items-center justify-center"
                style={{
                  left: item.x * cellSize,
                  top: item.y * cellSize,
                  width: cellSize,
                  height: cellSize,
                }}
              >
                <div className="text-3xl animate-bounce-gentle drop-shadow-md">
                  {item.type === 'star' ? '⭐' : '🔑'}
                </div>
              </div>
            );
          })}

          {/* Obstacles (Mud, Walls, Doors) */}
          {level.obstacles?.map((obs, idx) => {
            const isDoor = obs.type === 'door_locked';
            const isDoorOpen = isDoor && doorUnlocked;

            return (
              <div
                key={`obs-${idx}-${obs.x}-${obs.y}`}
                className="absolute flex items-center justify-center"
                style={{
                  left: obs.x * cellSize,
                  top: obs.y * cellSize,
                  width: cellSize,
                  height: cellSize,
                }}
              >
                {obs.type === 'mud' && (
                  <div
                    className="w-14 h-14 rounded-full bg-amber-800/40 border-2 border-amber-900/40 flex items-center justify-center text-xl shadow-inner"
                    title="Flaque de boue (obstacle !)"
                  >
                    🟤
                  </div>
                )}
                {obs.type === 'wall' && (
                  <div
                    className="w-14 h-14 rounded-2xl bg-slate-300 border-2 border-slate-400 flex items-center justify-center text-xl shadow-xs"
                    title="Buisson / Mur"
                  >
                    🌿
                  </div>
                )}
                {isDoor && (
                  <div
                    className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl transition-all ${
                      isDoorOpen
                        ? 'bg-emerald-100 border-emerald-400 opacity-60'
                        : 'bg-rose-100 border-rose-400 shadow-sm'
                    }`}
                    title={isDoorOpen ? 'Porte déverrouillée !' : 'Porte verrouillée !'}
                  >
                    {isDoorOpen ? '🚪' : '🔒'}
                  </div>
                )}
              </div>
            );
          })}

          {/* Animated Robot "Botty" */}
          <div
            className="absolute flex items-center justify-center transition-all duration-300 ease-out z-20 pointer-events-none"
            style={{
              left: botPos.x * cellSize,
              top: botPos.y * cellSize,
              width: cellSize,
              height: cellSize,
            }}
          >
            <RobotSprite
              direction={botPos.dir}
              isMoving={isMoving}
              isJumping={isJumping}
              isCelebrating={isCelebrating}
              hasKey={collectedItems.some((k) => k.startsWith('key-'))}
              size={54}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
