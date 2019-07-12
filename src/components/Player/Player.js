import React, { Component } from 'react'
import { connect } from 'react-redux'

import Hls from 'hls.js'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Controls from './Controls'
import Loading from '../Loading/Loading'

import { formatTime, isFullscreen } from '../../lib/util'

import './Player.scss'
import { updatePlaybackTime } from '../../actions'

class Player extends Component {
  constructor (props) {
    super (props)

    this.state = {
      id: null,

      fullscreen: false,
      inited: false,
      paused: true,
      duration: 0,
      loadedSeconds: 0,
      progressSeconds: 0,
      loadingVideo: true,
      loaded: false,
      levels: [],
      quality: '1080',
    }

    this.playerRef = React.createRef()
    this.playerContainerRef = React.createRef()

    this.hls = null

    this.loggedTime = props.media.playhead || 0

    this.play = this.play.bind(this)
    this.pause = this.pause.bind(this)
    this.setTime = this.setTime.bind(this)
    this.setQuality = this.setQuality.bind(this)
    this.togglePlay = this.togglePlay.bind(this)
    this.toggleFullscreen = this.toggleFullscreen.bind(this)
    this.onLoadedProgress = this.onLoadedProgress.bind(this)
    this.onTimeUpdate = this.onTimeUpdate.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.skipSeconds = this.skipSeconds.bind(this)
    this.shouldResume = this.shouldResume.bind(this)
  }

  componentDidMount () {
    this.updateEpisode()

    const toggleFullscreenState = () => this.setState({ fullscreen: isFullscreen() })

    document.addEventListener('fullscreenchange', toggleFullscreenState, false)
    document.addEventListener('webkitfullscreenchange', toggleFullscreenState, false)
    document.addEventListener('mozfullscreenchange', toggleFullscreenState, false)
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    const { id, stream } = this.props
    if (prevProps.id !== id || prevProps.stream !== stream) this.updateEpisode()
  }

  shouldResume () {
    const { media } = this.props
    return media && media.playhead !== 0 && (media.playhead / media.duration < 0.9)
  }

  updateEpisode () {
    const { stream, media } = this.props

    const oldHls = this.hls

    this.loggedTime = media.playhead || 0

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false })

      hls.loadSource(stream)
      hls.attachMedia(this.playerRef.current)

      this.hls = hls

      if (oldHls) oldHls.destroy()
    } else {
      this.playerRef.current.src = stream
      this.playerRef.current.addEventListener('loadedmetadata', () => {
        this.play()
      })
    }
    this.registerHlsEvents()
  }

  registerHlsEvents () {
    const { quality } = this.state

    this.hls && this.hls.on('hlsManifestParsed', (_event, data) => {
      const levels = data.levels.map((level) => level.height.toString())

      if (levels[quality] == null) {
        const newQuality = levels[levels.length - 1]
        this.setState({ quality: newQuality })
      }
      this.hls.loadLevel = levels.indexOf(this.state.quality)

      this.setState({ levels })
    })

    this.playerRef.current.onplay = () => {
      this.setState({ paused: false })
    }
    this.playerRef.current.onpause = () => {
      this.setState({ paused: true })
    }
    this.playerRef.current.oncanplay = () => {
      this.setState({ loadingVideo: false, loaded: true, duration: this.playerRef.current.duration })
    }
    this.playerRef.current.onwaiting = () => {
      this.setState({ loadingVideo: true })
    }
    this.playerRef.current.onprogress = this.onLoadedProgress
    this.playerRef.current.ontimeupdate = this.onTimeUpdate
    this.playerRef.current.addEventListener('ended', () => this.logTime())
  }

  onLoadedProgress(e) {
    const { inited } = this.state
    const { media } = this.props
    if (!media || !inited) return

    const element = e.target
    if (element.buffered.length) {
      const buffered = element.buffered.end(0)
      this.setState({ loadedSeconds: buffered })
    }
  }

  onTimeUpdate (e) {
    const { media } = this.props
    if (!media) return

    const element = e.target
    this.setState({ progressSeconds: element.currentTime })
  }

  play () {
    const { paused, inited } = this.state
    const { media } = this.props

    if (!paused) return

    if (!inited && this.shouldResume()) this.setTime(media.playhead)

    if (!inited) this.setState({ inited: true })

    this.playerRef.current.play()
  }

  pause () {
    const { paused } = this.state
    if (paused) return

    this.logTime()

    this.playerRef.current.pause()
  }

  togglePlay () {
    const { paused } = this.state
    if (paused) this.play()
    else this.pause()
  }

  toggleFullscreen () {
    const requestFullscreen = (el) => {
      if (el.requestFullscreen)
        el.requestFullscreen()
      else if (el.webkitRequestFullscreen)
        el.webkitRequestFullscreen()
      else if (el.mozRequestFullScreen)
        el.mozRequestFullScreen()
      else if (el.msRequestFullscreen)
        el.msRequestFullscreen()
      else if (el.querySelector && el.querySelector('video') && el.querySelector('video').webkitEnterFullScreen)
        el.querySelector('video').webkitEnterFullScreen()
      else if (el.webkitEnterFullScreen)
        el.webkitEnterFullScreen()
    }

    const cancelFullscreen = (el) => {
      if (el.exitFullscreen)
        el.exitFullscreen()
      else if (el.webkitCancelFullScreen)
        el.webkitCancelFullScreen()
      else if (el.webkitExitFullscreen)
        el.webkitExitFullscreen()
      else if (el.mozCancelFullScreen)
        el.mozCancelFullScreen()
      else if (el.msExitFullscreen)
        el.msExitFullscreen()
    }

    if (!isFullscreen()) {
      requestFullscreen(this.playerContainerRef.current)
    } else {
      cancelFullscreen(document)
    }
  }

  setQuality (quality) {
    const { levels } = this.state

    this.setState({ quality })
    this.hls.currentLevel = levels.indexOf(quality)
  }

  setTime (value) {
    this.playerRef.current.currentTime = value
  }

  onKeyDown (e) {
    const { keyCode } = e

    if (keyCode === 32) this.togglePlay()
    if (keyCode === 39) this.skipSeconds(10)
    if (keyCode === 37) this.skipSeconds(-10)

    if ([ 32, 39, 37 ].includes(keyCode)) e.preventDefault()
  }

  skipSeconds (seconds) {
    this.playerRef.current.currentTime += seconds
  }

  async logTime (t) {
    const { progressSeconds } = this.state
    const { dispatch, id } = this.props

    const time = t || progressSeconds

    // debug
    if (window.setLogToZero) {
      await dispatch(updatePlaybackTime(0, id))
      return
    }

    // log time only if it's greater than what is saved
    if (time !== 0 && time > this.loggedTime && process.env.NODE_ENV === 'production') {
      try {
        await dispatch(updatePlaybackTime(time, id))
      } catch (err) {
        console.error(err)
      }
      this.loggedTime = time
    }
  }

  render () {
    const { loadingVideo, paused, duration, fullscreen, progressSeconds, loadedSeconds, quality, levels, inited } = this.state
    const { poster, autoPlay, media } = this.props

    return (
      <div className='player' ref={this.playerContainerRef} onKeyDown={this.onKeyDown} tabIndex='0'>
        <video preload='metadata' poster={poster} autoPlay={autoPlay} ref={this.playerRef} playsInline />

        {loadingVideo && inited && <div className='player-center-overlay text-white'><Loading /></div>}
        {paused && (
          <div className='position-absolute d-flex justify-content-center align-items-center h-100 w-100 text-white flex-column'>
            <div className=''>
              <FontAwesomeIcon icon='play' size='4x' />
            </div>
            {this.shouldResume() && !inited && <div className='mt-1 bg-dark rounded-pill px-2'>
              <FontAwesomeIcon icon='fast-forward' /> {formatTime(media.playhead)}
            </div>}
          </div>
        )}

        <Controls
          media={media}
          play={this.play}
          pause={this.pause}
          setTime={this.setTime}
          togglePlay={this.togglePlay}
          paused={paused}
          fullscreen={fullscreen}
          toggleFullscreen={this.toggleFullscreen}
          duration={duration}
          quality={quality}
          setQuality={this.setQuality}
          levels={levels}
          watchTime={progressSeconds}
          progressPercent={duration && progressSeconds && progressSeconds / duration}
          loadedPercent={duration && loadedSeconds && loadedSeconds / duration}
        />
      </div>
    )
  }
}

export default connect()(Player)
