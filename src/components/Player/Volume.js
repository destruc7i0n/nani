import React, { Component } from 'react'

import './Volume.scss'

class Volume extends Component {
  constructor (props) {
    super (props)

    this.state = {
      mousePosition: null,
      mouseDown: false,
    }

    this.sliderRef = React.createRef()

    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseDown = this.onMouseDown.bind(this)
    this.setVolume = this.setVolume.bind(this)
  }

  onMouseMove (e) {
    const { mouseDown } = this.state

    const position = e.nativeEvent.layerX / this.sliderRef.current.clientWidth

    this.setState({
      mousePosition: position
    })

    if (mouseDown) {
      this.setVolume(position)
    }
  }

  onMouseDown () {
    const { mousePosition } = this.state

    this.setState({ mouseDown: true })

    this.setVolume(mousePosition)
  }

  setVolume (value) {
    const { setVolume } = this.props

    const clamp = (...v) => v.sort((a,b) => a-b)[1]

    setVolume(
      clamp(value, 0, 1)
    )
  }

  render () {
    const { volumePercent } = this.props
    return (
      <div
        className='volume-slider d-none d-lg-block'
        onMouseMove={this.onMouseMove}
        onMouseLeave={() => this.setState({ hovering: false, mouseDown: false })}
        onMouseDown={this.onMouseDown}
        onMouseUp={() => this.setState({ mouseDown: false })}
      >
        <div className='progress' id='volume-slider' ref={this.sliderRef}>
          <div className='progress-bar' style={{
            width: volumePercent * 100 + '%'
          }} />
        </div>
      </div>
    )
  }
}

export default Volume
