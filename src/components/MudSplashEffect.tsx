import React from 'react';

interface MudSplashEffectProps {
  x: number;
  y: number;
  cellSize: number;
}

// 12 droplets shooting out at various angles, distances and speeds
const DROPLETS = [
  { angle: 0, dist: 38, size: 8, color: '#78350f', delay: 0 },
  { angle: 30, dist: 46, size: 6, color: '#92400e', delay: 30 },
  { angle: 60, dist: 42, size: 9, color: '#5c2a07', delay: 10 },
  { angle: 90, dist: 50, size: 10, color: '#78350f', delay: 0 },
  { angle: 120, dist: 44, size: 7, color: '#92400e', delay: 40 },
  { angle: 150, dist: 40, size: 8, color: '#5c2a07', delay: 20 },
  { angle: 180, dist: 48, size: 9, color: '#78350f', delay: 10 },
  { angle: 210, dist: 36, size: 6, color: '#92400e', delay: 50 },
  { angle: 240, dist: 42, size: 8, color: '#5c2a07', delay: 20 },
  { angle: 270, dist: 48, size: 10, color: '#78350f', delay: 0 },
  { angle: 300, dist: 40, size: 7, color: '#92400e', delay: 30 },
  { angle: 330, dist: 45, size: 8, color: '#5c2a07', delay: 15 },
];

export const MudSplashEffect: React.FC<MudSplashEffectProps> = ({
  x,
  y,
  cellSize,
}) => {
  const left = x * cellSize;
  const top = y * cellSize;

  return (
    <div
      className="absolute pointer-events-none z-30"
      style={{
        left,
        top,
        width: cellSize,
        height: cellSize,
      }}
    >
      {/* 1. Mud shockwave expanding ripple 1 */}
      <div
        className="absolute inset-0 m-auto rounded-full border-4 border-amber-900/70 animate-mud-ripple"
        style={{ width: cellSize * 0.9, height: cellSize * 0.9 }}
      />

      {/* 2. Secondary lighter ripple */}
      <div
        className="absolute inset-0 m-auto rounded-full border-2 border-amber-700/60 animate-mud-ripple"
        style={{
          width: cellSize * 0.7,
          height: cellSize * 0.7,
          animationDelay: '0.12s',
        }}
      />

      {/* 3. Central Mud Splatter SVG */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-16 h-16 animate-pulse-subtle drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Splatter blob with organic mud spikes */}
          <path
            d="M50 20 C56 12, 64 16, 62 26 C72 22, 78 30, 74 38 C84 40, 88 52, 80 58 C88 68, 80 78, 70 76 C68 86, 56 88, 50 82 C42 88, 30 84, 30 74 C20 76, 14 66, 22 56 C12 50, 16 38, 26 36 C22 26, 32 18, 42 24 Z"
            fill="#5c2a07"
            opacity="0.85"
          />
          <path
            d="M50 28 C54 22, 60 25, 58 32 C65 30, 70 36, 66 42 C73 44, 75 52, 69 57 C74 64, 68 70, 61 69 C59 76, 50 77, 46 72 C40 76, 32 73, 33 65 C26 66, 22 59, 28 51 C21 47, 24 38, 31 37 C29 30, 36 24, 44 29 Z"
            fill="#78350f"
          />
        </svg>
      </div>

      {/* 4. Flying mud droplets shooting out */}
      {DROPLETS.map((drop, idx) => {
        const rad = (drop.angle * Math.PI) / 180;
        const tx = Math.round(Math.cos(rad) * drop.dist);
        const ty = Math.round(Math.sin(rad) * drop.dist - 14); // slightly arc upwards

        return (
          <div
            key={`mud-drop-${idx}`}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-mud-drop"
            style={
              {
                '--tx': `${tx}px`,
                '--ty': `${ty}px`,
                animationDelay: `${drop.delay}ms`,
              } as React.CSSProperties
            }
          >
            <div
              className="rounded-full shadow-sm drop-shadow"
              style={{
                width: drop.size,
                height: drop.size * 1.2,
                backgroundColor: drop.color,
                transform: `rotate(${drop.angle + 90}deg)`,
              }}
            />
          </div>
        );
      })}

      {/* 5. Comic "PLOUF !" pop badge */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 animate-plouf-badge flex items-center justify-center pointer-events-none">
        <span className="bg-amber-900/90 text-amber-100 font-display font-extrabold text-sm px-2.5 py-1 rounded-full border-2 border-amber-300 shadow-lg tracking-wider whitespace-nowrap">
          💦 PLOUF ! 💦
        </span>
      </div>
    </div>
  );
};
