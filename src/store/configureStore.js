import { applyMiddleware, createStore } from 'redux'
import localForage from 'localforage'
import { createBrowserHistory } from 'history'
import { persistCombineReducers, persistStore, createMigrate } from 'redux-persist'
import { connectRouter, routerMiddleware } from 'connected-react-router'

import thunk from 'redux-thunk'

import reducers from '../reducers'

export default function configureStore (preloadedState) {
  const middleware = [thunk]
  if (process.env.NODE_ENV === 'development') {
    const { logger } = require('redux-logger')

    middleware.push(logger)
  }

  // migrations for store changes
  const migrations = {
    1: (state) => {
      // placeholder until there is the need for an actual one
      return {
        ...state
      }
    }
  }

  // only persist auth
  const persistorConfig = {
    version: 1,
    storage: localForage,
    key: 'nani',
    whitelist: ['Auth', 'Options'],
    migrate: createMigrate(migrations, { debug: false })
  }

  const history = createBrowserHistory()

  const reducer = persistCombineReducers(persistorConfig, reducers)
  const store = createStore(
    connectRouter(history)(reducer),
    preloadedState,
    applyMiddleware(
      routerMiddleware(history),
      ...middleware
    )
  )
  const persistor = persistStore(store)
  return { store, persistor, history }
}
