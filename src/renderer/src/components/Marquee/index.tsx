import { PropsWithChildren } from 'react'

interface Props {
  className?: string
  delay?: number
  velocity?: number
}

const Marquee = ({ children, className }: PropsWithChildren<Props>) => {
  // TODO: Get marquee scroll working
  return <div className={className}>{children}</div>
}

export default Marquee
