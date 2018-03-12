import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getSeriesInfo, getCollectionsForSeries } from '../actions'

import { Link } from 'react-router-dom'

import Collection from '../components/Collection'

class Series extends Component {
  async componentWillMount () {
    const { dispatch, match: { params } } = this.props
    try {
      await dispatch(getSeriesInfo(params.id))
      await dispatch(getCollectionsForSeries(params.id))
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    console.log('render')
    const { match: { params: { id } }, series, seriesCollections, collections } = this.props
    const loaded = series[id] && seriesCollections[id]
    return (
      <div>
        <Link to='/'>
          <button type='button'>
            Home
          </button>
        </Link>
        <br />
        {!loaded ? 'Loading...' : (
          <div>
            <strong>{series[id].name}</strong>
            <p>{series[id].description}</p>
            <br />
            <img src={series[id].portrait_image.full_url} style={{ maxWidth: '300px' }} alt={series[id].name} />
            <br />
            <ul>
              {
                seriesCollections[id].map((collection, index) => (
                  <Fragment key={`collectionTitle-${index}`}>
                    <li><strong>{collections[collection].name}</strong></li>
                    <ul>
                      <Collection id={collection} collectionId={id} index={index} />
                    </ul>
                  </Fragment>
                ))
              }
            </ul>
          </div>
        )}
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
