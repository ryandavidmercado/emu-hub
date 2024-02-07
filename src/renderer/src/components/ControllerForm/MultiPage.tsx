import { useCallback, useMemo, useState } from 'react'
import ControllerForm, { ControllerFormEntry, FormTypes } from './ControllerForm'
import { useOnInput } from '@renderer/hooks'
import { Input } from '@renderer/enums/Input'
import { FaAngleRight } from 'react-icons/fa'
import { Align } from 'react-window'

type Entry = Omit<ControllerFormEntry, 'onSelect' | 'type'> &
  (FormTypes | { type: 'navigate'; navigateTo?: string | -1; onSelect?: (id: string) => void })

export interface MultiFormPage {
  id: string
  entries: Entry[] | ((data: any) => Entry[])
  canExitLeft?: boolean
  defaultSelection?: string
}

interface Props {
  pages: MultiFormPage[]
  onExitLeft?: () => void
  onExitBack?: () => void
  active: boolean
  inputPriority?: number
  scrollType?: Align
  hasParentContainer?: boolean
}

const MultiPageControllerForm = ({
  pages,
  onExitLeft,
  onExitBack,
  active,
  inputPriority,
  scrollType,
  hasParentContainer
}: Props) => {
  const [pageStack, setPageStack] = useState([pages[0].id])
  const activePageId = pageStack.at(-1)
  const currentPageIndex = pages.findIndex((page) => page.id === activePageId)
  const currentPage = pages[currentPageIndex]

  const defaultNavigateTo = pages[currentPageIndex + 1]?.id

  const [pageSelections, setPageSelections] = useState<Record<string, string>>(
    pages.reduce(
      (acc, page) => ({
        ...acc,
        [page.id]: null
      }),
      {}
    )
  )

  const goBack = useCallback(() => {
    if (pageStack.length === 1) return onExitBack?.()
    setPageStack(pageStack.slice(0, -1))
  }, [onExitBack, pageStack])

  useOnInput(
    (input) => {
      switch (input) {
        case Input.LEFT:
          if (!currentPage) break

          const { canExitLeft = true } = currentPage
          if (canExitLeft) onExitLeft?.()

          break
        case Input.B:
          goBack()
      }
    },
    {
      disabled: !active,
      priority: inputPriority
    }
  )

  const entries = useMemo(() => {
    if (!currentPage) return []
    const baseEntries = Array.isArray(currentPage.entries)
      ? currentPage.entries
      : currentPage.entries(pageSelections)

    // inject navigate entries with form selections setter & routing
    return baseEntries.map((entry) => {
      switch (entry.type) {
        case 'navigate':
          return {
            ...entry,
            type: 'action',
            onSelect: (selectedEntryId: string) => {
              if (entry.onSelect) entry.onSelect(selectedEntryId)
              setPageSelections((pageData) => ({
                ...pageData,
                [currentPage.id]: selectedEntryId
              }))

              const navigateTo = entry.navigateTo
              if (navigateTo !== -1) {
                setPageStack((stack) => [...stack, navigateTo ?? defaultNavigateTo])
              } else {
                goBack()
              }
            },
            Icon: entry.Icon ?? FaAngleRight,
            IconActive: entry.IconActive ?? entry.Icon ?? FaAngleRight
          } as ControllerFormEntry
        default:
          return entry as ControllerFormEntry
      }
    })
  }, [currentPage, pageSelections, goBack])

  return (
    <ControllerForm
      key={`${currentPage.id}-${entries.length}`}
      entries={entries}
      isActive={active}
      inputPriority={inputPriority}
      defaultSelection={currentPage.defaultSelection}
      scrollType={scrollType}
      hasParentContainer={hasParentContainer}
    />
  )
}

export default MultiPageControllerForm
