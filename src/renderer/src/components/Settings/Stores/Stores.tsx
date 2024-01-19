import { useAtom } from "jotai";
import { useState, useMemo } from "react"
import systems from "@renderer/atoms/systems";
import ControllerForm, { ControllerFormEntry } from "@renderer/components/ControllerForm/ControllerForm";
import Loading from "react-loading";
import games from "@renderer/atoms/games";
import css from "./Stores.module.scss";
import { useOnInput } from "@renderer/hooks";
import { Input } from "@renderer/enums/Input";
import AlphabetSelector from "./AlphabetSelector/AlphabetSelector";

type Page = "main" | "system" | "store"

const Stores = ({ isActive, onExit }: { isActive: boolean, onExit: () => void }) => {
  const [pageStack, setPageStack] = useState<Page[]>(["main"]);
  const [activeSystem, setActiveSystem] = useState<string>();
  const [activeStore, setActiveStore] = useState<string>();

  const currentPage = pageStack[pageStack.length - 1];

  useOnInput((input) => {
    switch(input) {
      case Input.LEFT:
        if(currentPage !== "store") onExit();
        break;
      case Input.B:
        if(pageStack.length === 1) return onExit();
        setPageStack(stack => stack.slice(0, -1));
    }
  }, {
    parentCaptureKeys: ["settings-modal"],
    disabled: !isActive
  })

  if(currentPage === "main") return (
    <Main
      isActive={isActive}
      onSelect={(systemId: string) => {
        setActiveSystem(systemId);
        setPageStack(stack => [...stack, "system"])
      }}
    />
  );

  if(currentPage === "system") return (
    <System
      isActive={isActive}
      onSelect={(store) => {
        setActiveStore(store)
        setPageStack(stack => [...stack, "store"])
      }}
      system={activeSystem}
    />
  )

  if(currentPage === "store") return (
    <Store
      isActive={isActive}
      system={activeSystem}
      store={activeStore}
      onExit={onExit}
    />
  )
  return null;
}

interface MainProps {
  isActive: boolean,
  onSelect: (id: string) => void
}

const Main = ({ isActive, onSelect }: MainProps) => {
  const [systemsList] = useAtom(systems.lists.withStores);

  const entries: ControllerFormEntry[] = systemsList.map(system => ({
    id: system.id,
    type: "action",
    label: system.name,
    onSelect
  }))

  return <ControllerForm entries={entries} isActive={isActive} />
}

interface SystemProps {
  system?: string
  isActive: boolean
  onSelect: (id: string) => void
}

const System = ({ system, isActive, onSelect }: SystemProps) => {
  const [systemData] = useAtom(systems.single(system || ""));
  const entries: ControllerFormEntry[] = systemData?.stores?.map(store => ({
    id: store.id,
    type: "action",
    label: store.name,
    onSelect
  })) ?? []

  if(!systemData) return null;
  return <ControllerForm entries={entries} isActive={isActive} />
}

interface StoreProps {
  system?: string;
  store?: string;
  isActive: boolean;
  onExit: () => void;
}

const Store = ({ system, store, isActive, onExit }: StoreProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [alphabetOpen, setAlphabetOpen] = useState(false);

  const [storeData] = useAtom(systems.store.get({ storeId: store ?? "", systemId: system ?? "" }));
  const [storeContents] = useAtom(systems.store.load(storeData));
  const [, downloadGame] = useAtom(games.download);

  useOnInput((input) => {
    switch(input) {
      case Input.LEFT:
        if(!alphabetOpen) return onExit();
        setAlphabetOpen(false);
        break;
      case Input.RIGHT:
        setAlphabetOpen(true);
    }
  }, {
    disabled: !isActive,
    parentCaptureKeys: ["settings-modal"]
  })

  const filtered = useMemo(() => {
    if(storeContents.state !== "hasData") return [];
    return storeContents.data.filter(entry => entry.name.includes("USA"));
  }, [storeContents])

  const entries: ControllerFormEntry[] = useMemo(() => filtered.map(storeEntry => ({
    id: storeEntry.name,
    label: storeEntry.name,
    type: "action",
    onSelect: (name) => {
      const storeEntry = filtered.find(entry => entry.name === name);
      if(!storeEntry || !system) return;

      downloadGame(system, storeEntry, Boolean(storeData.autoScrape))
    }
  })), [filtered])

  if(storeContents.state === "loading") return <div className={css.loading}><Loading type="spin" /></div>
  if(storeContents.state === "hasError") return null;

  return (
    <div className={css.storeWrapper}>
      <ControllerForm
        entries={entries}
        isActive={isActive && !alphabetOpen}
        controlledActiveIndex={activeIndex}
        controlledSetActiveIndex={setActiveIndex}
      />
      <AlphabetSelector
        entries={entries}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        isActive={alphabetOpen}
      />
    </div>
  )
}

export default Stores;
