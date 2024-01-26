import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.scss'
import { Provider } from 'jotai'
import { jotaiStore } from './atoms/store/store'
import "@fontsource-variable/figtree"
import "@fontsource-variable/figtree/wght-italic.css"

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={jotaiStore}>
      <App />
    </Provider>
  </React.StrictMode>
)
