import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getHistory, getQueue } from '../actions'
import { Helmet } from 'react-helmet'

import Collection from '../components/Collection'

class Dashboard extends Component {
  async componentDidMount () {
    const { dispatch } = this.props
    try {
      await dispatch(getQueue())
      await dispatch(getHistory())
    } catch (e) {
      console.error(e)
    }
  }

  render () {
    const { queue, history } = this.props
    const queueIds = queue.map((item) => item.most_likely_media.media_id)
    const historyIds = history.map((item) => item.media.media_id)
    return (
      <Fragment>
        <Helmet>
          <title>Dashboard - nani</title>
        </Helmet>
        <Collection title='Queue' mediaIds={queueIds} loading={queueIds.length === 0} />
        <Collection title='History' mediaIds={historyIds} loading={historyIds.length === 0} />
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    queue: store.Data.queue,
    history: store.Data.history
  }
})(Dashboard)
