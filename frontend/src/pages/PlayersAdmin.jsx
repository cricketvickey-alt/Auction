import React, { useEffect, useMemo, useState } from 'react'
import { listPlayers, createPlayer, updatePlayer, deletePlayer, getAdminToken, setAdminToken } from '../lib/api'

const HOUSE_OPTIONS = ['Aravali', 'Shivalik', 'Udaigiri', 'Nilgiri']
const STRENGTH_OPTIONS = ['Batsman', 'BattingAllrounder', 'Bowler', 'Bowling allrounder', 'All rounder']

const emptyForm = () => ({
  name: '',
  batch: 1,
  house: HOUSE_OPTIONS[0],
  phoneNumber: '',
  totalMatchPlayed: 0,
  totalScore: 0,
  totalWicket: 0,
  strength: STRENGTH_OPTIONS[0],
  basePrice: 1000,
  photoUrl: ''
})

export default function PlayersAdmin() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState(emptyForm())
  const [editingId, setEditingId] = useState('')
  const [needsAuth, setNeedsAuth] = useState(!getAdminToken())
  const [tokenInput, setTokenInput] = useState('')
  const [filter, setFilter] = useState('all') // all | sold | unsold
  const [searchQuery, setSearchQuery] = useState('')

  const load = async () => {
    try {
      const params = filter === 'sold' ? { sold: true } : filter === 'unsold' ? { sold: false } : {}
      const list = await listPlayers(params)
      setPlayers(list)
      setNeedsAuth(false)
    } catch (e) {
      if (e?.response?.status === 401) {
        setAdminToken('')
        setNeedsAuth(true)
      } else {
        setMessage(e?.response?.data?.error || 'Failed to load players')
      }
    }
  }

  useEffect(() => { if (!needsAuth) load() }, [filter, needsAuth])

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      if (editingId) {
        const updated = await updatePlayer(editingId, { ...form, batch: Number(form.batch), basePrice: Number(form.basePrice), totalMatchPlayed: Number(form.totalMatchPlayed), totalScore: Number(form.totalScore), totalWicket: Number(form.totalWicket) })
        setMessage('Player updated')
        // Update the player in the list immediately for instant feedback
        setPlayers(prev => prev.map(p => p._id === editingId ? updated : p))
      } else {
        const created = await createPlayer({ ...form, batch: Number(form.batch), basePrice: Number(form.basePrice), totalMatchPlayed: Number(form.totalMatchPlayed), totalScore: Number(form.totalScore), totalWicket: Number(form.totalWicket) })
        setMessage('Player created')
        // Add new player to the list immediately
        setPlayers(prev => [...prev, created])
      }
      setForm(emptyForm())
      setEditingId('')
      // Reload to ensure consistency with backend
      setTimeout(() => load(), 100)
      setTimeout(() => setMessage(''), 2000)
    } catch (e) {
      if (e?.response?.status === 401) setNeedsAuth(true)
      else setMessage(e?.response?.data?.error || 'Save failed')
    } finally { setLoading(false) }
  }

  const onEdit = (pl) => {
    setEditingId(pl._id)
    setForm({
      name: pl.name || '',
      batch: pl.batch ?? 1,
      house: pl.house || HOUSE_OPTIONS[0],
      phoneNumber: pl.phoneNumber || '',
      totalMatchPlayed: pl.totalMatchPlayed ?? 0,
      totalScore: pl.totalScore ?? 0,
      totalWicket: pl.totalWicket ?? 0,
      strength: pl.strength || STRENGTH_OPTIONS[0],
      basePrice: pl.basePrice ?? 1000,
      photoUrl: pl.photoUrl || ''
    })
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onCancelEdit = () => {
    setEditingId('')
    setForm(emptyForm())
  }

  // Filter players by search query
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return players
    const query = searchQuery.toLowerCase()
    return players.filter(pl => 
      pl.name?.toLowerCase().includes(query) ||
      pl.house?.toLowerCase().includes(query) ||
      pl.strength?.toLowerCase().includes(query) ||
      String(pl.batch).includes(query)
    )
  }, [players, searchQuery])

  const onDelete = async (id) => {
    if (!confirm('Delete this player? This cannot be undone.')) return
    setLoading(true)
    try {
      await deletePlayer(id)
      await load()
      setMessage('Player deleted')
      setTimeout(() => setMessage(''), 1500)
    } catch (e) {
      if (e?.response?.status === 401) setNeedsAuth(true)
      else setMessage(e?.response?.data?.error || 'Delete failed')
    } finally { setLoading(false) }
  }

  const submitToken = (e) => {
    e.preventDefault()
    setAdminToken(tokenInput.trim())
    setNeedsAuth(false)
    setTimeout(() => load(), 0)
  }

  return (
    <div className="card">
      <h2>Players (Admin)</h2>
      {needsAuth && (
        <form onSubmit={submitToken} className="row" style={{ alignItems: 'end' }}>
          <div className="col" style={{ maxWidth: 320 }}>
            <label className="muted">Enter Admin Token</label>
            <input type="password" value={tokenInput} onChange={e => setTokenInput(e.target.value)} placeholder="ADMIN_TOKEN" />
          </div>
          <div style={{ minWidth: 120 }}>
            <button type="submit" disabled={!tokenInput}>Unlock</button>
          </div>
          {message && <div className="muted">{message}</div>}
        </form>
      )}

      {!needsAuth && (
        <>
          {/* Create / Edit Form */}
          {editingId && (
            <div style={{ padding: 8, background: '#1a2942', borderRadius: 8, marginTop: 8, border: '1px solid #2e4370' }}>
              <span style={{ fontSize: 13, color: '#8fb4ff' }}>✏️ Editing Player</span>
            </div>
          )}
          <form onSubmit={onSubmit} className="row" style={{ gap: 12, alignItems: 'end', marginTop: 8 }}>
            <div className="col" style={{ maxWidth: 220 }}>
              <label className="muted">Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="col" style={{ maxWidth: 120 }}>
              <label className="muted">Batch</label>
              <input type="number" value={form.batch} min={1} max={31} onChange={e => setForm({ ...form, batch: e.target.value })} required />
            </div>
            <div className="col" style={{ maxWidth: 160 }}>
              <label className="muted">House</label>
              <select value={form.house} onChange={e => setForm({ ...form, house: e.target.value })}>
                {HOUSE_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="col" style={{ maxWidth: 180 }}>
              <label className="muted">Phone Number</label>
              <input type="tel" value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} placeholder="+91 1234567890" />
            </div>
            <div className="col" style={{ maxWidth: 200 }}>
              <label className="muted">Strength</label>
              <select value={form.strength} onChange={e => setForm({ ...form, strength: e.target.value })}>
                {STRENGTH_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col" style={{ maxWidth: 140 }}>
              <label className="muted">Matches</label>
              <input type="number" value={form.totalMatchPlayed} onChange={e => setForm({ ...form, totalMatchPlayed: e.target.value })} />
            </div>
            <div className="col" style={{ maxWidth: 140 }}>
              <label className="muted">Runs</label>
              <input type="number" value={form.totalScore} onChange={e => setForm({ ...form, totalScore: e.target.value })} />
            </div>
            <div className="col" style={{ maxWidth: 140 }}>
              <label className="muted">Wickets</label>
              <input type="number" value={form.totalWicket} onChange={e => setForm({ ...form, totalWicket: e.target.value })} />
            </div>
            <div className="col" style={{ maxWidth: 160 }}>
              <label className="muted">Base Price</label>
              <input type="number" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: e.target.value })} />
            </div>
            <div className="col" style={{ minWidth: 260 }}>
              <label className="muted">Photo URL (direct image) or upload below</label>
              <input value={form.photoUrl} onChange={e => setForm({ ...form, photoUrl: e.target.value })} placeholder="https://.../image.jpg or data:image/*;base64,..." />
            </div>
            <div className="col" style={{ minWidth: 260 }}>
              <label className="muted">Upload Image</label>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                // Compress client-side: resize to max 800px (long edge) and JPEG quality, target < 200KB
                const img = new Image()
                const url = URL.createObjectURL(file)
                img.onload = () => {
                  const canvas = document.createElement('canvas')
                  const ctx = canvas.getContext('2d')
                  const maxEdge = 800
                  let { width, height } = img
                  if (width > height && width > maxEdge) {
                    height = Math.round((height * maxEdge) / width)
                    width = maxEdge
                  } else if (height >= width && height > maxEdge) {
                    width = Math.round((width * maxEdge) / height)
                    height = maxEdge
                  }
                  canvas.width = width
                  canvas.height = height
                  ctx.drawImage(img, 0, 0, width, height)
                  let quality = 0.75
                  let dataUrl = canvas.toDataURL('image/jpeg', quality)
                  // Try to keep under ~200KB by lowering quality (base64 adds ~37% overhead)
                  const targetBytes = 200 * 1024
                  let attempts = 0
                  while (dataUrl.length > targetBytes * 1.37 && quality > 0.3 && attempts < 6) {
                    quality -= 0.08
                    dataUrl = canvas.toDataURL('image/jpeg', quality)
                    attempts++
                  }
                  setForm((f) => ({ ...f, photoUrl: dataUrl }))
                  URL.revokeObjectURL(url)
                }
                img.onerror = () => {
                  URL.revokeObjectURL(url)
                }
                img.referrerPolicy = 'no-referrer'
                img.src = url
              }} />
            </div>
            {form.photoUrl && (
              <div className="col" style={{ maxWidth: 120 }}>
                <label className="muted">Preview</label>
                <img src={form.photoUrl} alt="preview" style={{ width: '100%', borderRadius: 8, border: '1px solid #1f2a44', objectFit: 'cover', height: 150 }} />
              </div>
            )}
            <div style={{ minWidth: 160 }}>
              <button type="submit" disabled={loading}>{editingId ? 'Update Player' : 'Create Player'}</button>
            </div>
            {editingId && (
              <div style={{ minWidth: 120 }}>
                <button type="button" onClick={onCancelEdit} disabled={loading}>Cancel</button>
              </div>
            )}
          </form>

          {message && <div className="muted" style={{ marginTop: 8 }}>{message}</div>}

          {/* Filters and Search */}
          <div className="row" style={{ marginTop: 16, alignItems: 'end', gap: 12 }}>
            <div className="col" style={{ maxWidth: 260 }}>
              <label className="muted">Filter</label>
              <select value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="unsold">Unsold</option>
                <option value="sold">Sold</option>
              </select>
            </div>
            <div className="col" style={{ maxWidth: 320 }}>
              <label className="muted">Search</label>
              <input 
                type="text" 
                placeholder="Search by name, house, strength, batch..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <div style={{ minWidth: 100 }}>
                <button onClick={() => setSearchQuery('')}>Clear</button>
              </div>
            )}
          </div>
          {searchQuery && (
            <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
              Found {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
            </div>
          )}

          {/* List */}
          <div style={{ marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Batch</th>
                  <th>House</th>
                  <th>Strength</th>
                  <th>Base</th>
                  <th>Photo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map(pl => (
                  <tr key={pl._id}>
                    <td>{pl.name}</td>
                    <td>{pl.batch}</td>
                    <td>{pl.house}</td>
                    <td>{pl.strength}</td>
                    <td>₹{(pl.basePrice || 2500).toLocaleString('en-IN')}</td>
                    <td>
                      {pl.photoUrl ? (
                        <img src={pl.photoUrl} alt="p" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none' }} style={{ width: 38, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #1f2a44' }} />
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => onEdit(pl)} disabled={loading}>Edit</button>
                        <button onClick={() => onDelete(pl._id)} disabled={loading}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filteredPlayers.length && (
                  <tr><td colSpan={7} className="muted">No players</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
