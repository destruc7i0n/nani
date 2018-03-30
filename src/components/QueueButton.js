import React, { Component } from 'react'
import { connect } from 'react-redux'
import { updateSeriesQueue } from '../actions'

import { Button, Badge } from 'reactstrap'

class QueueButton extends Component {
  constructor (props) {
    super(props)
    const { inQueue, id, series } = props
    this.state = {
      // set from the prop or from the series object directly
      inQueue: inQueue || (series[id] && series[id].in_queue)
    }
    this.handle = this.handle.bind(this)
  }

  async handle (e) {
    e.preventDefault()
    const { inQueue } = this.state
    const { dispatch, id } = this.props
    try {
      await dispatch(updateSeriesQueue({ id, inQueue }))
      this.setState({ inQueue: !inQueue })
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    const { inQueue } = this.state
    // grab some unnecessary props to make them not go into the tag (because of ...props)
    const { dispatch, badge, inQueue: isInQueue, ...props } = this.props

    let Tag, attrs
    if (badge) {
      Tag = Badge
      attrs = {
        ...props,
        href: '#'
      }
    } else {
      Tag = Button
      attrs = {...props}
    }
    return (
      <Tag color={inQueue ? 'danger' : 'success'} onClick={this.handle} {...attrs}>
        {inQueue ? 'Remove from Queue' : 'Add to Queue'}
      </Tag>
    )
  }
}

export default connect((store) => {
  return {
    series: store.Data.series
  }
})(QueueButton)
