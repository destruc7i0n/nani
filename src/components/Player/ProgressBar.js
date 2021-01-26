import React, { Component } from 'react'

import classNames from 'classnames'

import { formatTime } from '../../lib/util'

import './ProgressBar.scss'

class ProgressBar extends Component {
  constructor (props) {
    super (props)

    this.state = {
      hovering: false,
      mousePosition: null,
      mouseDown: false,
    }

    this.barRef = React.createRef()
    this.timestampRef = React.createRef()

    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseDown = this.onMouseDown.bind(this)
    this.updateTime = this.updateTime.bind(this)
  }

  onMouseMove (e) {
    const { duration } = this.props
    const { mouseDown } = this.state

    const mousePosition = e.nativeEvent.layerX / this.barRef.current.clientWidth
    const time = Math.round(mousePosition * duration)

    if (time <= duration) {
      this.setState({
        hovering: true,
        time,
        mousePosition
      })
    }
    if (mouseDown) this.updateTime()
  }

  onMouseDown () {
    this.setState({ mouseDown: true })

    this.updateTime()
  }

  updateTime () {
    const { mousePosition, hovering } = this.state
    const { duration, setTime } = this.props

    if (hovering) setTime(Math.round(mousePosition * duration))
  }

  render () {
    const { hovering, mousePosition } = this.state
    const { progressPercent, loadedPercent, duration } = this.props
    return (
      <div
        className='video-progress'
        onMouseMove={this.onMouseMove}
        onMouseDown={this.onMouseDown}
        onMouseUp={() => this.setState({ mouseDown: false })}
        onMouseLeave={() => this.setState({ hovering: false, mouseDown: false })}
        onClick={this.updateTime}
      >
        <div
          ref={this.timestampRef}
          className={classNames('video-timestamp text-white', { 'd-none': !hovering })}
          // get the width of this element and remove half of it to center...
          style={{ left: `calc(${mousePosition * 100}% - ${((this.timestampRef.current && this.timestampRef.current.getBoundingClientRect().width) || 0) / 2}px)` }}
          >
          <div className='bg-dark rounded-pill px-2'>
            {formatTime(Math.round(mousePosition * duration))}
          </div>
        </div>
        <div className='progress' id='video-progress' ref={this.barRef}>
          <div className='progress-bar' style={{
            width: progressPercent * 100 + '%'
          }} />
          {loadedPercent > progressPercent && <div className='progress-bar bg-secondary progress-percent' style={{
            width: (loadedPercent - progressPercent) * 100 + '%'
          }} />}
        </div>
      </div>
    )
  }
}

export default ProgressBar
