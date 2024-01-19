import { PartialBy } from "@renderer/types/util";
import { atom } from "jotai";
import ShortUniqueId from "short-unique-id";
const uid = new ShortUniqueId();

interface Notification {
  id: string;
  text: string;
}

const notifications = atom<Notification[]>([]);
const add = atom(null,
  (_, set, notification: PartialBy<Notification, 'id'>) => {
    set(notifications, (notifs)=> [...notifs, {
      ...notification,
      id: notification.id ?? uid.rnd()
    }])
    alert(notification.text)
  }
)

const remove = atom(null,
  (_, set, id: Notification["id"]) => {
    set(notifications, (notifs) => notifs.filter(notif => notif.id !== id))
  }
)
const clear = atom(null, (_, set) => { set(notifications, [])})

export default {
  list: notifications,
  add,
  remove,
  clear
}
