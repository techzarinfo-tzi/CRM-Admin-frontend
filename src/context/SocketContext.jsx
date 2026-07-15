import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '@/context/AuthContext'

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '')

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setSocket(null)
      return
    }

    const token = localStorage.getItem('token')
    const instance = io(SOCKET_URL, { auth: { token } })
    setSocket(instance)

    return () => {
      instance.disconnect()
      setSocket(null)
    }
  }, [user])

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}

export function useSocket() {
  return useContext(SocketContext)
}
