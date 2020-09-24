import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import { Button, Popover, PopoverBody, Toast, ToastBody, ToastHeader } from 'reactstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import classNames from 'classnames'

import { DoubleEventHandler, formatTime } from '../../lib/util'

import ProgressBar from './ProgressBar'
import Volume from './Volume'

import './Controls.scss'

class Controls extends Component {
  constructor (props) {
    super (props)

    this.state = {
      hovering: false,
      settingsOpen: false,
      newPlayerInfo: false,

      lastVolume: null,
    }

    this.hoverTimeout = null
    this.clickTimeout = null
    this.doubleTapHandler = new DoubleEventHandler(500)

    this.toggleVisibility = this.toggleVisibility.bind(this)
    this.handleMouseLeave = this.handleMouseLeave.bind(this)
    this.coverClick = this.coverClick.bind(this)
    this.cancelClick = this.cancelClick.bind(this)
    this.coverDoubleClick = this.coverDoubleClick.bind(this)
    this.coverDoubleTap = this.coverDoubleTap.bind(this)
    this.coverTap = this.coverTap.bind(this)
    this.toggleNewPlayerInfo = this.toggleNewPlayerInfo.bind(this)
    this.toggleSettings = this.toggleSettings.bind(this)
    this.toggleVolume = this.toggleVolume.bind(this)
  }

  componentWillUnmount () {
    if (this.hoverTimeout) clearTimeout(this.hoverTimeout)
  }

  toggleVisibility () {
    this.setState({ hovering: true })

    if (this.hoverTimeout) clearTimeout(this.hoverTimeout)

    this.hoverTimeout = setTimeout(() => {
      this.setState({ hovering: false })
      this.hoverTimeout = null
    }, 3 * 1000)
  }

  handleMouseLeave () {
    this.setState({ hovering: false })

    if (this.hoverTimeout) clearTimeout(this.hoverTimeout)
  }

  cancelClick () {
    clearTimeout(this.clickTimeout)
    this.clickTimeout = null
  }

  coverClick () {
    const { togglePlay } = this.props
    this.clickTimeout = setTimeout(() => {
      this.clickTimeout && togglePlay()
    }, 200)
  }

  coverDoubleClick () {
    const { toggleFullscreen } = this.props
    this.clickTimeout = null
    toggleFullscreen()
  }

  coverDoubleTap (e) {
    const { toggleFullscreen } = this.props
    this.doubleTapHandler.handle(e, () => {
      this.cancelClick()
      toggleFullscreen()
    })
  }

  coverTap (e) {
    const { hovering } = this.state
    const { paused } = this.props

    if (!hovering && !paused) e.preventDefault()

    if (!hovering) this.toggleVisibility()
    this.coverDoubleTap(e)
  }

  toggleNewPlayerInfo () {
    const { newPlayerInfo } = this.state
    this.setState({
      newPlayerInfo: !newPlayerInfo
    })
  }

  toggleSettings () {
    const { settingsOpen } = this.state
    this.setState({
      settingsOpen: !settingsOpen
    })
  }

  toggleVolume () {
    const { lastVolume } = this.state
    const { volume, setVolume } = this.props

    if (lastVolume === null) {
      this.setState({ lastVolume: volume })
      setVolume(0)
    } else {
      this.setState({ lastVolume: null })
      setVolume(lastVolume)
    }
  }

  render () {
    const { hovering, newPlayerInfo, settingsOpen, lastVolume } = this.state
    const {
      readyToPlay,
      paused,
      fullscreen,
      toggleFullscreen,
      togglePIP,
      canPlayPIP,
      pip,
      media,
      nextMedia,
      playNextMedia,
      progressPercent,
      loadedPercent,
      play,
      pause,
      setTime,
      setSpeed,
      setQuality,
      setVolume,
      volume,
      quality,
      levels,
      speed,
      isFullPage,
      toggleFullPage,
    } = this.props

    let duration = this.props.duration
    let watchTime = this.props.watchTime

    const controlsVisible = hovering || paused || settingsOpen || pip

    const fullScreenView = fullscreen || isFullPage

    const linkTitle = (
      <Link to={`/series/${media.series_id}#collection_${media.collection_id}`} className='text-white'>
        <div className='d-flex' style={{ pointerEvents: 'all' }}>
          <FontAwesomeIcon icon='arrow-left' size='lg' className='pr-2' />
          <h3>{media.collection_name || 'Loading...'}</h3>
        </div>
      </Link>
    )

    return (
      <div
        className={classNames('controls', { 'visible': controlsVisible, 'no-cursor': !controlsVisible })}
        onMouseMove={this.toggleVisibility}
        onMouseOut={this.handleMouseLeave}
      >
        <div className='cover' onClick={this.coverClick} onDoubleClick={this.coverDoubleClick} onTouchEnd={this.coverTap} />

        <div className='episode-information text-white'>
          {isFullPage ? linkTitle : (
            <h3>{media.collection_name || 'Loading...'}</h3>
          )}
          {fullScreenView && <h4>Episode {media.episode_number}: {media.name}</h4>}
        </div>

        <div className='player-info-button d-md-block d-none'>
          {newPlayerInfo
            ? (
              <Toast className='bg-white'>
                <ToastHeader toggle={this.toggleNewPlayerInfo}>
                  New Video Player!
                </ToastHeader>
                <ToastBody className='text-body'>
                  Welcome to the new custom video player! It was built to better accommodate the design and needs of this website.<br />
                  Do you have feedback or requests of features no-longer available?
                  You can create a new <a target='_blank' rel='noopener noreferrer' href='https://github.com/destruc7i0n/nani/issues/new?title=New+video+player+feedback'>GitHub issue</a> or <a href='mailto:destruc7i0n@thedestruc7i0n.ca'>send me an email</a>.
                </ToastBody>
              </Toast>
            )
            : (
              <Button color='primary' className='rounded-circle' onClick={this.toggleNewPlayerInfo}>
                <FontAwesomeIcon icon='question' />
              </Button>
            )}
        </div>

        <div className='toolbar'>
          <div className='toolbar-button cursor-pointer' title={paused ? 'Play' : 'Pause'} onClick={() => paused ? play() : pause()} >
            <FontAwesomeIcon icon={paused ? 'play' : 'pause'} size='lg' />
          </div>

          {nextMedia && <div className='toolbar-button cursor-pointer d-md-block d-none' title='Next Episode' onClick={playNextMedia} >
            <FontAwesomeIcon icon='step-forward' size='lg' />
          </div>}

          <span className='text-white time-ticker'>{formatTime(watchTime)}</span>

          <ProgressBar setTime={setTime} progressPercent={progressPercent} loadedPercent={loadedPercent} duration={duration} />

          <span className='text-white time-ticker'>{formatTime(duration - watchTime)}</span>

          <div className='toolbar-button cursor-pointer volume-icon' title='Volume' onClick={this.toggleVolume} >
            <FontAwesomeIcon icon={
              volume === 0
                ? lastVolume === null
                  ? 'volume-off'
                  : 'volume-mute'
                : volume < 0.3
                  ? 'volume-down'
                  : volume > 0.7
                    ? 'volume-up'
                    : 'volume'
            } size='lg' />
          </div>
          <Volume volumePercent={volume} setVolume={setVolume} />

          <div className='toolbar-button cursor-pointer' id='player-settings' title='Settings' onClick={this.toggleSettings} >
            <FontAwesomeIcon icon='cog' size='lg' />
          </div>

          <Popover container={fullScreenView ? 'player' : 'body'} placement='top' trigger='legacy' isOpen={settingsOpen} target='player-settings' toggle={this.toggleSettings}>
            <PopoverBody>
              {levels.length > 0 && <div className='row pb-2'>
                <div className='col'>Quality</div>
                <div className='col'>
                  <select name='quality' id='quality-selector' value={quality} onChange={(e) => setQuality(e.target.value)}>
                    <option value='auto'>Auto</option>
                    {levels.map((level, index) => <option key={`quality-${index}`} value={level}>{level}p</option>)}
                  </select>
                </div>
              </div>}
              <div className='row'>
                <div className='col'>Speed</div>
                <div className='col'>
                  <select name='speed' id='speed-selector' value={speed} onChange={(e) => setSpeed(e.target.value)}>
                    <option value={2}>2x</option>
                    <option value={1.75}>1.75x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1}>1x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={0.5}>0.5x</option>
                    <option value={0.25}>0.25x</option>
                  </select>
                </div>
              </div>
            </PopoverBody>
          </Popover>

          {canPlayPIP && readyToPlay && (
            <div className='toolbar-button cursor-pointer' title='Toggle PiP' onClick={() => togglePIP()} >
              <FontAwesomeIcon icon='clone' size='lg' />
            </div>
          )}

          {!fullscreen && (
            <div className='toolbar-button cursor-pointer d-none d-md-block'
                 title={isFullPage ? 'Small' : 'Full Page'}
                 onClick={() => toggleFullPage()}>
              <FontAwesomeIcon icon={isFullPage ? 'video' : 'desktop'} size='lg'/>
            </div>
          )}

          <div className='toolbar-button cursor-pointer' title={fullscreen ? 'Minimize' : 'Fullscreen'} onClick={() => toggleFullscreen()} >
            <FontAwesomeIcon icon={fullscreen ? 'compress' : 'expand'} size='lg' />
          </div>
        </div>
      </div>
    )
  }
}

export default Controls
