import { PartialBy } from '@renderer/types/util'
import { atom } from 'jotai'
import ShortUniqueId from 'short-unique-id'
const uid = new ShortUniqueId()

export interface Notification {
  id: string
  text: string
  type: 'download' | 'error' | 'info' | 'success'
  timeout?: number
}

const notifications = atom<Notification[]>([])

const remove = atom(null, (_, set, id: Notification['id']) => {
  set(notifications, (notifs) => notifs.filter((notif) => notif.id !== id))
})

const add = atom(null, (get, set, notification: PartialBy<Notification, 'id'>) => {
  const currentNotifications = get(notifications)
  if(currentNotifications.some(notif => notif.id === notification.id)) return

  const newNotification = {
    ...notification,
    id: notification.id ?? uid.rnd()
  }

  set(notifications, (notifs) => [...notifs, newNotification])
  const notificationTimeout = newNotification.timeout ?? 3

  if(notificationTimeout) setTimeout(() => { set(remove, newNotification.id) }, notificationTimeout * 1000)
})


const clear = atom(null, (_, set) => {
  set(notifications, [])
})

export default {
  list: notifications,
  add,
  remove,
  clear,
}
