import { io } from 'socket.io-client'

const base = import.meta.env.VITE_API_URL?.replace(/\/$/, '')
export const socket = io(base, { transports: ['websocket'], autoConnect: true })

export default socket
