import collections from '@renderer/atoms/collections'
import MultiPageControllerForm, {
  MultiFormPage
} from '@renderer/components/ControllerForm/MultiPage'
import { useAtom, useSetAtom } from 'jotai'
import { SectionProps } from '..'
import { useMemo } from 'react'
import { FaMinus } from 'react-icons/fa'
import { IoTrash } from 'react-icons/io5'
import { HiPlus } from 'react-icons/hi'

const Collections = ({ isActive, onExit, inputPriority }: SectionProps) => {
  const [collectionsList] = useAtom(collections.lists.all)
  const [getCollection] = useAtom(collections.single.curriedWithGames)

  const addCollection = useSetAtom(collections.add)

  const updateCollection = useSetAtom(collections.curriedSingle)
  const removeGameFromCollection = useSetAtom(collections.removeGame)
  const deleteCollection = useSetAtom(collections.remove)

  const pages = useMemo<MultiFormPage[]>(
    () => [
      {
        id: 'collection',
        entries: [
          {
            id: 'new-collection',
            label: 'New Collection',
            type: 'input',
            colorScheme: 'confirm',
            Icon: HiPlus,
            onInput: (input) => {
              addCollection({
                name: input,
                games: []
              })
            }
          },
          ...collectionsList.map(
            (collection) =>
              ({
                id: collection.id,
                label: collection.name,
                type: 'navigate'
              }) as const
          )
        ]
      },
      {
        id: 'game',
        entries: ({ collection }: { collection: string }) => {
          const collectionData = getCollection(collection)
          if (!collectionData) return []

          return [
            {
              id: `rename-${collectionData.id}`,
              label: `Rename "${collectionData.name}"`,
              type: 'input',
              defaultValue: collectionData.name,
              onInput: (newName: string) => { updateCollection({ id: collection, name: newName }) }
            },
            {
              id: `remove-${collectionData.id}`,
              label: "Delete Collection",
              type: 'navigate',
              navigateTo: -1,
              Icon: IoTrash,
              colorScheme: 'caution',
              onSelect: () => {
                deleteCollection(collection)
              }
            } as const,
            ...collectionData.games.map(
              (game) =>
                ({
                  id: game.id,
                  label: game.name ?? game.romname,
                  sublabel: `Remove ${game.name ?? game.romname} from "${collectionData.name}"`,
                  type: 'action',
                  Icon: FaMinus,
                  onSelect: (gameId: string) => {
                    removeGameFromCollection(collection, gameId)
                  }
                }) as const
            )
          ]
        }
      }
    ],
    [collectionsList]
  )

  return (
    <MultiPageControllerForm
      pages={pages}
      active={isActive}
      onExitBack={onExit}
      onExitLeft={onExit}
      inputPriority={inputPriority}
    />
  )
}

export default Collections
