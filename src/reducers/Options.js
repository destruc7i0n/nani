import { SET_LANGUAGE, TOGGLE_AUTOPLAY } from '../actions'

export default function Options (state = {
  language: 'enUS',
  autoplay: false
}, action) {
  switch (action.type) {
    case SET_LANGUAGE:
      return {
        ...state,
        language: action.payload
      }
    case TOGGLE_AUTOPLAY:
      return {
        ...state,
        autoplay: !state.autoplay
      }
    default:
      return state
  }
}
