import React from 'react';
import { ALL_BLOCKS } from '../data/codingBlocks';
import { BlockType } from '../types';
import { X, Play } from 'lucide-react';

interface BlockItemProps {
  type: BlockType;
  index?: number;
  isActive?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  disabled?: boolean;
  isDraggable?: boolean;
  showStepNumber?: boolean;
}

export const BlockItem: React.FC<BlockItemProps> = ({
  type,
  index,
  isActive = false,
  onRemove,
  onClick,
  disabled = false,
  showStepNumber = false,
}) => {
  const block = ALL_BLOCKS[type] || {
    id: type,
    type,
    label: type,
    icon: '📦',
    color: 'bg-slate-600 text-white',
    category: 'motion',
  };

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`group relative flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 select-none ${
        block.color
      } ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
      } ${
        isActive
          ? 'ring-4 ring-yellow-400 scale-105 shadow-lg brightness-110 z-10'
          : 'shadow-xs'
      }`}
    >
      {/* Optional Step counter (1, 2, 3...) */}
      {showStepNumber && typeof index === 'number' && (
        <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
          {index + 1}
        </span>
      )}

      {/* Block Icon & Label */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-lg shrink-0 drop-shadow-xs">{block.icon}</span>
        <span className="font-semibold tracking-wide truncate">{block.label}</span>
      </div>

      {/* Remove button if inside program list */}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="w-6 h-6 rounded-lg bg-black/15 hover:bg-black/30 flex items-center justify-center text-white transition-colors shrink-0"
          title="Retirer ce bloc"
          aria-label="Retirer ce bloc"
        >
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      )}

      {/* Active step indicator dot */}
      {isActive && (
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-300 rounded-full animate-ping" />
      )}
    </div>
  );
};
