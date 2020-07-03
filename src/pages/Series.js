import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getSeriesInfo, getCollectionsForSeries, getAniListItem } from '../actions'
import { Helmet } from 'react-helmet'

import { Badge, Alert, Card, CardBody } from 'reactstrap'

import { Img } from 'react-image'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { startCase } from 'lodash'
import moment from 'moment'

import Collection from '../components/Collections/Collection'
import SeriesCollection from '../components/Collections/SeriesCollection'
import QueueButton from '../components/Buttons/QueueButton'
import ImageLoader from '../components/Loading/ImageLoader'
import LoadingSeriesPage from '../components/Loading/LoadingSeriesPage'

import withProxy, { replaceHttps } from '../lib/withProxy'

import './Series.css'

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
    const {
      dispatch,
      match: {params: {id}},
      series: {[id]: series},
      seriesCollections: {[id]: seriesCollection = []},
      collections,
      anilist: {token},
      anilistCollections,
      hash
    } = this.props
    const loaded = series && seriesCollection
    const portraitImgFullURL = series && series.portrait_image && series.portrait_image.full_url
    const landscapeImgFullURL = series && series.landscape_image && series.landscape_image.full_url

    // the latest collection would probably be the last one in the list...
    const latestCollectionId = loaded && seriesCollection[seriesCollection.length - 1]
    const latestCollection = latestCollectionId && collections[latestCollectionId]

    // load the latest collection
    if (token && latestCollection) {
      try {
        dispatch(getAniListItem(latestCollection.name, latestCollectionId))
      } catch (e) {
        console.error(e)
      }
    }

    // check if the collection has been loaded
    let anilistItem = null
    if (anilistCollections) {
      anilistItem = anilistCollections[latestCollectionId]
    }

    let loadedCollection = ''
    if (seriesCollection.length) {
      loadedCollection = seriesCollection[0]

      // check if the hash is valid, then load it
      if (hash) {
        if (hash.startsWith('#collection_')) {
          const collection = hash.replace('#collection_', '')
          if (seriesCollection.includes(collection)) {
            loadedCollection = collection
          }
        }
      }
    }

    const isSmallScreen = window.matchMedia('(max-width: 576px)').matches

    return (
      <Fragment>
        <Helmet defer={false}>
          <title>{ loaded ? series.name : 'Loading...' }</title>
        </Helmet>
        { <h1 className='col-sm-12 text-center text-danger'>{error}</h1> || null }
        { !loaded
          ? (
            <LoadingSeriesPage />
          )
          : (
            <Fragment>
              <div className='series-banner' style={{
                background: landscapeImgFullURL ? [
                  `url(${withProxy(landscapeImgFullURL)}) top left / cover no-repeat`,
                  `url(${replaceHttps(landscapeImgFullURL)}) top left / cover no-repeat`
                ].join(', ') : 'https://via.placeholder.com/1920x1080?text=No+Image'
              }}>
                <div className='series-banner-overlay' />
              </div>
              <div className='container'>
                <Card className='border-0 over-banner'>
                  <CardBody className='main-details-card-body'>
                    <div className='row'>
                      <div className='col-sm-4 col-lg-3' style={isSmallScreen ? { marginTop: '-100px' } : {}}>
                        <div>
                          <Img loader={<ImageLoader height={300} />} src={portraitImgFullURL ? [
                            withProxy(portraitImgFullURL),
                            replaceHttps(portraitImgFullURL)
                          ] : 'https://via.placeholder.com/640x960?text=No+Image'} alt={series.name} className='img-fluid shadow-sm w-100' />
                          <QueueButton id={id} block className='mt-2' />
                        </div>
                      </div>
                      <div className='col-sm-8 col-lg-9'>
                        <h1>{series.name}</h1>
                        <p>{series.description}</p>
                        { anilistItem && anilistItem.nextAiringEpisode
                          ? <Alert>
                            <Badge color='primary'>AniList</Badge>
                            {' '}The next episode of <strong>{anilistItem.title.english || anilistItem.title.romaji}</strong> will air
                            {' '}{moment.unix(anilistItem.nextAiringEpisode.airingAt).fromNow()}.
                          </Alert>
                          : null }
                        <div className='rating font-weight-bold pb-2'>
                          {series.rating / 10} / 10
                          {' '}
                          <FontAwesomeIcon icon='star' className='text-warning mr-1' />
                          {
                            series.genres.map((genre, index) =>
                              <Badge color='info' key={`genre-${index}`} className='mr-1'>
                                {startCase(genre)}
                              </Badge>
                            )
                          }
                        </div>
                        {seriesCollection.map((collectionId, index) =>
                          <SeriesCollection
                            index={index}
                            key={`seriesCollection-${collectionId}`}
                            defaultLoaded={collectionId === loadedCollection}
                            id={collectionId}
                            showTitle={seriesCollection.length > 1}
                            title={collections[collectionId].name} />
                        )}
                        {!seriesCollection.length
                          ? (
                            <div className='mt-4'>
                              <Collection loading perPage={3} showTitle titleTag='h4' title={series.name} />
                            </div>
                          )
                          : null}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </Fragment>
          )
        }
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    media: store.Data.media,
    series: store.Data.series,
    seriesCollections: store.Data.seriesCollections,
    collections: store.Data.collections,

    anilist: store.Auth.anilist,
    anilistCollections: store.Data.anilist,

    hash: store.router.location.hash
  }
})(Series)
