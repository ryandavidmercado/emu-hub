import './App.scss'
import { Landing } from './pages/Landing';
import { GameViewWrapper } from './pages/GameView';
import Wave from 'react-wavify';
import { SystemView } from './pages/SystemView';
import Settings from './components/Settings';
import { useWaveHeight } from './hooks';
import { HashRouter, Routes, Route } from 'react-router-dom';

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
  return (
    <Routes>
      {appRoutes.map(route => (
        <Route key={route.path} {...route} />
      ))}
    </Routes>
  )
}

export default App
