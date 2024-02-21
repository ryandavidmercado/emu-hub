import css from './systemPreset.module.scss'
import { LuCalendar } from 'react-icons/lu'
import { GrOrganization } from 'react-icons/gr'
import { SystemWithGames } from '@common/types'
import { Pill, ShowcaseContent } from '../..'

export const getSystemShowcaseConfig = (system: SystemWithGames): ShowcaseContent => {
  return {
    classNames: { right: css.systemShowcaseRight },
    left: [
      {
        type: 'media',
        media: system.screenshot || ''
      }
    ],
    right: [
      {
        type: 'media',
        media:
          system.logo ||
          window.loadMedia({
            resourceId: system.id,
            resourceType: 'logoAlt',
            resourceCollection: 'systems'
          }) ||
          window.loadMedia({
            resourceId: system.id,
            resourceType: 'logo',
            resourceCollection: 'systems'
          })!,
        className: css.systemShowcaseLogo
      },
      {
        type: 'pills',
        pills: [
          { id: 'release-year', Icon: LuCalendar, text: system.releaseYear },
          { id: 'company', Icon: GrOrganization, text: system.company }
        ].filter((p) => p.text) as Pill[]
      }
    ]
  }
}
