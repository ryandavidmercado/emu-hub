import { Route } from 'wouter';
import './App.css'
import { Landing } from './pages/Landing';
import GameView from './pages/GameView';
import Wave from 'react-wavify';

function App() {
  return (
    <div className="App">
      <Route path="/">
        <Landing />
      </Route>
      <Route path="/game/:gameId">
        {params => <GameView id={params.gameId} />}
      </Route>
      <Wave
        fill="hsla(0, 0%, 0%, 50%)"
        className="wave"
        style={{ display: "flex" }}
        options={{
          height: 800,
          amplitude: 50
        }}
      />
    </div>
  )
}

export default App
