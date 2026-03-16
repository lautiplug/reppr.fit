import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY ?? ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RAPIDAPI_KEY) {
  console.error('Faltan variables de entorno: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RAPIDAPI_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Trae ejercicios que aún no tienen gif de ExerciseDB (gif_url con github o null)
async function getPendingExercises(limit: number) {
  const { data, error } = await supabase
    .from('exercises')
    .select('id, name')
    .or('gif_url.is.null,gif_url.like.%githubusercontent%')
    .limit(limit)

  if (error) throw new Error(error.message)
  return data ?? []
}

async function searchGif(name: string): Promise<string | null> {
  const encoded = encodeURIComponent(name)
  const url = `https://exercisedb.p.rapidapi.com/exercises/name/${encoded}?limit=1&offset=0`
  const response = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
    },
  })

  if (!response.ok) {
    console.warn(`  RapidAPI error para "${name}": ${response.status}`)
    return null
  }

  const results = await response.json()
  return results?.[0]?.gifUrl ?? null
}

async function enrich() {
  const DAILY_LIMIT = 600 // usa la mayoría del cupo mensual de una vez
  console.log(`Buscando hasta ${DAILY_LIMIT} ejercicios sin GIF...`)

  const pending = await getPendingExercises(DAILY_LIMIT)
  console.log(`${pending.length} ejercicios para enriquecer`)

  let updated = 0
  let notFound = 0

  for (const exercise of pending) {
    const gifUrl = await searchGif(exercise.name)

    if (gifUrl) {
      const { error } = await supabase
        .from('exercises')
        .update({ gif_url: gifUrl })
        .eq('id', exercise.id)

      if (error) {
        console.warn(`  Error actualizando "${exercise.name}":`, error.message)
      } else {
        console.log(`  ✓ ${exercise.name}`)
        updated++
      }
    } else {
      console.log(`  - No encontrado: ${exercise.name}`)
      notFound++
    }

    // Pausa para respetar el rate limit de 1000/hora
    await new Promise(r => setTimeout(r, 100))
  }

  console.log(`\nListo. Actualizados: ${updated} | No encontrados: ${notFound}`)
}

enrich().catch(err => {
  console.error(err)
  process.exit(1)
})
