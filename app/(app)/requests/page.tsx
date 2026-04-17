'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'

type RequestType = 'feature' | 'change' | 'bug' | 'error'
type RequestStatus = 'pending' | 'in_progress' | 'resolved' | 'closed'

interface Request {
  id: string
  type: RequestType
  title: string
  description: string
  attachments: string[]
  status: RequestStatus
  created_at: string
  profiles: {
    full_name: string | null
    role: string
  } | null
}

const typeConfig: Record<RequestType, { label: string; color: string }> = {
  feature: { label: 'Feature', color: 'bg-primary/20 text-primary border-primary/40' },
  change: { label: 'Change', color: 'bg-cyan-400/20 text-cyan-400 border-cyan-400/40' },
  bug: { label: 'Bug', color: 'bg-rose-400/20 text-rose-400 border-rose-400/40' },
  error: { label: 'Error', color: 'bg-destructive/10 text-destructive border-destructive/20' },
}

const statusConfig: Record<RequestStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/10 text-blue-400' },
  resolved: { label: 'Resolved', color: 'bg-primary/10 text-primary' },
  closed: { label: 'Closed', color: 'bg-muted/50 text-muted-foreground/60' },
}

export default function RequestsPage() {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<Request[]>([])
  const [role, setRole] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [type, setType] = useState<RequestType>('feature')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()
  const supabase = useMemo(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null
    return createClient()
  }, [])

  useEffect(() => {
    checkAuthAndFetch()
  }, [])

  async function checkAuthAndFetch() {
    if (!supabase) {
      setError('App is not configured. Missing Supabase environment variables.')
      setLoading(false)
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login?redirect=/requests')
      return
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      router.push('/dashboard')
      return
    }

    setRole(profile.role)
    await fetchRequests()
    setLoading(false)

    // Realtime: notify super_admins of incoming requests
    if (profile.role === 'super_admin' && supabase) {
      const channel = supabase
        .channel('requests-notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'requests' },
          (payload) => {
            const req = payload.new as { type: string; title: string }
            const labels: Record<string, string> = {
              feature: 'Feature Request',
              change: 'Change Request',
              bug: 'Bug Report',
              error: 'Error Ticket',
            }
            toast(`New ${labels[req.type] || 'Request'}: ${req.title}`, {
              description: 'A new request was just submitted.',
              duration: 6000,
            })
            fetchRequests()
          }
        )
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }
  }

  async function fetchRequests() {
    const res = await fetch('/api/requests')
    if (res.ok) {
      const data = await res.json()
      setRequests(data.requests || [])
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Upload failed')
        }

        const data = await res.json()
        setAttachments((prev) => [...prev, data.url])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  function removeAttachment(url: string) {
    setAttachments((prev) => prev.filter((a) => a !== url))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, description, attachments }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }

      toast.success('Request submitted successfully')
      setTitle('')
      setDescription('')
      setAttachments([])
      setType('feature')
      setShowForm(false)
      await fetchRequests()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  async function updateStatus(id: string, status: RequestStatus) {
    const res = await fetch('/api/requests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })

    if (res.ok) {
      await fetchRequests()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 grid-subtle pointer-events-none" />

      <main className="relative max-w-4xl mx-auto px-6 md:px-8 lg:px-12 py-10 md:py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground font-medium">Feedback Portal</span>
            </div>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-2">
                {role === 'super_admin' ? 'All Requests' : 'Submit Feedback'}
              </h1>
              <p className="text-muted-foreground text-lg">
                {role === 'super_admin'
                  ? 'Review and manage incoming requests from the team.'
                  : 'Help us improve. Report bugs, request features, or suggest changes.'}
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="shrink-0 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              {showForm ? 'Cancel' : 'New Request'}
            </button>
          </div>
        </div>

        {/* New Request Form */}
        {showForm && (
          <div className="mb-10 p-6 bg-card/50 backdrop-blur-sm border border-border rounded-2xl">
            <h2 className="text-lg font-semibold mb-6">What would you like to share?</h2>

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type Selector */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Type</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(typeConfig) as RequestType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                        type === t ? typeConfig[t].color : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50'
                      }`}
                    >
                      {typeConfig[t].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Brief summary"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  placeholder="Provide as much detail as possible..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Screenshots (optional)</label>
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {attachments.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <Image
                          src={url}
                          alt={`Attachment ${idx + 1}`}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeAttachment(url)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-muted/50 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Add Screenshot'}
                </button>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || !title || !description}
                  className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-2">No requests yet</p>
              <button onClick={() => setShowForm(true)} className="text-primary hover:underline text-sm">
                Submit your first request
              </button>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="group p-5 bg-card/50 backdrop-blur-sm border border-border hover:border-primary/30 rounded-xl transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${typeConfig[req.type].color}`}>
                        {typeConfig[req.type].label}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusConfig[req.status].color}`}>
                        {statusConfig[req.status].label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {req.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{req.description}</p>

                    {req.attachments && req.attachments.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {req.attachments.map((url, idx) => (
                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                            <Image
                              src={url}
                              alt={`Attachment ${idx + 1}`}
                              width={48}
                              height={48}
                              className="rounded-lg object-cover hover:opacity-80 transition-opacity"
                            />
                          </a>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground/60">
                      {new Date(req.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {role === 'super_admin' && req.profiles?.full_name && <span> · {req.profiles.full_name}</span>}
                    </p>
                  </div>

                  {role === 'super_admin' && (
                    <select
                      value={req.status}
                      onChange={(e) => updateStatus(req.id, e.target.value as RequestStatus)}
                      className="shrink-0 px-3 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {(Object.keys(statusConfig) as RequestStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {statusConfig[s].label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

