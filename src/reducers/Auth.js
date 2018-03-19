import uuid from 'uuid/v4'
import { UPDATE_AUTH, SET_EXPIRED_SESSION, REMOVE_AUTH } from '../actions'

const initialState = {
  expiredSession: '',
  uuid: uuid()
}

export default function Auth (state = initialState, action) {
  switch (action.type) {
    case UPDATE_AUTH:
      return {
        ...state,
        ...action.payload
      }
    case REMOVE_AUTH:
      return initialState
    case SET_EXPIRED_SESSION:
      return {
        ...state,
        expiredSession: action.payload
      }
    default:
      return state
  }
}
