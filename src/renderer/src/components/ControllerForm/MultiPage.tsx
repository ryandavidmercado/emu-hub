import { useCallback, useMemo, useState } from "react";
import ControllerForm, { ControllerFormEntry } from "./ControllerForm";
import { useOnInput } from "@renderer/hooks";
import { Input } from "@renderer/enums/Input";
import { FaAngleRight } from "react-icons/fa";

type Entry = Omit<ControllerFormEntry, "onSelect" | "type"> & {
  type: "action" | "navigate",
  onSelect?: (id: string, goBack: () => void) => void
}

export interface MultiFormPage {
  id: string;
  entries: Entry[] | ((data: any) => Entry[])
  canExitLeft?: boolean;
}

interface Props {
  pages: MultiFormPage[]
  onExitLeft?: () => void;
  onExitBack?: () => void;
  active: boolean;
  inputPriority?: number
}

const MultiPageControllerForm = ({ pages, onExitLeft, onExitBack, active, inputPriority }: Props) => {
  const [activePage, setActivePage] = useState(0);
  const currentPage = pages[activePage];

  const [pageSelections, setPageSelections] = useState<Record<string, string>>(pages.reduce((acc, page) => ({
    ...acc,
    [page.id]: null
  }), {}));

  const goBack = useCallback(() => {
    if(activePage === 0) return onExitBack?.();
    setActivePage(page => page - 1)
  }, [onExitBack, activePage])

  useOnInput((input) => {
    switch(input) {
      case Input.LEFT:
        if(!currentPage) break;

        const { canExitLeft = true } = currentPage;
        if(canExitLeft) onExitLeft?.();

        break;
      case Input.B:
        if(activePage === 0) return onExitBack?.();
        setActivePage(page => page - 1);
    }
  }, {
    disabled: !active,
    priority: inputPriority
  });

  const entries = useMemo(() => {
    if(!currentPage) return [];
    const baseEntries = Array.isArray(currentPage.entries)
      ? currentPage.entries
      : currentPage.entries(pageSelections)

    // inject baseEntries handlers with form selections setter & routing
    return baseEntries.map(entry => ({
      ...entry,
      type: "action" as const,
      onSelect: (selectedEntryId: string) => {
        if(entry.type === "navigate") {
          setPageSelections(pageData => ({
            ...pageData,
            [currentPage.id]: selectedEntryId
          }));
          if(activePage < pages.length - 1) setActivePage(page => page + 1);
        }

        entry.onSelect?.(selectedEntryId, goBack);
      },
      Icon: (() => {
        if(entry.Icon) return entry.Icon;

        if(entry.type === "navigate") return FaAngleRight;
        return entry.Icon;
      })()
    }))
  }, [currentPage, pageSelections, goBack])

  return <ControllerForm
    key={`${currentPage.id}-${entries.length}`}
    entries={entries}
    isActive={active}
    inputPriority={inputPriority}
  />
}

export default MultiPageControllerForm;
