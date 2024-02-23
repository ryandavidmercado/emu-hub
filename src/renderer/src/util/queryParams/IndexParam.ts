import { withDefault, NumberParam, useQueryParam } from "use-query-params"
import { wrappedIndex } from "../wrappedIndex"
export const IndexParam = withDefault(NumberParam, 0)
export const useIndexParam = (name: string, listLength: number) => {
  const [index, setIndex] = useQueryParam<number, number>(name, IndexParam, { updateType: 'replaceIn' })

  const set = (setter: number | ((old: number) => number)) => {
    setIndex(old => {
      const newIndex = typeof setter === 'number'
        ? wrappedIndex(setter, listLength)
        : wrappedIndex(setter(wrappedIndex(old, listLength)), listLength)

      return newIndex
    })
  }

  return [wrappedIndex(index, listLength), set] as const
}
