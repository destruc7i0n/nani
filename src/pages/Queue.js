import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getQueue } from '../actions'
import { Helmet } from 'react-helmet'

import Collection from '../components/Collections/Collection'

class Queue extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loaded: false
    }
  }

  async componentDidMount () {
    const { dispatch } = this.props
    try {
      await dispatch(getQueue(true))
      this.setState({ loaded: true })
    } catch (e) {
      console.error(e)
    }
  }

  render () {
    const { loaded } = this.state
    const { queue } = this.props
    const queueIds = queue.map((item) => item.most_likely_media.media_id)
    return (
      <Fragment>
        <Helmet defer={false}>
          <title>Queue</title>
        </Helmet>
        <Collection title='Queue' size='lg' mediaIds={queueIds} loading={!loaded && queueIds.length === 0} />
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    queue: store.Data.queue
  }
})(Queue)
