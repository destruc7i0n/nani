import React, { Component } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import classNames from 'classnames'

import { formatTime } from '../../lib/util'

import ProgressBar from './ProgressBar'

import './Controls.scss'

class Controls extends Component {
  constructor (props) {
    super (props)

    this.state = {
      hovering: false,
    }

    this.hoverTimeout = null

    this.toggleVisibility = this.toggleVisibility.bind(this)
    this.handleMouseLeave = this.handleMouseLeave.bind(this)
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
      togglePlay,
      setQuality,
      quality,
      levels,
      duration = media.duration,
      watchTime = media.playhead
    } = this.props

    return (
      <div className={classNames('controls', { 'visible': hovering })} onMouseMove={this.toggleVisibility} onMouseOut={this.handleMouseLeave}>
        <div className='cover' onClick={togglePlay} />

        <div className='episode-information'>
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
