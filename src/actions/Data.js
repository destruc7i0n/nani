import { isCancel } from 'axios'

import api from '../lib/api'

const MEDIA_FIELDS = 'media.media_id,media.available,media.available_time,media.collection_id,media.collection_name,media.series_id,media.type,media.episode_number,media.name,media.description,media.screenshot_image,media.created,media.duration,media.playhead,media.bif_url'
const SERIES_FIELDS = 'series.series_id,series.name,series.portrait_image,series.landscape_image,series.description,series.in_queue'

export const handleError = (err, dispatch, reject) => {
  if (!isCancel(err)) {
    dispatch(setError(true))
    reject(err)
  }
}

export const SET_ERROR = 'SET_ERROR'
export const setError = (error) => ({
  type: SET_ERROR,
  payload: error
})

export const SET_QUEUE_DATA = 'SET_QUEUE_DATA'
export const setQueueData = (data) => ({
  type: SET_QUEUE_DATA,
  payload: data
})

export const SET_SEARCH_IDS = 'SET_SEARCH_IDS'
export const setSearchIds = (ids) => ({
  type: SET_SEARCH_IDS,
  payload: ids
})

const addIdCheck = (id, obj, action) => dispatch => {
  if (obj && obj[id]) {
    dispatch({
      type: action,
      payload: {
        [obj[id]]: obj
      }
    })
  }
}

const addIdArr = ({ id, arr }, action) => ({
  type: action,
  payload: {
    [id]: arr
  }
})

export const ADD_SERIES = 'ADD_SERIES'
export const addSeries = (obj) => addIdCheck('series_id', obj, ADD_SERIES)

export const ADD_MEDIA = 'ADD_MEDIA'
export const addMedia = (obj) => addIdCheck('media_id', obj, ADD_MEDIA)

export const ADD_COLLECTION = 'ADD_COLLECTION'
export const addCollection = (obj) => addIdCheck('collection_id', obj, ADD_COLLECTION)

export const ADD_COLLECTION_MEDIA = 'ADD_COLLECTION_MEDIA'
export const addCollectionMedia = (obj) => addIdArr(obj, ADD_COLLECTION_MEDIA)

export const ADD_SERIES_COLLECTION = 'ADD_SERIES_COLLECTION'
export const addSeriesCollection = (obj) => addIdArr(obj, ADD_SERIES_COLLECTION)

export const getQueueInfo = (force) => (dispatch, getState) => {
  const state = getState()
  const params = {
    session_id: state.Auth.session_id,
    media_types: 'anime|drama',
    fields: [MEDIA_FIELDS, SERIES_FIELDS].join(',')
  }

  if (state.Data.queueData.length > 0 && !force) return Promise.resolve()

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({route: 'queue', params})
      if (resp.data.error) throw resp

      const data = resp.data.data
      dispatch(setQueueData(data))
      data.forEach((d) => {
        dispatch(addSeries(d.series))
        dispatch(addMedia(d.most_likely_media))
        dispatch(addMedia(d.last_watched_media))
      })
      resolve()
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
      data.forEach((d) => {
        dispatch(addSeries(d))
      })
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
      data.forEach((d) => {
        dispatch(addCollection(d))
      })
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
    offset: 0
  }

  if (state.Data.collectionMedia[id]) return Promise.resolve()

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({route: 'list_media', params})
      if (resp.data.error) throw resp

      const data = resp.data.data
      data.forEach((d) => {
        dispatch(addMedia(d))
      })
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

  if (state.Data.media[id]) return Promise.resolve()

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({route: 'info', params})
      if (resp.data.error) throw resp

      const data = resp.data.data
      dispatch(addMedia(data))
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}
