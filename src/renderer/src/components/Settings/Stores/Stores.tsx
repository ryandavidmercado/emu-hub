import { useAtom } from 'jotai'
import { useState, useMemo, useEffect } from 'react'
import systems from '@renderer/atoms/systems'
import { StoreEntry } from '@common/types'
import ControllerForm, {
  ControllerFormEntry
} from '@renderer/components/ControllerForm/ControllerForm'
import Loading from 'react-loading'
import games from '@renderer/atoms/games'
import css from './Stores.module.scss'
import { ControllerHint, useOnInput } from '@renderer/hooks'
import { Input } from '@renderer/enums/Input'
import AlphabetSelector from './AlphabetSelector/AlphabetSelector'
import { SectionProps } from '..'
import { FaAngleRight } from 'react-icons/fa'
import { IoMdDownload } from 'react-icons/io'
import Pill from '@renderer/components/Pill'
import { MdOutlineCategory } from 'react-icons/md'
import { AnimatePresence, motion } from 'framer-motion'
import classNames from 'classnames'
import { sort } from 'fast-sort'
import MediaImage from '@renderer/components/MediaImage/MediaImage'
import { useInputModal } from '@renderer/components/InputModal/InputModal'
import Fuse from 'fuse.js'
import notifications from '@renderer/atoms/notifications'

type Page = 'main' | 'system' | 'store'

const Stores = ({ isActive, onExit, inputPriority }: SectionProps) => {
  const [pageStack, setPageStack] = useState<Page[]>(['main'])
  const [activeSystem, setActiveSystem] = useState<string>()
  const [activeStore, setActiveStore] = useState<string>()

  const currentPage = pageStack[pageStack.length - 1]
  const onBack = () => {
    if (pageStack.length === 1) {
      return onExit()
    }

    setPageStack((stack) => stack.slice(0, -1))
  }

  useOnInput(
    (input) => {
      switch (input) {
        case Input.LEFT:
          if (currentPage !== 'store') onExit()
          break
        case Input.B:
          onBack()
      }
    },
    {
      disabled: !isActive,
      priority: inputPriority
    }
  )

  if (currentPage === 'main')
    return (
      <Main
        isActive={isActive}
        onSelect={(systemId: string) => {
          setActiveSystem(systemId)
          setPageStack((stack) => [...stack, 'system'])
        }}
        inputPriority={inputPriority}
      />
    )

  if (currentPage === 'system')
    return (
      <System
        isActive={isActive}
        onSelect={(store) => {
          setActiveStore(store)
          setPageStack((stack) => [...stack, 'store'])
        }}
        system={activeSystem}
        inputPriority={inputPriority}
      />
    )

  if (currentPage === 'store')
    return (
      <Store
        isActive={isActive}
        system={activeSystem}
        store={activeStore}
        onBack={onBack}
        onExit={onExit}
        inputPriority={inputPriority ? inputPriority + 1 : undefined}
      />
    )
  return null
}

interface MainProps {
  isActive: boolean
  onSelect: (id: string) => void
  inputPriority?: number
}

const Main = ({ isActive, onSelect, inputPriority }: MainProps) => {
  const [systemsList] = useAtom(systems.lists.withStores)

  const entries: ControllerFormEntry[] = sort(
    systemsList.map((system) => ({
      id: system.id,
      type: 'action' as const,
      label: system.name,
      onSelect,
      Icon: FaAngleRight
    }))
  ).asc((s) => s.label)

  return <ControllerForm entries={entries} isActive={isActive} inputPriority={inputPriority} />
}

interface SystemProps {
  system?: string
  isActive: boolean
  onSelect: (id: string) => void
  inputPriority?: number
}

const System = ({ system, isActive, onSelect, inputPriority }: SystemProps) => {
  const [systemData] = useAtom(systems.single(system || ''))
  const entries: ControllerFormEntry[] =
    systemData?.stores?.map((store) => ({
      id: store.id,
      type: 'action',
      label: store.name,
      onSelect,
      Icon: FaAngleRight
    })) ?? []

  if (!systemData) return null
  return <ControllerForm entries={entries} isActive={isActive} inputPriority={inputPriority} />
}

interface StoreProps {
  system?: string
  store?: string
  isActive: boolean
  onBack: () => void
  onExit: () => void
  inputPriority?: number
}

const Store = ({ system, store, isActive, onBack, onExit, inputPriority }: StoreProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [alphabetOpen, setAlphabetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('');

  const [storeData] = useAtom(systems.store.get({ storeId: store ?? '', systemId: system ?? '' }))
  const [storeContents] = useAtom(systems.store.load({ storeData, systemId: system ?? '' }))
  const [, downloadGame] = useAtom(games.download)
  const [, addNotification] = useAtom(notifications.add)

  const getInput = useInputModal()

  const canAlphabet = !searchQuery
  const canSearch = storeData?.type === 'html' && !alphabetOpen && !searchQuery

  const entries: ControllerFormEntry[] = useMemo(
    () => {
      const baseData = 'data' in storeContents ? storeContents.data : [];
      const unfilteredEntries = baseData.map((storeEntry) => ({
        id: storeEntry.name,
        label: storeEntry.name,
        type: 'action',
        onSelect: (name) => {
          if (!('data' in storeContents)) return
          const storeEntry = storeContents.data.find((entry) => entry.name === name)
          if (!storeEntry || !system) return

          downloadGame(system, storeEntry)
        },
        IconActive: IoMdDownload
      }) as const).sort((a, b) => a.label.localeCompare(b.label))

      if(!searchQuery) return unfilteredEntries

      const searcher = new Fuse(unfilteredEntries, { threshold: .3, keys: ['label'], ignoreLocation: true })
      const results = searcher.search(searchQuery)

      if(!results.length) {
        addNotification({
          type: 'error',
          id: `no-query-${searchQuery}`,
          text: `No results found for "${searchQuery}"!`
        })

        setSearchQuery('')
        return unfilteredEntries
      }

      return results.map(results => results.item)
    },
    [storeContents, searchQuery, canSearch]
  )

  useOnInput(
    async (input) => {
      switch (input) {
        case Input.LEFT:
          if (!alphabetOpen) return onExit()
          setAlphabetOpen(false)
          break
        case Input.RIGHT:
          if (!canAlphabet) break
          setAlphabetOpen(true)
          break
        case Input.B:
          if(alphabetOpen) return setAlphabetOpen(false)
          if(searchQuery) return setSearchQuery('')

          return onBack()
        case Input.SELECT: {
          if(!canSearch) break
          const newQuery = await getInput({
            label: 'Search Store',
            shiftOnOpen: false,
            shiftOnSpace: false
          })

          if(!newQuery) break
          setSearchQuery(newQuery)

          break
        }
      }
    },
    {
      disabled: !isActive,
      priority: inputPriority,
      hints: [
        !alphabetOpen && entries.length && canAlphabet && { input: Input.RIGHT, text: 'Alphabet Selector' },
        alphabetOpen && { input: Input.LEFT, text: 'Close Alphabet Selector' },
        canSearch && entries.length && { input: Input.SELECT, text: 'Search' },
        searchQuery && { input: Input.B, text: 'Clear Search' }
      ].filter(Boolean) as ControllerHint[]
    }
  )

  useEffect(() => {
    setActiveIndex(0)
  }, [searchQuery])

  if (storeContents.state === 'loading')
    return (
      <div className={css.loading}>
        <Loading type="spin" />
      </div>
    )
  if (storeContents.state === 'hasError') return null

  return (
    <div className={css.storeWrapper}>
      {storeData.type === 'emudeck' && (
        <div className={css.emudeckWrapper}>
          <div style={{ height: '100%', position: 'relative' }}>
            <ControllerForm
              entries={entries}
              isActive={isActive && !alphabetOpen}
              controlledActiveIndex={activeIndex}
              controlledSetActiveIndex={setActiveIndex}
              inputPriority={inputPriority}
            />
            <AlphabetSelector
              entries={entries}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              isActive={alphabetOpen}
              inputPriority={inputPriority}
            />
          </div>
          <GamePreview entry={storeContents.data[activeIndex]} />
        </div>
      )}
      {storeData.type === 'html' && (
        <>
          <ControllerForm
            entries={entries}
            isActive={isActive && !alphabetOpen}
            controlledActiveIndex={activeIndex}
            controlledSetActiveIndex={setActiveIndex}
            inputPriority={inputPriority}
            scrollType="center"
            wraparound={false}
          />
          <AlphabetSelector
            entries={entries}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            isActive={alphabetOpen}
            inputPriority={inputPriority}
          />
        </>
      )}
    </div>
  )
}

const GamePreview = ({ entry }: { entry: StoreEntry }) => {
  return (
    <div className={css.gamePreviewOuter}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={entry.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.1 } }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          className={css.gamePreview}
        >
          <MediaImage
            media={entry.media?.['screenshot']?.url || ''}
            className={css.img}
            fallbackClassName={css.imgFallback}
          />
          <div className={classNames(css.description, !entry.description && css.centered)}>
            {entry.description}
            <Pill className={css.pill} Icon={MdOutlineCategory} label={entry.genre ?? ''} />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default Stores
