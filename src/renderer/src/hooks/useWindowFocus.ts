import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'

export const focusAtom = atom(true)

export const useWindowFocus = () => {
  const [focus, setFocus] = useAtom(focusAtom)

  useEffect(() => {
    const onFocus = () => {
      setFocus(true)
    }
    const onBlur = () => {
      setFocus(false)
    }

    window.addEventListener('focus', onFocus)
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  return focus
}
