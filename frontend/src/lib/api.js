import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.replace(/\/$/, '') + '/api',
})

export default api

// Admin token helpers
const ADMIN_TOKEN_KEY = 'adminToken'
export function setAdminToken(token) {
  if (!token) {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
  } else {
    localStorage.setItem(ADMIN_TOKEN_KEY, token)
  }
}
export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY) || ''
}

// Attach admin token to /admin requests
api.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('/admin')) {
    const token = getAdminToken()
    if (token) config.headers['x-admin-token'] = token
  }
  return config
})

// Auction
export const getAuctionState = () => api.get('/auction/state').then(r => r.data)
export const teamLogin = (code) => api.post('/auction/team/login', { code }).then(r => r.data)
export const raiseBid = (code) => api.post('/auction/bid/raise', { code }).then(r => r.data)

// Players
export const listPlayers = (params={}) => api.get('/players', { params }).then(r => r.data)
export const createPlayer = (payload) => api.post('/players', payload).then(r => r.data)

// Teams
export const listTeams = () => api.get('/teams').then(r => r.data)
export const getTeam = (id) => api.get(`/teams/${id}`).then(r => r.data)
export const createTeam = (payload) => api.post('/teams', payload).then(r => r.data)
export const updateTeam = (id, payload) => api.put(`/teams/${id}`, payload).then(r => r.data)

// Admin
export const getSettings = () => api.get('/admin/settings').then(r => r.data)
export const updateSettings = (payload) => api.put('/admin/settings', payload).then(r => r.data)
export const setCurrentPlayer = (playerId) => api.post('/admin/current-player', { playerId }).then(r => r.data)
export const sellPlayer = () => api.post('/admin/sell').then(r => r.data)
export const setTeamWallet = (teamId, amount) => api.put(`/admin/team/${teamId}/wallet`, { amount }).then(r => r.data)
