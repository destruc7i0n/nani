export const SET_LANGUAGE = 'SET_LANGUAGE'
export const setLanguage = (language) => ({
  type: SET_LANGUAGE,
  payload: language
})

export const TOGGLE_AUTOPLAY = 'TOGGLE_AUTOPLAY'
export const toggleAutoplay = () => ({
  type: TOGGLE_AUTOPLAY
})

export const HIDE_ABOUT = 'HIDE_ABOUT'
export const hideAbout = () => ({
  type: HIDE_ABOUT
})

export const TOGGLE_ORDER_CONTROLS = 'TOGGLE_ORDER_CONTROLS'
export const toggleOrderControls = () => ({
  type: TOGGLE_ORDER_CONTROLS
})

export const SET_THEME = 'SET_THEME'
export const setTheme = (theme) => ({
  type: SET_THEME,
  payload: theme
})

export const TOGGLE_AUTO_THEME = 'TOGGLE_AUTO_THEME'
export const toggleAutoTheme = () => ({
  type: TOGGLE_AUTO_THEME
})

export const SET_HOMEPAGE_CONTINUE_COUNT = 'SET_HOMEPAGE_CONTINUE_COUNT'
export const setHomepageContinueCount = (count) => ({
  type: SET_HOMEPAGE_CONTINUE_COUNT,
  payload: count
})

export const TOGGLE_PREMIUM_ALERT = 'TOGGLE_PREMIUM_ALERT'
export const togglePremiumAlert = () => ({
  type: TOGGLE_PREMIUM_ALERT
})

