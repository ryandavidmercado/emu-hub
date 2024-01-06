import { Route } from 'wouter';
import './App.scss'
import { Landing } from './pages/Landing';
import { GameView } from './pages/GameView';
import Wave from 'react-wavify';
import { SystemView } from './pages/SystemView';
import InGame from './pages/InGame';
import Settings from './components/Settings';
import { useWaveHeight } from './hooks';
import { AnimatePresence } from 'framer-motion';

function App() {
  const { parentRef, waveHeight } = useWaveHeight(.3);

  return (
    <div className="App" ref={parentRef}>
      <AnimatePresence>
        <Route path="/">
          <Landing />
        </Route>
        <Route path="/game/:gameId">
          {params => <GameView id={params.gameId} />}
        </Route>
        <Route path="/system/:systemId">
          {params => <SystemView id={params.systemId} />}
        </Route>
        <Route path="/ingame">
          <InGame />
        </Route>
      </AnimatePresence>
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

export default App
