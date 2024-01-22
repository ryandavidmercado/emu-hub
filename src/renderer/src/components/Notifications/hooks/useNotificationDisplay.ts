import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { Notification } from "@renderer/atoms/notifications";

export const notificationsAtom = atom<Notification[]>([]);

const useNotificationDisplay = (timeout = 4) => {
  const [notifications, setNotifications] = useAtom(notificationsAtom);

  useEffect(() => {
    const handler = ((e: CustomEvent) => {
      const notification = e.detail;
      setNotifications(n => [...n, notification]);

      setTimeout(() => {
        setNotifications(n => n.filter(n => n.id !== notification.id));
      }, (notification.timeout ?? timeout) * 1000)
    }) as EventListener;

    window.addEventListener("notification-display", handler)
    return () => {
      window.removeEventListener("notification-display", handler)
    }
  }, [])

  return notifications;
}

export default useNotificationDisplay;
