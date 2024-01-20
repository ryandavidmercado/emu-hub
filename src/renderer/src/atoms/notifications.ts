import { PartialBy } from "@renderer/types/util";
import { atom } from "jotai";
import ShortUniqueId from "short-unique-id";
const uid = new ShortUniqueId();

export interface Notification {
  id: string;
  text: string;
  type: "download" | "error" | "info" | "success"
}

const notifications = atom<Notification[]>([]);
const add = atom(null,
  (_, set, notification: PartialBy<Notification, 'id'>) => {
    const newNotification = {
      ...notification,
      id: notification.id ?? uid.rnd()
    }

    set(notifications, (notifs)=> [...notifs, newNotification])

    const event = new CustomEvent("notification", { detail: newNotification });
    window.dispatchEvent(event);
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
