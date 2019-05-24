import {
  ADD_ANILIST_ITEM,
  ADD_COLLECTION,
  ADD_COLLECTION_MEDIA,
  ADD_MAL_ITEM,
  ADD_MEDIA,
  ADD_SERIES,
  ADD_SERIES_COLLECTION,
  SET_CATEGORIES,
  SET_ERROR,
  SET_HISTORY,
  SET_LANGUAGES,
  SET_LIST,
  SET_PLAYHEAD_TIME,
  SET_QUEUE,
  SET_RECENT,
  SET_SEARCH_IDS,
  UPDATE_SERIES_QUEUE
} from '../actions'

export const addToObj = (state, key, data) => ({
  ...state,
  [key]: {
    ...state[key],
    ...data
  }
})

export default function Data (state = {
  searchIds: [],
  series: {},
  seriesCollections: {},
  media: {},
  collections: {},
  collectionMedia: {},
  history: {
    offset: 0,
    data: []
  },
  queue: [],
  list: {},
  recent: [],
  languages: [],
  categories: {},
  mal: {},
  anilist: {},

  error: false
}, action) {
  switch (action.type) {
    case SET_ERROR:
      return {
        ...state,
        error: action.payload
      }
    case SET_SEARCH_IDS:
      return {
        ...state,
        searchIds: action.payload
      }
    case SET_QUEUE:
      return {
        ...state,
        queue: action.payload
      }
    case SET_HISTORY:
      return {
        ...state,
        history: {
          offset: action.payload.offset,
          data: action.payload.history
        }
      }
    case SET_LIST:
      return {
        ...state,
        list: {
          ...state.list,
          [action.payload.type]: action.payload
        }
      }
    case SET_RECENT:
      return {
        ...state,
        recent: action.payload
      }
    case UPDATE_SERIES_QUEUE:
      return {
        ...state,
        series: {
          ...state.series,
          [action.payload.id]: {
            ...state.series[action.payload.id],
            in_queue: action.payload.inQueue
          }
        }
      }
    case SET_PLAYHEAD_TIME:
      return {
        ...state,
        media: {
          ...state.media,
          [action.payload.id]: {
            ...state.media[action.payload.id],
            playhead: action.payload.time
          }
        }
      }
    case SET_LANGUAGES:
      return {
        ...state,
        languages: action.payload
      }
    case SET_CATEGORIES:
      return {
        ...state,
        categories: action.payload
      }
    case ADD_MAL_ITEM:
      return {
        ...state,
        mal: {
          ...state.mal,
          [action.payload.id]: action.payload.data
        }
      }
    case ADD_ANILIST_ITEM:
      return {
        ...state,
        anilist: {
          ...state.anilist,
          [action.payload.id]: action.payload.data
        }
      }
    case ADD_SERIES:
      return addToObj(state, 'series', action.payload)
    case ADD_SERIES_COLLECTION:
      return addToObj(state, 'seriesCollections', action.payload)
    case ADD_MEDIA:
      return addToObj(state, 'media', action.payload)
    case ADD_COLLECTION:
      return addToObj(state, 'collections', action.payload)
    case ADD_COLLECTION_MEDIA:
      return addToObj(state, 'collectionMedia', action.payload)
    default:
      return state
  }
}
