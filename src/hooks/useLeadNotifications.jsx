import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '@/context/SocketContext'

const SOUND_SRC = '/sounds/mixkit-positive-notification-951.wav'

export function useLeadNotifications(onNewLead) {
  const socket = useSocket()
  const navigate = useNavigate()
  const audioRef = useRef(null)

  // Browsers block audio-with-sound playback until the page has received a
  // real user gesture (click/keypress). An admin who's already logged in
  // (token restored from localStorage) can land on the panel and receive a
  // lead before clicking anything, so play-and-immediately-pause on the
  // first interaction to "unlock" the element for later unprompted plays.
  useEffect(() => {
    const audio = new Audio(SOUND_SRC)
    audio.preload = 'auto'
    audioRef.current = audio

    const unlock = () => {
      audio
        .play()
        .then(() => {
          audio.pause()
          audio.currentTime = 0
        })
        .catch(() => {})
    }

    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })

    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleNewLead = (lead) => {
      const audio = audioRef.current
      if (audio) {
        audio.currentTime = 0
        audio.play().catch((err) => {
          console.warn('Lead notification sound was blocked by the browser:', err.message)
        })
      }

      onNewLead?.(lead)

      toast.custom(
        (t) => (
          <div
            className={`w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg transition-opacity ${
              t.visible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900">New lead received</p>
              <button onClick={() => toast.dismiss(t.id)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>
            <p className="mt-1 text-sm font-medium text-gray-800">{lead.name}</p>
            <p className="text-xs text-gray-500">{lead.email}</p>
            <p className="text-xs text-gray-500">{lead.phone}</p>
            <p className="mt-2 line-clamp-2 text-xs text-gray-600">{lead.requirements}</p>
            <button
              onClick={() => {
                toast.dismiss(t.id)
                navigate('/')
              }}
              className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              View lead
            </button>
          </div>
        ),
        { duration: 8000 }
      )
    }

    socket.on('lead:new', handleNewLead)
    return () => socket.off('lead:new', handleNewLead)
  }, [socket, onNewLead, navigate])
}
