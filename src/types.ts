/**
 * Types for RoboStudio - Software Creation for 7yo Kids
 */

export type BlockType =
  | 'forward'        // Avancer
  | 'turn_left'      // Tourner à gauche
  | 'turn_right'     // Tourner à droite
  | 'jump'           // Sauter
  | 'collect'        // Ramasser
  | 'repeat_2'       // Répéter 2 fois
  | 'repeat_3'       // Répéter 3 fois
  | 'repeat_4'       // Répéter 4 fois
  | 'if_key'         // Si j'ai la clé
  | 'paint_blue'     // Peindre en bleu
  | 'sound_beep';    // Faire bip

export interface CodeBlockItem {
  id: string;
  type: BlockType;
  label: string;
  icon: string;
  color: string;
  category: 'motion' | 'action' | 'control' | 'condition';
  description: string;
  jsCode: string;
  pythonCode: string;
}

export type Direction = 'up' | 'right' | 'down' | 'left';

export interface GridCell {
  x: number;
  y: number;
  type: 'empty' | 'wall' | 'water' | 'mud' | 'goal' | 'star' | 'key' | 'door_locked' | 'door_open';
}

export interface PuzzleLevel {
  id: number;
  title: string;
  subtitle: string;
  missionDescription: string;
  voiceText: string;
  conceptTitle: string;
  conceptExplanation: string;
  gridWidth: number;
  gridHeight: number;
  startPos: { x: number; y: number; dir: Direction };
  goalPos: { x: number; y: number };
  collectibles?: { x: number; y: number; type: 'star' | 'key' }[];
  obstacles?: { x: number; y: number; type: 'wall' | 'mud' | 'door_locked' }[];
  availableBlocks: BlockType[];
  maxBlocks: number;
  hint: string;
  preloadedBlocks?: BlockType[];
  isBugHunt?: boolean; // For debugging levels where preloaded blocks have an intentional bug to fix!
}

export interface ChildProfile {
  name: string;
  avatar: string;
  starsCollected: number;
  completedLevels: number[];
  badges: string[];
}

// App / Game Maker Types
export type GameWorld = 'forest' | 'space' | 'candy' | 'ocean' | 'city';
export type HeroSprite = 'robot' | 'cat' | 'dino' | 'star' | 'rocket';

export interface GameEventRule {
  id: string;
  trigger:
    | 'on_start'
    | 'on_click_hero'
    | 'on_click_star'
    | 'on_key_right'
    | 'on_key_left'
    | 'on_key_jump'
    | 'on_touch_item';
  triggerLabel: string;
  action:
    | 'move_right'
    | 'move_left'
    | 'jump'
    | 'spin'
    | 'add_score'
    | 'add_score_1'
    | 'add_score_2'
    | 'add_score_5'
    | 'make_sound'
    | 'confetti'
    | 'say_hello'
    | 'change_costume';
  actionLabel: string;
  paramValue?: number | string;
}
