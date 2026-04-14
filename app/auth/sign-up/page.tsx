'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type AuthMethod = 'phone' | 'email' | 'google'

export default function SignUpPage() {
  const router = useRouter()
  const [method, setMethod] = useState<AuthMethod>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  
  // Form state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const supabase = createClient()

  const handlePhoneSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`
      
      if (!otpSent) {
        const { error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })
        if (error) throw error
        setOtpSent(true)
      } else {
        const { error } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: otp,
          type: 'sms',
        })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? 
            `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
          },
        },
      })
      if (error) throw error
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? 
            `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 grid-pattern">
        <div className="relative z-10 w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-mono text-xs text-muted-foreground tracking-widest">{'>> EMAIL_SENT'}</p>
          <h1 className="text-3xl font-black">Check your email</h1>
          <p className="text-muted-foreground">
            We&apos;ve sent a confirmation link to <span className="text-foreground font-medium">{email}</span>
          </p>
          <Link 
            href="/auth/login"
            className="inline-block text-primary font-medium hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 grid-pattern">
      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-2.5 h-2.5 rounded-full bg-primary group-hover:animate-glow-pulse transition-all" />
            <span className="font-bold text-sm tracking-widest">DOTIQ</span>
          </Link>
          <div className="space-y-2">
            <p className="font-mono text-xs text-muted-foreground tracking-widest">{'>> NEW_USER_REGISTRATION'}</p>
            <h1 className="text-3xl font-black">Create your account</h1>
            <p className="text-muted-foreground text-sm">Start your athletic journey today</p>
          </div>
        </div>

        {/* Auth Method Tabs */}
        <div className="flex bg-card border border-border rounded-lg p-1">
          {[
            { id: 'phone', label: 'Phone' },
            { id: 'email', label: 'Email' },
            { id: 'google', label: 'Google' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setMethod(tab.id as AuthMethod)
                setError(null)
                setOtpSent(false)
              }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                method === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Phone Auth */}
        {method === 'phone' && (
          <form onSubmit={handlePhoneSignUp} className="space-y-4">
            {!otpSent ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    required
                  />
                  <p className="text-xs text-muted-foreground">We&apos;ll send you a verification code</p>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-center text-2xl tracking-widest font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-sm text-primary hover:underline"
                >
                  Change phone number
                </button>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              {loading ? 'Loading...' : otpSent ? 'Verify Code' : 'Send Code'}
            </button>
          </form>
        )}

        {/* Email Auth */}
        {method === 'email' && (
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={8}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                required
              />
              <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Google Auth */}
        {method === 'google' && (
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full py-3 bg-card border border-border text-foreground font-semibold rounded-lg hover:bg-muted disabled:opacity-50 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? 'Redirecting...' : 'Continue with Google'}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center space-y-4">
          <p className="text-xs text-muted-foreground">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
