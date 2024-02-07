export const APPNAME = 'EmuHub'
export const version = '1.0.0-alpha.4'
export const SOFTNAME = `${APPNAME} v${version}`

export const displayTypeMap = {
  tile: {
    screenshot: 'Screenshot + Logo',
    fanart: 'Fanart + Logo',
    poster: 'Poster'
  },
  showcase: {
    screenshot: 'Screenshot',
    fanart: 'Fanart',
    poster: 'Poster'
  },
  gameView: {
    screenshot: 'Screenshot',
    fanart: 'Fanart',
    poster: 'Poster'
  }
} as const
