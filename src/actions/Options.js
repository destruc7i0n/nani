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
