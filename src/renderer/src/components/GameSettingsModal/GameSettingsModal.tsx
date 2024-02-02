import games from "@renderer/atoms/games"
import { Game } from "@common/types"
import Modal from "../Modal/Modal"
import { Dispatch, useState } from "react"
import { SetStateAction, useAtom } from "jotai"
import css from "./GameSettingsModal.module.scss";
import MultiPageControllerForm, { MultiFormPage } from "../ControllerForm/MultiPage"
import { ControllerFormEntry } from "../ControllerForm/ControllerForm"
import { IoTrash } from "react-icons/io5"
import { InputPriority } from "@renderer/const/inputPriorities"
import { DefaultGameDisplayType } from "@renderer/atoms/defaults/gameDisplayTypes"
import { FaAngleRight } from "react-icons/fa"
import GameArtSelction from "../GameArtSelection/GameArtSelection"

interface Props {
  game: Game,
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>
}

const GameSettingsModal = ({ game, open, setOpen }: Props) => {
  const [, removeGame] = useAtom(games.remove);
  const [, updateGame] = useAtom(games.single(game.id));

  const [inGameArtSelection, setInGameArtSelection] = useState(false);

  const showcaseDisplayType = game.showcaseDisplayType ?? DefaultGameDisplayType.showcase;
  const gamePageDisplayType = game.gamePageDisplayType ?? DefaultGameDisplayType.gamePage;
  const gameTileDisplayType = game.gameTileDisplayType ?? DefaultGameDisplayType.gameTile;

  const pages: MultiFormPage[] = [
    {
      id: 'main',
      entries: [
        (game.screenshot || game.hero || game.poster) && {
          id: 'game-art',
          label: 'Game Art',
          type: 'action',
          onSelect: () => {
            setInGameArtSelection(true);
          },
          Icon: FaAngleRight
        },
        {
          id: 'rename',
          label: "Rename",
          sublabel: `Current: ${game.name}`,
          type: "input",
          onInput: (name: string) => {
            updateGame({ name })
          },
          defaultValue: game.name
        },
        {
          id: 'delete',
          label: "Delete",
          type: "action",
          onSelect: () => {
            removeGame(game.id)
          },
          Icon: IoTrash,
          colorScheme: "warning",
          confirmation: {
            text: `Are you sure you want to delete ${game.name}? This will delete any associated ROM files and media assets.`,
            defaultToConfirmed: false
          }
        }
      ].filter(Boolean) as ControllerFormEntry[]
    },
    {
      id: 'game-art',
      entries: [
        game.screenshot && game.hero && {
          id: 'game-view',
          label: "Game Page",
          sublabel: `Current: ${gamePageDisplayType === "screenshot" ? "Screenshot": "Fanart"}`,
          type: "toggle",
          enabled: gamePageDisplayType === "screenshot",
          setEnabled: () => { updateGame({ gamePageDisplayType: gamePageDisplayType === "screenshot" ? "fanart" : "screenshot" })},
          useDisableStyling: false
        },
        game.screenshot && game.hero && {
          id: 'showcase-home',
          label: "Showcase (Home Page)",
          sublabel: `Current: ${showcaseDisplayType === "screenshot" ? "Screenshot" : "Fanart"}`,
          type: "toggle",
          enabled: showcaseDisplayType === "screenshot",
          setEnabled: () => {
            updateGame({ showcaseDisplayType: showcaseDisplayType === "screenshot" ? "fanart" : "screenshot" })
          },
          useDisableStyling: false
        },
        game.screenshot && game.poster && {
          id: 'tile',
          label: "Game Tile",
          type: "toggle",
          enabled: gameTileDisplayType === "poster",
          sublabel: `Current: ${gameTileDisplayType === "poster" ? "Poster" : "Screenshot + Logo"}`,
          setEnabled: () => {
            updateGame({ gameTileDisplayType: gameTileDisplayType === "poster" ? "screenshot" : "poster" })
          },
          useDisableStyling: false
        }
      ].filter(Boolean) as ControllerFormEntry[],
    }
  ]

  return (
    <Modal
      id="game-settings"
      open={open}
    >
      {!inGameArtSelection
        ? <div className={css.container}>
            <MultiPageControllerForm
              pages={pages}
              active={true}
              inputPriority={InputPriority.GENERAL_MODAL}
              hasParentContainer={false}
              onExitBack={() => { setOpen(false) }}
            />
          </div>
        : <GameArtSelction game={game} onExit={() => setInGameArtSelection(false) }/>
      }
    </Modal>
  )
}

export default GameSettingsModal;
