import React, { Component, Fragment } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { updatePlaybackTime } from '../../actions'
import { Link, withRouter } from 'react-router-dom'

import { Button } from 'reactstrap'

import Hls from 'hls.js'

import localForage from 'localforage'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Controls from './Controls'
import Loading from '../Loading/Loading'

import { formatTime, isFullscreen } from '../../lib/util'

import './Player.scss'
import { push } from "connected-react-router"

const defaultState = {
  id: null,

  fullscreen: false,
  inited: false,
  paused: true,
  duration: 0,
  loadedSeconds: 0,
  progressSeconds: 0,
  loadingVideo: true,
  levels: [],
}

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
      levels: [],
      quality: '1080',
      speed: 1,
      volume: 1,
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
    this.toggleFullscreenState = this.toggleFullscreenState.bind(this)
    this.onLoadedProgress = this.onLoadedProgress.bind(this)
    this.onTimeUpdate = this.onTimeUpdate.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.skipSeconds = this.skipSeconds.bind(this)
    this.shouldResume = this.shouldResume.bind(this)
    this.setSpeed = this.setSpeed.bind(this)
    this.setVolume = this.setVolume.bind(this)
    this.onVideoEnd = this.onVideoEnd.bind(this)
    this.nextEpisode = this.nextEpisode.bind(this)

    this.persistKey = `nani:player`
  }

  async componentDidMount () {
    document.addEventListener('fullscreenchange', this.toggleFullscreenState, false)
    document.addEventListener('webkitfullscreenchange', this.toggleFullscreenState, false)
    document.addEventListener('mozfullscreenchange', this.toggleFullscreenState, false)

    const persistedState = await localForage.getItem(this.persistKey)
    if (persistedState) {
      this.setState({ ...JSON.parse(persistedState) })
    }
  }

  componentWillUnmount () {
    document.removeEventListener('fullscreenchange', this.toggleFullscreenState, false)
    document.removeEventListener('webkitfullscreenchange', this.toggleFullscreenState, false)
    document.removeEventListener('mozfullscreenchange', this.toggleFullscreenState, false)
  }

  componentDidUpdate (prevProps, prevState) {
    const { id: oldId, fullscreen, volume, speed, quality } = this.state
    const { id, streams, streamsLoaded } = this.props
    if (id !== oldId && streamsLoaded && streams.length) {
      this.updateEpisode()
      this.setState({ ...defaultState, id, fullscreen })
    }
    if (volume !== prevState.volume || speed !== prevState.speed || quality !== prevState.quality) {
      this.persistState()
    }
  }

  persistState () {
    const { volume, speed, quality } = this.state
    localForage.setItem(this.persistKey, JSON.stringify({
      volume, speed, quality
    }))
  }

  shouldResume () {
    const { media } = this.props
    return media && media.playhead !== 0 && (media.playhead / media.duration < 0.9)
  }

  updateEpisode () {
    const { streams, streamsLoaded, media } = this.props

    if (!streamsLoaded || !streams.length) return

    const stream = streams[0].url

    const oldHls = this.hls

    this.loggedTime = media.playhead || 0

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false })

      hls.loadSource(stream)
      hls.attachMedia(this.playerRef.current)

      this.hls = hls

      if (oldHls) {
        oldHls.destroy()
      }
    } else {
      console.log('Hls supported, falling back.')
      this.playerRef.current.src = stream
      // this.playerRef.current.addEventListener('loadedmetadata', () => {
      //   this.play()
      // })
    }
    this.registerHlsEvents()
  }

  registerHlsEvents () {
    const { quality } = this.state
    const { media } = this.props

    this.hls && this.hls.on('hlsManifestParsed', (_event, data) => {
      const levels = data.levels.map((level) => level.height.toString())

      if (!levels.includes(quality)) {
        const newQuality = levels[levels.length - 1]
        this.setState({ quality: newQuality })
      }
      this.hls.loadLevel = levels.indexOf(this.state.quality)

      this.setState({ levels })
    })

    this.hls && this.hls.on('hlsMediaAttached', () => {
      if (this.shouldResume()) this.playerRef.current.currentTime = media.playhead
    })

    this.playerRef.current.oncanplay = () => {
      this.setState({ loadingVideo: false, duration: (this.playerRef.current && this.playerRef.current.duration) || 0 })
      // this seems to fix safari
      if (!Hls.isSupported() && this.shouldResume()) {
        this.playerRef.current.currentTime = this.props.media.playhead
      }
    }
    this.playerRef.current.onwaiting = () => {
      this.setState({ loadingVideo: true })
    }
    this.playerRef.current.onplay = () => {
      this.setState({ paused: false })
    }
    this.playerRef.current.onpause = () => {
      this.setState({ paused: true })
      this.logTime()
    }
    this.playerRef.current.onprogress = this.onLoadedProgress
    this.playerRef.current.ontimeupdate = this.onTimeUpdate
    this.playerRef.current.addEventListener('ended', this.onVideoEnd)
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

    if (this.playerRef.current.paused) this.playerRef.current.play()
  }

  pause () {
    const { paused } = this.state
    if (paused) return

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

  toggleFullscreenState () {
    this.setState({ fullscreen: isFullscreen() })
  }

  setQuality (quality) {
    const { levels } = this.state

    this.setState({ quality })
    this.hls.currentLevel = levels.indexOf(quality)
  }

  setTime (value) {
    this.playerRef.current.currentTime = value
  }

  setSpeed (speed) {
    speed = Number(speed)

    this.setState({ speed })
    this.playerRef.current.playbackRate = speed
  }

  setVolume (volume) {
    volume = Number(volume)

    if (volume >= 0 && volume <= 1) {
      this.setState({ volume })
      this.playerRef.current.volume = volume
    }
  }

  onKeyDown (e) {
    const { keyCode } = e

    if (keyCode === 32) this.togglePlay() // space
    if (keyCode === 70) this.toggleFullscreen() // f
    if (keyCode === 39 || keyCode === 76) this.skipSeconds(10) // arrow right or l
    if (keyCode === 37 || keyCode === 74) this.skipSeconds(-10) // arrow left or j
    if (keyCode === 38) this.modifyVolume(10) // arrow up
    if (keyCode === 40) this.modifyVolume(-10) // arrow down

    if ([ 32, 39, 37, 70, 76, 74, 38, 40 ].includes(keyCode)) e.preventDefault()
  }

  async onVideoEnd () {
    const { autoPlay } = this.props

    await this.logTime()
    if (autoPlay) {
      this.nextEpisode()
    }
  }

  nextEpisode () {
    const { dispatch, nextMedia } = this.props

    if (nextMedia && nextMedia.media_id) {
      dispatch(push(`/series/${nextMedia.collection_id}/${nextMedia.media_id}`))
    }
  }

  skipSeconds (seconds) {
    this.playerRef.current.currentTime += seconds
  }

  modifyVolume (amount) {
    let { volume } = this.state

    amount /= 100

    volume += amount
    if (volume > 1) volume = 1
    if (volume === 0) volume = 0

    this.setVolume(volume)
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
    const { loadingVideo, paused, duration, fullscreen, progressSeconds, loadedSeconds, quality, speed, volume, levels, inited } = this.state
    const { Auth, poster, autoPlay, media, nextMedia, streamsLoaded, streams, location } = this.props

    const allowedToWatch = media.premium_only ? Auth.premium : true
    const canPlayVideo = streamsLoaded && streams.length && allowedToWatch

    return (
      <div className='player' id='player' ref={this.playerContainerRef} onKeyDown={this.onKeyDown} tabIndex='0'>
        <video preload='metadata' controlsList='nodownload' poster={poster} autoPlay={autoPlay} ref={this.playerRef} playsInline  />

        {loadingVideo && inited && !paused && <div className='player-center-overlay text-white'><Loading /></div>}

        <div className='position-absolute d-flex justify-content-center align-items-center h-100 w-100 text-white flex-column'>
          {canPlayVideo ? (
            paused && (
              <div className='position-absolute d-flex justify-content-center align-items-center h-100 w-100 text-white flex-column'>
                <div className=''>
                  <FontAwesomeIcon icon='play' className='player-icon' />
                </div>
                {this.shouldResume() && !inited && <div className='mt-1 bg-dark rounded-pill px-2'>
                  <FontAwesomeIcon icon='fast-forward' /> {formatTime(media.playhead)}
                </div>}
              </div>
            )
          ) : (
            <Fragment>
              {(streamsLoaded || !allowedToWatch) && <div className='player-dark-blur' />}
              <div className='player-dark-overlay'>
                {!streamsLoaded && allowedToWatch && <Loading />}
                {streamsLoaded && !streams.length
                  ? allowedToWatch
                    ? (
                      <div className='text-center'>
                        <h2>
                          <FontAwesomeIcon icon='times-circle' className='text-danger' />
                          <div className='text-white'>
                            This video is not available.
                          </div>
                        </h2>
                      </div>
                    ) : null
                  : null}
                {media.premium_only && !Auth.premium && (
                  <div className='text-center p-2'>
                    <h2>
                      <FontAwesomeIcon icon='crown' className='text-warning' />
                      <div className='text-white'>
                        You must be a
                        {' '}
                        <a
                          href='http://www.crunchyroll.com/en/premium_comparison'
                          target='_blank' rel='noopener noreferrer'
                          className='text-white'
                        >Crunchyroll Premium</a>
                        {' '}
                        subscriber to view this!
                      </div>
                    </h2>
                    <Button
                      size='sm'
                      color='primary'
                      className='ml-auto'
                      tag={Link}
                      to={{pathname: '/login', state: { prevPath: location.pathname }}}
                    >Login</Button>
                  </div>
                )}
              </div>
            </Fragment>
          )}
        </div>

        {(canPlayVideo || fullscreen) && (
          <Controls
            media={media}
            nextMedia={nextMedia}
            playNextMedia={this.nextEpisode}
            play={this.play}
            pause={this.pause}
            setTime={this.setTime}
            speed={speed}
            setSpeed={this.setSpeed}
            volume={volume}
            setVolume={this.setVolume}
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
        )}
      </div>
    )
  }
}

export default compose(
  withRouter,
  connect((store) => {
    return {
      Auth: store.Auth
    }
  })
)(Player)
