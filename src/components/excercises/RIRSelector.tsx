interface RIRSelectorProps {
  value?: number
  completed?: boolean
  onChange: (rir: number | undefined) => void
}

export function RIRSelector({ value, completed, onChange }: RIRSelectorProps) {
  return (
    <input
      type="number"
      inputMode="numeric"
      value={value ?? ''}
      placeholder="—"
      min={0}
      onChange={e => onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
      className={[
        'w-10 h-11 shrink-0 rounded-xl text-center text-[14px] font-bold outline-none border transition-colors',
        completed && value !== undefined
          ? 'bg-brand/15 border-brand/50 text-brand'
          : 'bg-white/8 border-transparent text-white/60 focus:border-brand',
      ].join(' ')}
    />
  )
}
