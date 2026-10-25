import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';
import { Sparkles, CheckCircle2, RotateCcw, Award, ChevronRight } from 'lucide-react';

interface BugScenario {
  id: number;
  title: string;
  theme: string;
  goal: string;
  steps: {
    id: string;
    text: string;
    emoji: string;
    isBug: boolean;
    bugExplanation?: string;
  }[];
}

const BUG_SCENARIOS: BugScenario[] = [
  {
    id: 1,
    title: 'La Recette de Crêpes de Botty',
    theme: 'Cuisine Magique',
    goal: 'Aide le robot cuisinier à préparer de délicieuses crêpes sans faire de bêtise !',
    steps: [
      { id: 's1', text: 'Casser 3 œufs dans le saladier', emoji: '🥚', isBug: false },
      { id: 's2', text: 'Verser la farine et le lait avec soin', emoji: '🥛', isBug: false },
      {
        id: 's3',
        text: 'Jeter une vieille chaussette puante dans la poêle !',
        emoji: '🧦',
        isBug: true,
        bugExplanation: 'Berk ! Une chaussette dans des crêpes ?! Les ordinateurs exécutent tout ce qu’on leur dit sans réfléchir, même les pires bêtises !',
      },
      { id: 's4', text: 'Faire cuire et ajouter un peu de chocolat chaud', emoji: '🍫', isBug: false },
    ],
  },
  {
    id: 2,
    title: 'Le Réveil du Matin',
    theme: 'Routine Quotidienne',
    goal: 'Le programme de réveil de Botty a un problème ! Trouve l’action bizarre.',
    steps: [
      { id: 's1', text: 'La sonnerie du réveil retentit : Drrrring !', emoji: '⏰', isBug: false },
      { id: 's2', text: 'Sauter hors du lit et s’étirer les bras', emoji: '🛏️', isBug: false },
      {
        id: 's3',
        text: 'Manger son cartable en entier pour le petit déjeuner !',
        emoji: '🎒',
        isBug: true,
        bugExplanation: 'Aïe ! Le cartable n’est pas comestible ! L’instruction devait être : "Manger des céréales croustillantes".',
      },
      { id: 's4', text: 'Brosser ses dents et enfiler ses baskets', emoji: '👟', isBug: false },
    ],
  },
  {
    id: 3,
    title: 'Le Robot Peintre en Bleu',
    theme: 'Atelier de Peinture',
    goal: 'La mission est de repeindre la cabane en BLEU ciel. Repère l’erreur de couleur !',
    steps: [
      { id: 's1', text: 'Nettoyer les planches de bois de la cabane', emoji: '🪵', isBug: false },
      {
        id: 's2',
        text: 'Tremper le pinceau dans de la peinture ROUGE éclatante !',
        emoji: '🟥',
        isBug: true,
        bugExplanation: 'Oups ! La commande demandait du BLEU ! Si un programme utilise la mauvaise couleur, tout le dessin est raté.',
      },
      { id: 's3', text: 'Appliquer la peinture avec soin sur les murs', emoji: '🖌️', isBug: false },
      { id: 's4', text: 'Laisser sécher au soleil', emoji: '☀️', isBug: false },
    ],
  },
  {
    id: 4,
    title: 'Le Décollage de la Fusée Lunaire',
    theme: 'Aventure Spatiale',
    goal: 'La fusée est prête sur le pas de tir. Un bug menace la mission !',
    steps: [
      { id: 's1', text: 'Attacher la ceinture de sécurité dans la cabine', emoji: '🧑‍🚀', isBug: false },
      { id: 's2', text: 'Compte à rebours : 3... 2... 1...', emoji: '⏱️', isBug: false },
      {
        id: 's3',
        text: 'Éteindre tous les moteurs et verrouiller les freins !',
        emoji: '🛑',
        isBug: true,
        bugExplanation: 'Oh non ! Éteindre les moteurs au moment du décollage fait rater le vol ! Il fallait allumer les réacteurs à fond !',
      },
      { id: 's4', text: 'Voler vers les étoiles scintillantes', emoji: '🚀', isBug: false },
    ],
  },
  {
    id: 5,
    title: 'Le Toutou Robot et la Balle',
    theme: 'Amis Animaux',
    goal: 'Le chien robot doit rapporter la balle rouge à son maître.',
    steps: [
      { id: 's1', text: 'Regarder la balle s’envoler dans le jardin', emoji: '🎾', isBug: false },
      { id: 's2', text: 'Courir à toute vitesse sur la pelouse', emoji: '🐕', isBug: false },
      {
        id: 's3',
        text: 'Faire une sieste de 3 heures au milieu d’un buisson',
        emoji: '😴',
        isBug: true,
        bugExplanation: 'Zzz ! Le robot s’est endormi au lieu d’attraper la balle ! En informatique, on appelle ça un blocage ou une pause infinie !',
      },
      { id: 's4', text: 'Rapporter fièrement l’objet à son maître', emoji: '✨', isBug: false },
    ],
  },
];

interface BugHunterArcadeProps {
  onGoToDiploma?: () => void;
  onBugsUpdated?: (solvedIds: number[]) => void;
}

export const BugHunterArcade: React.FC<BugHunterArcadeProps> = ({
  onGoToDiploma,
  onBugsUpdated,
}) => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [solvedScenarios, setSolvedScenarios] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('robostudio_solved_bugs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedBugId, setSelectedBugId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [showAllSolvedModal, setShowAllSolvedModal] = useState(false);

  const scenario = BUG_SCENARIOS[currentScenarioIndex];

  const handleStepClick = (stepId: string, isBug: boolean, explanation?: string) => {
    setSelectedBugId(stepId);

    if (isBug) {
      sound.playSuccess();
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.6 },
      });
      setFeedback({
        isCorrect: true,
        text: explanation || 'Bravo ! Tu as démasqué le vilain bug !',
      });

      let updatedSolved = solvedScenarios;
      if (!solvedScenarios.includes(scenario.id)) {
        updatedSolved = [...solvedScenarios, scenario.id];
        setSolvedScenarios(updatedSolved);
        try {
          localStorage.setItem('robostudio_solved_bugs', JSON.stringify(updatedSolved));
        } catch {
          // ignore
        }
        if (onBugsUpdated) {
          onBugsUpdated(updatedSolved);
        }
      }

      // If all 5 bugs have just been solved!
      if (updatedSolved.length === BUG_SCENARIOS.length) {
        setTimeout(() => {
          sound.playSuccess();
          confetti({
            particleCount: 110,
            spread: 90,
            origin: { y: 0.5 },
          });
          setShowAllSolvedModal(true);
        }, 1200);
      }
    } else {
      sound.playError();
      setFeedback({
        isCorrect: false,
        text: 'Non, cette étape est tout à fait normale ! Cherche bien l’action qui n’a aucun sens.',
      });
    }
  };

  const handleNext = () => {
    sound.playClick();
    setSelectedBugId(null);
    setFeedback(null);

    // If on the last scenario
    if (currentScenarioIndex === BUG_SCENARIOS.length - 1) {
      if (solvedScenarios.length === BUG_SCENARIOS.length) {
        // All done! Open celebration modal
        sound.playSuccess();
        setShowAllSolvedModal(true);
      } else {
        // Find first unsolved scenario
        const firstUnsolvedIdx = BUG_SCENARIOS.findIndex(
          (s) => !solvedScenarios.includes(s.id)
        );
        if (firstUnsolvedIdx !== -1) {
          setCurrentScenarioIndex(firstUnsolvedIdx);
        } else {
          setShowAllSolvedModal(true);
        }
      }
    } else {
      setCurrentScenarioIndex((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    sound.playClick();
    setSelectedBugId(null);
    setFeedback(null);
  };

  const isCurrentSolved = solvedScenarios.includes(scenario.id);
  const isAllSolved = solvedScenarios.length === BUG_SCENARIOS.length;
  const isLastScenario = currentScenarioIndex === BUG_SCENARIOS.length - 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
            🔍
          </div>
          <div>
            <h2 className="font-display font-bold text-xl sm:text-2xl">
              La Brigade Anti-Bugs 🐞
            </h2>
            <p className="text-rose-100 text-xs sm:text-sm mt-0.5">
              Un bug est une bêtise glissée dans le code. Trouve l’étape bizarre pour réparer le logiciel !
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white/20 px-3.5 py-2 rounded-2xl font-bold text-xs">
            <Award className="w-4 h-4 text-yellow-300" />
            <span>
              {solvedScenarios.length} / {BUG_SCENARIOS.length} bugs capturés
            </span>
          </div>

          {onGoToDiploma && (
            <button
              onClick={() => {
                sound.playClick();
                onGoToDiploma();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white text-rose-950 font-display font-bold text-xs shadow-xs hover:bg-rose-50 transition-colors"
              title="Voir mon diplôme officiel"
            >
              <span>🎓 Diplôme</span>
            </button>
          )}
        </div>
      </div>

      {/* Scenario Card */}
      <div className="bg-white/95 rounded-3xl border border-amber-200/80 p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              Affaire #{scenario.id} · {scenario.theme}
            </span>
            <h3 className="font-display font-bold text-xl text-slate-900">
              {scenario.title}
            </h3>
          </div>

          {/* Dots progression */}
          <div className="flex items-center gap-1.5">
            {BUG_SCENARIOS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  sound.playClick();
                  setCurrentScenarioIndex(idx);
                  setSelectedBugId(null);
                  setFeedback(null);
                }}
                className={`w-7 h-7 rounded-xl text-xs font-bold transition-all ${
                  idx === currentScenarioIndex
                    ? 'bg-rose-500 text-white shadow-xs scale-105 ring-2 ring-rose-300'
                    : solvedScenarios.includes(s.id)
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {s.id}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-600 bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
          🎯 <strong>Objectif :</strong> {scenario.goal}
        </p>

        {/* Steps List (Children click the bug!) */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Clique sur l’instruction qui contient le BUG :
          </span>

          {scenario.steps.map((step, idx) => {
            const isSelected = selectedBugId === step.id;
            const isSolved = solvedScenarios.includes(scenario.id) && step.isBug;

            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id, step.isBug, step.bugExplanation)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-150 flex items-center justify-between gap-3 ${
                  isSolved || (isSelected && step.isBug)
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm ring-2 ring-emerald-300'
                    : isSelected && !step.isBug
                    ? 'border-rose-400 bg-rose-50 text-rose-950'
                    : 'border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/40 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-2xl shrink-0">{step.emoji}</span>
                  <span className="font-semibold text-sm leading-snug">
                    {step.text}
                  </span>
                </div>

                <div className="shrink-0">
                  {isSolved || (isSelected && step.isBug) ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-xl">
                      <CheckCircle2 className="w-4 h-4" /> BUG ÉCRASÉ !
                    </span>
                  ) : isSelected && !step.isBug ? (
                    <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-1 rounded-xl">
                      Ce n’est pas un bug !
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">
                      Examiner 👀
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback message box */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl text-sm leading-relaxed flex items-start gap-3 animate-in fade-in duration-200 ${
              feedback.isCorrect
                ? 'bg-emerald-100 border border-emerald-300 text-emerald-950'
                : 'bg-rose-100 border border-rose-300 text-rose-950'
            }`}
          >
            <span className="text-2xl shrink-0">{feedback.isCorrect ? '🎉' : '🤔'}</span>
            <div>
              <p className="font-bold">{feedback.isCorrect ? 'Explication Développeur :' : 'Essaie encore !'}</p>
              <p className="text-xs sm:text-sm mt-0.5">{feedback.text}</p>
            </div>
          </div>
        )}

        {/* Action button */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>

          <div className="flex items-center gap-2">
            {isAllSolved && onGoToDiploma && (
              <button
                onClick={() => {
                  sound.playSuccess();
                  onGoToDiploma();
                }}
                className="px-5 py-2.5 rounded-xl font-display font-bold text-sm text-white bg-amber-500 hover:bg-amber-600 shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Voir mon Diplôme ! 🎓</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className={`px-5 py-2.5 rounded-xl font-display font-bold text-sm text-white transition-all shadow-xs flex items-center gap-1.5 ${
                isLastScenario
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-500 hover:bg-rose-600'
              }`}
            >
              <span>
                {isLastScenario
                  ? isAllSolved
                    ? 'Toutes les enquêtes réussies ! 🏆'
                    : 'Vérifier les enquêtes'
                  : 'Mission Suivante ➡️'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Celebration Modal when all 5 bugs are caught */}
      {showAllSolvedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border-4 border-rose-300 transform animate-in zoom-in-95 duration-200">
            <div className="text-5xl mb-3 animate-bounce">🐞🏆</div>
            <h2 className="font-display font-bold text-2xl text-slate-900 mb-1">
              Tous les Bugs sont Démasqués !
            </h2>
            <p className="text-xs text-rose-600 font-bold uppercase tracking-wider mb-4">
              Félicitations, tu es un Détective Anti-Bugs d’Élite !
            </p>

            <div className="bg-rose-50 rounded-2xl p-4 text-left border border-rose-200 mb-6 text-xs text-rose-950 space-y-2">
              <p className="font-bold text-sm text-slate-900">
                Ce que tu as prouvé :
              </p>
              <p className="text-slate-600 leading-relaxed">
                Tu as su repérer chaque instruction absurde qui bloquait les programmes. Tu sais désormais analyser et déboguer le code comme les plus grands ingénieurs !
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setShowAllSolvedModal(false);
                  setCurrentScenarioIndex(0);
                  setSelectedBugId(null);
                  setFeedback(null);
                }}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Rejouer les enquêtes 🔄
              </button>

              <button
                onClick={() => {
                  setShowAllSolvedModal(false);
                  sound.playSuccess();
                  if (onGoToDiploma) {
                    onGoToDiploma();
                  }
                }}
                className="px-6 py-2.5 rounded-xl font-display font-bold text-sm text-white bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
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
