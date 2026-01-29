import { useState, useEffect, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function useNotifications(onNotification) {
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((notification) => {
    const newNotif = {
      ...notification,
      id: Date.now(),
      read: false,
    }
    setNotifications((prev) => [newNotif, ...prev].slice(0, 10)) // Garder les 10 dernières

    if (onNotification) {
      onNotification(newNotif)
    }
  }, [onNotification])

  const clearNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/api/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log('[STOMP]', str)
      },
    })

    client.onConnect = () => {
      console.log('WebSocket connecté')
      setConnected(true)

      client.subscribe('/topic/signalements', (message) => {
        try {
          const notification = JSON.parse(message.body)
          console.log('Notification reçue:', notification)
          addNotification(notification)
        } catch (e) {
          console.error('Erreur parsing notification:', e)
        }
      })
    }

    client.onDisconnect = () => {
      console.log('WebSocket déconnecté')
      setConnected(false)
    }

    client.onStompError = (frame) => {
      console.error('Erreur STOMP:', frame.headers['message'])
    }

    client.activate()

    return () => {
      if (client.active) {
        client.deactivate()
      }
    }
  }, [addNotification])

  return {
    connected,
    notifications,
    clearNotification,
    clearAll,
  }
}
