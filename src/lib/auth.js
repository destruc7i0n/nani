import { store as reduxStore } from '../index'

export function isLoggedIn (premium = false) {
  const store = reduxStore.getState()
  return !store.Auth.guest &&
    store.Auth.user_id &&
    store.Auth.token &&
    !store.Auth.expiredSession &&
    store.Auth.expires &&
    new Date() < new Date(store.Auth.expires) &&
    (premium ? store.Auth.premium : true)
}
