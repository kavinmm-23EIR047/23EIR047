import { useEffect, useState } from 'react'

const NOTIFICATIONS_URL = import.meta.env.VITE_API_URL || 'http://4.224.186.213/evaluation-service/notifications'
const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN

function Notifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    async function loadNotifications() {
      try {
        setLoading(true)
        const headers = new Headers({
          Accept: 'application/json',
        })

        if (AUTH_TOKEN?.trim()) {
          headers.set('Authorization', `Bearer ${AUTH_TOKEN.trim()}`)
        }

        const response = await fetch(NOTIFICATIONS_URL, {
          headers,
        })

        if (!response.ok) {
          throw new Error(`Fetch failed: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        const rawItems = Array.isArray(data)
          ? data
          : Array.isArray(data.notifications)
          ? data.notifications
          : Array.isArray(data.items)
          ? data.items
          : []

        if (mounted) {
          setItems(rawItems.slice(0, 10))
        }
      } catch (fetchError) {
        if (mounted) {
          setError(fetchError.message)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadNotifications()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <section id="notifications">
      <h2>Notifications</h2>

      {loading && <p>Loading notifications...</p>}
      {error && <p className="error">Error: {error}</p>}

      {!loading && !error && items.length === 0 && (
        <p>No notifications were returned from the service.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <ol>
          {items.map((item, index) => {
            const title = item.title ?? item.message ?? item.name ?? `Notification ${index + 1}`
            const detail = item.detail ?? item.description ?? item.message ?? null
            return (
              <li key={item.id ?? `${index}-${title}`}>
                <strong>{title}</strong>
                {detail && <div>{detail}</div>}
                {item.timestamp && <div>{new Date(item.timestamp).toLocaleString()}</div>}
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

export default Notifications


