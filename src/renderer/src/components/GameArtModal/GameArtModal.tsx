import { Dispatch } from "react"
import Modal from "../Modal/Modal"
import { SetStateAction } from "jotai"

interface Props {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const GameArtModal = ({ open }: Props) => {
  return (
    <Modal
      id="game-art-modal"
      open={open}
    />
  )
}

export default GameArtModal
