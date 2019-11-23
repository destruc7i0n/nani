import React from 'react'
import { render } from 'react-dom'
import App from './App'
import * as serviceWorker from './serviceWorker'

import configureStore from './store/configureStore'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/es/integration/react'
import { ConnectedRouter } from 'connected-react-router'

export const { store, persistor, history } = configureStore()

render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </PersistGate>
  </Provider>,
  document.getElementById('root'))

serviceWorker.register()
