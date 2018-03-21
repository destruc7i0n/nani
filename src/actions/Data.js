// some functions taken from umi

import { isCancel } from 'axios'

import api, { LOCALE, VERSION } from '../lib/api'

const MEDIA_FIELDS = [
  'media.media_id',
  'media.available',
  'media.available_time',
  'media.collection_id',
  'media.collection_name',
  'media.series_id',
  'media.type',
  'media.episode_number',
  'media.name',
  'media.description',
  'media.screenshot_image',
  'media.created',
  'media.duration',
  'media.playhead'
].join(',')
const SERIES_FIELDS = [
  'series.series_id',
  'series.name',
  'series.description',
  'series.portrait_image',
  'series.landscape_image',
  'series.in_queue',
  'series.media_count',
  'series.rating',
  'series.genres',
  'series.year'
].join(',')

export const handleError = (err, dispatch, reject) => {
  if (!isCancel(err)) {
    dispatch(setError(true))
    reject(err)
  } else {
    console.error('Cancelled request.')
  }
}

export const SET_ERROR = 'SET_ERROR'
export const setError = (error) => ({
  type: SET_ERROR,
  payload: error
})

export const SET_QUEUE = 'SET_QUEUE'
export const setQueue = (data) => ({
  type: SET_QUEUE,
  payload: data
})

export const SET_SEARCH_IDS = 'SET_SEARCH_IDS'
export const setSearchIds = (ids) => ({
  type: SET_SEARCH_IDS,
  payload: ids
})

export const SET_HISTORY = 'SET_HISTORY'
export const setHistory = (offset, history) => ({
  type: SET_HISTORY,
  payload: {
    offset,
    history
  }
})

export const SET_LIST = 'SET_LIST'
export const setList = (type, list) => ({
  type: SET_LIST,
  payload: {
    type,
    list
  }
})

export const SET_RECENT = 'SET_RECENT'
export const setRecent = (recent) => ({
  type: SET_RECENT,
  payload: recent
})

export const UPDATE_SERIES_QUEUE = 'UPDATE_SERIES_QUEUE'
export const updateSeriesQueueData = (id, inQueue) => ({
  type: UPDATE_SERIES_QUEUE,
  payload: { id, inQueue }
})

const addIdCheckBulk = (id, obj, action) => ({
  type: action,
  // eslint-disable-next-line array-callback-return
  payload: obj.reduce((result, item) => {
    if (item && item[id]) {
      return {
        ...result,
        [item[id]]: item
      }
    }
  }, {})
})

const addIdArr = ({ id, arr }, action) => ({
  type: action,
  payload: {
    [id]: arr
  }
})

export const ADD_SERIES = 'ADD_SERIES'
export const addSeries = (obj) => addIdCheckBulk('series_id', [obj], ADD_SERIES)
export const addSeriesBulk = (bulk) => addIdCheckBulk('series_id', bulk, ADD_SERIES)

export const ADD_MEDIA = 'ADD_MEDIA'
export const addMedia = (obj) => addIdCheckBulk('media_id', [obj], ADD_MEDIA)
export const addMediaBulk = (bulk) => addIdCheckBulk('media_id', bulk, ADD_MEDIA)

export const ADD_COLLECTION = 'ADD_COLLECTION'
export const addCollection = (obj) => addIdCheckBulk('collection_id', [obj], ADD_COLLECTION)
export const addCollectionBulk = (bulk) => addIdCheckBulk('collection_id', bulk, ADD_COLLECTION)

export const ADD_COLLECTION_MEDIA = 'ADD_COLLECTION_MEDIA'
export const addCollectionMedia = (obj) => addIdArr(obj, ADD_COLLECTION_MEDIA)

export const ADD_SERIES_COLLECTION = 'ADD_SERIES_COLLECTION'
export const addSeriesCollection = (obj) => addIdArr(obj, ADD_SERIES_COLLECTION)

export const getQueue = (force) => (dispatch, getState) => {
  const state = getState()
  const params = {
    session_id: state.Auth.session_id,
    media_types: 'anime|drama',
    fields: [MEDIA_FIELDS, SERIES_FIELDS].join(',')
  }

  if (state.Data.queue.length > 0 && !force) return Promise.resolve()

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({route: 'queue', params, noCancel: true})
      if (resp.data.error) throw resp

      const data = resp.data.data
      dispatch(setQueue(data))
      dispatch(addSeriesBulk(data.map((d) => d.series)))
      dispatch(addMediaBulk(data.map((d) => d.most_likely_media)))
      dispatch(addMediaBulk(data.map((d) => d.last_watched_media)))
      resolve()
    } catch (err) {
      handleError(err, dispatch, reject)
    }
  })
}

export const getHistory = ({limit = 24, offset = 0} = {}, append = false) => (dispatch, getState) => {
  const state = getState()
  // handle appending offset
  offset = append ? state.Data.history.offset + limit : offset
  const params = {
    session_id: state.Auth.session_id,
    media_types: 'anime|drama',
    fields: [MEDIA_FIELDS, SERIES_FIELDS].join(','),
    limit,
    offset
  }

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({route: 'recently_watched', params, noCancel: true})
      if (resp.data.error) throw resp

      const data = resp.data.data
      if (!append) {
        // overwrite the data there
        dispatch(setHistory(offset, data))
      } else {
        // append to the list of data already there
        dispatch(setHistory(offset, [
          ...state.Data.history.data,
          ...data
        ]))
      }
      dispatch(addSeriesBulk(data.map((d) => d.series)))
      dispatch(addCollectionBulk(data.map((d) => d.collection)))
      dispatch(addMediaBulk(data.map((d) => d.media)))
      resolve(data)
    } catch (err) {
      handleError(err, dispatch, reject)
    }
  })
}

export const search = (q) => (dispatch, getState) => {
  const state = getState()
  const params = {
    session_id: state.Auth.session_id,
    classes: 'series',
    limit: 999,
    offset: 0,
    media_types: 'anime|drama',
    fields: SERIES_FIELDS,
    q
  }

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({route: 'autocomplete', params})
      if (resp.data.error) throw resp

      const data = resp.data.data
      dispatch(addSeriesBulk(data.map((d) => d)))
      dispatch(setSearchIds(data.map((d) => d.series_id)))
      resolve()
    } catch (err) {
      handleError(err, dispatch, reject)
    }
  })
}

export const getSeriesInfo = (id) => (dispatch, getState) => {
  const state = getState()
  const params = {
    session_id: state.Auth.session_id,
    series_id: id,
    fields: SERIES_FIELDS
  }

  if (state.Data.series[id]) return Promise.resolve()

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({route: 'info', params})
      if (resp.data.error) throw resp

      const data = resp.data.data
      dispatch(addSeries(data))
      resolve()
    } catch (err) {
      handleError(err, dispatch, reject)
    }
  })
}

export const getCollectionsForSeries = (id) => (dispatch, getState) => {
  const state = getState()
  const params = {
    session_id: state.Auth.session_id,
    series_id: id,
    limit: 5000,
    offset: 0
  }

  if (state.Data.seriesCollections[id]) return Promise.resolve()

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({route: 'list_collections', params})
      if (resp.data.error) throw resp

      const data = resp.data.data
      dispatch(addCollectionBulk(data.map((d) => d)))
      dispatch(addSeriesCollection({id, arr: data.map((d) => d.collection_id)}))
      resolve()
    } catch (err) {
      handleError(err, dispatch, reject)
    }
  })
}

export const getMediaForCollection = (id) => (dispatch, getState) => {
  const state = getState()
  const params = {
    session_id: state.Auth.session_id,
    collection_id: id,
    include_clips: 1,
    limit: 5000,
    offset: 0,
    fields: MEDIA_FIELDS
  }

  if (state.Data.collectionMedia[id]) return Promise.resolve()

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({route: 'list_media', params})
      if (resp.data.error) throw resp

      const data = resp.data.data
      dispatch(addMediaBulk(data.map((d) => d)))
      dispatch(addCollectionMedia({id, arr: data.map((d) => d.media_id)}))
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

export const getMediaInfo = (id) => (dispatch, getState) => {
  const state = getState()
  const params = {
    session_id: state.Auth.session_id,
    media_id: id
  }

  if (state.Data.media[id]) return Promise.resolve(state.Data.media[id])

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({route: 'info', params})
      if (resp.data.error) throw resp

      const data = resp.data.data
      dispatch(addMedia(data))
      resolve(data)
    } catch (err) {
      reject(err)
    }
  })
}

export const updateSeriesQueue = ({id, inQueue}) => (dispatch, getState) => {
  const state = getState()
  const form = new FormData()
  form.append('session_id', state.Auth.session_id)
  form.append('locale', LOCALE)
  form.append('version', VERSION)
  form.append('series_id', id)

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({method: 'post', route: inQueue ? 'remove_from_queue' : 'add_to_queue', data: form, noCancel: true})
      if (resp.data.error) throw resp

      dispatch(getQueue(true))
      dispatch(updateSeriesQueueData(id, !inQueue))
      resolve()
    } catch (err) {
      handleError(err, dispatch, reject)
    }
  })
}

export const getSeriesList = (filter = 'simulcast') => (dispatch, getState) => {
  const state = getState()
  const params = {
    session_id: state.Auth.session_id,
    media_type: 'anime',
    fields: 'series.series_id,series.in_queue,series.name,series.description,series.portrait_image',
    limit: 54,
    offset: 0,
    filter
  }

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({route: 'list_series', params})
      if (resp.data.error) throw resp

      const data = resp.data.data
      dispatch(setList(filter, data))
      resolve()
    } catch (err) {
      handleError(err, dispatch, reject)
    }
  })
}

export const getRecent = () => (dispatch, getState) => {
  const state = getState()
  const params = {
    session_id: state.Auth.session_id,
    media_type: 'anime',
    fields: [MEDIA_FIELDS, 'media.series_name', 'series.most_recent_media'].join(','),
    limit: 54,
    offset: 0,
    filter: 'updated'
  }

  if (state.Data.recent.length > 0) return Promise.resolve()

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({route: 'list_series', params})
      if (resp.data.error) throw resp

      const data = resp.data.data
      dispatch(addMediaBulk(data.map((d) => d.most_recent_media)))
      dispatch(setRecent(data))
      resolve()
    } catch (err) {
      handleError(err, dispatch, reject)
    }
  })
}
