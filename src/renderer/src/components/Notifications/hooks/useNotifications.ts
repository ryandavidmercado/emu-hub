import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { Notification } from "@renderer/atoms/notifications";

export const notificationsAtom = atom<Notification[]>([]);

const useNotifications = (timeout = 4) => {
  const [notifications, setNotifications] = useAtom(notificationsAtom);

  useEffect(() => {
    const notifLifecycleHandler = async (notification: Notification) => {
      setNotifications(n => [...n, notification]);
      await new Promise((res) => setTimeout(res, timeout * 1000)) //
      setNotifications(n => n.filter(n => n.id !== notification.id));
    }

    const handler = ((e: CustomEvent) => {
      notifLifecycleHandler(e.detail);
    }) as EventListener;

    window.addEventListener("notification", handler)
    return () => {
      window.removeEventListener("notification", handler)
    }
  }, [])

  return notifications;
}

export default useNotifications;
