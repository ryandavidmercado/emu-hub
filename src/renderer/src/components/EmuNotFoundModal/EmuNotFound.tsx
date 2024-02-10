import { Emulator } from "@common/types";
import SelectModal, { SelectModalOption } from "../SelectModal/SelectModal";
import { useEffect, useState } from "react";
import css from "./EmuNotFound.module.scss";
import { useAtom } from "jotai";
import notifications from "@renderer/atoms/notifications";

interface Props {
  open: boolean
  setOpen: (o: boolean) => void,
  emulator: Emulator
}

const EmuNotFound = ({ emulator, open, setOpen }: Props) => {
  const [selected, setSelected] = useState(0);
  const [, addNotification] = useAtom(notifications.add);
  const [, removeNotification] = useAtom(notifications.remove);

  useEffect(() => {
    if(open) return;
    setSelected(0);
  }, [open]);

  const isRA = "core" in emulator.location;

  const emuNameString = isRA
    ? `RetroArch core (${emulator.name})`
    : `emulator (${emulator.name})`;

  const canInstallFlatpak = window.platform === "linux"
    && "linux" in emulator.location
    && emulator.location.linux
    && "flatpak" in emulator.location.linux
    && window.hasFlatpak

  return (
    <SelectModal
      open={open}
      canClose={true}
      text={
        <div className={css.text}>
          <h2>{emulator.name} not found!</h2>
          <p>Could not find the selected {emuNameString} on this system.</p>
        </div>
      }
      selected={selected}
      setSelected={setSelected}
      options={[
        {
          id: 'close',
          label: 'Close',
          colorScheme: 'default'
        },
        canInstallFlatpak && {
          id: 'install-flatpak',
          label: `Install ${emulator.name} Flatpak`,
          colorScheme: "confirm",
        }
      ].filter(Boolean) as SelectModalOption[]}
      onResponse={async (response) => {
        switch(response) {
          case "install-flatpak": {
            if(!canInstallFlatpak) break;
            if(!("linux" in emulator.location)
              || !emulator.location.linux
              || !("flatpak" in emulator.location.linux)
              || !emulator.location.linux.flatpak
            ) {
              break
            };

            const notifId = `install-emu-${emulator.id}`
            addNotification({
              id: notifId,
              text: `Installing ${emulator.name}: ${emulator.location.linux.flatpak}`,
              type: "download",
              timeout: 0
            });
            setOpen(false);

            try {
              await window.installEmulator(emulator, "flatpak");
              addNotification({
                text: `Done installing ${emulator.name}!`,
                type: "success"
              })
            } catch(e) {
              console.error(e)
              addNotification({
                text: `Failed to install ${emulator.name}`,
                type: "error"
              })
            } finally {
              removeNotification(notifId)
            }
          }
          default: {
            setOpen(false)
          }
        }
      }}
    />
  )
}

export default EmuNotFound
