import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Faltan variables de entorno: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const EXERCISES_DIR = path.join(process.cwd(), 'exercises.json-master', 'exercises')
const BUCKET = 'exercises'
const GITHUB_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = buckets?.some(b => b.name === BUCKET)
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true })
    if (error) throw new Error(`Error creando bucket: ${error.message}`)
    console.log(`Bucket '${BUCKET}' creado.`)
  } else {
    console.log(`Bucket '${BUCKET}' ya existe.`)
  }
}

async function uploadImages() {
  await ensureBucket()

  const exercises = fs.readdirSync(EXERCISES_DIR).filter(name =>
    fs.statSync(path.join(EXERCISES_DIR, name)).isDirectory()
  )

  console.log(`Subiendo imágenes de ${exercises.length} ejercicios...`)

  let uploaded = 0
  let skipped = 0
  let errors = 0

  for (let i = 0; i < exercises.length; i++) {
    const exerciseName = exercises[i]
    const imagesDir = path.join(EXERCISES_DIR, exerciseName, 'images')

    if (!fs.existsSync(imagesDir)) continue

    for (const imgFile of ['0.jpg', '1.jpg']) {
      const localPath = path.join(imagesDir, imgFile)
      if (!fs.existsSync(localPath)) continue

      const storagePath = `${exerciseName}/${imgFile}`
      const fileBuffer = fs.readFileSync(localPath)

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        })

      if (error) {
        if (error.message.includes('already exists') || 'statusCode' in error && (error as { statusCode?: string }).statusCode === '409') {
          skipped++
        } else {
          console.error(`Error subiendo ${storagePath}: ${error.message}`)
          errors++
        }
      } else {
        uploaded++
      }
    }

    if ((i + 1) % 50 === 0 || i + 1 === exercises.length) {
      console.log(`  ${i + 1}/${exercises.length} ejercicios procesados (subidas: ${uploaded}, omitidas: ${skipped}, errores: ${errors})`)
    }
  }

  console.log(`\nUpload completo. Subidas: ${uploaded} | Omitidas: ${skipped} | Errores: ${errors}`)
}

async function updateUrls() {
  console.log('\nActualizando URLs en la base de datos...')

  const SUPABASE_STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`

  // Traer todos los ejercicios con gif_url de GitHub
  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('id, gif_url')
    .like('gif_url', `${GITHUB_BASE}%`)

  if (error) throw new Error(`Error leyendo ejercicios: ${error.message}`)
  if (!exercises?.length) {
    console.log('No hay URLs de GitHub para actualizar.')
    return
  }

  console.log(`Actualizando ${exercises.length} ejercicios...`)

  let updated = 0
  for (const ex of exercises) {
    const relativePath = ex.gif_url.replace(GITHUB_BASE, '')
    const newUrl = `${SUPABASE_STORAGE_BASE}${relativePath}`

    const { error: updateError } = await supabase
      .from('exercises')
      .update({ gif_url: newUrl })
      .eq('id', ex.id)

    if (updateError) {
      console.error(`Error actualizando id ${ex.id}: ${updateError.message}`)
    } else {
      updated++
    }
  }

  console.log(`URLs actualizadas: ${updated}/${exercises.length}`)
}

async function main() {
  await uploadImages()
  await updateUrls()
  console.log('\nTodo listo.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
