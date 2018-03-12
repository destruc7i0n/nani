import React, { Component } from 'react'

import Clappr from 'clappr'
import LevelSelector from '../lib/clappr-level-selector'

class Video extends Component {
  // ignore updates!
  shouldComponentUpdate () {
    return false
  }

  componentDidMount () {
    this.change()
  }

  componentWillUnmount () {
    this.destroyPlayer()
  }

  destroyPlayer () {
    if (this.player) {
      this.player.destroy()
    }
    this.player = null
  }

  change () {
    const { streamUrl, poster } = this.props
    if (streamUrl && poster) {
      if (this.player) {
        this.destroyPlayer()
      }
      this.player = new Clappr.Player({
        parent: this.playerRef,
        source: streamUrl,
        poster: poster,
        plugins: [LevelSelector],
        levelSelectorConfig: {
          title: 'Quality',
          labels: {
            4: '1080p',
            3: '720p',
            2: '480p',
            1: '360p',
            0: '240p'
          }
        },
        disableVideoTagContextMenu: true
      })
    }
  }

  render () {
    return (
      <div>
        <div ref={el => { this.playerRef = el }} />
      </div>
    )
  }
}

export default Video
