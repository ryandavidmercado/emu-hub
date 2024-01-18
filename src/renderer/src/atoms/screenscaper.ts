import { objConfigAtom } from "./util/objConfigAtom";

const screenScraperAtom = objConfigAtom({
  storageKey: 'screenscraper-credentials',
  defaults: {
    username: "",
    password: ""
  }
})

export default screenScraperAtom;
