import games from '@renderer/atoms/games'
import { Game } from '@common/types'
import Modal from '../Modal/Modal'
import { Dispatch, useState } from 'react'
import { SetStateAction, useAtom } from 'jotai'
import css from './GameSettingsModal.module.scss'
import MultiPageControllerForm, { MultiFormPage } from '../ControllerForm/MultiPage'
import { ControllerFormEntry } from '../ControllerForm/ControllerForm'
import { IoTrash } from 'react-icons/io5'
import { InputPriority } from '@renderer/const/inputPriorities'
import { FaAngleRight } from 'react-icons/fa'
import GameArtSelction from '../GameArtSelection/GameArtSelection'
import systems from '@renderer/atoms/systems'
import emulators from '@renderer/atoms/emulators'

interface Props {
  game: Game
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const GameSettingsModal = ({ game, open, setOpen }: Props) => {
  const [, removeGame] = useAtom(games.remove)
  const [, updateGame] = useAtom(games.single(game.id))

  const [gameSystem] = useAtom(systems.single(game.system))
  const [getEmulator] = useAtom(emulators.curriedSingle)

  const [inGameArtSelection, setInGameArtSelection] = useState(false)

  const emulatorsList = (gameSystem.emulators ?? []).map(getEmulator).map((emu) => ({
    id: emu.id,
    label: emu.name
  }))

  const selectedEmulator = game.emulator ?? emulatorsList[0]?.id

  const pages: MultiFormPage[] = [
    {
      id: 'main',
      entries: [
        (game.screenshot || game.hero || game.poster) && {
          id: 'game-art',
          label: 'Game Art',
          type: 'action',
          onSelect: () => {
            setInGameArtSelection(true)
          },
          Icon: FaAngleRight
        },
        emulatorsList?.length && {
          id: 'emulator',
          label: 'Emulator',
          type: 'selector',
          options: emulatorsList,
          value: selectedEmulator,
          onSelect: (emuId: string) => {
            updateGame({ emulator: emuId })
          },
          wraparound: true
        },
        {
          id: 'rename',
          label: 'Rename',
          sublabel: `Current: ${game.name}`,
          type: 'input',
          onInput: (name: string) => {
            updateGame({ name })
          },
          defaultValue: game.name
        },
        {
          id: 'delete',
          label: 'Delete',
          type: 'action',
          onSelect: () => {
            removeGame(game.id)
          },
          Icon: IoTrash,
          colorScheme: 'warning',
          confirmation: {
            text: `Are you sure you want to delete ${game.name}? This will delete any associated ROM files and media assets.`,
            defaultToConfirmed: false
          }
        }
      ].filter(Boolean) as ControllerFormEntry[]
    }
  ]

  return (
    <Modal id="game-settings" open={open}>
      {!inGameArtSelection ? (
        <div className={css.container}>
          <MultiPageControllerForm
            pages={pages}
            active={true}
            inputPriority={InputPriority.GENERAL_MODAL}
            hasParentContainer={false}
            onExitBack={() => {
              setOpen(false)
            }}
          />
        </div>
      ) : (
        <GameArtSelction game={game} onExit={() => setInGameArtSelection(false)} />
      )}
    </Modal>
  )
}

export default GameSettingsModal
