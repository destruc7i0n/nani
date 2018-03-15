import React, { Component } from 'react'
import { connect } from 'react-redux'

import Clappr from 'clappr'
import LevelSelector from '../lib/clappr-level-selector'

import api, { LOCALE, VERSION } from '../lib/api'

import './Video.css'

class Video extends Component {
  constructor (props) {
    super(props)
    this.logTime = this.logTime.bind(this)
  }

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
    const { streamUrl, poster, seek = 0, media } = this.props
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
      if (seek) {
        this.player.seek(seek)
      }
      this.player.on(Clappr.Events.PLAYER_PAUSE, () => {
        this.logTime()
      })
      this.player.on(Clappr.Events.PLAYER_ENDED, () => {
        this.logTime(media.duration)
      })
    }
  }

  logTime (t) {
    const { Auth, id } = this.props
    const time = t || this.player.getCurrentTime()
    if (time !== 0 && process.env.NODE_ENV === 'production') {
      const data = new FormData()
      data.append('session_id', Auth.session_id)
      data.append('event', 'playback_status')
      data.append('playhead', time)
      data.append('media_id', id)
      data.append('locale', LOCALE)
      data.append('version', VERSION)
      api({
        method: 'post',
        route: 'log',
        data
      })
    }
  }

  render () {
    return (
      <div className='embed-responsive sort-of-center'>
        <div ref={el => { this.playerRef = el }} />
      </div>
    )
  }
}

export default connect((store, props) => {
  return {
    Auth: store.Auth,
    media: store.Data.media[props.id]
  }
})(Video)
