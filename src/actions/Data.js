// some functions taken from umi

import axios, { isCancel } from 'axios'
import { omit } from 'lodash'

import { matchPath } from 'react-router'

import api, { ACCESS_TOKEN, DEVICE_TYPE, LOCALE, VERSION } from '../lib/api'

import { batch } from 'react-redux'

import { logout, startSession } from './Auth'
import { push } from 'connected-react-router'

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
  'media.playhead',
  'media.premium_only'
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

export const handleError = async (err, dispatch, state, reject) => {
  const path = state.router.location.pathname || '/'
  if (!isCancel(err)) {
    const { data } = err
    if (data) {
      switch (data.code) {
        case 'bad_session': { // when the session has expired?
          // create a new session
          let sessionId
          try {
            sessionId = await dispatch(startSession())
          } catch (e) {
            window.location.reload()
          }

          // move to an empty page and then back if not on the media page
          const isMediaPage = matchPath(path, { path: '/series/:id/:media', exact: true })
          if (!isMediaPage) {
            if (sessionId) {
              window.location.reload()
            } else {
              await dispatch(logout(true))
              dispatch(push('/login'))
            }
          }
          break
        }
        case 'bad_request': { // when removed from the devices and the like
          await dispatch(logout(true))
          dispatch(setError(data.code))
          dispatch(push('/login')) // go to login page
          break
        }
        default: {
          dispatch(setError(true))
          reject(err)
          break
        }
      }
    } else {
      dispatch(setError(true))
    }
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

export const SET_PLAYHEAD_TIME = 'SET_PLAYHEAD_TIME'
export const setPlayheadTime = (time, id) => ({
  type: SET_PLAYHEAD_TIME,
  payload: {
    id,
    time
  }
})

export const SET_LANGUAGES = 'SET_LANGUAGES'
export const setLanguages = (languages) => ({
  type: SET_LANGUAGES,
  payload: languages
})

export const SET_CATEGORIES = 'SET_CATEGORIES'
export const setCategories = (categories) => ({
  type: SET_CATEGORIES,
  payload: categories
})

export const ADD_MAL_ITEM = 'ADD_MAL_ITEM'
export const addMalItem = (id, data) => ({
  type: ADD_MAL_ITEM,
  payload: {
    id,
    data
  }
})

export const ADD_ANILIST_ITEM = 'ADD_ANILIST_ITEM'
export const addAniListItem = (id, data) => ({
  type: ADD_ANILIST_ITEM,
  payload: {
    id,
    data
  }
})

export const addIdCheckBulk = (id, obj, action) => ({
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

export const addIdArr = ({ id, arr }, action) => ({
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
    media_types: 'anime',
    fields: [MEDIA_FIELDS, SERIES_FIELDS].join(',')
  }

  if (state.Data.queue.length > 0 && !force) return Promise.resolve()

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({route: 'queue', params, locale: state.Options.language, noCancel: true})
      if (resp.data.error) throw resp

      const data = resp.data.data
      batch(() => {
        dispatch(setQueue(data))
        dispatch(addSeriesBulk(data.map((d) => d.series)))
        dispatch(addMediaBulk(data.map((d) => d.most_likely_media)))
        dispatch(addMediaBulk(data.map((d) => d.last_watched_media)))
      })
      resolve()
    } catch (err) {
      await handleError(err, dispatch, state, reject)
    }
  })
}

export const getHistory = ({limit = 24, offset = 0} = {}, append = false, force = false) => (dispatch, getState) => {
  const state = getState()
  // handle appending offset
  offset = append ? state.Data.history.offset + limit : offset
  const params = {
    session_id: state.Auth.session_id,
    media_types: 'anime',
    fields: [MEDIA_FIELDS, SERIES_FIELDS].join(','),
    limit,
    offset
  }

  if (state.Data.history && state.Data.history.data.length > 0 && !force && !append) return Promise.resolve()

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({route: 'recently_watched', params, locale: state.Options.language, noCancel: true})
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
      batch(() => {
        dispatch(addSeriesBulk(data.map((d) => d.series)))
        dispatch(addCollectionBulk(data.map((d) => d.collection)))
        dispatch(addMediaBulk(data.map((d) => d.media)))
      })
      resolve(data)
    } catch (err) {
      await handleError(err, dispatch, state, reject)
    }
  })
}

export const search = (q) => (dispatch, getState) => {
  const state = getState()
  const params = {
    session_id: state.Auth.session_id,
    classes: 'series',
    limit: 10,
    offset: 0,
    media_types: 'anime',
    fields: SERIES_FIELDS,
    q
  }

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({route: 'autocomplete', params, locale: state.Options.language})
      if (resp.data.error) throw resp

      const data = resp.data.data
      batch(() => {
        dispatch(addSeriesBulk(data.map((d) => d)))
        dispatch(setSearchIds(data.map((d) => d.series_id)))
      })
      resolve()
    } catch (err) {
      await handleError(err, dispatch, state, reject)
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
      const resp = await api({route: 'info', params, locale: state.Options.language})
      if (resp.data.error) throw resp

      const data = resp.data.data
      dispatch(addSeries(data))
      resolve()
    } catch (err) {
      await handleError(err, dispatch, state, reject)
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
      const resp = await api({route: 'list_collections', params, locale: state.Options.language})
      if (resp.data.error) throw resp

      const data = resp.data.data
      batch(() => {
        dispatch(addCollectionBulk(data.map((d) => d)))
        dispatch(addSeriesCollection({id, arr: data.map((d) => d.collection_id)}))
      })
      resolve(data)
    } catch (err) {
      await handleError(err, dispatch, state, reject)
    }
  })
}

export const getMediaForCollection = (id) => (dispatch, getState) => {
  const state = getState()
  const params = {
    session_id: state.Auth.session_id,
    collection_id: id,
    include_clips: 0,
    limit: 5000,
    offset: 0,
    fields: MEDIA_FIELDS
  }

  if (state.Data.collectionMedia[id]) return Promise.resolve()

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({route: 'list_media', params, locale: state.Options.language})
      if (resp.data.error) throw resp

      const data = resp.data.data
      batch(() => {
        dispatch(addMediaBulk(data.map((d) => d)))
        dispatch(addCollectionMedia({id, arr: data.map((d) => d.media_id)}))
      })
      resolve()
    } catch (err) {
      await handleError(err, dispatch, state, reject)
    }
  })
}

export const getMediaInfo = (id) => (dispatch, getState) => {
  const state = getState()
  const params = {
    session_id: state.Auth.session_id,
    media_id: id,
    fields: MEDIA_FIELDS
  }

  if (state.Data.media[id]) return Promise.resolve(state.Data.media[id])

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({route: 'info', params, locale: state.Options.language})
      if (resp.data.error) throw resp

      const data = resp.data.data
      dispatch(addMedia(data))
      resolve(data)
    } catch (err) {
      await handleError(err, dispatch, state, reject)
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
      const resp = await api({method: 'post', route: inQueue ? 'remove_from_queue' : 'add_to_queue', data: form, locale: state.Options.language, noCancel: true})
      if (resp.data.error) throw resp

      batch(() => {
        dispatch(getQueue(true))
        dispatch(updateSeriesQueueData(id, !inQueue))
      })
      resolve()
    } catch (err) {
      await handleError(err, dispatch, state, reject)
    }
  })
}

export const getSeriesList = (filter = 'simulcast', noCancel = false) => (dispatch, getState) => {
  const state = getState()
  const params = {
    session_id: state.Auth.session_id,
    media_type: 'anime',
    fields: 'series.series_id,series.in_queue,series.name,series.media_count,series.portrait_image',
    limit: 54,
    offset: 0,
    filter
  }

  filter = filter.replace('tag:', '')

  if (state.Data.list[filter]) return Promise.resolve()

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({route: 'list_series', params, locale: state.Options.language, noCancel})
      if (resp.data.error) throw resp

      const data = resp.data.data
      dispatch(setList(filter, data))
      resolve()
    } catch (err) {
      await handleError(err, dispatch, state, reject)
    }
  })
}

export const updatePlaybackTime = (time, id) => (dispatch, getState) => {
  const state = getState()
  const form = new FormData()
  form.append('session_id', state.Auth.session_id)
  form.append('event', 'playback_status')
  form.append('playhead', time)
  form.append('media_id', id)
  form.append('locale', LOCALE)
  form.append('version', VERSION)

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({
        method: 'post',
        route: 'log',
        data: form,
        locale: state.Options.language
      })
      if (resp.data.error) throw resp

      // update the time in the store too
      dispatch(setPlayheadTime(time, id))
      resolve()
    } catch (err) {
      console.error(err)
      reject(err)
    }
  })
}

export const getRecent = (noCancel = false) => (dispatch, getState) => {
  const state = getState()
  const params = {
    session_id: state.Auth.session_id,
    media_type: 'anime',
    fields: [MEDIA_FIELDS, SERIES_FIELDS, 'media.series_name', 'series.most_recent_media'].join(','),
    limit: 54,
    offset: 0,
    filter: 'updated'
  }

  if (state.Data.recent.length > 0) return Promise.resolve()

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({route: 'list_series', params, locale: state.Options.language, noCancel})
      if (resp.data.error) throw resp

      const data = resp.data.data
      batch(() => {
        dispatch(addMediaBulk(data.map((d) => d.most_recent_media)))
        dispatch(addSeriesBulk(data.map((d) => omit(d, 'most_recent_media'))))
        dispatch(setRecent(data))
      })
      resolve()
    } catch (err) {
      await handleError(err, dispatch, state, reject)
    }
  })
}

export const getLanguages = () => (dispatch, getState) => {
  const state = getState()
  const params = {
    access_token: ACCESS_TOKEN,
    device_type: DEVICE_TYPE,
    device_id: state.Auth.uuid
  }

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({route: 'list_locales', version: '1', params})
      if (resp.data.error) throw resp

      const data = resp.data.data
      dispatch(setLanguages(data.locales.map((locale) => ({ text: locale.label, id: locale.locale_id }))))
      resolve()
    } catch (err) {
      await handleError(err, dispatch, state, reject)
    }
  })
}

export const getCategories = () => (dispatch, getState) => {
  const state = getState()
  const params = {
    session_id: state.Auth.session_id,
    media_type: 'anime'
  }

  if (Object.keys(state.Data.categories).length) return Promise.resolve(state.Data.categories)

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({route: 'categories', version: '0', params})
      if (resp.data.error) throw resp

      const data = resp.data.data
      dispatch(setCategories(data))
      resolve(data)
    } catch (err) {
      await handleError(err, dispatch, state, reject)
    }
  })
}

export const getMalItem = (name, collectionId) => (dispatch, getState) => {
  const state = getState()

  if (state.Data.mal[collectionId]) return Promise.resolve(state.Data.mal[collectionId])

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await axios.get(`/.netlify/functions/mal_search?name=${name}`)
      const { data: { error, success, data } } = resp
      if (resp.data.error) throw resp

      if (!error && success) {
        dispatch(addMalItem(collectionId, data))
        resolve(data)
      }
    } catch (err) {
      reject(err)
    }
  })
}

export const getAniListItem = (name, collectionId, force = false) => (dispatch, getState) => {
  const state = getState()

  if (state.Data.anilist[collectionId] && !force) return Promise.resolve(state.Data.anilist[collectionId])

  if (!state.Auth.anilist.token) return Promise.reject(new Error('Not authenticated.'))

  const { token } = state.Auth.anilist

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await axios.post('https://graphql.anilist.co', {
        query: `
          query ($name: String) {
            Media (search: $name, type: ANIME) {
              title {
                romaji
                english
              },
              id,
              mediaListEntry {
                progress
              },
              episodes,
              nextAiringEpisode {
                airingAt,
                episode
              }
            }
          }
        `,
        variables: {
          name
        }
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const { data: { data: { Media } }, errors = [] } = resp
      if (errors.length) throw errors[0].message || 'An Error Occurred'

      if (!errors.length) {
        dispatch(addAniListItem(collectionId, Media))
        resolve(Media)
      }
    } catch (err) {
      reject(err)
    }
  })
}
