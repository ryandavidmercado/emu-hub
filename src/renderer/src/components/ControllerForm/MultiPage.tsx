import { useCallback, useMemo, useState } from "react";
import ControllerForm, { ControllerFormEntry } from "./ControllerForm";
import { useOnInput } from "@renderer/hooks";
import { Input } from "@renderer/enums/Input";
import { FaAngleRight } from "react-icons/fa";
import { Align } from "react-window";

type Entry = Omit<ControllerFormEntry, "onSelect" | "type"> & {
  onSelect?: (id: string, goBack: () => void) => void
} & ({ type: "action" } | { type: "navigate", navigateTo?: string })

export interface MultiFormPage {
  id: string;
  entries: Entry[] | ((data: any) => Entry[])
  canExitLeft?: boolean;
  defaultSelection?: string;
}

interface Props {
  pages: MultiFormPage[]
  onExitLeft?: () => void;
  onExitBack?: () => void;
  active: boolean;
  inputPriority?: number
  autoHeight?: boolean;
  scrollType?: Align
}

const MultiPageControllerForm = ({ pages, onExitLeft, onExitBack, active, inputPriority, autoHeight, scrollType }: Props) => {
  const [pageStack, setPageStack] = useState([pages[0].id]);
  const activePageId = pageStack.at(-1)
  const currentPageIndex = pages.findIndex(page => page.id === activePageId);
  const currentPage = pages[currentPageIndex];

  const defaultNavigateTo = pages[currentPageIndex + 1]?.id;

  const [pageSelections, setPageSelections] = useState<Record<string, string>>(pages.reduce((acc, page) => ({
    ...acc,
    [page.id]: null
  }), {}));

  const goBack = useCallback(() => {
    if(pageStack.length === 1) return onExitBack?.();
    setPageStack(pageStack.slice(0, -1))
  }, [onExitBack, pageStack])

  useOnInput((input) => {
    switch(input) {
      case Input.LEFT:
        if(!currentPage) break;

        const { canExitLeft = true } = currentPage;
        if(canExitLeft) onExitLeft?.();

        break;
      case Input.B:
        goBack();
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
          setPageStack(stack => [...stack, entry.navigateTo ?? defaultNavigateTo])
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
    autoHeight={autoHeight}
    defaultSelection={currentPage.defaultSelection}
    scrollType={scrollType}
  />
}

export default MultiPageControllerForm;
