import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getSeriesInfo, getCollectionsForSeries } from '../actions'
import { Helmet } from 'react-helmet'

import SeriesCollection from '../components/SeriesCollection'
import Loading from '../components/Loading'
import QueueButton from '../components/QueueButton'

class Series extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: ''
    }
    this.load = this.load.bind(this)
  }

  async componentWillMount () {
    const { match: { params } } = this.props
    await this.load(params.id)
  }

  async componentWillReceiveProps (nextProps) {
    const { match: { params } } = this.props
    const { match: { params: nextParams } } = nextProps
    if (nextParams.id !== params.id) {
      await this.load(nextParams.id)
    }
  }

  async load (id) {
    const { dispatch } = this.props
    try {
      await dispatch(getSeriesInfo(id))
      await dispatch(getCollectionsForSeries(id))
    } catch (err) {
      console.error(err)
      this.setState({ error: err.data.message || true })
    }
  }

  render () {
    const { error } = this.state
    const { match: { params: { id } }, series, seriesCollections, collections } = this.props
    const loaded = series[id] && seriesCollections[id]
    return (
      <div className='row'>
        <Helmet>
          <title>{ loaded ? series[id].name : 'Loading...' } - nani</title>
        </Helmet>
        { <h1 className='col-sm-12 text-center text-danger'>{error}</h1> || null }
        {!loaded
          ? (
            <Loading />
          )
          : (
            <Fragment>
              <div className='col-sm-3'>
                <img src={series[id].portrait_image.full_url} alt={series[id].name} className='img-thumbnail' />
                <QueueButton inQueue={series[id].in_queue} id={id} />
              </div>
              <div className='col-sm-9'>
                <h1>{series[id].name}</h1>
                <p>{series[id].description}</p>
                {seriesCollections[id].map((collectionId, index) =>
                  <SeriesCollection
                    key={`seriesCollection-${collectionId}`}
                    index={index}
                    id={collectionId}
                    showTitle={seriesCollections[id].length > 1}
                    title={collections[collectionId].name} />)}
              </div>
            </Fragment>
          )
        }
      </div>
    )
  }
}

export default connect((store) => {
  return {
    media: store.Data.media,
    series: store.Data.series,
    seriesCollections: store.Data.seriesCollections,
    collections: store.Data.collections,
    collectionMedia: store.Data.collectionMedia
  }
})(Series)
