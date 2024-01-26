import './App.scss'
import { Home } from './pages/Home';
import { GameViewWrapper } from './pages/GameView';
import Wave from 'react-wavify';
import { SystemView } from './pages/SystemView';
import Settings from './components/Settings';
import { useWaveHeight, useWindowFocus } from './hooks';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Notifications from './components/Notifications/Notifications';
import { InputModal } from './components/InputModal/InputModal';
import ConfirmationModal from './components/ConfirmationModal/ConfirmationModal';
import Init from './pages/Init/Init';

function App() {
  const { parentRef, waveHeight } = useWaveHeight(.3);
  const windowFocused = useWindowFocus();

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
          amplitude: 50,
        }}
        paused={!windowFocused}
      />}
      <Settings />
      <InputModal />
      <ConfirmationModal />
      <Notifications />
    </div>
  )
}

const appRoutes = [
  {
    path: "/",
    element: <Init />
  },
  {
    path: "/home",
    element: <Home />
  },
  {
    path: "/game/:gameId",
    element: <GameViewWrapper />
  },
  {
    path: "/system/:systemId",
    element: <SystemView />
  },
]

const AppRoutes = () => {
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
