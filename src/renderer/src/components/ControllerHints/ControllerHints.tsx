import { ControllerHint, inputSubscribersAtom } from "@renderer/hooks"
import { useAtom } from "jotai"
import css from "./ControllerHints.module.scss"
import { motion } from "framer-motion";
import MediaImage from "../MediaImage/MediaImage";
import { Input } from "@renderer/enums";
import { hintsHeight } from "@renderer/const/const";

const sortOrder = [
  Input.UP,
  Input.DOWN,
  Input.LEFT,
  Input.RIGHT,
  "DPAD",
  "DPADLR",
  "DPADUD",
  Input.B,
  Input.A,
  Input.X,
  Input.Y,
  Input.LB,
  Input.RB,
  Input.LT,
  Input.RT,
  Input.SELECT,
  Input.START,
] as const

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
    .toSorted((a, b) => sortOrder.indexOf(a.input) - sortOrder.indexOf(b.input)) as ControllerHint[]

  if (hints.length === 1 && hints[0].text === 'Settings Menu') {
    hints = []
  } // workaround for flash between closing settings and being able to control content; don't like it but it'll do

  return (
    <div
      className={css.hints}
      style={{
        height: hintsHeight,
        backgroundColor: "rgba(0, 0, 0, .6)",
        backdropFilter: "blur(30px)",
        position: "fixed",
        bottom: 0,
        width: "100%",
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
          gap: "1.2rem",
        }}
      >
        {hints.map((hint, i) => (
          <div
            key={i}
            style={{
              gap: ".6rem",
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
