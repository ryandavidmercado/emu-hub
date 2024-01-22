import { createStore } from "jotai";
import games from "../games";

export const jotaiStore = createStore()
jotaiStore.set(games.scan) // automatically scan ROMs on app init

