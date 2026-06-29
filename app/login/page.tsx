'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Mail, Lock, Loader2, Play } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const err = searchParams.get('error')
    if (err === 'TooManyAttempts') {
      setError('Muitas tentativas. Aguarde 1 minuto.')
      return
    }
    if (err) setError('Invalid email or password')
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password: password.trim(),
        redirect: false,
        callbackUrl: '/dashboard',
      })

      if (result?.error) {
        if (result.error === 'TooManyAttempts') {
          setError('Muitas tentativas. Aguarde 1 minuto.')
        } else {
          setError('Invalid email or password')
        }
        setLoading(false)
        return
      }

      if (result?.ok) {
        window.location.href = '/dashboard'
        return
      }

      setError('Invalid email or password')
      setLoading(false)
    } catch (err) {
      console.error('Login exception:', err)
      setError('Login error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-ds-bg bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: 'url(/login.jpg)' }}
    >
      <div className="absolute inset-0 bg-black/70" aria-hidden />
      <div
        className="absolute inset-0"
        style={{ background: 'var(--overlay-hero)' }}
        aria-hidden
      />
      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="ds-card p-8 backdrop-blur-sm bg-ds-surface/95">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-ds-md bg-brand mb-4">
              <Play className="w-6 h-6 text-white fill-white" strokeWidth={3} />
            </div>
            <h1 className="ds-page-title text-3xl mb-2">Prohub.</h1>
            <p className="text-ds-secondary text-sm">Sign in to access your courses</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-ds-md border border-brand/30 bg-brand/10 text-red-300 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="ds-label block mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-ds-muted w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="ds-input pl-10"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="ds-label block mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-ds-muted w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="ds-input pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="ds-btn-primary w-full disabled:opacity-50">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-ds-bg">
          <Loader2 className="w-8 h-8 animate-spin text-ds-secondary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
