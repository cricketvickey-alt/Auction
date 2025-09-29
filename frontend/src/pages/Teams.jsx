import React, { useEffect, useState } from 'react'
import { listTeams, getTeam } from '../lib/api'

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

  useEffect(() => { load() }, [])

  return (
    <div className="card">
      <h2>Teams</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Players</th>
            <th>Remaining Slots</th>
            <th>Wallet</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {teams.map(t => (
            <React.Fragment key={t.id}>
              <tr>
                <td>{t.name}</td>
                <td>{t.purchases}</td>
                <td>{t.remainingSlots}</td>
                <td>₹{t.wallet.toLocaleString('en-IN')}</td>
                <td><button onClick={() => toggle(t.id)}>{expanded[t.id] ? 'Hide' : 'View'}</button></td>
              </tr>
              {expanded[t.id] && expanded[t.id] !== 'loading' && (
                <tr>
                  <td colSpan={5}>
                    <div className="row">
                      <div className="col">
                        <b>Purchases</b>
                        <table style={{ marginTop: 8 }}>
                          <thead>
                            <tr>
                              <th>Player</th>
                              <th>House</th>
                              <th>Strength</th>
                              <th>Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expanded[t.id].purchases?.map((p, i) => (
                              <tr key={i}>
                                <td>{p.player?.name}</td>
                                <td>{p.player?.house}</td>
                                <td>{p.player?.strength}</td>
                                <td>₹{p.price.toLocaleString('en-IN')}</td>
                              </tr>
                            ))}
                            {!expanded[t.id].purchases?.length && (
                              <tr><td colSpan={4} className="muted">No purchases yet</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div className="col" style={{ minWidth: 200 }}>
                        <b>Totals</b>
                        <div style={{ marginTop: 8 }}>
                          {(() => {
                            const spent = (expanded[t.id].purchases || []).reduce((s, p) => s + p.price, 0)
                            const remaining = Math.max(0, expanded[t.id].wallet - spent)
                            return (
                              <>
                                <div>Spent: ₹{spent.toLocaleString('en-IN')}</div>
                                <div>Remaining: ₹{remaining.toLocaleString('en-IN')}</div>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {expanded[t.id] === 'loading' && (
                <tr><td colSpan={5} className="muted">Loading…</td></tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
