import { applyMiddleware, createStore, compose } from 'redux'
import localForage from './localForage'
import { createBrowserHistory } from 'history'
import { persistCombineReducers, persistStore, createMigrate } from 'redux-persist'
import { connectRouter, routerMiddleware } from 'connected-react-router'

import thunk from 'redux-thunk'

import reducers from '../reducers'

export default function configureStore (preloadedState) {
  const middleware = [thunk]

  // migrations for store changes
  const migrations = {
    1: (state) => {
      // placeholder until there is the need for an actual one
      return {
        ...state
      }
    }
  }

  const storage = localForage.init()

  // only persist auth
  const persistorConfig = {
    version: 1,
    storage,
    key: 'nani',
    whitelist: ['Auth', 'Options'],
    migrate: createMigrate(migrations, { debug: false })
  }

  const history = createBrowserHistory()

  const createReducer = (history) => persistCombineReducers(persistorConfig, {
    router: connectRouter(history),
    ...reducers
  })

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

  const store = createStore(
    createReducer(history),
    preloadedState,
    composeEnhancers(
      applyMiddleware(
        routerMiddleware(history),
        ...middleware
      )
    )
  )
  const persistor = persistStore(store)
  return { store, persistor, history }
}
