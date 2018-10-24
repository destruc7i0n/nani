import { HIDE_ABOUT, SET_LANGUAGE, TOGGLE_AUTOPLAY } from '../actions'

export default function Options (state = {
  language: 'enUS',
  autoplay: false,
  aboutVisible: true
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
    case HIDE_ABOUT:
      return {
        ...state,
        aboutVisible: false
      }
    default:
      return state
  }
}
