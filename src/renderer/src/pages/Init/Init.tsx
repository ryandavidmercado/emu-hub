// @ts-ignore
import games from "@renderer/atoms/games"
import pathAtom from "@renderer/atoms/paths"
import systemsAtoms from "@renderer/atoms/systems"
import { useAtom } from "jotai"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import SelectModal, { useSelect } from "@renderer/components/SelectModal/SelectModal";
import { PropagateLoader } from "react-spinners"
import css from "./Init.module.scss"
import { eventHandler } from "@renderer/eventHandler"
import { useOnInput } from "@renderer/hooks"
import { settingsOpenAtom } from "@renderer/components/Settings"
import { useInputModal } from "@renderer/components/InputModal/InputModal"
import { MainPaths } from "@common/types/Paths"
import notifications from "@renderer/atoms/notifications"

let isInitializing = false;

const Init = () => {
  const [configuredPaths, setPaths] = useAtom(pathAtom)
  const [systems] = useAtom(systemsAtoms.lists.all)
  const [, addNotification] = useAtom(notifications.add)

  const [settingsOpen] = useAtom(settingsOpenAtom);

  const getInput = useInputModal();

  const [, scanRoms] = useAtom(games.scan)
  const { getSelection, modalProps } = useSelect();

  const navigate = useNavigate();

  // lock input while we're initializing
  useOnInput(() => {}, { priority: 20, disabled: modalProps.open || settingsOpen })

  const main = async (paths: MainPaths = configuredPaths) => {
    await window.initRomDir(paths, systems)
    const gamesLength = await scanRoms();

    if(gamesLength > 0) {
      navigate("/home", { replace: true })
    }

    const selection = await getSelection({
      text: (
        <div className={css.welcome}>
          <h1>Welcome to EmuHub!</h1>
          <div>Your ROMs directory has been populated at:</div>
          <div className={css.dir}>{paths.ROMs}</div>
          <div>You can either:</div>
          <ul>
            <li>Load up some ROMs in this directory and restart EmuHub</li>
            <li>Change your ROMs directory, or</li>
            <li>Head to the system stores to download some homebrew!</li>
          </ul>
        </div>
      ),
      options: [
        { id: 'close', label: "Close EmuHub" },
        { id: 'change', label: "Change ROMs Directory" },
        { id: 'store', label: "Head to the stores!", colorScheme: "confirm" }
      ],
      canClose: false,
    })

    switch(selection) {
      case "close":
        window.quit();
        break;
      case "change": {
        const input = await getInput({
          defaultValue: paths.ROMs
        });

        if(!input) return main();

        const parentDir = window.path.dirname(input);
        const canUseDir = window.checkDir(parentDir);

        if(!canUseDir) {
          addNotification({
            text: `Unable to access ${parentDir}!`,
            type: "error",
          })
          return main(paths);
        }

        const newPaths: MainPaths = { ...paths, ROMs: input }
        setPaths(newPaths);

        main(newPaths);

        break;
      }
      default: "store"
        eventHandler.emit("settings-jump-to-section", 2)
        break;
    }

    const unbind = eventHandler.on('settings-close', () => {
      unbind();
      main(paths);
    })
  }

  useEffect(() => {
    if(!isInitializing) {
      isInitializing = true;
      main();
    }
  }, [])

  return (
    <div className={css.container}>
      <PropagateLoader
        color="hsl(177, 24%, 84%)"
      />
      <SelectModal className={css.welcomeContainer} {...modalProps} />
    </div>
  );
}

export default Init
