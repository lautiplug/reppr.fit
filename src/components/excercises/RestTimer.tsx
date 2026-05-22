import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface RestTimerProps {
  seconds: number;
  elapsedOnMount?: number; // segundos ya transcurridos al montar (para persistencia)
  onDone: (elapsed: number) => void;
  onSkip: (elapsed: number) => void;
}

export function RestTimer({ seconds, elapsedOnMount = 0, onDone, onSkip }: RestTimerProps) {
  const [remaining, setRemaining] = useState(() => Math.max(0, seconds - elapsedOnMount));
  const [startedAtMs] = useState(() => Date.now() - elapsedOnMount * 1000);
  const startedAt = useRef(startedAtMs);
  const onDoneRef = useRef(onDone);
  const onSkipRef = useRef(onSkip);

  useLayoutEffect(() => {
    onDoneRef.current = onDone;
    onSkipRef.current = onSkip;
  });

  useEffect(() => {
    if (remaining <= 0) {
      navigator.vibrate?.(10);
      onDoneRef.current(Math.round((Date.now() - startedAt.current) / 1000));
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  const handleSkip = () => {
    onSkipRef.current(Math.round((Date.now() - startedAt.current) / 1000));
  };

  const onAdditionalTime = (extraSeconds: number) => {
    setRemaining((r) => r + extraSeconds);
  };

  const onLessTime = (lessSeconds: number) => {
    setRemaining((r) => Math.max(0, r - lessSeconds));
  };

  const pct = (remaining / seconds) * 100;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="#9BFF30"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white tabular-nums">
          {mins > 0 ? `${mins}:${String(secs).padStart(2, "0")}` : secs}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-white border border-white p-2 rounded-xl" onClick={() => onLessTime(30)}>
          -30
        </button>
        <button className="text-white border border-white p-2 rounded-xl" onClick={() => onAdditionalTime(30)}>
          +30
        </button>
      </div>
      <button
        onClick={handleSkip}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 text-white/60 text-sm cursor-pointer hover:bg-white/20 transition-colors"
      >
        <X size={14} />
        Saltar descanso
      </button>
    </div>
  );
}
