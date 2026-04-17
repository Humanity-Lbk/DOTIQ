import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export type Role = 'user' | 'admin' | 'super_admin'

export interface Profile {
  full_name: string | null
  role: Role
}

export interface UserProfileSnapshot {
  user: User | null
  profile: Profile | null
}

export const USER_PROFILE_CACHE_KEY = 'user-profile'

export async function fetchUserAndProfile(): Promise<UserProfileSnapshot> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { user: null, profile: null }
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, profile: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  return { user, profile: (profile as Profile | null) ?? null }
}

