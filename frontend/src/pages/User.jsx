import React, { useEffect, useState } from 'react'
import { getAuctionState } from '../lib/api'
import socket from '../lib/socket'

export default function User() {
  const [state, setState] = useState({ basePrice: 2500, minIncrement: 500, player: null, currentBid: null, lastSold: null })
  const [pulse, setPulse] = useState(false)

  const load = async () => {
    const s = await getAuctionState()
    setState(s)
  }

  useEffect(() => {
    load()
    const onBid = (p) => setState((s) => ({ ...s, currentBid: { amount: p.amount, teamName: p.teamName } }))
    const onSettings = (p) => setState((s) => ({ ...s, minIncrement: p.minIncrement ?? s.minIncrement, basePrice: p.basePrice ?? s.basePrice }))
    const onPlayerChanged = () => load()
    const onSold = () => load()
    socket.on('bid_updated', onBid)
    socket.on('settings_updated', onSettings)
    socket.on('current_player_changed', onPlayerChanged)
    socket.on('player_sold', onSold)
    return () => {
      socket.off('bid_updated', onBid)
      socket.off('settings_updated', onSettings)
      socket.off('current_player_changed', onPlayerChanged)
      socket.off('player_sold', onSold)
    }
  }, [])

  // Trigger a short pulse when the current bid amount changes
  useEffect(() => {
    if (!state?.currentBid?.amount) return
    setPulse(true)
    const t = setTimeout(() => setPulse(false), 450)
    return () => clearTimeout(t)
  }, [state?.currentBid?.amount])

  const p = state.player
  const currentAmount = p ? (state.currentBid?.amount || p.basePrice || state.basePrice) : null
  const currentTeam = state.currentBid?.teamName || null

  const houseBadgeStyle = (house) => {
    const map = {
      Aravali: { bg: '#0f2a60', border: '#2c4fa3', text: '#cfe2ff' }, // blue
      Nelgiri: { bg: '#0d3a1f', border: '#2f7a43', text: '#c9ffdb' }, // green
      Udaigiri: { bg: '#4a3a07', border: '#b08a1f', text: '#ffe9a6' }, // yellow
      Shivalik: { bg: '#4a0f16', border: '#a33232', text: '#ffc9c9' }, // red
    }
    const c = map[house] || { bg: '#0e1b34', border: '#2e4370', text: '#e6eefc' }
    return { background: c.bg, border: `1px solid ${c.border}`, color: c.text }
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'stretch' }}>
        {/* Left: Player photo */}
        <div style={{ flex: '0 0 220px', maxWidth: 240 }}>
          {p ? (
            <img
              src={p.photoUrl || 'https://via.placeholder.com/200x260?text=Player'}
              alt="player"
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://via.placeholder.com/200x260?text=Player' }}
              style={{ width: '100%', borderRadius: 10, border: '1px solid #1f2a44', boxShadow: '0 12px 30px rgba(0,0,0,0.35)' }}
            />
          ) : (
            <div style={{ height: 220, borderRadius: 10, border: '1px dashed #1f2a44', display: 'grid', placeItems: 'center', color: '#9bb3d1' }}>No player selected</div>
          )}
        </div>

        {/* Right: Info + Bid panel */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <h2 style={{ margin: 0 }}>Live Auction</h2>
            <div className="badge">Min +₹{state.minIncrement.toLocaleString('en-IN')}</div>
          </div>

          {/* Sold state */}
          {!p && (
            <div style={{ marginTop: 12 }}>
              {state.lastSold ? (
                <div style={{ padding: 12, borderRadius: 10, background: '#0e1b34', border: '1px solid #2e4370' }}>
                  <div style={{ fontSize: 18 }}>
                    <span className="badge" style={{ marginRight: 10 }}>SOLD</span>
                    {state.lastSold.playerName} to <b>{state.lastSold.teamName || '—'}</b> for <b>₹{(state.lastSold.price || 0).toLocaleString('en-IN')}</b>
                  </div>
                  <div className="muted" style={{ marginTop: 6 }}>Waiting for admin to select the next player…</div>
                </div>
              ) : (
                <div className="muted" style={{ marginTop: 6 }}>Waiting for admin to select a player…</div>
              )}
            </div>
          )}

          {/* Active player details */}
          {p && (
            <>
              <div style={{ marginTop: 6 }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{p.name} <span className="badge" style={{ marginLeft: 8 }}>Batch {p.batch}</span></div>
                <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ ...houseBadgeStyle(p.house) }}>{p.house}</span>
                  <span className="badge">{p.strength}</span>
                </div>
              </div>

              {/* Stats grid */}
              <div className="row" style={{ marginTop: 12 }}>
                <div className="col"><div className="badge">Matches: {p.totalMatchPlayed}</div></div>
                <div className="col"><div className="badge">Runs: {p.totalScore}</div></div>
                <div className="col"><div className="badge">Wickets: {p.totalWicket}</div></div>
              </div>

              {/* Bid panel */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                   <div style={{
                      background: 'linear-gradient(135deg, #102444 0%, #0e1b34 100%)',
                      border: '1px solid #2e4370',
                      padding: '14px 16px',
                      borderRadius: 12,
                      minWidth: 260,
                      boxShadow: pulse ? '0 0 0 6px rgba(79,156,255,0.12)' : '0 6px 20px rgba(0,0,0,0.25)',
                      transition: 'box-shadow 280ms ease'
                    }}>
                    <div className="muted" style={{ fontSize: 12, letterSpacing: .4 }}>CURRENT BID</div>
                    <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.15 }}>₹{currentAmount?.toLocaleString('en-IN')}</div>
                  </div>
                  {currentTeam && (
                    <div className="badge" style={{ fontSize: 14 }}>Highest: {currentTeam}</div>
                  )}
                  <div className="badge" style={{ fontSize: 14 }}>Base: ₹{(p.basePrice || state.basePrice).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
