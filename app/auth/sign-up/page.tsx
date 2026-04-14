'use client'

import { Suspense } from 'react'
import SignUpContent from './sign-up-content'

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <SignUpContent />
    </Suspense>
  )
}
