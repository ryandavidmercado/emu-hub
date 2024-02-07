import { useEffect, useId } from 'react'
import { Input } from '../enums'
import gamepadReader from './util/gamepadReader'

type Callback = (input: Input) => void

const kbKeyMap: Partial<Record<KeyboardEvent['key'], Input>> = {
  ArrowLeft: Input.LEFT,
  ArrowRight: Input.RIGHT,
  ArrowUp: Input.UP,
  ArrowDown: Input.DOWN,
  a: Input.LEFT,
  d: Input.RIGHT,
  w: Input.UP,
  s: Input.DOWN,
  Enter: Input.A,
  Escape: Input.B,
  Backspace: Input.START,
  Tab: Input.SELECT
}

interface Subscriber {
  id: string
  priority: number
  bypass: boolean
  cb: Callback
  enforcePriority: boolean
  disableForDevice?: 'keyboard' | 'gamepad'
}

let subscribers: Subscriber[] = []

const passInputToSubscribers = (input: Input, source: 'keyboard' | 'gamepad') => {
  const maxPriority = subscribers.reduce((acc, sub) => {
    return Math.max(sub.enforcePriority ? sub.priority : 0, acc)
  }, 0)

  for (const subscriber of subscribers) {
    if (subscriber.priority < maxPriority && !subscriber.bypass) continue
    if (source === subscriber.disableForDevice) continue
    subscriber.cb(input)
  }
}

gamepadReader(passInputToSubscribers)

document.addEventListener('keydown', (e) => {
  const input = kbKeyMap[e.key]
  if (!input) return

  passInputToSubscribers(input, 'keyboard')
})

interface PrioritySettings {
  priority?: number
  bypass?: boolean
  disabled?: boolean
  enforcePriority?: boolean
  disableForDevice?: 'keyboard' | 'gamepad'
}

export const useOnInput = (cb: Callback, prioritySettings?: PrioritySettings) => {
  const {
    priority = 0,
    disabled = false,
    bypass = false,
    enforcePriority = true,
    disableForDevice
  } = prioritySettings ?? {}
  const id = useId()

  useEffect(() => {
    if (disabled) {
      subscribers = subscribers.filter((sub) => sub.id !== id)
      return
    }

    const currentSubscriber = subscribers.find((sub) => sub.id === id)
    if (!currentSubscriber) {
      subscribers.push({
        priority,
        cb,
        id,
        bypass,
        enforcePriority,
        disableForDevice
      })
    } else {
      currentSubscriber.priority = priority
      currentSubscriber.cb = cb
    }

    return () => {
      subscribers = subscribers.filter((sub) => sub.id !== id)
    }
  }, [cb, priority, disabled])
}
