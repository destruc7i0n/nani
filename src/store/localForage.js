import localForage from 'localforage'

export default {
  init () {
    try {
      // IOS fixed crash IndexedDB
      // DOMException: Connection to Indexed Database server lost. Refresh the page to try again
      // Disable IndexedDB for Safari
      let driver = []
      // eslint-disable-next-line no-useless-escape
      if (!!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/)) {
        // console.log('Safari: No IndexedDB usage')
        driver = [
          localForage.WEBSQL,
          localForage.LOCALSTORAGE
        ]
      } else {
        driver = [
          localForage.INDEXEDDB,
          localForage.WEBSQL,
          localForage.LOCALSTORAGE
        ]
      }
      localForage.config({
        driver
      })
      return localForage
    } catch (error) {
      console.error('localForage.config Error: ', error)
    }
  }
}
