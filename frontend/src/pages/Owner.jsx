import React, { useEffect, useMemo, useState } from 'react'
import { teamLogin, raiseBid } from '../lib/api'
import socket from '../lib/socket'

export default function Owner() {
  const OWNER_CODE_KEY = 'ownerCode'
  const [code, setCode] = useState(localStorage.getItem(OWNER_CODE_KEY) || '')
  const [auth, setAuth] = useState(null) // { team, basePrice, minIncrement, player, currentBid }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [maxCap, setMaxCap] = useState(null)

  const currentAmount = useMemo(() => {
    if (!auth) return 0
    const base = auth.player?.basePrice || auth.basePrice
    return auth.currentBid?.amount || base
  }, [auth])

  const liveMaxAllowed = useMemo(() => {
    if (!auth?.team) return null
    const base = auth.player?.basePrice || auth.basePrice
    const slots = Math.max(0, (auth.team.remainingSlots ?? 0) - 1)
    const max = (auth.team.remaining ?? 0) - slots * base
    return Math.max(0, max)
  }, [auth])

  const onLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await teamLogin(code.trim())
      setAuth(data)
      setMaxCap(null)
      localStorage.setItem(OWNER_CODE_KEY, code.trim())
    } catch (e) {
      const msg = e.response?.data?.error || 'Login failed'
      setError(msg)
      if (e?.response?.status === 404) {
        // invalid code; clear cache
        localStorage.removeItem(OWNER_CODE_KEY)
      }
    } finally {
      setLoading(false)
    }
  }

  const doRaise = async () => {
    if (!code) return
    setLoading(true)
    setError('')
    try {
      const r = await raiseBid(code.trim())
      // r: { ok, currentBid, maxAllowed }
      setAuth((s) => ({ ...s, currentBid: r.currentBid }))
      setMaxCap(r.maxAllowed ?? null)
    } catch (e) {
      const maxAllowed = e.response?.data?.maxAllowed
      if (maxAllowed !== undefined) setMaxCap(maxAllowed)
      setError(e.response?.data?.error || 'Bid failed')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    const onBid = (p) => setAuth((s) => {
      if (!s?.player || !p?.playerId || String(s.player._id) !== String(p.playerId)) return s
      return { ...s, currentBid: { amount: p.amount, teamName: p.teamName } }
    })
    const onSettings = (p) => setAuth((s) => (s ? { ...s, minIncrement: p.minIncrement ?? s.minIncrement, basePrice: p.basePrice ?? s.basePrice } : s))
    const refreshOn = () => {
      if (!code) return
      teamLogin(code.trim()).then(setAuth).catch((e) => {
        if (e?.response?.status === 404) {
          localStorage.removeItem(OWNER_CODE_KEY)
          setAuth(null)
          setCode('')
          setError('Code invalid. Please login again.')
        }
      })
      setMaxCap(null)
    }
    socket.on('bid_updated', onBid)
    socket.on('settings_updated', onSettings)
    socket.on('current_player_changed', refreshOn)
    socket.on('player_sold', refreshOn)
    const id = setInterval(() => { if (code) teamLogin(code.trim()).then(setAuth).catch(() => {}) }, 5000)
    return () => {
      socket.off('bid_updated', onBid)
      socket.off('settings_updated', onSettings)
      socket.off('current_player_changed', refreshOn)
      socket.off('player_sold', refreshOn)
      clearInterval(id)
    }
  }, [code])

  // Auto-login on mount if a code exists in localStorage
  useEffect(() => {
    const saved = localStorage.getItem(OWNER_CODE_KEY)
    if (saved && !auth && !loading) {
      setCode(saved)
      teamLogin(saved).then((data) => {
        setAuth(data)
        setError('')
      }).catch(() => {
        // invalid; clear
        localStorage.removeItem(OWNER_CODE_KEY)
        setCode('')
      })
    }
    const onStorage = (e) => {
      if (e.key === OWNER_CODE_KEY) {
        const val = e.newValue || ''
        setCode(val)
        setAuth(null)
        if (val) teamLogin(val).then(setAuth).catch(() => {})
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const disabled = useMemo(() => {
    if (!auth?.player) return true
    if (!auth?.team) return true
    const cap = (maxCap !== null) ? maxCap : liveMaxAllowed
    if (cap !== null && currentAmount + auth.minIncrement > cap) return true
    return false
  }, [auth, maxCap, liveMaxAllowed, currentAmount])

  return (
    <div className="card">
      <h2>Team Owner</h2>
      {!auth && (
        <form onSubmit={onLogin} className="row" style={{ alignItems: 'end' }}>
          <div className="col" style={{ maxWidth: 320 }}>
            <label className="muted">Enter Team Code</label>
            <input placeholder="TEAM-CODE" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div style={{ minWidth: 120 }}>
            <button type="submit" disabled={!code || loading}>Login</button>
          </div>
          {error && <div className="muted" style={{ color: '#ffb4b4' }}>{error}</div>}
        </form>
      )}

      {auth && (
        <div>
          <div className="row">
            <div className="col">
              <div className="badge">Team: {auth.team.name}</div>
            </div>
            <div className="col">
              {(() => {
                const spent = (auth.team?.purchasesTotal || 0) // not provided; compute from refresh endpoints if needed
                const remaining = auth.team.remaining
                return (
                  <div className="badge">Remaining Wallet: ₹{remaining.toLocaleString('en-IN')}</div>
                )
              })()}
            </div>
            <div className="col">
              <div className="badge">Remaining Slots: {auth.team.remainingSlots}</div>
            </div>
          </div>

          {!auth.player && (
            <>
              {auth.lastSold ? (
                <div className="row" style={{ alignItems: 'center', marginTop: 12 }}>
                  <div className="col" style={{ fontSize: 16 }}>
                    <b>Sold:</b> {auth.lastSold.playerName} to <b>{auth.lastSold.teamName || '—'}</b> for <b>₹{(auth.lastSold.price || 0).toLocaleString('en-IN')}</b>
                  </div>
                  <div className="col muted">Waiting for admin to select the next player…</div>
                </div>
              ) : (
                <p className="muted" style={{ marginTop: 12 }}>Waiting for admin to select a player…</p>
              )}
            </>
          )}

          {auth.player && (
            <div className="row" style={{ marginTop: 12 }}>
              <div className="col" style={{ maxWidth: 220 }}>
                <img
                  src={auth.player.photoUrl || 'https://via.placeholder.com/200x260?text=Player'}
                  alt="player"
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://via.placeholder.com/200x260?text=Player' }}
                  style={{ width: '100%', borderRadius: 8, border: '1px solid #1f2a44' }}
                />
              </div>
              <div className="col">
                <h3 style={{ marginTop: 0 }}>{auth.player.name} <span className="badge">Batch {auth.player.batch}</span></h3>
                <p className="muted">House: {auth.player.house} • Strength: {auth.player.strength}</p>
                
                <div style={{ marginTop: 12, padding: 12, background: '#0f1728', borderRadius: 8, border: '1px solid #1f2a44' }}>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Player Stats</div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <div className="muted" style={{ fontSize: 11 }}>Matches</div>
                      <div style={{ fontWeight: 700 }}>{auth.player.totalMatchPlayed || 0}</div>
                    </div>
                    <div>
                      <div className="muted" style={{ fontSize: 11 }}>Runs</div>
                      <div style={{ fontWeight: 700 }}>{auth.player.totalScore || 0}</div>
                    </div>
                    <div>
                      <div className="muted" style={{ fontSize: 11 }}>Wickets</div>
                      <div style={{ fontWeight: 700 }}>{auth.player.totalWicket || 0}</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div>Base Price: ₹{auth.basePrice.toLocaleString('en-IN')}</div>
                  <div>Min Increment: ₹{auth.minIncrement.toLocaleString('en-IN')}</div>
                  <div style={{ marginTop: 12, fontSize: 18 }}>
                    {auth.currentBid ? 'Current Bid' : 'Starting Price'}: <b>₹{currentAmount.toLocaleString('en-IN')}</b>
                    {auth.currentBid?.teamName && <span className="badge" style={{ marginLeft: 8 }}>Highest: {auth.currentBid.teamName}</span>}
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button onClick={doRaise} disabled={disabled || loading}>Raise +₹{auth.minIncrement.toLocaleString('en-IN')}</button>
                  {(maxCap !== null || liveMaxAllowed !== null) && (
                    <span className="muted">Max allowed: ₹{((maxCap !== null ? maxCap : liveMaxAllowed) || 0).toLocaleString('en-IN')}</span>
                  )}
                  {disabled && maxCap !== null && (
                    <span className="muted" style={{ color: '#ffcea8' }}>Max reached</span>
                  )}
                </div>
                {error && <div className="muted" style={{ color: '#ffb4b4', marginTop: 8 }}>{error}</div>}
              </div>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <button onClick={() => { setAuth(null); localStorage.removeItem(OWNER_CODE_KEY); setCode('') }}>Logout</button>
          </div>
        </div>
      )}
    </div>
  )
}
