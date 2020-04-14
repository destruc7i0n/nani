// based on umi's api.js

import axios, {CancelToken} from 'axios'

export const ACCESS_TOKEN = 'LNDJgOit5yaRIWN'
export const DEVICE_TYPE = 'com.crunchyroll.manga.flash'
export const API_VERSION = '1.0'

let source = CancelToken.source()

export default function api (opts) {
  const config = {
    method: opts.method || 'get',
    url: `https://api-manga.crunchyroll.com/${opts.route}`,
    params: !opts.data ? {
      api_ver: API_VERSION,
      ...opts.params,
      device_type: DEVICE_TYPE,
    } : null,
    data: opts.data,
    cancelToken: !opts.noCancel ? source.token : null
  }

  return axios(config)
}

export function cancelCurrentRequests () {
  source.cancel('User changed page')
  source = CancelToken.source()
}
