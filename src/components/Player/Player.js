import React, { Component, Fragment } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { updatePlaybackTime } from '../../actions'
import { Link, withRouter } from 'react-router-dom'
import { push } from 'connected-react-router'

import { Button } from 'reactstrap'

import ReactPlayer from 'react-player'

import localForage from 'localforage'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Img } from 'react-image'

import Controls from './Controls'
import Loading from '../Loading/Loading'

import { formatTime, isFullscreen } from '../../lib/util'
import withProxy, { replaceHttps } from '../../lib/withProxy'

import './Player.scss'

const defaultState = {
  id: null,

  stream: null,
  canPlay: true,
  ready: false,

  fullscreen: false,
  canPlayPIP: false,
  pip: false,
  inited: false,
  paused: true,
  duration: 0,
  loadedSeconds: 0,
  loadedPercent: 0,
  progressSeconds: 0,
  progressPercent: 0,
  loadingVideo: true,
  levels: [],
}

class Player extends Component {
  constructor (props) {
    super (props)

    this.state = {
      ...defaultState,
      paused: !props.autoPlay,
      quality: '1080',
      speed: 1,
      volume: 1,
    }

    this.playerRef = React.createRef()
    this.playerContainerRef = React.createRef()
    this.controlsRef = React.createRef()

    this.loggedTime = props.media.playhead || 0

    this.play = this.play.bind(this)
    this.pause = this.pause.bind(this)
    this.setTime = this.setTime.bind(this)
    this.setQuality = this.setQuality.bind(this)
    this.togglePlay = this.togglePlay.bind(this)
    this.toggleFullscreen = this.toggleFullscreen.bind(this)
    this.togglePIP = this.togglePIP.bind(this)
    this.toggleFullscreenState = this.toggleFullscreenState.bind(this)
    this.onStart = this.onStart.bind(this)
    this.onReady = this.onReady.bind(this)
    this.onPause = this.onPause.bind(this)
    this.onPlay = this.onPlay.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.skipSeconds = this.skipSeconds.bind(this)
    this.shouldResume = this.shouldResume.bind(this)
    this.setSpeed = this.setSpeed.bind(this)
    this.setVolume = this.setVolume.bind(this)
    this.onVideoEnd = this.onVideoEnd.bind(this)
    this.nextEpisode = this.nextEpisode.bind(this)
    this.getLevels = this.getLevels.bind(this)

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
    const { paused } = this.state

    document.removeEventListener('fullscreenchange', this.toggleFullscreenState, false)
    document.removeEventListener('webkitfullscreenchange', this.toggleFullscreenState, false)
    document.removeEventListener('mozfullscreenchange', this.toggleFullscreenState, false)

    // if the video is playing and attempting to unmount, log the time
    if (!paused) this.logTime()
  }

  componentDidUpdate (prevProps, prevState) {
    const { id: oldId, fullscreen, volume, speed, quality } = this.state
    const { id, streams, streamsLoaded, autoPlay } = this.props
    if (id !== oldId && streamsLoaded) {
      let stream = ''
      if (streams.length) stream = streams[0].url
      this.setState({ ...defaultState, id, fullscreen, stream, canPlay: ReactPlayer.canPlay(stream), paused: !autoPlay, })
      this.loggedTime = this.props.media.playhead || 0
    }
    if (volume !== prevState.volume || speed !== prevState.speed || quality !== prevState.quality) {
      this.persistState()
    }
  }

  async getImageDimensions (src) {
    return new Promise((r) => {
      const img = new Image()
      img.onload = () => r({ width: img.width, height: img.height })
      img.src = src
    })
  }

  async handleMediaSession () {
    if ('mediaSession' in navigator) {
      const { media } = this.props

      if (!media.screenshot_image) return

      let artwork = []

      if (media.screenshot_image.medium_url) {
        const { width: mediumWidth, height: mediumHeight } = await this.getImageDimensions(media.screenshot_image.medium_url)
        artwork.push(
          { src: media.screenshot_image.medium_url, sizes: `${mediumWidth}x${mediumHeight}`, type: 'image/jpg' }
        )
      }
      if (media.screenshot_image.large_url) {
        const { width: largeWidth, height: largeHeight } = await this.getImageDimensions(media.screenshot_image.large_url)
        artwork.push(
          { src: media.screenshot_image.large_url, sizes: `${largeWidth}x${largeHeight}`, type: 'image/jpg' }
        )
      }
      if (media.screenshot_image.fwide_url) {
        const { width: fullWidthWidth, height: fullWidthHeight } = await this.getImageDimensions(media.screenshot_image.fwide_url)
        artwork.push(
          { src: media.screenshot_image.fwide_url, sizes: `${fullWidthWidth}x${fullWidthHeight}`, type: 'image/jpg' }
        )
      }

      // eslint-disable-next-line
      navigator.mediaSession.metadata = new MediaMetadata({
        title: media.name,
        artist: media.collection_name,
        artwork
      })

      navigator.mediaSession.setActionHandler('play', () => this.play())
      navigator.mediaSession.setActionHandler('pause', () => this.pause())
      navigator.mediaSession.setActionHandler('seekbackward', () => this.skipSeconds(-10))
      navigator.mediaSession.setActionHandler('seekforward', () => this.skipSeconds(10))
    }
  }

  getLevels () {
    const { quality } = this.state
    if (this.playerRef.current) {
      const Hls = this.playerRef.current.getInternalPlayer('hls')

      if (Hls) {
        const levels = Hls.levels.map((level) => level.height.toString())

        if (!levels.includes(quality)) {
          if (quality !== 'auto') {
            const newQuality = levels[levels.length - 1]
            this.setState({ quality: newQuality })
          }
        }

        if (quality === 'auto') {
          Hls.loadLevel = -1
        } else {
          Hls.loadLevel = levels.indexOf(this.state.quality)
        }

        this.setState({ levels })
      }
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
    const { inited, progressSeconds } = this.state
    return media && media.playhead !== 0 && (media.playhead / media.duration < 0.9) && !inited && progressSeconds < 1
  }

  play () {
    const { paused, ready } = this.state
    const { media } = this.props

    if (!paused || !ready) return

    if (this.shouldResume()) this.setTime(media.playhead)

    this.setState({ paused: false })
  }

  pause () {
    const { paused } = this.state
    if (paused) return

    this.setState({ paused: true })
  }

  onPause () {
    const { paused } = this.state
    if (!paused) this.setState({ paused: true })

    this.logTime()
  }

  onPlay () {
    const { paused } = this.state
    if (paused) this.setState({ paused: false })
  }

  onStart () {
    const { media } = this.props

    if (this.shouldResume()) this.setTime(media.playhead)

    this.setState({ inited: true })

    this.handleMediaSession()
  }

  onReady () {
    const { stream } = this.state

    const canPlayPIP = ReactPlayer.canEnablePIP(stream)

    this.getLevels()
    this.setState({ loadingVideo: false, ready: true, canPlayPIP })
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

  togglePIP () {
    const { canPlayPIP, pip, fullscreen } = this.state
    if (fullscreen) this.toggleFullscreen()
    if (canPlayPIP) this.setState({ pip: !pip, fullscreen: false })
  }

  setQuality (quality) {
    const { levels } = this.state

    if (this.playerRef.current) {
      const Hls = this.playerRef.current.getInternalPlayer('hls')

      if (Hls) {
        if (quality === 'auto') {
          Hls.currentLevel = -1
        } else {
          Hls.currentLevel = levels.indexOf(quality)
        }

        this.setState({ quality })
      }
    }
  }

  setTime (value) {
    try {
      if (this.playerRef.current) this.playerRef.current.seekTo(value)
    } catch (e) {
      console.error('Could not seek video!')
    }
  }

  setSpeed (speed) {
    speed = Number(speed)

    this.setState({ speed })
  }

  setVolume (volume) {
    volume = Number(volume)

    if (volume >= 0 && volume <= 1) {
      this.setState({ volume })
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

    if ([ 32, 39, 37, 70, 76, 74, 38, 40 ].includes(keyCode)) {
      e.preventDefault()
      // make the controls show
      if (this.controlsRef.current) this.controlsRef.current.toggleVisibility()
    }
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
    if (this.playerRef.current) this.setTime(this.playerRef.current.getCurrentTime() + seconds)
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
        setTimeout(async () => this.logTime(t), 1000 * 5) // try again in a few seconds
      }
      this.loggedTime = time
    }
  }

  render () {
    const { id, stream, loadingVideo, paused, duration, fullscreen, progressSeconds, quality, speed, volume, pip, levels, inited, loadedPercent, progressPercent, canPlay, canPlayPIP, ready } = this.state
    const { Auth, poster, media, nextMedia, streamsLoaded, streams, location, isFullPage, toggleFullPage } = this.props

    const allowedToWatch = media.premium_only ? Auth.premium : true

    return (
      <div className='player' id='player' ref={this.playerContainerRef} onKeyDown={this.onKeyDown} tabIndex='0'>
        <ReactPlayer
          key={id}
          url={stream}
          playing={!paused}
          volume={volume}
          playbackRate={speed}
          pip={pip}
          className='video-player'
          width='100%'
          height='100%'
          ref={this.playerRef}

          onBuffer={() => this.setState({ loadingVideo: true })}
          onBufferEnd={() => this.setState({ loadingVideo: false })}
          onProgress={({ loadedSeconds, playedSeconds: progressSeconds, played: progressPercent, loaded: loadedPercent }) =>
            this.setState({ loadedSeconds, progressSeconds, progressPercent, loadedPercent })}
          onDuration={(duration) => this.setState({ duration })}
          onPause={this.onPause}
          onPlay={this.onPlay}
          onReady={this.onReady}
          onStart={this.onStart}
          onEnded={this.onVideoEnd}
          onEnablePIP={() => this.setState({ pip: true })}
          onDisablePIP={() => this.setState({ pip: false })}
        />

        {!inited && (
          <div className='player-center-overlay'>
            <Img src={poster ? [
              withProxy(poster),
              replaceHttps(poster)
            ] : 'https://via.placeholder.com/1920x1080?text=No+Image'} alt={media.title} className='w-100' />
            {(!ready && canPlay) && <div className='player-center-overlay text-white'><Loading /></div>}
          </div>
        )}

        <div className='position-absolute d-flex justify-content-center align-items-center h-100 w-100 text-white flex-column'>
          {ready ? (
            <div className='position-absolute d-flex justify-content-center align-items-center h-100 w-100 text-white flex-column'>
              {paused ? (
                <>
                  <FontAwesomeIcon icon='play' className='player-icon' />
                  {this.shouldResume() && <div className='mt-1 bg-dark rounded-pill px-2'>
                    <FontAwesomeIcon icon='fast-forward' /> {formatTime(media.playhead)}
                  </div>}
                </>
              ) : (
                loadingVideo ? (
                  <FontAwesomeIcon icon='circle-notch' pulse className='player-icon' size='3x' />
                ) : null)
              }
            </div>
          ) : (
            <Fragment>
              {(!allowedToWatch || (!streams.length && streamsLoaded)) && <div className='player-dark-blur' />}
              <div className='player-dark-overlay'>
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

        {(ready || fullscreen || isFullPage) && (
          <Controls
            ref={this.controlsRef}
            readyToPlay={ready && inited}
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
            isFullPage={isFullPage}
            toggleFullPage={toggleFullPage}
            toggleFullscreen={this.toggleFullscreen}
            canPlayPIP={canPlayPIP}
            togglePIP={this.togglePIP}
            pip={pip}
            duration={duration}
            quality={quality}
            setQuality={this.setQuality}
            levels={levels}
            watchTime={progressSeconds}
            progressPercent={progressPercent}
            loadedPercent={loadedPercent}
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
