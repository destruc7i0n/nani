import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getMediaForCollection, getMediaInfo, getSeriesInfo } from '../actions'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import { Badge } from 'reactstrap'

import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import {
  faTv,
  faClock,
  faSearch,
  faListOl
} from '@fortawesome/fontawesome-free-solid'

import Video from '../components/Video'
import Collection from '../components/Collection'
import MALButton from '../components/MALButton'
import QueueButton from '../components/QueueButton'
import Loading from '../components/Loading'

import api from '../lib/api'
import useProxy from '../lib/useProxy'

import './Media.css'

class Media extends Component {
  constructor (props) {
    super(props)
    this.state = {
      streamData: {},
      error: ''
    }
    this.loadVideo = this.loadVideo.bind(this)
  }

  async componentDidMount () {
    const { match: { params } } = this.props
    await this.loadVideo(params.media)
  }

  async componentWillReceiveProps (nextProps) {
    const { match: { params } } = this.props
    const { match: { params: nextParams } } = nextProps
    // check if the media isn't the same, then load
    if (nextParams.media !== params.media) {
      await this.loadVideo(nextParams.media)
    }
  }

  async loadVideo (mediaId) {
    const { dispatch, Auth } = this.props
    try {
      const media = await dispatch(getMediaInfo(mediaId))
      // only if available
      if (media.available) {
        await dispatch(getMediaForCollection(media.collection_id))
        await dispatch(getSeriesInfo(media.series_id))
        const video = await api({route: 'info', params: {session_id: Auth.session_id, media_id: mediaId, fields: 'media.stream_data,media.media_id'}})
        this.setState({
          streamData: video.data.data
        })
      } else {
        this.setState({ error: 'This is not available.' })
      }
    } catch (err) {
      this.setState({ error: err.data.message || 'An error occurred.' })
      console.error(err)
    }
  }

  render () {
    const { streamData, error } = this.state
    const { match: { params: { media: mediaId } }, media, collectionMedia, series } = this.props
    // the current media object and the series
    const mediaObj = media[mediaId]
    const currentSeries = mediaObj && series ? series[mediaObj.series_id] : null
    // check that both of the above are loaded and no error
    const loadedDetails = mediaObj && currentSeries && !error
    // check that the video URL exists
    const loadedVideo = Object.keys(streamData).length > 0 && streamData.media_id === mediaId
    // remove episodes that are before the one currently being watched
    const nextEpisodes = mediaObj && collectionMedia[mediaObj.collection_id]
      ? collectionMedia[mediaObj.collection_id].filter((collectionMediaId) => Number(collectionMediaId) > Number(mediaId))
      : false
    // small function to format time
    const formatTime = (secs) => {
      const minutes = Math.floor(secs / 60)
      let seconds = secs - (minutes * 60)
      seconds = seconds < 10 ? `0${seconds}` : seconds
      return `${minutes}:${seconds}`
    }
    return (
      <Fragment>
        <Helmet>
          <title>
            {loadedDetails ? `Episode ${mediaObj.episode_number}: ${mediaObj.name} - ${currentSeries.name}` : 'Loading...'}
            {' '}- nani
          </title>
        </Helmet>
        { <h1 className='col-sm-12 text-center text-danger'>{error}</h1> || null }
        <div className='row'>
          { !loadedDetails
            ? (
              <Loading />
            )
            : (
              <div className='col-sm-12'>
                <div className='d-flex mb-4 bg-light player-background justify-content-center'>
                  {!loadedVideo || !streamData.stream_data.streams.length
                    ? <img className='img-fluid' src={mediaObj.screenshot_image && useProxy(mediaObj.screenshot_image.full_url)} alt={mediaObj.name} />
                    : <Video
                      streamUrl={streamData.stream_data.streams[0].url}
                      key={mediaId}
                      id={mediaId}
                    />}
                </div>
                <h3>{mediaObj.name}</h3>
                <h5 className='d-flex flex-column flex-sm-row flex-wrap'>
                  <Badge color='success' tag={Link} to={`/series/${mediaObj.series_id}`} className='text-white mb-1 text-truncate'>
                    <FontAwesomeIcon icon={faTv} />
                    {' '}
                    {currentSeries.name || 'Loading...'}
                  </Badge>
                  {mediaObj.episode_number
                    ? <Badge color='secondary' className='ml-sm-2 mb-1 badge-outline'>
                      <FontAwesomeIcon icon={faListOl} />
                      {' '}
                      Episode {mediaObj.episode_number}
                    </Badge>
                    : null}
                  <Badge color='info' className='ml-sm-2 mb-1 badge-outline'>
                    <FontAwesomeIcon icon={faClock} />
                    {' '}
                    {formatTime(mediaObj.duration)}
                  </Badge>
                  <Badge color='warning' className='ml-sm-2 mb-1 text-white' tag='a' target='_blank' rel='noopener noreferrer' href={`
                      http://www.crunchyroll.com/search?q=${currentSeries.name} Episode ${mediaObj.episode_number} ${mediaObj.name}
                    `}>
                    <FontAwesomeIcon icon={faSearch} />
                    {' '}
                    Find on Crunchyroll
                  </Badge>
                  <MALButton id={mediaId} media={mediaObj} className='ml-sm-2 mb-1' />
                  <QueueButton id={mediaObj.series_id} badge className='ml-sm-2 mb-1' />
                </h5>
                <p>{mediaObj.description}</p>
                {nextEpisodes && nextEpisodes.length
                  ? <Collection
                    mediaIds={
                      collectionMedia[mediaObj.collection_id]
                        // get all the next episodes
                        ? collectionMedia[mediaObj.collection_id].slice(
                          collectionMedia[mediaObj.collection_id].indexOf(mediaId) + 1
                        )
                        : []
                    }
                    loading={collectionMedia[mediaObj.collection_id] === undefined}
                    title='Next Episodes'
                    titleTag='h4'
                    perPage={4} />
                  : null
                }
              </div>
            )
          }
        </div>
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    Auth: store.Auth,
    media: store.Data.media,
    collectionMedia: store.Data.collectionMedia,
    series: store.Data.series
  }
})(Media)
