import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { Notification } from "@renderer/atoms/notifications";

export const notificationsAtom = atom<Notification[]>([]);

const useNotificationDisplay = (timeout = 4) => {
  const [notifications, setNotifications] = useAtom(notificationsAtom);

  useEffect(() => {
    const displayHandler = ((e: CustomEvent) => {
      const notification = e.detail;
      setNotifications(n => [...n, notification]);

      const notificationTimeout = notification.timeout ?? timeout;
      if(!notificationTimeout) return;

      setTimeout(() => {
        setNotifications(n => n.filter(n => n.id !== notification.id));
      }, (notificationTimeout * 1000))
    }) as EventListener;

    const dismissHandler = ((e: CustomEvent) => {
      const dismissId = e.detail.id as string;
      setNotifications(n => n.filter(n => n.id !== dismissId));
    }) as EventListener

    window.addEventListener("notification-display", displayHandler)
    window.addEventListener("notification-display-dismiss", dismissHandler)

    return () => {
      window.removeEventListener("notification-display", displayHandler)
      window.removeEventListener("notification-display-dismiss", dismissHandler)
    }
  }, [])

  return notifications;
}

export default useNotificationDisplay;
