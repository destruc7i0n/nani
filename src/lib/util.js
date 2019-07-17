export const formatTime = (secs) => {
  const minutes = Math.floor(secs / 60)
  let seconds = Math.floor(secs - (minutes * 60))
  seconds = seconds < 10 ? `0${seconds}` : seconds
  return `${minutes}:${seconds}`
}

export const isFullscreen = () => !!(
  document.webkitFullscreenElement ||
  document.webkitIsFullScreen ||
  document.mozFullScreen ||
  document.msFullscreenElement
)

export class DoubleEventHandler {
  constructor(delay = 500) {
    this.delay = delay
    this.lastTime = 0
  }

  handle(event, cb, prevented = true) {
    // Based on http://jsfiddle.net/brettwp/J4djY/
    let currentTime = new Date().getTime()
    let diffTime = currentTime - this.lastTime

    if (diffTime < this.delay && diffTime > 0) {
      cb()
      prevented && event.preventDefault()
    }

    this.lastTime = currentTime
  }
}
