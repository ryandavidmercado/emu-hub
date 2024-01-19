import './App.scss'
import { Landing } from './pages/Landing';
import { GameViewWrapper } from './pages/GameView';
import Wave from 'react-wavify';
import { SystemView } from './pages/SystemView';
import Settings from './components/Settings';
import { useWaveHeight } from './hooks';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const { parentRef, waveHeight } = useWaveHeight(.3);

  return (
    <div className="App" ref={parentRef}>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
      {waveHeight && <Wave
        fill="hsla(0, 0%, 0%, 50%)"
        className="wave"
        style={{ display: "flex" }}
        options={{
          height: waveHeight,
          amplitude: 50
        }}
      />}
      <Settings />
    </div>
  )
}

const appRoutes = [
  {
    path: "/",
    element: <Landing />
  },
  {
    path: "/game/:gameId",
    element: <GameViewWrapper />
  },
  {
    path: "/system/:systemId",
    element: <SystemView />
  }
]

const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence>
      <Routes>
        {appRoutes.map(route => (
          <Route key={route.path}
            {...route}
            element={
              <motion.div
                className="motion-wrapper"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: .15 }}}
                exit={{ opacity: 0, transition: { duration: 5 }}}
                key={route.path}
              >
                {route.element}
              </motion.div>
            }
          />
        ))}
      </Routes>
    </AnimatePresence>
  )
}

export default App
