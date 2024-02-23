export const wrappedIndex = (index: number, listLength: number) => {
  if(index < 0) return 0
  if(index > listLength - 1) return listLength - 1

  return index
}
