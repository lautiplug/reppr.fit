interface ExerciseFlipProps {
  gifUrl: string
  alt: string
  playing?: boolean
  className?: string
  onLoad?: () => void
}

export function ExerciseFlip({ gifUrl, alt, playing = false, className, onLoad }: ExerciseFlipProps) {
  const img0 = gifUrl
  const img1 = gifUrl.replace(/\/0\.jpg$/, '/1.jpg')
  const playState = playing ? 'running' : 'paused'

  return (
    <div className={`relative ${className ?? ''}`}>
      <style>{`
        @keyframes exercise-flip-0 {
          0%        { opacity: 1; }
          40%, 50%  { opacity: 0; }
          90%, 100% { opacity: 1; }
        }
        @keyframes exercise-flip-1 {
          0%        { opacity: 0; }
          40%, 50%  { opacity: 1; }
          90%, 100% { opacity: 0; }
        }
      `}</style>

      <img
        src={img0}
        alt={alt}
        onLoad={onLoad}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ animation: 'exercise-flip-0 2s ease-in-out infinite', animationPlayState: playState }}
      />
      <img
        src={img1}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        style={{ animation: 'exercise-flip-1 2s ease-in-out infinite', animationPlayState: playState }}
      />
    </div>
  )
}
