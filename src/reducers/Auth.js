import { v4 as uuid } from 'uuid'
import { UPDATE_AUTH, SET_EXPIRED_SESSION, REMOVE_AUTH, UPDATE_MAL, UPDATE_ANILIST } from '../actions'

// make UUIDs noticeable
const genUUID = () => {
  let id = uuid()
  const parts = id.split('-')
  parts[1] = 'NANI'
  return parts.join('-')
}

const initialState = {
  token: '',
  expires: 8640000000000000,
  username: '',
  guest: true,
  premium: false,
  mal: {username: '', token: ''},
  anilist: {username: '', token: ''},
  expiredSession: '',
  uuid: genUUID()
}

export default function Auth (state = initialState, action) {
  switch (action.type) {
    case UPDATE_AUTH:
      return {
        ...state,
        ...action.payload
      }
    case UPDATE_MAL:
      return {
        ...state,
        mal: action.payload
      }
    case UPDATE_ANILIST:
      return {
        ...state,
        anilist: action.payload
      }
    case REMOVE_AUTH:
      return {
        ...initialState,
        expiredSession: state.expiredSession,
        uuid: state.uuid,
        mal: state.mal,
        anilist: state.anilist
      }
    case SET_EXPIRED_SESSION:
      return {
        ...state,
        expiredSession: action.payload
      }
    default:
      return state
  }
}
