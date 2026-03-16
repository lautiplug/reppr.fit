import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Faltan variables de entorno: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const MUSCLE_MAP: Record<string, string> = {
  abdominals: 'core',
  abductors: 'legs',
  adductors: 'legs',
  biceps: 'biceps',
  calves: 'calves',
  chest: 'chest',
  forearms: 'forearms',
  glutes: 'glutes',
  hamstrings: 'legs',
  'hip flexors': 'legs',
  'it band': 'legs',
  'lower back': 'back',
  'middle back': 'back',
  lats: 'back',
  neck: 'shoulders',
  quadriceps: 'legs',
  shoulders: 'shoulders',
  traps: 'shoulders',
  triceps: 'triceps',
}

interface FreeExercise {
  id: string
  name: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
  instructions: string[]
  category: string
  equipment: string
  images: string[]
}

const IMAGE_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'

async function seed() {
  console.log('Fetching exercises from free-exercise-db...')
  const response = await fetch(
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
  )
  if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`)

  const exercises: FreeExercise[] = await response.json()
  console.log(`Fetched ${exercises.length} exercises`)

  const mapped = exercises
    .filter(ex => ex.primaryMuscles.length > 0 && MUSCLE_MAP[ex.primaryMuscles[0].toLowerCase()])
    .map(ex => ({
      name: ex.name,
      muscle_group: MUSCLE_MAP[ex.primaryMuscles[0].toLowerCase()],
      secondary_muscles: ex.secondaryMuscles
        .map(m => MUSCLE_MAP[m.toLowerCase()])
        .filter(Boolean),
      description: ex.instructions.join(' '),
      gif_url: ex.images[0] ? `${IMAGE_BASE}${ex.images[0]}` : null,
    }))

  console.log(`Inserting ${mapped.length} exercises into Supabase...`)

  const batchSize = 100
  for (let i = 0; i < mapped.length; i += batchSize) {
    const batch = mapped.slice(i, i + batchSize)
    const { error } = await supabase.from('exercises').insert(batch)
    if (error) {
      console.error(`Error in batch ${Math.floor(i / batchSize) + 1}:`, error.message)
      process.exit(1)
    }
    console.log(`Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(mapped.length / batchSize)} insertado`)
  }

  console.log('Seed completado.')
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
