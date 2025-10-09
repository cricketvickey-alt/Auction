import React, { useEffect, useState } from 'react'
import { listTeams, getTeam } from '../lib/api'
import socket from '../lib/socket'

export default function Teams() {
  const [teams, setTeams] = useState([])
  const [expanded, setExpanded] = useState({})

  const load = async () => {
    const t = await listTeams()
    setTeams(t)
  }

  const toggle = async (id) => {
    setExpanded((e) => ({ ...e, [id]: e[id] ? null : 'loading' }))
    if (!expanded[id]) {
      const detail = await getTeam(id)
      setExpanded((e) => ({ ...e, [id]: detail }))
    }
  }

  useEffect(() => {
    load()
    // Refresh teams when a player is sold to update remaining amounts
    const onPlayerSold = async () => {
      await load()
      // Also refresh any expanded team details
      const expandedIds = Object.keys(expanded).filter(id => expanded[id] && expanded[id] !== 'loading')
      for (const id of expandedIds) {
        const detail = await getTeam(id)
        setExpanded((e) => ({ ...e, [id]: detail }))
      }
    }
    socket.on('player_sold', onPlayerSold)
    // Polling fallback
    const interval = setInterval(() => load(), 10000)
    return () => {
      socket.off('player_sold', onPlayerSold)
      clearInterval(interval)
    }
  }, [expanded])

  const avatar = (team) => {
    const detail = expanded[team.id]
    const logo = team.logoUrl || (detail && detail !== 'loading' ? detail.logoUrl : null)
    if (logo) return <img src={logo} alt={team.name} style={{ width: 130, height: 130, borderRadius: 12, border: '2px solid #2e4370', objectFit: 'cover' }} />
    const initials = team.name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()
    return (
      <div style={{ width: 130, height: 130, borderRadius: 12, border: '2px solid #2e4370', background: '#0e1b34', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 24 }}>
        {initials}
      </div>
    )
  }

  const card = (t) => {
    const detail = expanded[t.id]
    const spent = detail && detail !== 'loading' ? (detail.purchases || []).reduce((s, p) => s + p.price, 0) : null
    const remaining = spent !== null ? Math.max(0, detail.wallet - spent) : (typeof t.remaining === 'number' ? t.remaining : t.wallet)
    const playerAvatars = detail && detail !== 'loading' ? detail.purchases || [] : []
    
    return (
      <div key={t.id} style={{ border: '1px solid #1f2a44', borderRadius: 12, padding: 12, background: '#0f1728' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {avatar(t)}
            <div>
              <div style={{ fontWeight: 800 }}>{t.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>Players: {t.purchases} • Slots: {t.remainingSlots}</div>
            </div>
          </div>
          <div className="badge">Remaining ₹{remaining.toLocaleString('en-IN')}</div>
        </div>

        {/* Player Avatars - Show only when collapsed */}
        {!expanded[t.id] && playerAvatars.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {playerAvatars.slice(0, 15).map((p, i) => (
              p.player?.photoUrl ? (
                <img 
                  key={i}
                  src={p.player.photoUrl} 
                  alt={p.player?.name}
                  title={p.player?.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                  style={{ 
                    width: 50, 
                    height: 50, 
                    borderRadius: '50%', 
                    objectFit: 'cover', 
                    border: '2px solid #2e4370',
                    cursor: 'pointer'
                  }}
                />
              ) : (
                <div 
                  key={i}
                  title={p.player?.name}
                  style={{ 
                    width: 50, 
                    height: 50, 
                    borderRadius: '50%', 
                    border: '2px solid #2e4370',
                    background: '#1a2942',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 20,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {p.player?.name?.charAt(0)?.toUpperCase() || 'P'}
                </div>
              )
            ))}
            {playerAvatars.length > 15 && (
              <div style={{ 
                width: 50, 
                height: 50, 
                borderRadius: '50%', 
                background: '#1a2942', 
                border: '2px solid #2e4370',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: 14
              }}>
                +{playerAvatars.length - 15}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 10 }}>
          <button onClick={() => toggle(t.id)}>{expanded[t.id] ? 'Hide' : 'View Purchases'}</button>
        </div>

        {expanded[t.id] === 'loading' && (
          <div className="muted" style={{ marginTop: 8 }}>Loading…</div>
        )}

        {expanded[t.id] && expanded[t.id] !== 'loading' && (
          <div style={{ marginTop: 12 }}>
            <b>Purchases</b>
            
            {/* Player Avatars Grid in expanded view */}
            {detail.purchases?.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                {detail.purchases.map((p, i) => (
                  p.player?.photoUrl ? (
                    <img 
                      key={i}
                      src={p.player.photoUrl} 
                      alt={p.player?.name}
                      title={p.player?.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                      style={{ 
                        width: 50, 
                        height: 50, 
                        borderRadius: '50%', 
                        objectFit: 'cover', 
                        border: '2px solid #2e4370',
                        cursor: 'pointer'
                      }}
                    />
                  ) : (
                    <div 
                      key={i}
                      title={p.player?.name}
                      style={{ 
                        width: 50, 
                        height: 50, 
                        borderRadius: '50%', 
                        border: '2px solid #2e4370',
                        background: '#1a2942',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 20,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {p.player?.name?.charAt(0)?.toUpperCase() || 'P'}
                    </div>
                  )
                ))}
              </div>
            )}
            
            <div style={{ overflowX: 'auto', marginTop: 12 }}>
              <table style={{ minWidth: 600 }}>
                <thead>
                  <tr>
                    <th></th>
                    <th>Player</th>
                    <th>Role</th>
                    <th>Batch</th>
                    <th>Phone</th>
                    <th>House</th>
                    <th>Strength</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.purchases?.map((p, i) => (
                    <tr key={i}>
                      <td>
                        {p.player?.photoUrl ? (
                          <img 
                            src={p.player.photoUrl} 
                            alt={p.player?.name}
                            referrerPolicy="no-referrer"
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                            style={{ width: 40, height: 50, borderRadius: 6, objectFit: 'cover', border: '1px solid #2e4370' }}
                          />
                        ) : (
                          <div style={{ 
                            width: 40, 
                            height: 50, 
                            borderRadius: 6, 
                            border: '1px solid #2e4370', 
                            background: '#1a2942',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: 18,
                            fontWeight: 700
                          }}>
                            {p.player?.name?.charAt(0)?.toUpperCase() || 'P'}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {p.player?.name}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {p.player?.isCaptain && (
                            <span style={{ 
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              padding: '3px 8px',
                              borderRadius: 12,
                              fontSize: 10,
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              whiteSpace: 'nowrap'
                            }}>
                              ⭐ Captain
                            </span>
                          )}
                          {p.player?.isIcon && (
                            <span style={{ 
                              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                              color: 'white',
                              padding: '3px 8px',
                              borderRadius: 12,
                              fontSize: 10,
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              whiteSpace: 'nowrap'
                            }}>
                              💎 Icon
                            </span>
                          )}
                          {p.player?.isRetained && (
                            <span style={{ 
                              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                              color: 'white',
                              padding: '3px 8px',
                              borderRadius: 12,
                              fontSize: 10,
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              whiteSpace: 'nowrap'
                            }}>
                              🔒 Retained
                            </span>
                          )}
                          {p.player?.isTraded && (
                            <span style={{ 
                              background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                              color: 'white',
                              padding: '3px 8px',
                              borderRadius: 12,
                              fontSize: 10,
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              whiteSpace: 'nowrap'
                            }}>
                              🔄 Traded
                            </span>
                          )}
                          {!p.player?.isCaptain && !p.player?.isIcon && !p.player?.isRetained && !p.player?.isTraded && (
                            <span style={{ color: '#6b7280', fontSize: 11 }}>-</span>
                          )}
                        </div>
                      </td>
                      <td>{p.player?.batch}</td>
                      <td>{p.player?.phoneNumber || '-'}</td>
                      <td>{p.player?.house}</td>
                      <td>{p.player?.strength}</td>
                      <td>₹{p.price.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  {!detail.purchases?.length && (
                    <tr><td colSpan={7} className="muted">No purchases yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 8 }} className="muted">Remaining ₹{remaining.toLocaleString('en-IN')} • Slots {t.remainingSlots}</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="card">
      <h2>Teams</h2>
      <div className="row" style={{ gap: 12 }}>
        {teams.map(card)}
      </div>
    </div>
  )
}
