import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BicepsFlexed,
  Check,
  Clock,
  Dumbbell,
  Flame,
  House,
  Scale,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type {
  Equipment,
  RoutineSetupAnswers,
  TrainingGoal,
  TrainingLevel,
} from "@/types";
import { useRoutineStore } from "@/store/useRoutineStore";

// --- comments ---

const COMMENTS = [
  {
    text: "4 preguntas",
  },
  {
    text: "Tus respuestas ayudarán a personalizar tu rutina",
  },
  {
    text: "Todas las respuestas se mantienen seguras y privadas",
  },
];

// --- --- //

// --- Option definitions ---

const GOAL_OPTIONS: {
  value: TrainingGoal;
  label: string;
  description: string;
  emoji: ReactNode;
}[] = [
  {
    value: "muscle",
    label: "Ganar músculo",
    description: "Hipertrofia y fuerza",
    emoji: <BicepsFlexed strokeWidth={1.5} />,
  },
  {
    value: "fat_loss",
    label: "Perder peso",
    description: "Cardio y déficit calórico",
    emoji: <Flame strokeWidth={1.5} />,
  },
  {
    value: "maintain",
    label: "Mantenerme",
    description: "Salud general y bienestar",
    emoji: <Scale strokeWidth={1.5} />,
  },
  {
    value: "performance",
    label: "Rendimiento",
    description: "Potencia, velocidad y agilidad",
    emoji: <Zap strokeWidth={1.5} />,
  },
];

const LEVEL_OPTIONS: {
  value: TrainingLevel;
  label: string;
  description: string;
}[] = [
  {
    value: "beginner",
    label: "Principiante",
    description: "Menos de 1 año entrenando",
  },
  {
    value: "intermediate",
    label: "Intermedio",
    description: "1 a 3 años entrenando",
  },
  {
    value: "advanced",
    label: "Avanzado",
    description: "Más de 3 años entrenando",
  },
];

const EQUIPMENT_OPTIONS: {
  value: Equipment;
  label: string;
  description: string;
  emoji: ReactNode;
}[] = [
  {
    value: "full_gym",
    label: "Gym completo",
    description: "Máquinas, barras y mancuernas",
    emoji: <Dumbbell strokeWidth={1.5} />,
  },
  {
    value: "home_weights",
    label: "Pesas en casa",
    description: "Mancuernas y/o barra",
    emoji: <House strokeWidth={1.5} />,
  },
  {
    value: "bodyweight",
    label: "Peso corporal",
    description: "Sin equipamiento",
    emoji: <BicepsFlexed strokeWidth={1.5} />,
  },
];

const DAYS_OPTIONS = [2, 3, 4, 5, 6];

const STEPS = ["objetivo", "experiencia", "días", "equipamiento"] as const;

// --- Sub-components ---

function OptionButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-colors flex items-center gap-3 bg-[#000000]/0 ${
        active
          ? "border-[#9BFF30] bg-[#202021]"
          : "border-none bg-[#202021]"
      }`}
    >
      {children}
    </button>
  );
}

function ContinueButton({
  disabled,
  onClick,
  label = "Continuar",
}: {
  disabled: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`mt-8 w-full font-bold text-base rounded-full py-4 flex items-center justify-center gap-2 transition-colors ${
        disabled
          ? "bg-[#3A3A3C] text-[#636366] cursor-not-allowed"
          : "bg-[#9BFF30] text-black"
      }`}
      style={{ fontFamily: "Syne, sans-serif" }}
    >
      {label}
      <ArrowRight className="w-5 h-5" />
    </button>
  );
}

// --- Main component ---

interface Props {
  onComplete: (answers: RoutineSetupAnswers) => void;
  initialAnswers?: RoutineSetupAnswers;
}

function inferStep(draft: Partial<RoutineSetupAnswers> | null): number {
  if (!draft) return -1;
  if (!draft.goal) return 0;
  if (!draft.level) return 1;
  if (!draft.daysPerWeek) return 2;
  if (!draft.equipment) return 3;
  return 3;
}

export const SetupQuiz = ({ onComplete, initialAnswers }: Props) => {
  const navigate = useNavigate();
  const { draftAnswers, setDraftAnswers, clearDraftAnswers } = useRoutineStore();

  const draft = draftAnswers ?? (initialAnswers ? initialAnswers : null);

  const [step, setStep] = useState(() => inferStep(draft));
  const [goal, setGoal] = useState<TrainingGoal | null>(draft?.goal ?? null);
  const [level, setLevel] = useState<TrainingLevel | null>(draft?.level ?? null);
  const [days, setDays] = useState<number | null>(draft?.daysPerWeek ?? null);
  const [equipment, setEquipment] = useState<Equipment | null>(draft?.equipment ?? null);

  const saveDraft = (patch: Partial<RoutineSetupAnswers>) => {
    setDraftAnswers({ goal, level, daysPerWeek: days ?? undefined, equipment, ...patch } as Partial<RoutineSetupAnswers>);
  };

  const goBack = () => {
    setStep((s) => s - 1);
  };

  const advance = () => setStep((s) => s + 1);

  return (
    <div className="px-5 pb-28 bg-linear-to-b from-[#5c981c] from-1% via-[#20300E] via-44% to-black to-81%">
      {/* Pantalla intro */}
      {step === -1 && (
        <div className="flex flex-col min-h-[80vh] gap-3">
          <div className="flex items-center justify-between mt-5">
            <button
              onClick={() => navigate(-1)}
              className="self-start p-2 rounded-full bg-[#2C2C2E] text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <p className="text-[#ececec]">Saltar</p>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center gap-4">
            {/* Ícono */}
            <div className="w-18 h-18 rounded-2xl bg-[#9BFF30]/30 flex items-center justify-center">
              <Dumbbell
                className="w-12 h-12 text-[#9BFF30]"
                strokeWidth={1.5}
              />
            </div>

            {/* Título y subtítulo */}
            <div className="flex flex-col gap-2">
              <h1
                className="font-black text-3xl text-white leading-tight"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Armemos tu rutina
              </h1>
              <p className="text-[#ceced5] text-sm">
                4 preguntas para conocerte y poder crear un crecimiento
                personalizado que realmente se adapte a vos.
              </p>
            </div>

            <div className="bg-[#9BFF30]/10 border border-[#9BFF30] rounded-lg w-full px-4 py-3 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-white">
                <Clock className="text-[#9BFF30] w-5 h-5" />
                <p className="text-[15px]">Sólo toma 1-2 minutos</p>
              </div>
              <div className="text-left mt-2">
                <ul>
                  {COMMENTS.map((c, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-1 text-[#ceced5] text-xs mt-2"
                    >
                      <Check className="w-4 h-4 text-gray-200" />
                      {c.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Lista de pasos */}
            <div className="w-full flex flex-col gap-2 text-left">
              {[
                "Objetivo (ganar músculo, perder peso, etc.)",
                "Experiencia (principiante, intermedio, avanzado)",
                "Días disponibles (2, 3, 4, 5 o 6)",
                "Equipamiento (gym completo, pesas en casa etc.)",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full bg-[#9BFF30]/40 text-[#9BFF30] text-sm font-bold flex items-center justify-center shrink-0"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[#ceced5] text-[13px]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => setStep(0)}
            className="w-full bg-[#9BFF30] text-black font-bold text-base rounded-full py-4 flex items-center justify-center gap-2 mt-8"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Empezar
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Header (pasos del quiz) */}
      {step >= 0 && (
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={goBack}
            className="p-2 rounded-full bg-[#2C2C2E] text-white mt-5"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-1.5 flex-1 mt-5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-[#9BFF30]" : "bg-[#3A3A3C]"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 0 — Objetivo */}
      {step === 0 && (
        <>
          <h2
            className="font-black text-2xl text-white mb-1"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            ¿Cuál es tu objetivo?
          </h2>
          <p className="text-sm text-[#e1e1e8] mb-6">
            Esto define el enfoque de tu rutina.
          </p>
          <div className="flex flex-col gap-2">
            {GOAL_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.value}
                active={goal === opt.value}
                onClick={() => { setGoal(opt.value); saveDraft({ goal: opt.value }); }}
              >
                <span className="text-2xl text-[#9BFF30]">{opt.emoji}</span>
                <div>
                  <p
                    className="font-bold text-white text-sm"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {opt.label}
                  </p>
                  <p className="text-xs text-[#8E8E93] mt-0.5">
                    {opt.description}
                  </p>
                </div>
              </OptionButton>
            ))}
          </div>
          <ContinueButton disabled={!goal} onClick={advance} />
        </>
      )}

      {/* Step 1 — Experiencia */}
      {step === 1 && (
        <>
          <h2
            className="font-black text-2xl text-white mb-1"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            ¿Cuál es tu experiencia?
          </h2>
          <p className="text-sm text-[#e1e1e8] mb-6">
            Adaptamos la intensidad y volumen.
          </p>
          <div className="flex flex-col gap-2">
            {LEVEL_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.value}
                active={level === opt.value}
                onClick={() => { setLevel(opt.value); saveDraft({ level: opt.value }); }}
              >
                <div>
                  <p
                    className="font-bold text-white text-sm"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {opt.label}
                  </p>
                  <p className="text-xs text-[#8E8E93] mt-0.5">
                    {opt.description}
                  </p>
                </div>
              </OptionButton>
            ))}
          </div>
          <ContinueButton disabled={!level} onClick={advance} />
        </>
      )}

      {/* Step 2 — Días */}
      {step === 2 && (
        <>
          <h2
            className="font-black text-2xl text-white mb-1"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            ¿Cuántos días por semana?
          </h2>
          <p className="text-sm text-[#e1e1e8] mb-6">
            Armamos la estructura semanal en base a esto.
          </p>
          <div className="flex gap-2">
            {DAYS_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => { setDays(d); saveDraft({ daysPerWeek: d }); }}
                className={`flex-1 py-5 rounded-2xl border-2 font-black text-2xl transition-colors ${
                  days === d
                    ? "border-[#9BFF30] bg-[#3A3A3C] text-white"
                    : "border-[#38383A] bg-[#2C2C2E] text-white"
                }`}
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {d}
              </button>
            ))}
          </div>
          <ContinueButton disabled={!days} onClick={advance} />
        </>
      )}

      {/* Step 3 — Equipamiento */}
      {step === 3 && (
        <>
          <h2
            className="font-black text-2xl text-white mb-1"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            ¿Con qué equipamiento contás?
          </h2>
          <p className="text-sm text-[#e1e1e8] mb-6">
            Elegimos ejercicios que puedas hacer.
          </p>
          <div className="flex flex-col gap-2">
            {EQUIPMENT_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.value}
                active={equipment === opt.value}
                onClick={() => { setEquipment(opt.value); saveDraft({ equipment: opt.value }); }}
              >
                <span className="text-2xl text-[#9BFF30]">{opt.emoji}</span>
                <div>
                  <p
                    className="font-bold text-white text-sm"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {opt.label}
                  </p>
                  <p className="text-xs text-[#8E8E93] mt-0.5">
                    {opt.description}
                  </p>
                </div>
              </OptionButton>
            ))}
          </div>
          <ContinueButton
            disabled={!equipment}
            label="Generar mi rutina"
            onClick={() => {
              if (!equipment) return;
              clearDraftAnswers();
              onComplete({ goal: goal!, level: level!, daysPerWeek: days!, equipment });
            }}
          />
        </>
      )}
    </div>
  );
};
