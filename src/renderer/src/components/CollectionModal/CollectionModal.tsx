import { SetStateAction, useAtom } from "jotai"
import { Dispatch } from "react"
import Modal from "../Modal/Modal"
import css from "./CollectionModal.module.scss";
import ControllerForm, { ControllerFormEntry } from "../ControllerForm/ControllerForm";
import { useOnInput } from "@renderer/hooks";
import { Input } from "@renderer/enums/Input";
import { FaPlus } from "react-icons/fa6"
import { Game } from "@common/types";
import collections from "@renderer/atoms/collections";
import notifications from "@renderer/atoms/notifications";
import { InputPriority } from "@renderer/const/inputPriorities";

interface Props {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  game: Game
}

const CollectionModal = ({ open, setOpen, game }: Props) => {
  const [collectionsList] = useAtom(collections.lists.all);
  const [,addCollection] = useAtom(collections.add);
  const [,addGameToCollection] = useAtom(collections.addGame);
  const [,addNotification] = useAtom(notifications.add);

  useOnInput((input) => {
    switch(input) {
      case Input.B:
        setOpen(false);
    }
  }, {
    disabled: !open,
    priority: InputPriority.GENERAL_MODAL
  })

  const entries: ControllerFormEntry[] = [
    {
      id: "new-collection",
      label: "New Collection",
      type: "input",
      Icon: FaPlus,
      colorScheme: "confirm",
      onInput: (input) => {
        setOpen(false);
        addCollection({ name: input, games: game ? [game.id] : [] });
        addNotification({
          text: `Created "${input}" collection!`,
          type: "success",
          timeout: 2
        })
      },
    },
    ...collectionsList
      .filter(collection => !collection.games.includes(game?.id))
      .map<ControllerFormEntry>(collection => ({
        id: `collection-${collection.id}`,
        label: collection.name,
        type: "action",
        onSelect: () => {
          addGameToCollection(collection.id, game.id);
          addNotification({
            type: "success",
            text: `Added ${game.name ?? game.romname} to "${collection.name}"!`,
            timeout: 2
          })
          setOpen(false);
        }
      })),
  ]

  return (
    <Modal open={open} id="collection">
      <div className={css.container}>
        <ControllerForm
          entries={entries}
          isActive={true}
          inputPriority={InputPriority.GENERAL_MODAL}
          maxHeight="70vh"
        />
      </div>
    </Modal>
  )
}

export default CollectionModal;
