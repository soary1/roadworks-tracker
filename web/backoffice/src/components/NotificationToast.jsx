import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import './NotificationToast.css'

const getNotificationIcon = (type) => {
  switch (type) {
    case 'NEW_SIGNALEMENT':
      return '🆕'
    case 'STATUS_UPDATED':
      return '🔄'
    case 'WORK_ADDED':
      return '🔧'
    case 'SYNC_COMPLETED':
      return '✅'
    default:
      return '📢'
  }
}

const getNotificationColor = (type) => {
  switch (type) {
    case 'NEW_SIGNALEMENT':
      return '#3498db'
    case 'STATUS_UPDATED':
      return '#f39c12'
    case 'WORK_ADDED':
      return '#27ae60'
    case 'SYNC_COMPLETED':
      return '#9b59b6'
    default:
      return '#7f8c8d'
  }
}

export default function NotificationToast({ notifications, onDismiss, onRefresh }) {
  const [visible, setVisible] = useState([])

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotif = notifications[0]
      if (!visible.includes(latestNotif.id)) {
        setVisible((prev) => [...prev, latestNotif.id])

        // Auto-dismiss après 5 secondes
        setTimeout(() => {
          setVisible((prev) => prev.filter((id) => id !== latestNotif.id))
        }, 5000)
      }
    }
  }, [notifications, visible])

  const handleDismiss = (id) => {
    setVisible((prev) => prev.filter((i) => i !== id))
    if (onDismiss) onDismiss(id)
  }

  const handleClick = (notif) => {
    handleDismiss(notif.id)
    if (onRefresh) onRefresh()
  }

  const visibleNotifications = notifications.filter((n) => visible.includes(n.id))

  if (visibleNotifications.length === 0) return null

  return (
    <div className="notification-container">
      {visibleNotifications.map((notif) => (
        <div
          key={notif.id}
          className="notification-toast"
          style={{ borderLeftColor: getNotificationColor(notif.type) }}
          onClick={() => handleClick(notif)}
        >
          <div className="notification-icon">{getNotificationIcon(notif.type)}</div>
          <div className="notification-content">
            <div className="notification-message">{notif.message}</div>
            {notif.typeProblem && (
              <div className="notification-details">Type: {notif.typeProblem}</div>
            )}
          </div>
          <button
            className="notification-close"
            onClick={(e) => {
              e.stopPropagation()
              handleDismiss(notif.id)
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

NotificationToast.propTypes = {
  notifications: PropTypes.array.isRequired,
  onDismiss: PropTypes.func,
  onRefresh: PropTypes.func,
}
