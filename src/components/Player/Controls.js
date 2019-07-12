import React, { Component } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import classNames from 'classnames'

import { DoubleEventHandler, formatTime } from '../../lib/util'

import ProgressBar from './ProgressBar'

import './Controls.scss'

class Controls extends Component {
  constructor (props) {
    super (props)

    this.state = {
      hovering: false,
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

  render () {
    const { hovering } = this.state
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
      setQuality,
      quality,
      levels,
    } = this.props

    let duration = this.props.duration || media.duration
    let watchTime = this.props.watchTime || media.playhead

    const controlsVisible = hovering || paused

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

        <div className='toolbar'>
          <div className='toolbar-button cursor-pointer' onClick={() => paused ? play() : pause()} >
            <FontAwesomeIcon icon={paused ? 'play' : 'pause'} size='lg' />
          </div>

          <span className='text-white time-ticker'>{formatTime(watchTime)}</span>

          <ProgressBar setTime={setTime} progressPercent={progressPercent} loadedPercent={loadedPercent} duration={duration} />

          <span className='text-white time-ticker'>{formatTime(duration - watchTime)}</span>

          {fullscreen && <select name="quality" id="quality-selector" value={quality} onChange={(e) => setQuality(e.target.value)}>
            {levels.map((level, index) => <option key={`quality-${index}`} value={level}>{level}p</option>)}
          </select>}

          <div className='toolbar-button cursor-pointer' onClick={() => toggleFullscreen()} >
            <FontAwesomeIcon icon={fullscreen ? 'compress' : 'expand'} size='lg' />
          </div>
        </div>
      </div>
    )
  }
}

export default Controls
