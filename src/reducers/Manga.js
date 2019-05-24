import { ADD_MANGA_SERIES, SET_MANGA_SERIES } from '../actions'
import { addToObj } from './Data'

const initialState = {
  series: {},
  chapters: {},
}

export default function Manga (state = initialState, action) {
  switch (action.type) {
    case SET_MANGA_SERIES:
      return {
        ...state,
        series: action.payload
      }
    case ADD_MANGA_SERIES:
      return addToObj(state, 'series', action.payload)
    default:
      return state
  }
}
