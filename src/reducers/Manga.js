import { ADD_MANGA_SERIES, SET_MANGA_LIST, SET_MANGA_SERIES } from '../actions'
import { addToObj } from './Data'

const initialState = {
  series: {},
  list: {},
  chapters: {},
}

export default function Manga (state = initialState, action) {
  switch (action.type) {
    case SET_MANGA_SERIES:
      return {
        ...state,
        series: action.payload
      }
    case SET_MANGA_LIST:
      return {
        ...state,
        list: {
          ...state.list,
          [action.payload.type]: action.payload.list
        }
      }
    case ADD_MANGA_SERIES:
      return addToObj(state, 'series', action.payload)
    default:
      return state
  }
}
