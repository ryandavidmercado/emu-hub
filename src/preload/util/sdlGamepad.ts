import { Input, sdlButtonToInputMap } from "@common/types/Input"
import { Sdl, controller } from "@kmamal/sdl"
import ShortUniqueId from "short-unique-id"
import controllerDb from "../../../resources/sdl/gamecontrollerdb.txt?raw"

interface Listener {
  type: "buttonDown" | "buttonUp"
  id: string
  callback: (input: Input, controllerId: number) => void
}

controller.addMappings(controllerDb.split('\n').filter(l => l.length && !l.startsWith("#")))

export const sdlGamepad = () => {
  let controllerInstances: Sdl.Controller.ControllerInstance[] = []
  let listeners: Listener[] = []

  const uid = new ShortUniqueId()

  const initDevice = (device: Sdl.Controller.Device) => {
    console.log(`init`, device)

    const instance = controller.openDevice(device)
    instance.on('buttonDown', (e) => {
      console.log('got btn')
      const input = sdlButtonToInputMap[e.button]
      if(!input) return

      listeners.forEach(listener => { if(listener.type === "buttonDown") listener.callback(input, device.id) })
    })

    instance.on('buttonUp', (e) => {
      console.log('lost button')
      const input = sdlButtonToInputMap[e.button]
      if(!input) return

      listeners.forEach(listener => { if(listener.type === "buttonUp") listener.callback(input, device.id) })
    })

    controllerInstances.push(instance)
  }

  if(controller.devices.length) {
    controller.devices.forEach(initDevice)
    console.log(controller.devices)
  }

  controller.on('deviceAdd', (e) => { console.log(`adding ${e.device.name}`); initDevice(e.device) })
  controller.on('deviceRemove', (device) => {
    controllerInstances = controllerInstances.filter(instance => (
      instance.device.id !== device.device.id
    ))
  })

  const onButton = (type: 'up' | 'down', callback: Listener['callback']) => {
    const paramTypeToListenerTypeMap = {
      up: 'buttonUp',
      down: 'buttonDown'
    } as const

    const id = uid.rnd()
    listeners.push({ callback, id, type: paramTypeToListenerTypeMap[type] })

    return () => {
      listeners = listeners.filter(listener => listener.id !== id)
    }
  }

  return {
    onButton
  }
}
