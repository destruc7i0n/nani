import uuid from 'uuid/v4'
import { store as reduxStore } from '../index'

let localId = localStorage.getItem('nani-uuid')
export function getUuid () {
  if (!localId) {
    localId = uuid().toUpperCase()
    localStorage.setItem('nani-uuid', localId)
  }

  return localId
}

export function isLoggedIn () {
  const store = reduxStore.getState()
  return store.Auth.username && !store.Auth.expiredSession
}
