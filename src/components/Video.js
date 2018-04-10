import React, { Component } from 'react'
import { connect } from 'react-redux'

import Clappr from 'clappr'
import LevelSelector from '../lib/clappr-level-selector'
import ChromecastPlugin from '../lib/clappr-chromecast-plugin'
import ResponsiveContainer from '../lib/clappr-responsive-container-plugin'

import withProxy from '../lib/withProxy'

import './Video.css'
import { updatePlaybackTime } from '../actions'

class Video extends Component {
  constructor (props) {
    super(props)
    // manually store the amount of time watched
    this.loggedTime = props.media.playhead
    // if already seeked
    this.seeked = false
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
    const { streamUrl, media, playCallback = () => null } = this.props
    if (streamUrl && media) {
      if (this.player) {
        this.destroyPlayer()
      }
      this.player = new Clappr.Player({
        parent: this.playerRef,
        source: streamUrl,
        poster: (media.screenshot_image && withProxy(media.screenshot_image.full_url)) || null,
        plugins: {
          core: [LevelSelector, ChromecastPlugin, ResponsiveContainer]
        },
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
        chromecast: {
          media: {
            type: ChromecastPlugin.TvSeries,
            title: media.name,
            subtitle: media.description
          }
        },
        disableVideoTagContextMenu: true
      })
      this.player.on(Clappr.Events.PLAYER_PLAY, () => {
        // seek video on first player play, this will fix it on mobile too!
        if (media.playhead && !this.seeked) {
          this.player.seek(media.playhead)
        }
        // run the callback
        playCallback()
        this.seeked = true
      })
      this.player.on(Clappr.Events.PLAYER_PAUSE, () => {
        this.logTime()
      })
      this.player.on(Clappr.Events.PLAYER_ENDED, () => {
        this.logTime(media.duration)
      })
    }
  }

  async logTime (t) {
    const { dispatch, id } = this.props
    const time = t || this.player.getCurrentTime()
    // log time only if it's greater than what is saved
    if (time !== 0 && time > this.loggedTime && process.env.NODE_ENV === 'production') {
      await dispatch(updatePlaybackTime(time, id))
      this.loggedTime = time
    }
  }

  render () {
    return (
      <div ref={el => { this.playerRef = el }} />
    )
  }
}

export default connect((store, props) => {
  return {
    Auth: store.Auth,
    media: store.Data.media[props.id]
  }
})(Video)
