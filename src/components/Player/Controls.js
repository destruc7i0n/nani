import React, { Component } from 'react'

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
    this.toggleNewPlayerInfo = this.toggleNewPlayerInfo.bind(this)
    this.toggleSettings = this.toggleSettings.bind(this)
    this.toggleVolume = this.toggleVolume.bind(this)
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
      paused,
      fullscreen,
      toggleFullscreen,
      media,
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
    } = this.props

    let duration = this.props.duration || media.duration
    let watchTime = this.props.watchTime || media.playhead

    const controlsVisible = hovering || paused || settingsOpen

    return (
      <div
        className={classNames('controls', { 'visible': controlsVisible, 'no-cursor': !controlsVisible })}
        onMouseMove={this.toggleVisibility}
        onMouseOut={this.handleMouseLeave}
      >
        <div className='cover' onClick={this.coverClick} onDoubleClick={this.coverDoubleClick} onTouchEnd={this.coverDoubleTap} />

        <div className='episode-information text-white'>
          <h3>{media.collection_name || 'Loading...'}</h3>
          {fullscreen && <h4>Episode {media.episode_number}: {media.name}</h4>}
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
                  Create a new <a target='_blank' rel='noopener noreferrer' href='https://github.com/destruc7i0n/nani/issues/new?title=New+video+player+feedback'>GitHub issue</a> or <a href='mailto:destruc7i0n@thedestruc7i0n.ca'>send me an email</a>.
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
          <div className='toolbar-button cursor-pointer' onClick={() => paused ? play() : pause()} >
            <FontAwesomeIcon icon={paused ? 'play' : 'pause'} size='lg' />
          </div>

          <span className='text-white time-ticker'>{formatTime(watchTime)}</span>

          <ProgressBar setTime={setTime} progressPercent={progressPercent} loadedPercent={loadedPercent} duration={duration} />

          <span className='text-white time-ticker'>{formatTime(duration - watchTime)}</span>

          <div className='toolbar-button cursor-pointer volume-icon' onClick={this.toggleVolume} >
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

          <div className='toolbar-button cursor-pointer' id='player-settings' onClick={this.toggleSettings} >
            <FontAwesomeIcon icon='cog' size='lg' />
          </div>

          <Popover container={fullscreen ? 'player' : 'body'} placement='top' trigger='legacy' isOpen={settingsOpen} target='player-settings' toggle={this.toggleSettings}>
            <PopoverBody>
              <div className='row'>
                <div className='col'>Quality</div>
                <div className='col'>
                  <select name='quality' id='quality-selector' value={quality} onChange={(e) => setQuality(e.target.value)}>
                    {levels.map((level, index) => <option key={`quality-${index}`} value={level}>{level}p</option>)}
                  </select>
                </div>
              </div>
              <div className='row pt-2'>
                <div className='col'>Speed</div>
                <div className='col'>
                  <select name='speed' id='speed-selector' value={speed} onChange={(e) => setSpeed(e.target.value)}>
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>
              </div>
            </PopoverBody>
          </Popover>

          <div className='toolbar-button cursor-pointer' onClick={() => toggleFullscreen()} >
            <FontAwesomeIcon icon={fullscreen ? 'compress' : 'expand'} size='lg' />
          </div>
        </div>
      </div>
    )
  }
}

export default Controls
