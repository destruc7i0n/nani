import React, { Component } from 'react'

import './Volume.scss'

class Volume extends Component {
  constructor (props) {
    super (props)

    this.state = {
      mousePosition: null,
      mouseDown: false,
      localVolume: props.volumePercent,
    }

    this.sliderRef = React.createRef()

    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseDown = this.onMouseDown.bind(this)
  }

  onMouseMove (e) {
    const { mouseDown } = this.state
    const { setVolume } = this.props

    const position = e.nativeEvent.layerX / this.sliderRef.current.clientWidth

    this.setState({
      mousePosition: position
    })

    if (mouseDown) {
      setVolume(position)
    }
  }

  onMouseDown () {
    const { mousePosition } = this.state
    const { setVolume } = this.props

    this.setState({ mouseDown: true })

    setVolume(mousePosition)
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
