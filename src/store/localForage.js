import localForage from 'localforage'

export default {
  init () {
    try {
      // IOS 12.2 fixed crash IndexedDB
      // DOMException: Connection to Indexed Database server lost. Refresh the page to try again
      let driver = []
      if (window.device && window.device.platform.toLowerCase() === 'ios') {
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
