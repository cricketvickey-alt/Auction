import React, { useEffect, useState } from 'react'
import { getAuctionState } from '../lib/api'
import socket from '../lib/socket'

export default function User() {
  const [state, setState] = useState({ basePrice: 2500, minIncrement: 500, player: null, currentBid: null, lastSold: null })

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

  const p = state.player
  return (
    <div className="card">
      <h2>Live Auction</h2>
      {!p && (
        <>
          {state.lastSold ? (
            <div className="row" style={{ alignItems: 'center' }}>
              <div className="col" style={{ fontSize: 18 }}>
                <b>Sold:</b> {state.lastSold.playerName} to <b>{state.lastSold.teamName || '—'}</b> for <b>₹{(state.lastSold.price || 0).toLocaleString('en-IN')}</b>
              </div>
              <div className="col muted">Waiting for admin to select the next player…</div>
            </div>
          ) : (
            <p className="muted">Waiting for admin to select a player…</p>
          )}
        </>
      )}
      {p && (
        <div className="row">
          <div className="col" style={{ maxWidth: 220 }}>
            <img src={p.photoUrl || 'https://via.placeholder.com/200x260?text=Player'} alt="player" style={{ width: '100%', borderRadius: 8, border: '1px solid #1f2a44' }} />
          </div>
          <div className="col">
            <h3 style={{ marginTop: 0 }}>{p.name} <span className="badge">Batch {p.batch}</span></h3>
            <p className="muted">House: {p.house} • Strength: {p.strength}</p>
            <div className="row">
              <div className="col">
                <div className="badge">Matches: {p.totalMatchPlayed}</div>
              </div>
              <div className="col">
                <div className="badge">Runs: {p.totalScore}</div>
              </div>
              <div className="col">
                <div className="badge">Wickets: {p.totalWicket}</div>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div>Base Price: ₹{state.basePrice.toLocaleString('en-IN')}</div>
              <div>Min Increment: ₹{state.minIncrement.toLocaleString('en-IN')}</div>
              <div style={{ marginTop: 12, fontSize: 22 }}>
                Current Bid: <b>₹{(state.currentBid?.amount || p.basePrice || state.basePrice).toLocaleString('en-IN')}</b>
                {state.currentBid?.teamName && <span className="badge" style={{ marginLeft: 8 }}>Highest: {state.currentBid.teamName}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
