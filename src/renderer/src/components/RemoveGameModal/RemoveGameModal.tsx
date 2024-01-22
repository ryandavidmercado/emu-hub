import games from "@renderer/atoms/games"
import { Game } from "@common/types"
import Modal from "../Modal/Modal"
import { Dispatch, useMemo } from "react"
import { SetStateAction, useAtom } from "jotai"
import { useOnInput } from "@renderer/hooks"
import { Input } from "@renderer/enums"
import css from "./RemoveGameModal.module.scss";
import ControllerForm, { ControllerFormEntry } from "../ControllerForm/ControllerForm"
import { FaMinus } from "react-icons/fa"
import { IoTrash } from "react-icons/io5"

interface Props {
  game: Game,
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>
}

const RemoveGameModal = ({ game, open, setOpen }: Props) => {
  const [, removeGame] = useAtom(games.remove);
  const [, removeGameWithFiles] = useAtom(games.removeWithROMFiles);

  useOnInput((input) => {
    switch (input) {
      case Input.B:
        setOpen(false)
    }
  }, {
    priority: 20,
    disabled: !open
  })

  const entries = useMemo<ControllerFormEntry[]>(() => [
    {
      id: 'cancel',
      label: "Cancel",
      type: "action",
      onSelect: () => {
        setOpen(false)
      }
    },
    {
      id: 'remove-game',
      label: "Remove Game Entry",
      type: "action",
      colorScheme: "caution",
      Icon: FaMinus,
      onSelect: () => {
        removeGame(game.id)
      }
    },
    {
      id: 'remove-game-and-rom',
      label: "Remove Game Entry & Game Files",
      type: "action",
      colorScheme: "warning",
      Icon: IoTrash,
      onSelect: () => {
        removeGameWithFiles(game.id)
      }
    }
  ], [removeGame, removeGameWithFiles])

  return (
    <Modal
      id="remove-game"
      open={open}
    >
      <div className={css.container}>
        <div className={css.label}>Remove Game: {(game.name ?? game.romname)}</div>
        <ControllerForm
          entries={entries}
          isActive={true}
          inputPriority={20}
          autoHeight
          defaultSelection="cancel"
        />
      </div>
    </Modal>
  )
}

export default RemoveGameModal;
