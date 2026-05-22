import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Exercise, MuscleGroup } from '@/types'

const PAGE_SIZE = 20

export function useExercises(muscleGroup?: MuscleGroup, search?: string) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const pageRef = useRef(0)
  const loadingMoreRef = useRef(false)
  const hasMoreRef = useRef(true)
  const abortRef = useRef<AbortController | null>(null)

  const fetchPage = useCallback(async (mg: MuscleGroup | undefined, q: string | undefined, page: number) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    if (page === 0) setLoading(true)
    else {
      setLoadingMore(true)
      loadingMoreRef.current = true
    }

    const trimmed = q?.trim().toLowerCase() ?? ''
    const isSearching = trimmed.length > 0

    let query = supabase
      .from('exercises')
      .select('*')
      .order('name_es', { nullsFirst: false })
      .abortSignal(controller.signal)

    if (mg) query = query.eq('muscle_group', mg)

    if (isSearching) {
      query = query.or(`name_es.ilike.%${trimmed}%,name.ilike.%${trimmed}%`)
    } else {
      query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
    }

    const { data, error } = await query

    if (controller.signal.aborted) return

    if (!error && data) {
      setExercises(prev => page === 0 ? data : [...prev, ...data])
      // When searching, always return all results (no more pages)
      const more = !isSearching && data.length === PAGE_SIZE
      setHasMore(more)
      hasMoreRef.current = more
    }

    setLoading(false)
    setLoadingMore(false)
    loadingMoreRef.current = false
  }, [])

  useEffect(() => {
    pageRef.current = 0
    hasMoreRef.current = true
    void Promise.resolve().then(() => {
      setHasMore(true)
      setExercises([])
      fetchPage(muscleGroup, search, 0)
    })

    return () => { abortRef.current?.abort() }
  }, [muscleGroup, search, fetchPage])

  const loadMore = useCallback(() => {
    if (loadingMoreRef.current || !hasMoreRef.current) return
    const nextPage = pageRef.current + 1
    pageRef.current = nextPage
    fetchPage(muscleGroup, search, nextPage)
  }, [muscleGroup, search, fetchPage])

  return { exercises, loading, loadingMore, hasMore, loadMore }
}
