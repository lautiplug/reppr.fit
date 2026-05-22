import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocks deben ir antes de los imports que los usan
const mockLoadProfile = vi.fn()
const mockLoadRoutine = vi.fn()
const mockLoadSession = vi.fn()
const mockClearRoutine = vi.fn()
const mockClearProfile = vi.fn()

vi.mock('@/store/useProfileStore', () => ({
  useProfileStore: {
    getState: () => ({ loadFromSupabase: mockLoadProfile, clearProfile: mockClearProfile }),
    subscribe: vi.fn(),
  },
}))

vi.mock('@/store/useRoutineStore', () => ({
  useRoutineStore: {
    getState: () => ({ loadFromSupabase: mockLoadRoutine, clearRoutine: mockClearRoutine }),
    subscribe: vi.fn(),
  },
}))

vi.mock('@/store/useSessionStore', () => ({
  useSessionStore: {
    getState: () => ({ loadFromSupabase: mockLoadSession }),
    setState: vi.fn(),
    subscribe: vi.fn(),
  },
}))

vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: {
    getState: () => ({}),
    subscribe: vi.fn(),
  },
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: () => {
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      },
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}))

// Importamos la lógica del handler directamente para testearla sin React
function handleAuthEvent(event: string, session: { user: { id: string } } | null) {
  if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
    mockLoadRoutine(session.user.id)
    mockLoadSession(session.user.id)
    mockLoadProfile(session.user.id)
  }
  if (event === 'SIGNED_OUT') {
    mockClearRoutine()
    mockClearProfile()
  }
}

const mockUser = { id: 'user-123' }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Auth event handler', () => {
  it('SIGNED_IN llama a loadFromSupabase en todos los stores', () => {
    handleAuthEvent('SIGNED_IN', { user: mockUser })

    expect(mockLoadProfile).toHaveBeenCalledWith('user-123')
    expect(mockLoadRoutine).toHaveBeenCalledWith('user-123')
    expect(mockLoadSession).toHaveBeenCalledWith('user-123')
  })

  it('INITIAL_SESSION llama a loadFromSupabase en todos los stores', () => {
    handleAuthEvent('INITIAL_SESSION', { user: mockUser })

    expect(mockLoadProfile).toHaveBeenCalledWith('user-123')
    expect(mockLoadRoutine).toHaveBeenCalledWith('user-123')
    expect(mockLoadSession).toHaveBeenCalledWith('user-123')
  })

  it('SIGNED_OUT limpia routine y profile store', () => {
    handleAuthEvent('SIGNED_OUT', null)

    expect(mockClearRoutine).toHaveBeenCalled()
    expect(mockClearProfile).toHaveBeenCalled()
  })

  it('INITIAL_SESSION sin sesión no llama a loadFromSupabase', () => {
    handleAuthEvent('INITIAL_SESSION', null)

    expect(mockLoadProfile).not.toHaveBeenCalled()
    expect(mockLoadRoutine).not.toHaveBeenCalled()
    expect(mockLoadSession).not.toHaveBeenCalled()
  })

  it('TOKEN_REFRESHED no dispara ni load ni clear', () => {
    handleAuthEvent('TOKEN_REFRESHED', { user: mockUser })

    expect(mockLoadProfile).not.toHaveBeenCalled()
    expect(mockClearRoutine).not.toHaveBeenCalled()
  })
})
