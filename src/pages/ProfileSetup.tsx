import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useProfileStore, type UserProfile } from '@/store/useProfileStore'
import { ChevronLeft } from 'lucide-react'

type Sex = 'male' | 'female' | 'other'

const STEPS = 4

export const ProfileSetup = () => {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const saveProfile = useProfileStore(s => s.saveProfile)

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const [sex, setSex] = useState<Sex | null>(null)
  const [birthYear, setBirthYear] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')

  const canNext = [
    sex !== null,
    birthYear.length === 4 && Number(birthYear) >= 1930 && Number(birthYear) <= 2010,
    weight !== '' && Number(weight) >= 20 && Number(weight) <= 300,
    height !== '' && Number(height) >= 100 && Number(height) <= 250,
  ][step]

  const handleNext = async () => {
    if (step < STEPS - 1) {
      setStep(s => s + 1)
      return
    }
    if (!user) return
    setSaving(true)
    const profile: UserProfile = {
      sex: sex!,
      birth_year: Number(birthYear),
      weight_kg: Number(weight),
      height_cm: Number(height),
    }
    await saveProfile(user.id, profile)
    navigate('/', { replace: true })
  }

  const progress = ((step + 1) / STEPS) * 100

  return (
    <div className="min-h-screen bg-black flex flex-col px-6 pt-14 pb-10">
      {/* Progress bar */}
      <div className="w-full h-0.5 bg-[#2C2C2E] rounded-full mb-10">
        <div
          className="h-full bg-[#9BFF30] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Back button */}
      {step > 0 && (
        <button
          onClick={() => setStep(s => s - 1)}
          className="flex items-center gap-1 text-[#8E8E93] mb-8 w-fit cursor-pointer"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          <ChevronLeft size={18} />
          <span className="text-sm">Atrás</span>
        </button>
      )}

      {/* Step content */}
      <div className="flex-1 flex flex-col">
        {step === 0 && (
          <StepSex value={sex} onChange={setSex} />
        )}
        {step === 1 && (
          <StepBirthYear value={birthYear} onChange={setBirthYear} />
        )}
        {step === 2 && (
          <StepWeight value={weight} onChange={setWeight} />
        )}
        {step === 3 && (
          <StepHeight value={height} onChange={setHeight} />
        )}
      </div>

      {/* CTA */}
      <button
        onClick={handleNext}
        disabled={!canNext || saving}
        className="w-full py-4 rounded-2xl font-bold text-base bg-[#9BFF30] text-black disabled:opacity-30 transition-opacity cursor-pointer disabled:cursor-default"
        style={{ fontFamily: 'DM Sans, sans-serif' }}
      >
        {saving ? 'Guardando...' : step === STEPS - 1 ? 'Empezar' : 'Continuar'}
      </button>
    </div>
  )
}

/* ── Steps ──────────────────────────────────────────────── */

const StepSex = ({ value, onChange }: { value: Sex | null; onChange: (v: Sex) => void }) => (
  <div>
    <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
      ¿Con qué sexo te identificás?
    </h2>
    <p className="text-[#8E8E93] text-sm mb-10" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      Lo usamos para personalizar tu entrenamiento.
    </p>
    <div className="flex flex-col gap-3">
      {([
        { value: 'male', label: 'Masculino' },
        { value: 'female', label: 'Femenino' },
        { value: 'other', label: 'Prefiero no decirlo' },
      ] as { value: Sex; label: string }[]).map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`w-full py-4 px-5 rounded-2xl text-left font-medium text-base transition-all cursor-pointer ${
            value === opt.value
              ? 'bg-[#9BFF30] text-black'
              : 'bg-[#1C1C1E] text-white'
          }`}
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
)

const StepBirthYear = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div>
    <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
      ¿En qué año naciste?
    </h2>
    <p className="text-[#8E8E93] text-sm mb-10" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      Calculamos tu edad para ajustar la intensidad.
    </p>
    <input
      type="number"
      inputMode="numeric"
      placeholder="1990"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-[#1C1C1E] text-white text-4xl font-black text-center py-6 rounded-2xl outline-none border border-transparent focus:border-[#9BFF30] transition-colors"
      style={{ fontFamily: 'Syne, sans-serif' }}
      min={1930}
      max={2010}
    />
  </div>
)

const StepWeight = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div>
    <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
      ¿Cuánto pesás?
    </h2>
    <p className="text-[#8E8E93] text-sm mb-10" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      En kilogramos. Sirve para calcular cargas relativas.
    </p>
    <div className="relative">
      <input
        type="number"
        inputMode="decimal"
        placeholder="75"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-[#1C1C1E] text-white text-4xl font-black text-center py-6 rounded-2xl outline-none border border-transparent focus:border-[#9BFF30] transition-colors pr-16"
        style={{ fontFamily: 'Syne, sans-serif' }}
      />
      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#8E8E93] text-lg font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        kg
      </span>
    </div>
  </div>
)

const StepHeight = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div>
    <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
      ¿Cuánto medís?
    </h2>
    <p className="text-[#8E8E93] text-sm mb-10" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      En centímetros.
    </p>
    <div className="relative">
      <input
        type="number"
        inputMode="decimal"
        placeholder="175"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-[#1C1C1E] text-white text-4xl font-black text-center py-6 rounded-2xl outline-none border border-transparent focus:border-[#9BFF30] transition-colors pr-16"
        style={{ fontFamily: 'Syne, sans-serif' }}
      />
      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#8E8E93] text-lg font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        cm
      </span>
    </div>
  </div>
)
