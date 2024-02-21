import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.scss'
import { Provider } from 'jotai'
import { jotaiStore } from './atoms/store/store'
import '@fontsource-variable/figtree'
import '@fontsource-variable/figtree/wght-italic.css'
import { ErrorBoundary } from 'react-error-boundary'
import log from 'electron-log/renderer'

const onError = (e: Error) => {
  log.error(e)
  window.quit()
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary onError={onError} fallbackRender={() => null}>
      <Provider store={jotaiStore}>
        <App />
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
)
