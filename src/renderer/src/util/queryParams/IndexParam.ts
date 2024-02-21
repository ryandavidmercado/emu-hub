import { withDefault, NumberParam, useQueryParam } from "use-query-params"
export const IndexParam = withDefault(NumberParam, 0)
export const useIndexParam = (name: string) => {
  const [index, setIndex] = useQueryParam<number, number>(name, IndexParam, { updateType: 'replaceIn' })
  return [index, setIndex] as const
}
