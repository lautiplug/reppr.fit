interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

const CircularProgress = ({
  percentage,
  size = 45,
  strokeWidth = 4,
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#fff"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ff6900"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xs font-bold text-gray-100">
        {percentage}%
      </span>
    </div>
  );
};

export const WorkoutProgress = () => {
  return (
    <section className="bg-black px-8 py-5 m-3 rounded-2xl flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-white">
          Progreso del entrenamiento
        </h1>
        <p className="text-gray-200">12 ejercicios restantes</p>
      </div>
      <CircularProgress percentage={65} />
    </section>
  );
};
