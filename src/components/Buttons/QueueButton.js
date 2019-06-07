import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { updateSeriesQueue } from '../../actions'

import { Button, Badge } from 'reactstrap'

import classNames from 'classnames'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class QueueButton extends Component {
  constructor (props) {
    super(props)
    this.state = {
      inQueue: false
    }
    this.handle = this.handle.bind(this)
  }

  // update each time the props are updated
  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.inQueue !== prevState.inQueue) {
      return {
        inQueue: nextProps.inQueue
      }
    }
    return {}
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
    const { dispatch, Auth, series, id, badge, inQueue: isInQueue, className, colored, ...props } = this.props

    if (Auth.guest) return null

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

    return (
      <Tag
        color={colored
          ? inQueue
            ? 'danger'
            : 'success'
          : 'light'}
        onClick={this.handle}
        className={classNames(
          className, {
            // only use these if not colored button
            'text-danger': !colored && inQueue,
            'text-success': !colored && !inQueue
          }, 'mw-100 text-truncate')
        } {...attrs}>
        {inQueue
          ? <Fragment><FontAwesomeIcon icon='minus' /> Remove from Queue</Fragment>
          : <Fragment><FontAwesomeIcon icon='plus' /> Add to Queue</Fragment>}
      </Tag>
    )
  }
}

export default connect((store, props) => {
  const { id, inQueue } = props
  const currentSeries = store.Data.series[id]
  return {
    Auth: store.Auth,
    inQueue: inQueue || (currentSeries && currentSeries.in_queue)
  }
})(QueueButton)
