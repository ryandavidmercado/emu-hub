import path from "path";
import { SystemStore } from "../types/System";

const loadSystemStore = async (systemStore: SystemStore) => {
  const test = await fetch(systemStore.url);
  const text = await test.text()

  const dom = new DOMParser().parseFromString(text, 'text/html')
  const nodes = dom.querySelectorAll<HTMLAnchorElement>(systemStore.selector);

  return [...nodes].map(node => {
    const rawHref = node.href;
    const relativePath = path.basename(rawHref)
    const href = systemStore.url + '/' + relativePath;

    const rawName = node.innerText;
    const name = path.basename(rawName, path.extname(rawName))

    return {
      href,
      name
    }
  })
}

export default loadSystemStore;
