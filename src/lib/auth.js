import { store as reduxStore } from '../index'

export function isLoggedIn () {
  const store = reduxStore.getState()
  return !store.Auth.guest &&
    store.Auth.username &&
    !store.Auth.expiredSession &&
    store.Auth.expires &&
    new Date() < new Date(store.Auth.expires)
}
