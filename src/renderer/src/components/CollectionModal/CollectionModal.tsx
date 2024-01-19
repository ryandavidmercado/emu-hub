import { SetStateAction, useAtom } from "jotai"
import { Dispatch, useState } from "react"
import Modal from "../Modal/Modal"
import css from "./CollectionModal.module.scss";
import ControllerForm, { ControllerFormEntry } from "../ControllerForm/ControllerForm";
import { useOnInput } from "@renderer/hooks";
import { Input } from "@renderer/enums/Input";
import { FaPlus } from "react-icons/fa6"
import { Game } from "@renderer/atoms/games";
import collections from "@renderer/atoms/collections";

interface Props {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  game: Game
}

const CollectionModal = ({ open, setOpen, game }: Props) => {
  const [activeSection, setActiveSection] = useState<"selection" | "new">("selection");
  const [collectionsList] = useAtom(collections.lists.all);
  const [,addGameToCollection] = useAtom(collections.addGame);

  useOnInput((input) => {
    switch(input) {
      case Input.B:
        setOpen(false);
    }
  }, {
    captureKey: "collection-modal",
    isCaptured: open,
    disabled: !open || (activeSection !== "selection")
  })

  // TODO: this list doesn't work properly when it exceeds container height
  const entries: ControllerFormEntry[] = [
    {
      id: "new-collection",
      label: "New Collection",
      type: "action",
      Icon: FaPlus,
      onSelect: () => { setActiveSection("new") }
    },
    ...collectionsList
      .filter(collection => !collection.games.includes(game?.id))
      .map<ControllerFormEntry>(collection => ({
        id: `collection-${collection.id}`,
        label: collection.name,
        type: "action",
        onSelect: () => {
          addGameToCollection(collection.id, game.id);
          setOpen(false);
        }
      })),
  ]

  return (
    <Modal open={open} id="collection">
      <div className={css.container}>
        {activeSection == "selection" &&
          <div
            style={{
              height: Math.min(entries.length * 100, window.innerHeight * .8)
            }}
          >
            <ControllerForm
              entries={entries}
              isActive={true}
              parentCaptureKey="collection-modal"
            />
          </div>
        }
        {activeSection == "new" &&
          <NewCollection
            onCancel={() => { setActiveSection("selection" )}}
            onComplete={() => {
              setActiveSection("selection");
              setOpen(false);
            }}
            game={game}
          />
        }
      </div>
    </Modal>
  )
}

interface NewCollectionProps {
  onCancel: () => void;
  onComplete: () => void;
  game: Game
}

const NewCollection = ({ onCancel, game, onComplete }: NewCollectionProps) => {
  const [input, setInput] = useState("");
  const [, addCollection] = useAtom(collections.add);

  const onSubmit = () => {
    addCollection({ name: input, games: [game.id] });
    onComplete();
  }

  useOnInput((input) => {
    switch(input) {
      case Input.B:
        return onCancel?.();
      case Input.A:
        return onSubmit();
    }
  }, {
    parentCaptureKeys: ["collection-modal"]
  })

  return (
    <div className={css.newCollection}>
      <div>Collection Name</div>
      <input
        ref={(elem) => { elem?.focus(); }}
        value={input}
        onChange={(e) => { setInput(e.target.value )}}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default CollectionModal;
