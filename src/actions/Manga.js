import api from '../lib/api_manga'
import { addIdCheckBulk } from './Data'

export const ADD_MANGA_SERIES = 'ADD_MANGA_SERIES'
export const addMangaSeries = (series) => ({
  type: ADD_MANGA_SERIES,
  payload: series
})

export const addMangaSeriesBulk = (bulk) => addIdCheckBulk('series_id', bulk, ADD_MANGA_SERIES)

export const SET_MANGA_SERIES = 'SET_MANGA_SERIES'
export const setMangaSeries = (series) => ({
  type: SET_MANGA_SERIES,
  payload: series
})

export const SET_MANGA_LIST = 'SET_MANGA_LIST'
export const setMangaList = (type, list) => ({
  type: SET_MANGA_LIST,
  payload: {
    type,
    list
  }
})

export const getMangaSeries = (seriesId = null, filter = null, noCancel = false) => (dispatch, getState) => {
  const state = getState()
  const params = {
    content_type: 'jp_manga',
    series_id: seriesId,
    filter,
  }

  if (seriesId && state.Manga.series[seriesId]) return state.Manga.series[seriesId]
  if (filter && state.Manga.list[filter]) return state.Manga.list[filter]

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({route: 'list_series', params, noCancel})
      if (resp.data.error) throw resp

      const data = resp.data
      dispatch(addMangaSeriesBulk(data))

      if (filter) {
        dispatch(setMangaList(filter, data))
      }

      resolve(data)
    } catch (err) {
      reject(err)
    }
  })
}

export const getMangaChapters = (seriesId) => (dispatch, getState) => {
  const state = getState()
  const params = {
    series_id: seriesId,
    user_id: state.Auth.user_id || null
  }

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({ route: 'list_chapters', params })

      const data = resp.data
      resolve(data)
    } catch (err) {
      reject(err)
    }
  })
}

export const getMangaChapterPages = (chapterId) => (dispatch, getState) => {
  const state = getState()
  const params = {
    chapter_id: chapterId,
    session_id: state.Auth.session_id,
    auth: state.Auth.token
  }

  return new Promise(async (resolve, reject) => {
    try {
      const resp = await api({ route: 'list_chapter', params })

      const data = resp.data
      resolve(data)
    } catch (err) {
      reject(err)
    }
  })
}
