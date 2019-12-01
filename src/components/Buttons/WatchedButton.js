import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getQueue, updatePlaybackTime } from '../../actions'

import { Badge, Button } from 'reactstrap'

import classNames from 'classnames'

class WatchedButton extends Component {
  constructor (props) {
    super(props)
    this.handle = this.handle.bind(this)

    this.state = {
      visible: false
    }
  }

  componentDidMount () {
    this.refreshVisible()
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (prevProps.media.media_id !== this.props.media.media_id) {
      this.refreshVisible()
    }
  }

  refreshVisible () {
    const { media } = this.props
    if (media.playhead !== null && media.duration && media.playhead !== media.duration) {
      this.setState({ visible: true })
    }
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
      this.setState({ visible: false })
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    const { visible } = this.state
    // grab some unnecessary props to make them not go into the tag (because of ...props)
    const { dispatch, media, className, badge, ...props } = this.props

    let Tag, attrs
    if (badge) {
      Tag = Badge
      attrs = {
        ...props,
        href: '#'
      }
    } else {
      Tag = Button
      attrs = props
    }

    return visible ? (
      <Tag
        color='light'
        onClick={this.handle}
        className={classNames(className, 'mw-100 text-truncate cursor-pointer')
        } {...attrs}>
        Mark as Watched
      </Tag>
    ) : null
  }
}

export default connect()(WatchedButton)
