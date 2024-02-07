import { mergeWith } from 'lodash'

export const merger = (a: any, b: any) => {
  if (!Array.isArray(a)) return undefined

  if (typeof a[0] === 'string') return [...new Set([...a, ...b])]

  const aLookup = a.reduce((acc, e) => ({ ...acc, [e.id]: e }), {})
  const bLookup = b.reduce((acc, e) => ({ ...acc, [e.id]: e }), {})

  const ids = new Set([...a.map((e) => e.id), ...b.map((e) => e.id)])
  return [...ids].map((id) => mergeWith(aLookup[id] ?? {}, bLookup[id] ?? {}, merger))
}
