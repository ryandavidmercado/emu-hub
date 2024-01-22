import { useAtom } from "jotai";
import { useState, useMemo } from "react"
import systems, { StoreEntry } from "@renderer/atoms/systems";
import ControllerForm, { ControllerFormEntry } from "@renderer/components/ControllerForm/ControllerForm";
import Loading from "react-loading";
import games from "@renderer/atoms/games";
import css from "./Stores.module.scss";
import { useOnInput } from "@renderer/hooks";
import { Input } from "@renderer/enums/Input";
import AlphabetSelector from "./AlphabetSelector/AlphabetSelector";
import { SectionProps } from "..";
import { FaAngleRight } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import Pill from "@renderer/components/Pill";
import { MdOutlineCategory } from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
import classNames from "classnames";

type Page = "main" | "system" | "store"

const Stores = ({ isActive, onExit, inputPriority }: SectionProps) => {
  const [pageStack, setPageStack] = useState<Page[]>(["main"]);
  const [activeSystem, setActiveSystem] = useState<string>();
  const [activeStore, setActiveStore] = useState<string>();

  const currentPage = pageStack[pageStack.length - 1];

  useOnInput((input) => {
    switch (input) {
      case Input.LEFT:
        if (currentPage !== "store") onExit();
        break;
      case Input.B:
        if (pageStack.length === 1) return onExit();
        setPageStack(stack => stack.slice(0, -1));
    }
  }, {
    disabled: !isActive,
    priority: inputPriority
  })

  if (currentPage === "main") return (
    <Main
      isActive={isActive}
      onSelect={(systemId: string) => {
        setActiveSystem(systemId);
        setPageStack(stack => [...stack, "system"])
      }}
      inputPriority={inputPriority}
    />
  );

  if (currentPage === "system") return (
    <System
      isActive={isActive}
      onSelect={(store) => {
        setActiveStore(store)
        setPageStack(stack => [...stack, "store"])
      }}
      system={activeSystem}
      inputPriority={inputPriority}
    />
  )

  if (currentPage === "store") return (
    <Store
      isActive={isActive}
      system={activeSystem}
      store={activeStore}
      onExit={onExit}
      inputPriority={inputPriority}
    />
  )
  return null;
}

interface MainProps {
  isActive: boolean;
  onSelect: (id: string) => void;
  inputPriority?: number;
}

const Main = ({ isActive, onSelect, inputPriority }: MainProps) => {
  const [systemsList] = useAtom(systems.lists.withStores);

  const entries: ControllerFormEntry[] = systemsList.map(system => ({
    id: system.id,
    type: "action",
    label: system.name,
    onSelect,
    Icon: FaAngleRight
  }))

  return <ControllerForm entries={entries} isActive={isActive} inputPriority={inputPriority} />
}

interface SystemProps {
  system?: string
  isActive: boolean
  onSelect: (id: string) => void
  inputPriority?: number;
}

const System = ({ system, isActive, onSelect, inputPriority }: SystemProps) => {
  const [systemData] = useAtom(systems.single(system || ""));
  const entries: ControllerFormEntry[] = systemData?.stores?.map(store => ({
    id: store.id,
    type: "action",
    label: store.name,
    onSelect,
    Icon: FaAngleRight
  })) ?? []

  if (!systemData) return null;
  return <ControllerForm entries={entries} isActive={isActive} inputPriority={inputPriority} />
}

interface StoreProps {
  system?: string;
  store?: string;
  isActive: boolean;
  onExit: () => void;
  inputPriority?: number;
}

const Store = ({ system, store, isActive, onExit, inputPriority }: StoreProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [alphabetOpen, setAlphabetOpen] = useState(false);

  const [storeData] = useAtom(systems.store.get({ storeId: store ?? "", systemId: system ?? "" }));
  const [storeContents] = useAtom(systems.store.load({ storeData, systemId: system ?? "" }));

  const [, downloadGame] = useAtom(games.download);

  useOnInput((input) => {
    switch (input) {
      case Input.LEFT:
        if (!alphabetOpen) return onExit();
        setAlphabetOpen(false);
        break;
      case Input.RIGHT:
        setAlphabetOpen(true);
    }
  }, {
    disabled: !isActive,
    priority: inputPriority
  })

  const entries: ControllerFormEntry[] = useMemo(() => ("data" in storeContents ? storeContents.data : []).map(storeEntry => ({
    id: storeEntry.name,
    label: storeEntry.name,
    type: "action",
    onSelect: (name) => {
      if (!("data" in storeContents)) return;
      const storeEntry = storeContents.data.find(entry => entry.name === name);
      if (!storeEntry || !system) return;

      downloadGame(system, storeEntry)
    },
    IconActive: IoMdDownload
  })), [storeContents])

  if (storeContents.state === "loading") return <div className={css.loading}><Loading type="spin" /></div>
  if (storeContents.state === "hasError") return null;

  return (
    <div className={css.storeWrapper}>
      {storeData.type === "emudeck" && (
        <div className={css.emudeckWrapper}>
          <ControllerForm
            entries={entries}
            isActive={isActive && !alphabetOpen}
            controlledActiveIndex={activeIndex}
            controlledSetActiveIndex={setActiveIndex}
            inputPriority={inputPriority}
            scrollType="center"
          />
          <GamePreview entry={storeContents.data[activeIndex]} />
        </div>
      )}
      {storeData.type === "html" && (
        <ControllerForm
          entries={entries}
          isActive={isActive && !alphabetOpen}
          controlledActiveIndex={activeIndex}
          controlledSetActiveIndex={setActiveIndex}
          inputPriority={inputPriority}
          scrollType="center"
        />
      )}
      <AlphabetSelector
        entries={entries}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        isActive={alphabetOpen}
        inputPriority={inputPriority}
      />
    </div>
  )
}

const GamePreview = ({ entry }: { entry: StoreEntry }) => {
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={entry.name}
        initial={{opacity: 0}}
        animate={{opacity: 1, transition: { duration: .1 }}}
        exit={{opacity: 0, transition: { duration: .1 }}}
        className={css.gamePreview}
      >
        <img src={entry.media?.["screenshot"]?.url} />
        <div className={classNames(
          css.description,
          !entry.description && css.centered
        )}>
          {entry.description}
           <Pill
            className={css.pill}
            Icon={MdOutlineCategory}
            label={entry.genre ?? ""}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default Stores;
