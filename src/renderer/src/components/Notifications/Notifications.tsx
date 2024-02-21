import { createPortal } from 'react-dom'
import css from './Notifications.module.scss'
import notifications, { Notification } from '@renderer/atoms/notifications'
import { IconType } from 'react-icons'
import { FaCircleInfo } from 'react-icons/fa6'
import { MdDownloadForOffline } from 'react-icons/md'
import { AnimatePresence, motion } from 'framer-motion'
import classNames from 'classnames'
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'
import { useAtom } from 'jotai'
import { appConfigAtom } from '@renderer/atoms/appConfig'
import { hintsHeight } from '@renderer/const/const'

const Notifications = () => {
  const [appConfig] = useAtom(appConfigAtom)
  const { ui: { controllerHints }} = appConfig

  const [notificationsList] = useAtom(notifications.list)

  return createPortal(
    <motion.div
      className={css.notificationsOverlay}
      layout
      style={{
        padding: '2rem',
        paddingBottom: controllerHints ? `calc(2rem + ${hintsHeight})` : '2rem'
      }}
    >
      <AnimatePresence>
        {notificationsList.map((notification) => (
          <NotificationDisplay notification={notification} key={notification.id} />
        ))}
      </AnimatePresence>
    </motion.div>,
    document.body
  )
}

const IconMap: Partial<Record<Notification['type'], IconType>> = {
  info: FaCircleInfo,
  download: MdDownloadForOffline,
  error: FaExclamationCircle,
  success: FaCheckCircle
}

const NotificationDisplay = ({ notification }: { notification: Notification }) => {
  const Icon = IconMap[notification.type]

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -12 }}
      className={classNames(css.notificationDisplay, css[notification.type])}
    >
      {notification.text}
      {Icon && <Icon className={css.icon} />}
    </motion.div>
  )
}

export default Notifications
