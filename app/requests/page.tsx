'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

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

const typeLabels: Record<RequestType, string> = {
  feature: 'Feature Request',
  change: 'Change Request',
  bug: 'Bug Report',
  error: 'Error Ticket',
}

const typeColors: Record<RequestType, string> = {
  feature: 'bg-[var(--neon-lime)]/10 text-neon-lime border-[var(--neon-lime)]/30',
  change: 'bg-[var(--neon-cyan)]/10 text-neon-cyan border-[var(--neon-cyan)]/30',
  bug: 'bg-[var(--neon-gold)]/10 text-neon-gold border-[var(--neon-gold)]/30',
  error: 'bg-destructive/10 text-destructive border-destructive/30',
}

const statusLabels: Record<RequestStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

const statusColors: Record<RequestStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  in_progress: 'bg-[var(--neon-cyan)]/10 text-neon-cyan',
  resolved: 'bg-[var(--neon-lime)]/10 text-neon-lime',
  closed: 'bg-muted/50 text-muted-foreground',
}

export default function RequestsPage() {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<Request[]>([])
  const [role, setRole] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Form state
  const [type, setType] = useState<RequestType>('feature')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuthAndFetch()
  }, [])

  async function checkAuthAndFetch() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login?redirect=/requests')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      router.push('/dashboard')
      return
    }

    setRole(profile.role)
    await fetchRequests()
    setLoading(false)
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
        setAttachments(prev => [...prev, data.url])
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
    setAttachments(prev => prev.filter(a => a !== url))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          description,
          attachments,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit request')
      }

      setSuccess(true)
      setTitle('')
      setDescription('')
      setAttachments([])
      setType('feature')
      setShowForm(false)
      await fetchRequests()
      
      setTimeout(() => setSuccess(false), 3000)
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
        <div className="text-muted-foreground font-mono text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-xl font-black tracking-tight">
              DOTIQ
            </Link>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">REQUESTS & TICKETS</p>
          </div>
          <Link 
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Success message */}
        {success && (
          <div className="bg-[var(--neon-lime)]/10 border border-[var(--neon-lime)]/30 rounded-xl p-4">
            <p className="text-sm text-neon-lime font-medium">Request submitted successfully! Our team has been notified.</p>
          </div>
        )}

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">
              {role === 'super_admin' ? 'All Requests' : 'My Requests'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {role === 'super_admin' 
                ? 'View and manage all submitted requests'
                : 'Submit feature requests, report bugs, or request changes'
              }
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg text-sm hover:bg-primary/90 transition-colors"
          >
            {showForm ? 'Cancel' : 'New Request'}
          </button>
        </div>

        {/* New request form */}
        {showForm && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Submit a Request</h2>
            
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-2">REQUEST TYPE</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(typeLabels) as RequestType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        type === t 
                          ? typeColors[t] + ' border-current'
                          : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50'
                      }`}
                    >
                      {typeLabels[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-2">TITLE</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  placeholder="Brief summary of your request"
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-2">DESCRIPTION</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  rows={4}
                  placeholder="Provide details about what you need or the issue you're experiencing..."
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-2">ATTACHMENTS (OPTIONAL)</label>
                <div className="space-y-3">
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
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
                            className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            x
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
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || !title || !description}
                  className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Requests list */}
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No requests yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-2 text-primary hover:underline text-sm"
              >
                Submit your first request
              </button>
            </div>
          ) : (
            requests.map(req => (
              <div key={req.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${typeColors[req.type]}`}>
                        {typeLabels[req.type].toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${statusColors[req.status]}`}>
                        {statusLabels[req.status]}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground">{req.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{req.description}</p>
                    
                    {/* Attachments preview */}
                    {req.attachments && req.attachments.length > 0 && (
                      <div className="flex gap-2 mt-3">
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

                    <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground font-mono">
                      <span>
                        {new Date(req.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {role === 'super_admin' && req.profiles && (
                        <span>by {req.profiles.full_name || 'Unknown'}</span>
                      )}
                    </div>
                  </div>

                  {/* Super admin controls */}
                  {role === 'super_admin' && (
                    <div className="shrink-0">
                      <select
                        value={req.status}
                        onChange={e => updateStatus(req.id, e.target.value as RequestStatus)}
                        className="px-3 py-1.5 bg-muted/30 border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {(Object.keys(statusLabels) as RequestStatus[]).map(s => (
                          <option key={s} value={s}>{statusLabels[s]}</option>
                        ))}
                      </select>
                    </div>
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
