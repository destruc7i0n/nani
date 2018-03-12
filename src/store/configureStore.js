import { applyMiddleware, createStore } from 'redux'
import localForage from 'localforage'
import { persistCombineReducers, persistStore } from 'redux-persist'

import thunk from 'redux-thunk'

import reducers from '../reducers'

export default function configureStore (preloadedState) {
  const middleware = [thunk]
  if (process.env.NODE_ENV === 'development') {
    const { logger } = require('redux-logger')

    middleware.push(logger)
  }

  // only persist auth
  const persistorConfig = {
    storage: localForage,
    key: 'nani',
    whitelist: ['Auth']
  }

  const middlewareEnhancer = applyMiddleware(...middleware)

  const reducer = persistCombineReducers(persistorConfig, reducers)
  const store = createStore(reducer, preloadedState, middlewareEnhancer)
  const persistor = persistStore(store)
  return { store, persistor }
}
