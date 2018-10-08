// based on umi's api.js

import axios, {CancelToken} from 'axios'

export const ACCESS_TOKEN = 'LNDJgOit5yaRIWN'
export const DEVICE_TYPE = 'com.crunchyroll.windows.desktop'
export const LOCALE = 'enUS'
export const VERSION = '1.1.21.0'
export const CONNECTIVITY_TYPE = 'ethernet'

let source = CancelToken.source()

export default function api (opts) {
  const config = {
    method: opts.method || 'get',
    url: `https://api.crunchyroll.com/${opts.route}.${opts.version || '0'}.json`,
    params: !opts.data ? {
      ...opts.params,
      locale: opts.locale || LOCALE,
      version: VERSION,
      connectivity_type: CONNECTIVITY_TYPE
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
