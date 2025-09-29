import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import User from './pages/User.jsx'
import Teams from './pages/Teams.jsx'
import Owner from './pages/Owner.jsx'
import Admin from './pages/Admin.jsx'
import PlayersAdmin from './pages/PlayersAdmin.jsx'
import { getAdminToken } from './lib/api.js'

export default function App() {
  const [hasAdmin, setHasAdmin] = useState(!!getAdminToken())

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'adminToken') setHasAdmin(!!e.newValue)
    }
    window.addEventListener('storage', onStorage)
    const id = setInterval(() => setHasAdmin(!!getAdminToken()), 1000) // fallback for same-tab updates
    return () => { window.removeEventListener('storage', onStorage); clearInterval(id) }
  }, [])
  return (
    <div>
      <nav className="navbar">
        <div className="container navwrap">
          <div className="brand">🏏 Auction</div>
          <div className="navlinks">
            <Link to="/">Live Auction</Link>
            <Link to="/teams">Teams</Link>
            <Link to="/owner">Team Owner</Link>
             <Link to="/admin">Admin</Link>
           <Link to="/admin/players">Players</Link>
          </div>
        </div>
      </nav>
      <div className="container" style={{ paddingTop: 16 }}>
        <Routes>
          <Route path="/" element={<User />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/owner" element={<Owner />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/players" element={<PlayersAdmin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}
