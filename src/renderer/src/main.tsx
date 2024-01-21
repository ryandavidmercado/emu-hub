import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Provider } from 'jotai'
import { jotaiStore } from './atoms/store/store'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={jotaiStore}>
      <App />
    </Provider>
  </React.StrictMode>
)
