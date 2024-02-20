import { useEffect, useState } from "react"

export const useDeferredValue = <T>(deferred: T, initial: T) => {
  const [value, setValue] = useState(initial)
  useEffect(() => {
    setValue(deferred)
  }, [deferred])

  return value
}
