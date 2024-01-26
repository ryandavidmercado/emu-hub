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
import { settingsModalHandle } from "@renderer/components/Settings"
import { eventHandler } from "@renderer/eventHandler"
import { useOnInput } from "@renderer/hooks"

let isInitializing = false;

const Init = () => {
  const [paths] = useAtom(pathAtom)
  const [systems] = useAtom(systemsAtoms.lists.all)

  const [, scanRoms] = useAtom(games.scan)
  const { getSelection, modalProps } = useSelect();

  // SETTINGS handle
  const {
    activeSectionAtom,
    activeSideAtom,
    openAtom
  } = settingsModalHandle;

  const [settingsOpen, setSettingsOpen] = useAtom(openAtom);
  const [, setSettingsActiveSide] = useAtom(activeSideAtom);
  const [, setSettingsActiveSection] = useAtom(activeSectionAtom);

  const navigate = useNavigate();

  // lock input while we're initializing
  useOnInput(() => {}, { priority: 999, disabled: modalProps.open || settingsOpen })

  const main = async () => {
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
            <li>Load up some ROMs in this directory and restart EmuHub.</li>
            <li>Change your ROMs directory by modifying...
              <div className={css.dir}>{window.homedir}/Documents/EmuHub/paths.yml</div>
              ...and restarting EmuHub.
            </li>
            <li>Head to the system stores to download some homebrew!</li>
          </ul>
        </div>
      ),
      options: [
        { id: 'close', label: "Close EmuHub" },
        { id: 'store', label: "Head to the stores!", colorScheme: "confirm" }
      ],
      canClose: false,
    })

    switch(selection) {
      case "close":
        window.quit();
        break;
      default: "store"
        setSettingsActiveSide("right");
        setSettingsActiveSection(2);
        setSettingsOpen(true)
        break;
    }

    const unbind = eventHandler.on('settings-close', () => {
      unbind();
      main();
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
