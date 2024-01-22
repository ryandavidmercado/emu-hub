import { PartialBy } from "@renderer/types/util";
import { atom } from "jotai";
import ShortUniqueId from "short-unique-id";
const uid = new ShortUniqueId();

export interface Notification {
  id: string;
  text: string;
  type: "download" | "error" | "info" | "success",
  timeout?: number;
}

const notifications = atom<Notification[]>([]);
const add = atom(null,
  (_, set, notification: PartialBy<Notification, 'id'>) => {
    const newNotification = {
      ...notification,
      id: notification.id ?? uid.rnd()
    }

    set(notifications, (notifs) => [...notifs, newNotification])

    const event = new CustomEvent("notification-display", { detail : newNotification });
    window.dispatchEvent(event);
  }
)

const remove = atom(null,
  (_, set, id: Notification["id"]) => {
    set(notifications, (notifs) => notifs.filter(notif => notif.id !== id));
    const event = new CustomEvent("notification-display-dismiss", { detail: { id }});
    window.dispatchEvent(event);
  }
)

const update = atom(null,
  (get, set, update: Partial<Notification> & { id: string }) => {
    const notifs = get(notifications);
    const notifToUpdate = notifs.find(n => n.id === update.id);
    if(!notifToUpdate) return;

    const newNotif = {
      ...notifToUpdate,
      ...update
    }

    set(notifications, ns => ns.map(n => {
      if(n.id !== update.id) return n;
      return newNotif
    }));

    const displayNotificationId = uid.rnd();
    const event = new CustomEvent("notification-display", { detail: {
      ...newNotif,
      id: displayNotificationId
    }});

    window.dispatchEvent(event);
  }
)

const clear = atom(null, (_, set) => { set(notifications, [])})

export default {
  list: notifications,
  add,
  remove,
  clear,
  update
}
