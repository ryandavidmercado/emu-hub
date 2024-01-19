import { useEffect, useId } from "react"
import { Input } from "../enums"

type Callback = (input: Input) => void;

interface Subscriber {
  id: string;
  priority: number;
  bypass: boolean;
  cb: Callback;
}

interface PrioritySettings {
  priority?: number
  bypass?: boolean;
  disabled?: boolean;
}

let subscribers: Subscriber[] = [];
const keyMap: Record<KeyboardEvent['key'], Input> = {
  ArrowLeft: Input.LEFT,
  ArrowRight: Input.RIGHT,
  ArrowUp: Input.UP,
  ArrowDown: Input.DOWN,
  a: Input.LEFT,
  d: Input.RIGHT,
  w: Input.UP,
  s: Input.DOWN,
  "Enter": Input.A,
  "Escape": Input.B,
  "Backspace": Input.START
}

document.addEventListener("keydown", (e) => {
  const input = keyMap[e.key];
  const maxPriority = subscribers.reduce((acc, sub) => {
    return Math.max(sub.priority, acc)
  }, 0)

  for(const subscriber of subscribers) {
    if((subscriber.priority < maxPriority) && !subscriber.bypass) continue;
    subscriber.cb(input)
  }
})


export const useOnInput = (cb: Callback, prioritySettings?: PrioritySettings) => {
  const { priority = 0, disabled = false, bypass = false } = prioritySettings ?? {};
  const id = useId();

  useEffect(() => {
    if(disabled) {
      subscribers = subscribers.filter(sub => sub.id !== id);
      return;
    }

    const currentSubscriber = subscribers.find((sub) => sub.id === id);
    if(!currentSubscriber) {
      subscribers.push({
        priority,
        cb,
        id,
        bypass
      })
    } else {
      currentSubscriber.priority = priority;
      currentSubscriber.cb = cb;
    }

    return () => {
      subscribers = subscribers.filter(sub => sub.id !== id);
    }
  }, [cb, priority, disabled]);
}
