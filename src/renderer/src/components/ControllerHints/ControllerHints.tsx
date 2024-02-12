import { ControllerHint, inputSubscribersAtom } from "@renderer/hooks"
import { useAtom } from "jotai"
import css from "./ControllerHints.module.scss"
import { motion } from "framer-motion";
import MediaImage from "../MediaImage/MediaImage";

const ControllerHints = () => {
  const [subscribers] = useAtom(inputSubscribersAtom);
  const maxPriority = subscribers.reduce((acc, sub) => {
    return Math.max(sub.enforcePriority ? sub.priority : 0, acc)
  }, 0)

  let hints = (subscribers.flatMap(sub =>
    (sub.priority >= maxPriority || sub.bypass)
      ? sub.hints
      : []
  )
    .filter(Boolean) as ControllerHint[])
    .reduceRight((acc, hint) => {
      if (acc.some(accHint => accHint.input === hint.input)) return acc;
      return [...acc, hint]
    }, [] as ControllerHint[])
    .toSorted((a, b) => a!.input.localeCompare(b!.input)) as ControllerHint[]

  if (hints.length === 1 && hints[0].text === 'Settings Menu') {
    hints = []
  } // workaround for flash between closing settings and being able to control content; don't like it but it'll do

  return (
    <div
      className={css.hints}
      style={{
        height: "5vh",
        backgroundColor: "var(--background-dark)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        boxShadow: "0 0 15px rgba(0, 0, 0, .5)",
        fontFamily: "Figtree Variable",
        fontSize: "1.1rem"
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={Boolean(hints.length) ? "hints" : "no-hints"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        {hints.map((hint, i) => (
          <div
            key={i}
            style={{
              gap: ".5rem",
              display: "flex",
              alignItems: "center"
            }}
          >
            <MediaImage
              media={{
                resourceId: "base",
                resourceType: hint.input,
                resourceCollection: "input"
              }}
              className={css.icon}
            />
            <div>{hint.text}</div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default ControllerHints
