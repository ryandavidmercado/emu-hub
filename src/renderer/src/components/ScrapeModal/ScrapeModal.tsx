import { SetStateAction, useAtom } from "jotai"
import { Dispatch, useState } from "react"
import Modal from "../Modal/Modal"
import css from "./ScrapeModal.module.scss";
import ControllerForm, { ControllerFormEntry } from "../ControllerForm/ControllerForm";
import { useOnInput } from "@renderer/hooks";
import { Input } from "@renderer/enums/Input";
import { Game } from "@common/types";
import { InputPriority } from "@renderer/const/inputPriorities";
import { IoCloudDownload } from "react-icons/io5";
import games from "@renderer/atoms/games";
import { scrapers } from "@renderer/const/scrapers";

interface Props {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  game: Game
}

const ScrapeModal = ({ open, setOpen, game }: Props) => {
  const [, scrapeGame] = useAtom(games.scrape);
  const [scrapeBy, setScrapeBy] = useState<"name" | "rom">("rom");

  useOnInput((input) => {
    switch(input) {
      case Input.B:
        setOpen(false);
    }
  }, {
    disabled: !open,
    priority: InputPriority.GENERAL_MODAL
  })

  const [scraper, setScraper] = useState<"screenscraper" | "igdb">(scrapers[0].id)

  const entries: ControllerFormEntry[] = [
    {
      id: "scraper-selection",
      type: "selector",
      label: "Scraping Service",
      options: [...scrapers],
      wraparound: true,
      value: scraper,
      onSelect: (id) => { setScraper(id as "screenscraper" | "igdb") },
    },
    {
      id: 'scrape-by',
      type: 'selector',
      label: "Scrape By:",
      options: [
        { id: "rom", label: "ROM Info (Name, Size, CRC)" },
        { id: "name", label: "Game Name" }
      ],
      onSelect: (id) => setScrapeBy(id as "name" | "rom"),
      wraparound: true,
      value: scrapeBy,
    },
    {
      id: "start",
      type: "action",
      label: "Scrape Now",
      colorScheme: "confirm",
      onSelect: () => {
        scrapeGame({ gameId: game.id, scraper, scrapeBy })
      },
      Icon: IoCloudDownload,
    }
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

export default ScrapeModal;
