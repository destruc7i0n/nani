import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getHistory, getQueue, getRecent, getSeriesList } from '../actions'
import { Helmet } from 'react-helmet'

import Collection from '../components/Collections/Collection'
import SeriesCardCollection from '../components/Collections/SeriesCardCollection'
import { isEpisodeCompletedApprox } from '../lib/util'

const DAY = 1000 * 60 * 60 * 24
const daysSince = (timestamp) => Math.round(Math.abs((new Date() - new Date(timestamp)) / DAY))

class Dashboard extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loaded: false
    }
  }

  async componentDidMount () {
    const { dispatch, guest, queue, history } = this.props
    try {
      if (!guest) {
        let tasks = [
          dispatch(getQueue(true)),
          dispatch(getHistory({}, false, true))
        ]
        // if there's no data, show the loaders and load
        if (!queue.length || !history.length) {
          await Promise.all(tasks)
        } else {
          // otherwise, get it in the background to not show loaders all the time
          Promise.all(tasks)
        }
      }
      // it's loaded the necessary stuff!
      this.setState({ loaded: true })
      // we can wait on this...
      dispatch(getRecent(true))
      dispatch(getSeriesList('popular', true))
      dispatch(getSeriesList('simulcast', true))
    } catch (e) {
      console.error(e)
    }
  }

  render () {
    const { loaded } = this.state
    const { guest, queue, history, recent, list, continueCount = 4 } = this.props

    const cardCount = guest ? 12 : 6

    // combine the uncompleted history with the current queue

    const queueIds = queue
      .filter(item => item.most_likely_media !== undefined)
      .map((item) => item.most_likely_media.media_id)

    // grab all the series from the queue
    let queueSeries = queue
      .map((item) => item.series)

    const queueSeriesIds = queueSeries
      .map(item => item.series_id)

    queueSeries = queueSeries.slice(0, 6)

    const uncompletedHistory = history
      .filter((item) => isEpisodeCompletedApprox(item.media.playhead, item.media.duration))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      // not in the queue
      .filter((item) => !queueSeriesIds.includes(item.series.series_id))
      // not more than 7 days old
      .filter((item) => item.timestamp && daysSince(item.timestamp) <= 7)
      .map((item) => item.media.media_id)

    // combine the lists and only take the first few
    const continueIds = [...queueIds, ...uncompletedHistory].slice(0, continueCount)

    // grab the recently updated shows
    const recentlyUpdated = recent.slice(0, cardCount)

    // grab the most popular shows
    const mostPopular = list && list['popular']
      ? list['popular'].list.slice(0, cardCount)
      : []

    // grab the simulcasts
    const simulcasts = list && list['simulcast']
      ? list['simulcast'].list.slice(0, cardCount)
      : []
    return (
      <Fragment>
        <Helmet defer={false}>
          <title>Dashboard</title>
        </Helmet>
        {!guest ? <Fragment>
          <Collection title='Continue Watching' mediaIds={continueIds} loading={!loaded} loadingCardsCount={continueCount || 4} />
          <SeriesCardCollection
            title='Watchlist'
            link='/queue?type=watchlist'
            series={queueSeries}
            loading={!loaded && queueSeries.length === 0}
            loadingCardsCount={6} />
        </Fragment> : null}
        <SeriesCardCollection
          title='Recently Updated'
          link='/recent'
          series={recentlyUpdated}
          loading={recentlyUpdated.length === 0}
          loadingCardsCount={cardCount} />
        <SeriesCardCollection
          title='Most Popular'
          link='/list/popular'
          series={mostPopular}
          loading={mostPopular.length === 0}
          loadingCardsCount={cardCount} />
        <SeriesCardCollection
          title='Simulcasts'
          link='/list/simulcast'
          series={simulcasts}
          loading={simulcasts.length === 0}
          loadingCardsCount={cardCount} />
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    guest: store.Auth.guest,

    queue: store.Data.queue,
    history: store.Data.history.data,
    recent: store.Data.recent,
    list: store.Data.list,

    continueCount: store.Options.homepageContinueCount
  }
})(Dashboard)
