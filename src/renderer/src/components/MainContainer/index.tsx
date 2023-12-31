import { ReactNode } from "react"
import Wave from "react-wavify"
import css from "./MainContainer.module.css"

export const MainContainer = ({ children }: { children?: ReactNode }) => {
  return (
    <div className={css.mainContainer}>
      <Wave
        fill="hsla(0, 0%, 0%, 50%)"
        className={css.wave}
        options={{
          height: 200,
          amplitude: 50
        }}
        style={{
          position: "fixed"
        }}
      />
      {children}
    </div>
  )
}
