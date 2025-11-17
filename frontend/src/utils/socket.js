import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
    transports: ['websocket'],
    reconnection: true,
})

socket.on('connect', () => console.log('✅ Socket connected'))
socket.on('disconnect', () => console.log('⚠️ Socket disconnected'))

export default socket
