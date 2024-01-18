import { Dispatch, useMemo, useRef } from "react";
import css from "./AlphabetSelector.module.scss";
import classNames from "classnames";
import { SetStateAction } from "jotai";
import { useOnInput } from "@renderer/hooks";
import { Input } from "@renderer/enums";
import { useShrinkToFit } from "@renderer/hooks/useShrinkToFit";

const baseAlphabet = [
  {
    text: "0 - 9",
    matcher: (name: string) => /^\d/.test(name)
  },
  ...[...'abcdefghijklmnopqrstuvwxyz'].map(letter => ({
    text: letter.toUpperCase(),
    matcher: (name: string) => name.toLowerCase().startsWith(letter)
  }))
]

interface Props {
  entries: {
    label: string
  }[],
  activeIndex: number
  setActiveIndex: Dispatch<SetStateAction<number>>
  isActive: boolean;
}

const AlphabetSelector = ({ entries, activeIndex, setActiveIndex, isActive }: Props) => {
  const alphaRef = useRef<HTMLDivElement>(null);

  const lookupMap = useMemo(() => {
    return baseAlphabet.map(alpha => ({
      index: entries.findIndex(entry => alpha.matcher(entry.label)),
      alphabetEntry: alpha
    })).filter(lookupEntry => lookupEntry.index !== -1);
  }, [entries]);

  const activeLookupIndex = useMemo(() => {
    return lookupMap.findLastIndex(entry => activeIndex >= entry.index);
  }, [lookupMap, activeIndex])

  useOnInput((input) => {
    switch(input) {
      case Input.UP: {
        if(activeLookupIndex === 0) return;
        const lookup = lookupMap[activeLookupIndex - 1];
        const newEntry = entries.findIndex(entry => lookup.alphabetEntry.matcher(entry.label));
        setActiveIndex(newEntry);
        break;
      }
      case Input.DOWN: {
        if(activeLookupIndex === (lookupMap.length - 1)) return;
        const lookup = lookupMap[activeLookupIndex + 1];
        const newEntry = entries.findIndex(entry => lookup.alphabetEntry.matcher(entry.label));
        setActiveIndex(newEntry);
        break;
      }
    }
  }, {
    parentCaptureKeys: ["settings-modal"],
    disabled: !isActive
  })

  useShrinkToFit(alphaRef, .95);

  return (
    <div className={css.container}>
      <div className={classNames(css.selectorWrapper, !isActive && css.hidden)}>
        <div className={css.selector} ref={alphaRef}>
          {lookupMap.map((lookup, i) => (
            <div key={lookup.alphabetEntry.text} className={classNames(css.alphabetEntry, (i === activeLookupIndex) && css.active)}>
              {lookup.alphabetEntry.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AlphabetSelector;
