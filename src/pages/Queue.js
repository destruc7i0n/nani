import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getQueue } from '../actions'
import { Helmet } from 'react-helmet'

import Collection from '../components/Collection'

class Queue extends Component {
  async componentDidMount () {
    const { dispatch } = this.props
    try {
      await dispatch(getQueue(true))
    } catch (e) {
      console.error(e)
    }
  }

  render () {
    const { queue } = this.props
    const queueIds = queue.map((item) => item.most_likely_media.media_id)
    return (
      <Fragment>
        <Helmet>
          <title>Queue - nani</title>
        </Helmet>
        <Collection title='Queue' perPage={1} size='lg' mediaIds={queueIds} loading={queueIds.length === 0} />
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    queue: store.Data.queue
  }
})(Queue)
