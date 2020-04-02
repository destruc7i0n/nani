import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getQueue } from '../actions'
import { Helmet } from 'react-helmet'

import { parse } from 'qs'

import Collection from '../components/Collections/Collection'
import SeriesCardCollection from '../components/Collections/SeriesCardCollection'

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
    const { type: viewType = 'episodes' } = parse(this.props.location.search.slice(1))

    const queueIds = queue
      .filter(item => item.most_likely_media !== undefined)
      .map((item) => item.most_likely_media.media_id)
    const queueSeries = queue.map((item) => item.series)
    return (
      <Fragment>
        <Helmet defer={false}>
          <title>Queue</title>
        </Helmet>
        {
          viewType === 'watchlist'
            ? <SeriesCardCollection
              title='Queue'
              series={queueSeries}
              loading={!loaded && queueSeries.length === 0} />
            : <Collection
              title='Queue'
              size='lg'
              mediaIds={queueIds}
              loading={!loaded && queueIds.length === 0} />
        }
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    queue: store.Data.queue
  }
})(Queue)
