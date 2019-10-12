import {
  HIDE_ABOUT,
  SET_LANGUAGE,
  TOGGLE_AUTOPLAY,
  TOGGLE_ORDER_CONTROLS,
  SET_THEME,
  TOGGLE_AUTO_THEME,
  SET_HOMEPAGE_CONTINUE_COUNT,
  TOGGLE_PREMIUM_ALERT
} from '../actions'

export default function Options (state = {
  language: 'enUS',
  autoplay: false,
  aboutVisible: true,
  orderControls: true,
  theme: 'dark',
  autoThemeChange: true,
  homepageContinueCount: 4,
  showPremiumAlert: true
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
    case TOGGLE_ORDER_CONTROLS:
      return {
        ...state,
        orderControls: !state.orderControls
      }
    case SET_THEME:
      return {
        ...state,
        theme: action.payload
      }
    case TOGGLE_AUTO_THEME:
      return {
        ...state,
        autoThemeChange: !state.autoThemeChange
      }
    case SET_HOMEPAGE_CONTINUE_COUNT:
      return {
        ...state,
        homepageContinueCount: Number(action.payload)
      }
    case TOGGLE_PREMIUM_ALERT:
        return {
          ...state,
          showPremiumAlert: !state.showPremiumAlert
        }
    default:
      return state
  }
}
