import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getHistory, getQueue } from '../actions'
import { Helmet } from 'react-helmet'

import Collection from '../components/Collections/Collection'

class Dashboard extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loaded: false
    }
  }

  async componentDidMount () {
    const { dispatch } = this.props
    try {
      await dispatch(getQueue())
      await dispatch(getHistory())
      this.setState({ loaded: true })
    } catch (e) {
      console.error(e)
    }
  }

  render () {
    const { loaded } = this.state
    const { queue, history } = this.props
    const queueIds = queue.map((item) => item.most_likely_media.media_id)
    const historyIds = history.map((item) => item.media.media_id)
    return (
      <Fragment>
        <Helmet defer={false}>
          <title>Dashboard</title>
        </Helmet>
        <Collection title='Queue' mediaIds={queueIds} loading={!loaded && queueIds.length === 0} />
        <Collection title='History' mediaIds={historyIds} loading={!loaded && historyIds.length === 0} />
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    queue: store.Data.queue,
    history: store.Data.history.data
  }
})(Dashboard)
