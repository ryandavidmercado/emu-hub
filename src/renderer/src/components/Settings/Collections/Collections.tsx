import collections from "@renderer/atoms/collections"
import MultiPageControllerForm, { MultiFormPage } from "@renderer/components/ControllerForm/MultiPage"
import { useAtom } from "jotai"
import { SectionProps } from "..";
import { useMemo, useState } from "react";
import { FaMinus } from "react-icons/fa";
import { IoTrash } from "react-icons/io5";
import Modal from "@renderer/components/Modal/Modal";
import { NewCollection } from "@renderer/components/CollectionModal/CollectionModal";
import { HiPlus } from "react-icons/hi";

const Collections = ({ isActive, onExit, inputPriority }: SectionProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const [collectionsList] = useAtom(collections.lists.all)
  const [getCollection] = useAtom(collections.single.curriedWithGames);

  const [, removeGameFromCollection] = useAtom(collections.removeGame);
  const [, deleteCollection] = useAtom(collections.remove)

  const pages = useMemo<MultiFormPage[]>(() => [
    {
      id: 'collection',
      entries: [
        {
          id: 'new-collection',
          label: "New Collection",
          type: "action",
          colorScheme: "confirm",
          Icon: HiPlus,
          onSelect: () => { setModalOpen(true) }
        },
        ...collectionsList.map(collection => ({
          id: collection.id,
          label: collection.name,
          type: "navigate",
        } as const))
      ]
    },
    {
      id: 'game',
      entries: ({ collection }) => {
        const collectionData = getCollection(collection);
        if(!collectionData) return [];

        return [
          {
            id: `remove-${collectionData.name}`,
            label: `Remove "${collectionData.name}"`,
            type: 'action',
            Icon: IoTrash,
            colorScheme: 'warning',
            onSelect: (_, goBack: () => void) => {
              goBack();
              deleteCollection(collection);
            }
          } as const ,
          ...collectionData.games.map(game => ({
            id: game.id,
            label: game.name ?? game.romname,
            sublabel: `Remove ${game.name ?? game.romname} from "${collectionData.name}"`,
            type: 'action',
            Icon: FaMinus,
            colorScheme: "caution",
            onSelect: (gameId: string) => {
              removeGameFromCollection(collection, gameId)
            }
          } as const))
        ]
      }
    }
  ], [collectionsList])

  return (
    <>
      <MultiPageControllerForm
        pages={pages}
        active={isActive && !modalOpen}
        onExitBack={onExit}
        onExitLeft={onExit}
        inputPriority={inputPriority}
      />
      <Modal id="new-collection-modal" open={modalOpen}>
        <NewCollection
          onCancel={() => { setModalOpen(false) }}
          onComplete={() => { setModalOpen(false) }}
          inputPriority={20}
        />
      </Modal>
    </>
  )
}

export default Collections;
