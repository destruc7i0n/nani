import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getQueue, updatePlaybackTime } from '../../actions'

import { Button } from 'reactstrap'

import classNames from 'classnames'

class WatchedButton extends Component {
  constructor (props) {
    super(props)
    this.handle = this.handle.bind(this)
  }

  async handle (e) {
    e.preventDefault()
    const { dispatch, media, refreshQueue } = this.props
    const { media_id: mediaId, duration } = media
    try {
      await dispatch(updatePlaybackTime(duration, mediaId))
      if (refreshQueue) {
        await dispatch(getQueue(true))
      }
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    // grab some unnecessary props to make them not go into the tag (because of ...props)
    const { dispatch, media, className, ...props } = this.props
    return (
      <Button
        color='light'
        onClick={this.handle}
        className={classNames(className, 'mw-100 text-truncate')
        } {...props}>
        Mark as Watched
      </Button>
    )
  }
}

export default connect()(WatchedButton)
