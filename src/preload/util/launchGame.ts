import path from 'path'
import { Game, Emulator, System } from '@common/types'
import { spawn } from 'child_process'
import { loadConfig } from './configStorage'
import { MainPaths } from '@common/types/Paths'
import { readFileSync } from 'fs'
import findEmulator from './findEmulator'

type ExtractPromiseType<T> = T extends Promise<infer U> ? U : never;

const parseLaunchCommand = (
  command: string,
  emulatorLocation: ExtractPromiseType<ReturnType<typeof findEmulator>>,
  romLocation: string
) => {
  const templateMap = {
    /*  NOTE: Emulator path for RetroArch cores pre-includes the core launch command
        ex: /path/to/RetroArch.AppImage -L /path/to/ra-cores/relevant_core.dylib */
    '%EMUPATH%': () => emulatorLocation.bin, // ex: /home/Applications/CoolEmu.AppImage
    '%ROMPATH%': () => romLocation, // ex: /path/to/roms/someSystem/someParentDir/myRom.rom
    '%ROMDIR%': () => path.dirname(romLocation), // ex: /path/to/roms/someSystem/someParentDir
    '%ROMDIRNAME%': () => path.basename(path.dirname(romLocation)), // ex: someParentDir
    '%ROMNAME%': () => path.parse(romLocation).base, // ex: myRom.rom
    '%ROMNAMENOEXT%': () => path.parse(romLocation).name, // ex: myRom
    '%ROMEXT%': () => path.parse(romLocation).ext, // .rom
    '%ROMTEXTCONTENT%': () => readFileSync(romLocation, { encoding: 'utf8' }) // ex: rom is text file with contents "Hello" -> this returns "Hello"
  } as const

  const [bin, ...args] = command.split(" ");

  const injectTemplateValues = (command: string) => Object.keys(templateMap).reduce((command, templateKey) => {
    if (!command.includes(templateKey)) return command
    return command.replaceAll(templateKey, templateMap[templateKey]())
  }, command)

  return {
    bin: injectTemplateValues(bin),
    args: [
      ...(
        bin.includes('%EMUPATH%')
          ? emulatorLocation.args ?? []
          : []
      ),
      ...args.map(injectTemplateValues)
    ]
  }
}

const launchGame = async (game: Game, emulator: Emulator, system: System) => {
  const emulatorLocation = await findEmulator(emulator);
  console.log(emulatorLocation);

  let { bin, args: emuArgs } = emulatorLocation;

  const { ROMs: ROM_PATH } = loadConfig(
    'paths',
    {} /* we don't need to supply a default; jotai initializes this config on boot */
  ) as MainPaths

  const systemDir = system.romdir ?? path.join(ROM_PATH, system.id)
  const romLocation = path.join(systemDir, ...(game.rompath ?? []), game.romname)

  let args: string[]

  if ('core' in emulator.location) {
    args = [romLocation, '-f']
  } else if ('flatpak' in emulator) {
    args = [...(emulator.args ?? []), romLocation]
  } else {
    args = [...(emulator.args ?? []), romLocation]
  }

  const launchCommand =
    emulator.launchCommands?.[path.extname(game.romname)] ?? emulator.launchCommand

  let finalBin: string, finalArgs: string[];
  if(launchCommand) {
    const parsedLaunch = parseLaunchCommand(launchCommand, emulatorLocation, romLocation);
    finalBin = parsedLaunch.bin;
    finalArgs = parsedLaunch.args;
  } else {
    finalBin = bin;
    finalArgs = [...(emuArgs ?? []), ...args]
  }

  console.log(`Launching ${game.name} with command: ${finalBin} ${finalArgs.join(" ")}`)

  const spawnedProcess = spawn(finalBin, finalArgs, { stdio: "ignore", detached: true })
  const execInstance = new Promise<void>((resolve, reject) => {
    spawnedProcess.on('close', (status) => {
      console.log(status);
      if(status !== 1) resolve();

      if ('core' in emulator.location) {
        reject({ type: 'emu-not-found', data: emulator })
      }
    })

    spawnedProcess.on('error', (e) => {
      reject(e)
    })
  })

  const abort = () => {
    if(!spawnedProcess.pid) return;
    process.kill(-spawnedProcess.pid, emulator.killSignal || 'SIGTERM')
  }

  return {
    execInstance,
    abort,
    game
  }
}

export default launchGame
