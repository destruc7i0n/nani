import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getSeriesInfo, getCollectionsForSeries } from '../actions'
import { Helmet } from 'react-helmet'

import { Badge, Button } from 'reactstrap'

import Img from 'react-image'

import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faStar from '@fortawesome/fontawesome-free-solid/faStar'
import faSearch from '@fortawesome/fontawesome-free-solid/faSearch'

import { startCase } from 'lodash'

import SeriesCollection from '../components/Collections/SeriesCollection'
import Loading from '../components/Loading/Loading'
import QueueButton from '../components/Buttons/QueueButton'
import ImageLoader from '../components/Loading/ImageLoader'

import withProxy from '../lib/withProxy'

class Series extends Component {
  constructor (props) {
    super(props)
    this.state = {
      seriesId: '',
      error: ''
    }
    this.load = this.load.bind(this)
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    const { match: { params: { id: nextSeries } = {} } } = nextProps
    const { seriesId: prevSeries } = prevState
    if (nextSeries !== prevSeries) {
      return {
        seriesId: nextSeries,
        error: ''
      }
    }
    return null
  }

  async componentDidMount () {
    await this.load()
  }

  async componentDidUpdate (prevProps, prevState) {
    const { seriesId: nextSeries } = this.state
    const { seriesId: prevSeries } = prevState
    // check that the next id isn't the same as the old, then load
    if (nextSeries !== prevSeries) {
      await this.load()
    }
  }

  async load () {
    const { seriesId: id } = this.state
    const { dispatch } = this.props
    try {
      await dispatch(getSeriesInfo(id))
      await dispatch(getCollectionsForSeries(id))
    } catch (err) {
      console.error(err)
      this.setState({ error: err.data.message || 'An error occurred.' })
    }
  }

  render () {
    const { error } = this.state
    const { match: { params: { id } }, series, seriesCollections, collections } = this.props
    const loaded = series[id] && seriesCollections[id]
    const imgFullURL = series[id] && series[id].portrait_image && series[id].portrait_image.full_url
    return (
      <div className='row'>
        <Helmet defer={false}>
          <title>{ loaded ? series[id].name : 'Loading...' }</title>
        </Helmet>
        { <h1 className='col-sm-12 text-center text-danger'>{error}</h1> || null }
        {!loaded
          ? (
            <Loading />
          )
          : (
            <Fragment>
              <div className='col-sm-4 col-lg-3'>
                <Img loader={<ImageLoader height={300} />} src={imgFullURL ? [
                  withProxy(imgFullURL),
                  imgFullURL
                ] : 'https://via.placeholder.com/640x960?text=No+Image'} alt={series[id].name} className='img-thumbnail' />
                <QueueButton id={id} block className='mt-2' />
                <Button className='text-truncate' block color='light' href={
                  `https://myanimelist.net/search/all?q=${series[id].name}`
                } target='_blank' rel='noopener noreferrer'>
                  <FontAwesomeIcon icon={faSearch} />
                  {' '}
                  Find on MyAnimeList
                </Button>
              </div>
              <div className='col-sm-8 col-lg-9'>
                <h1>{series[id].name}</h1>
                <p>{series[id].description}</p>
                <div className='font-weight-bold pb-2'>
                  {series[id].rating / 10} / 10
                  {' '}
                  <FontAwesomeIcon icon={faStar} className='text-warning' />
                  {
                    series[id].genres.map((genre, index) =>
                      <Badge color='info' key={`genre-${index}`} className='ml-1'>
                        {startCase(genre)}
                      </Badge>
                    )
                  }
                </div>
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
