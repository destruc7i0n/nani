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
