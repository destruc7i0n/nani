import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getHistory, getQueue, getRecent, getSeriesList } from '../actions'
import { Helmet } from 'react-helmet'

import Collection from '../components/Collections/Collection'
import SeriesCardCollection from '../components/Collections/SeriesCardCollection'

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
      // get these immediately
      await dispatch(getQueue())
      await dispatch(getHistory())
      // it's loaded the necessary stuff!
      this.setState({ loaded: true })
      // we can wait on this...
      dispatch(getRecent())
      dispatch(getSeriesList('popular'))
    } catch (e) {
      console.error(e)
    }
  }

  render () {
    const { loaded } = this.state
    const { queue, history, recent, list } = this.props
    // combine the uncompleted history with the current queue
    const uncompletedHistory = history
      .filter((item) => item.media.playhead / item.media.duration < 0.9)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map((item) => item.media.media_id)

    const queueIds = queue
      .map((item) => item.most_likely_media.media_id)
      .filter((id) => !uncompletedHistory.includes(id))

    // make sure that everything is loaded
    const continueIds = [...uncompletedHistory, ...queueIds]
    // grab all the series from the queue
    const queueSeries = queue
      .map((item) => item.series)
      .slice(0, 6)

    // grab the recently updated shows
    const recentlyUpdated = recent.slice(0, 6)

    // grab the most popular shows
    const mostPopular = list && list.type === 'popular'
      ? list.list.slice(0, 6)
      : []
    return (
      <Fragment>
        <Helmet defer={false}>
          <title>Dashboard</title>
        </Helmet>
        <Collection title='Continue Watching' mediaIds={continueIds} loading={!loaded} loadingCardsCount={4} />
        <SeriesCardCollection
          title='Watchlist'
          link='/queue'
          series={queueSeries}
          loading={!loaded && queueSeries.length === 0}
          loadingCardsCount={6} />
        <SeriesCardCollection
          title='Recently Updated'
          link='/list/newest'
          series={recentlyUpdated}
          loading={recentlyUpdated.length === 0}
          loadingCardsCount={6} />
        <SeriesCardCollection
          title='Most Popular'
          link='/list/popular'
          series={mostPopular}
          loading={mostPopular.length === 0}
          loadingCardsCount={6} />
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    queue: store.Data.queue,
    history: store.Data.history.data,
    recent: store.Data.recent,
    list: store.Data.list
  }
})(Dashboard)
