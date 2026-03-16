import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ANTHROPIC_API_KEY) {
  console.error('Faltan variables de entorno: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

async function getPendingExercises() {
  const { data, error } = await supabase
    .from('exercises')
    .select('id, name')
    .is('name_es', null)
    .order('id')

  if (error) throw new Error(error.message)
  return data ?? []
}

async function translateBatch(names: string[]): Promise<Record<string, string>> {
  const list = names.map((n, i) => `${i + 1}. ${n}`).join('\n')

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Eres un entrenador personal hispanohablante. Traduce estos nombres de ejercicios al español neutro usado en gimnasios de Latinoamérica y España.

Reglas:
- Usa la terminología real del gym, no traducciones literales
- Ejemplos correctos: "Bench Press" → "Press de banco", "Deadlift" → "Peso muerto", "Squat" → "Sentadilla", "Pull-up" → "Dominadas", "Push-up" → "Flexiones", "Barbell Row" → "Remo con barra", "Lat Pulldown" → "Jalón al pecho"
- Si hay variante (con mancuerna, barra, máquina, cable), inclúyela en español
- Responde SOLO con JSON válido, sin texto adicional
- Formato: {"nombre original": "traducción en español"}

Ejercicios a traducir:
${list}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    return JSON.parse(text)
  } catch {
    console.warn('  Error parseando JSON, intentando extraer...')
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error(`Respuesta inválida: ${text.slice(0, 200)}`)
  }
}

async function enrich() {
  console.log('Buscando ejercicios sin traducción al español...')
  const pending = await getPendingExercises()
  console.log(`${pending.length} ejercicios para traducir`)

  if (pending.length === 0) {
    console.log('¡Todo ya está traducido!')
    return
  }

  const BATCH_SIZE = 50
  let updated = 0
  let errors = 0

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(pending.length / BATCH_SIZE)
    console.log(`\nBatch ${batchNum}/${totalBatches} (${batch.length} ejercicios)...`)

    try {
      const names = batch.map(ex => ex.name)
      const translations = await translateBatch(names)

      for (const exercise of batch) {
        const nameEs = translations[exercise.name]
        if (!nameEs) {
          console.warn(`  Sin traducción para: ${exercise.name}`)
          errors++
          continue
        }

        const { error } = await supabase
          .from('exercises')
          .update({ name_es: nameEs })
          .eq('id', exercise.id)

        if (error) {
          console.warn(`  Error actualizando "${exercise.name}":`, error.message)
          errors++
        } else {
          console.log(`  ✓ ${exercise.name} → ${nameEs}`)
          updated++
        }
      }
    } catch (err) {
      console.error(`  Error en batch ${batchNum}:`, err)
      errors += batch.length
    }

    // Pausa entre batches para no saturar la API
    if (i + BATCH_SIZE < pending.length) {
      await new Promise(r => setTimeout(r, 500))
    }
  }

  console.log(`\nListo. Traducidos: ${updated} | Errores: ${errors}`)
}

enrich().catch(err => {
  console.error(err)
  process.exit(1)
})
