import { useEffect, useId } from 'react'
import { Input } from '../enums'
import gamepadReader from './util/gamepadReader'
import { atom } from 'jotai'
import { jotaiStore } from '@renderer/atoms/store/store'
import { InputLabel } from '@common/types/Input'

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

export interface ControllerHint {
  input: InputLabel
  text: string
}

interface Subscriber {
  id: string
  priority: number
  bypass: boolean
  cb: Callback
  enforcePriority: boolean
  disableForDevice?: 'keyboard' | 'gamepad'
  hints?: ControllerHint[]
}

export const controllerHintsAtom = atom<ControllerHint[]>([])
export const inputSubscribersAtom = atom<Subscriber[]>([]);

const passInputToSubscribers = (input: Input, source: 'keyboard' | 'gamepad') => {
  const subscribers = jotaiStore.get(inputSubscribersAtom);

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
  hints?: ControllerHint[]
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
    // we create a dependency loop if we get our setters from the useAtom hook
    // we bypass this by talking to the store directly
    jotaiStore.set(inputSubscribersAtom, (subscribers) => {
      if(disabled) return subscribers.filter((sub) => sub.id !== id)

      const currentSubscriber = subscribers.find((sub) => sub.id === id)
      if(!currentSubscriber) return [
        ...subscribers,
        {
          priority,
          cb,
          id,
          bypass,
          enforcePriority,
          disableForDevice,
          hints: prioritySettings?.hints
        }
      ];

      return subscribers.map(subscriber => {
        if(subscriber.id !== id) return subscriber;
        return { ...subscriber, priority, cb, hints: prioritySettings?.hints }
      })
    })

    return () => {
      jotaiStore.set(inputSubscribersAtom, (subscribers => subscribers.filter((sub) => sub.id !== id)))
    }
  }, [cb, priority, disabled, prioritySettings?.hints])
}
