import React, { useEffect, useMemo, useState } from 'react'
import { getSettings, updateSettings, listPlayers, setCurrentPlayer, sellPlayer, listTeams, setTeamWallet, getAdminToken, setAdminToken } from '../lib/api'
import socket from '../lib/socket'

export default function Admin() {
  const [settings, setSettings] = useState(null)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [teams, setTeams] = useState([])
  const [tokenInput, setTokenInput] = useState('')
  const [needsAuth, setNeedsAuth] = useState(!getAdminToken())

  const load = async () => {
    try {
      const [s, p, t] = await Promise.all([getSettings(), listPlayers({ sold: false }), listTeams()])
      setSettings(s)
      setPlayers(p)
      setTeams(t)
      setNeedsAuth(false)
    } catch (e) {
      if (e?.response?.status === 401) {
        setAdminToken('')
        setNeedsAuth(true)
      } else {
        setMessage(e?.response?.data?.error || 'Failed to load admin data')
      }
    }
  }

  useEffect(() => {
    if (!needsAuth) load()
    const onSettings = (p) => setSettings((s) => s ? { ...s, ...p } : s)
    const refresh = () => { if (!needsAuth) load() }
    socket.on('settings_updated', onSettings)
    socket.on('current_player_changed', refresh)
    socket.on('player_sold', refresh)
    return () => {
      socket.off('settings_updated', onSettings)
      socket.off('current_player_changed', refresh)
      socket.off('player_sold', refresh)
    }
  }, [needsAuth])

  const currentPlayer = useMemo(() => players.find(pl => String(pl._id) === String(settings?.currentPlayer)) || null, [players, settings])

  const saveSettings = async () => {
    setLoading(true)
    try {
      await updateSettings({ minIncrement: settings.minIncrement, basePrice: settings.basePrice })
      setMessage('Settings updated')
      setTimeout(() => setMessage(''), 2000)
    } catch (e) {
      if (e?.response?.status === 401) setNeedsAuth(true)
    } finally { setLoading(false) }
  }

  const onSelectPlayer = async (id) => {
    setLoading(true)
    try {
      await setCurrentPlayer(id)
      await load()
    } catch (e) {
      if (e?.response?.status === 401) setNeedsAuth(true)
    } finally { setLoading(false) }
  }

  const onSell = async () => {
    setLoading(true)
    try {
      await sellPlayer()
      await load()
      setMessage('Player sold')
      setTimeout(() => setMessage(''), 2000)
    } catch (e) {
      setMessage(e.response?.data?.error || 'Sell failed')
      setTimeout(() => setMessage(''), 3000)
    } finally { setLoading(false) }
  }

  const onRandom = async () => {
    if (!players?.length) {
      setMessage('No unsold players available')
      setTimeout(() => setMessage(''), 2000)
      return
    }
    const idx = Math.floor(Math.random() * players.length)
    const chosen = players[idx]
    setLoading(true)
    try {
      await setCurrentPlayer(chosen._id)
      await load()
      setMessage(`Selected randomly: ${chosen.name}`)
      setTimeout(() => setMessage(''), 2000)
    } catch (e) {
      if (e?.response?.status === 401) setNeedsAuth(true)
    } finally { setLoading(false) }
  }

  const updateWallet = async (teamId, value) => {
    const amount = Number(value)
    if (Number.isNaN(amount)) return
    try {
      await setTeamWallet(teamId, amount)
      await load()
    } catch (e) {
      if (e?.response?.status === 401) setNeedsAuth(true)
    }
  }

  const submitToken = async (e) => {
    e.preventDefault()
    setAdminToken(tokenInput.trim())
    setNeedsAuth(false)
    setSettings(null)
    setPlayers([])
    setTeams([])
    setTimeout(() => load(), 0)
  }

  return (
    <div className="card">
      <h2>Admin</h2>
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

      {!needsAuth && !settings && <p className="muted">Loading…</p>}

      {!needsAuth && settings && (
        <div className="row">
          <div className="col">
            <b>Global Settings</b>
            <div style={{ marginTop: 8 }}>
              <label className="muted">Base Price</label>
              <input type="number" value={settings.basePrice} onChange={e => setSettings({ ...settings, basePrice: Number(e.target.value) })} />
            </div>
            <div style={{ marginTop: 8 }}>
              <label className="muted">Min Raise Increment</label>
              <input type="number" value={settings.minIncrement} onChange={e => setSettings({ ...settings, minIncrement: Number(e.target.value) })} />
            </div>
            <div style={{ marginTop: 8 }}>
              <button disabled={loading} onClick={saveSettings}>Save Settings</button>
            </div>
            {message && <div className="muted" style={{ marginTop: 8 }}>{message}</div>}
          </div>

          <div className="col">
            <b>Current Player</b>
            {!currentPlayer && <div className="muted">None selected</div>}
            {currentPlayer && (
              <div style={{ marginTop: 8 }}>
                <div className="row">
                  <div className="col" style={{ maxWidth: 120 }}>
                    <img src={currentPlayer.photoUrl || 'https://via.placeholder.com/120x150?text=Player'} style={{ width: '100%', borderRadius: 8, border: '1px solid #1f2a44' }} />
                  </div>
                  <div className="col">
                    <div><b>{currentPlayer.name}</b></div>
                    <div className="muted">Batch {currentPlayer.batch} • {currentPlayer.house} • {currentPlayer.strength}</div>
                    <div style={{ marginTop: 8 }}>
                      <button onClick={onSell} disabled={loading}>Sell to current highest bidder</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="row" style={{ marginTop: 16 }}>
        <div className="col">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <b>Select Next Player</b>
            <button onClick={onRandom} disabled={loading || !players.length}>Random Unsold</button>
          </div>
          <div className="muted">Unsold players</div>
          <div style={{ maxHeight: 360, overflow: 'auto', marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>House</th>
                  <th>Strength</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {players.map(pl => (
                  <tr key={pl._id}>
                    <td>{pl.name}</td>
                    <td>{pl.house}</td>
                    <td>{pl.strength}</td>
                    <td><button disabled={loading} onClick={() => onSelectPlayer(pl._id)}>Set Current</button></td>
                  </tr>
                ))}
                {!players.length && <tr><td colSpan={4} className="muted">No players available</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col">
          <b>Adjust Team Wallets</b>
          <div className="muted">Set absolute wallet amount per team</div>
          <div style={{ marginTop: 8 }}>
            {teams.map(t => (
              <div key={t.id} className="row" style={{ alignItems: 'center' }}>
                <div className="col" style={{ maxWidth: 220 }}>{t.name}</div>
                <div className="col" style={{ maxWidth: 140 }}>₹{t.wallet.toLocaleString('en-IN')}</div>
                <div className="col" style={{ maxWidth: 200 }}>
                  <input type="number" placeholder="New wallet" onBlur={(e) => updateWallet(t.id, e.target.value)} />
                </div>
              </div>
            ))}
            {!teams.length && <div className="muted">No teams yet</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
