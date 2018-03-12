import React from 'react'
import { render } from 'react-dom'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

import configureStore from './store/configureStore'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/es/integration/react'

export const { store, persistor } = configureStore()

render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  document.getElementById('root'))

registerServiceWorker()
