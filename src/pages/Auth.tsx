import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export const Auth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) {
      console.error('[Auth] Google sign-in error:', error)
      setError('No se pudo iniciar sesión. Intentá de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-xs flex flex-col items-center gap-8">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2">
          <h1
            className="text-5xl font-bold text-white tracking-tight font-display"
          >
            reppr.fit
          </h1>
          <p
            className="text-base text-[#8E8E93] font-body"
          >
            Entrená con propósito.
          </p>
        </div>

        {/* Google button */}
        <div className="w-full flex flex-col items-center gap-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium text-base rounded-full py-3 px-6 disabled:opacity-60 transition-opacity font-body"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.8757 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z"
                  fill="#4285F4"
                />
                <path
                  d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z"
                  fill="#34A853"
                />
                <path
                  d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z"
                  fill="#FBBC04"
                />
                <path
                  d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {!loading && 'Continuar con Google'}
            {loading && 'Conectando...'}
          </button>

          {error && (
            <p
              className="text-sm text-red-500 text-center font-body"
            >
              {error}
            </p>
          )}
        </div>

        {/* Fine print */}
        <p
          className="text-xs text-[#8E8E93] text-center font-body"
        >
          Al continuar aceptás los términos de uso.
        </p>
      </div>
    </div>
  )
}
