import { SET_QUEUE_DATA, SET_SEARCH_IDS, ADD_SERIES, ADD_MEDIA, ADD_COLLECTION, ADD_COLLECTION_MEDIA, ADD_SERIES_COLLECTION } from '../actions'

const addToObj = (state, key, data) => ({
  ...state,
  [key]: {
    ...state[key],
    ...data
  }
})

export default function Data (state = {
  queueData: [],
  searchIds: [],
  series: {},
  seriesCollections: {},
  media: {},
  collections: {},
  collectionMedia: {}
}, action) {
  switch (action.type) {
    case SET_SEARCH_IDS:
      return {
        ...state,
        searchIds: action.payload
      }
    case SET_QUEUE_DATA:
      return {
        ...state,
        queueData: action.payload
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
