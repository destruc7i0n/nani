import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getMediaForCollection, getMediaInfo, getSeriesInfo } from '../actions'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import { Badge } from 'reactstrap'

import { Img } from 'react-image'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import PlayerContainer from '../components/Player/PlayerContainer'

import Player from '../components/Player/Player'
import Collection from '../components/Collections/Collection'
import MALButton from '../components/Buttons/MALButton'
import AniListButton from '../components/Buttons/AniListButton'
import QueueButton from '../components/Buttons/QueueButton'
import WatchedButton from '../components/Buttons/WatchedButton'
import LoadingMediaPage from '../components/Loading/LoadingMediaPage'

import api from '../lib/api'
import { isCancel } from 'axios'
import withProxy, { replaceHttps } from '../lib/withProxy'

import { formatTime } from '../lib/util'

import './Media.css'

class Media extends Component {
  constructor (props) {
    super(props)
    this.state = {
      mediaId: '',
      streamData: {},
      error: false,
      currentCollection: null,
      currentMedia: null,
      nextMedia: null,
      prevMedia: null,
      fullPage: false,
    }
    this.loadVideo = this.loadVideo.bind(this)
    this.getVideoData = this.getVideoData.bind(this)
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    const { match: { params: { media: nextMedia } = {} } } = nextProps
    const { mediaId: prevMedia } = prevState
    // reset on each media change
    if (nextMedia !== prevMedia) {
      return {
        mediaId: nextMedia,
        streamData: {},
        error: '',
      }
    }
    return null
  }

  async componentDidMount () {
    await this.loadVideo()
  }

  async componentDidUpdate (prevProps, prevState) {
    const { mediaId: nextMedia } = this.state
    const { mediaId: prevMedia } = prevState
    // check if the media isn't the same, then load
    if (nextMedia !== prevMedia) {
      await this.loadVideo()
    }
  }

  async loadVideo () {
    const { mediaId } = this.state
    const { dispatch, Auth, language } = this.props
    try {
      const media = await dispatch(getMediaInfo(mediaId))
      // only if available
      if (media.available) {
        await dispatch(getMediaForCollection(media.collection_id))
        // preload the series info
        await dispatch(getSeriesInfo(media.series_id))

        // load ui stuff
        this.getVideoData()

        // grab the media stream URL
        const video = await api({
          route: 'info',
          params: {session_id: Auth.session_id, media_id: mediaId, fields: 'media.stream_data,media.media_id'},
          locale: language
        })
        this.setState({
          streamData: video.data.data
        })
      } else {
        this.setState({ error: 'This is not available.' })
      }
    } catch (err) {
      // check that it isn't an error from the request being cancelled
      if (!isCancel(err)) {
        this.setState({ error: (err && err.data && err.data.message) || 'An error occurred.' })
        console.error(err)
      }
    }
  }

  getVideoData () {
    const { match: { params: { media: mediaId } }, media, collectionMedia } = this.props

    // the current media object and the series
    const mediaObj = media[mediaId]
    // the current collection
    const currentCollection = mediaObj && collectionMedia[mediaObj.collection_id]

    // grab the ids for the next or previous episode
    const nextEpisodeId = currentCollection && currentCollection[currentCollection.indexOf(mediaObj.media_id) + 1]
    const prevEpisodeId = currentCollection && currentCollection[currentCollection.indexOf(mediaObj.media_id) - 1]
    const nextEpisodeMedia = nextEpisodeId && media[nextEpisodeId]
    const prevEpisodeMedia = prevEpisodeId && media[prevEpisodeId]
    const nextEpisodeImgURL = nextEpisodeId && nextEpisodeMedia.screenshot_image && nextEpisodeMedia.screenshot_image.full_url
    const prevEpisodeImgURL = prevEpisodeMedia && prevEpisodeMedia.screenshot_image && prevEpisodeMedia.screenshot_image.full_url

    const imgFullURL = mediaObj && mediaObj.screenshot_image && mediaObj.screenshot_image.full_url

    this.setState({
      currentCollection,
      currentMedia: {
        ...mediaObj,
        img: imgFullURL,
      },
      nextMedia: nextEpisodeId ? {
        ...nextEpisodeMedia,
        img: nextEpisodeImgURL
      } : null,
      prevMedia: prevEpisodeId ? {
        ...prevEpisodeMedia,
        img: prevEpisodeImgURL
      } : null,
    })
  }

  render () {
    const { streamData, error, currentMedia, currentCollection, nextMedia, prevMedia, fullPage } = this.state
    const { match: { params: { media: mediaId } }, collectionMedia, autoplay } = this.props
    // the current media object and the series
    const mediaObj = currentMedia

    // check that both of the above are loaded and no error
    const loadedDetails = mediaObj && !error

    // check that the video URL exists
    const loadedVideo = streamData && Object.keys(streamData).length > 0 && streamData.media_id === mediaId

    // remove episodes that are before the one currently being watched
    const nextEpisodes = mediaObj && currentCollection
      ? currentCollection.filter((collectionMediaId) => Number(collectionMediaId) > Number(mediaId))
      : false

    const streams = (streamData && streamData.stream_data && streamData.stream_data.streams) || []

    const player = (
      <Player
        media={mediaObj}
        nextMedia={nextMedia}
        streamsLoaded={loadedVideo}
        streams={streams}
        poster={currentMedia && currentMedia.img}
        autoPlay={autoplay}
        id={mediaObj && mediaObj.media_id}
        isFullPage={fullPage}
        toggleFullPage={() => this.setState({ fullPage: !fullPage })}
      />
    )

    // add or remove the classes needed for their respective views
    // I would have loved to use multiple components, though react seems to like remounting the player
    // no matter what I do...
    const containedPlayer = (
      <div className={fullPage ? '' : 'player-width position-relative embed-responsive embed-responsive-16by9'}>
        <div className={fullPage ? 'position-relative vw-100 vh-100 overflow-hidden' : 'embed-responsive-item'}>
          {player}
        </div>
      </div>
    )

    const defaultView = (
      <div className='row'>
        { !loadedDetails
          ? (
          <LoadingMediaPage />
        )
          : (
            <div className='col-sm-12'>
              <PlayerContainer fullWidth={fullPage}>
                <div className={!fullPage ? 'd-flex mb-4 mt-2 justify-content-center position-relative' : ''}>
                  {prevMedia && !fullPage ? (
                    <div className='position-absolute video-image-left'>
                      <Link
                        className='position-relative'
                        to={`/series/${mediaObj.collection_id}/${prevMedia.media_id}`}
                      >
                        <div className='position-absolute video-image-overlay-left' />
                        <Img src={prevMedia.img ? [
                          withProxy(prevMedia.img),
                          replaceHttps(prevMedia.img)
                        ] : 'https://via.placeholder.com/640x360?text=No+Image'} alt={prevMedia.name} />
                      </Link>
                    </div>
                  ) : null}
                  {nextMedia && !fullPage ? (
                    <div className='position-absolute video-image-right'>
                      <Link
                        className='position-relative'
                        to={`/series/${mediaObj.collection_id}/${nextMedia.media_id}`}
                      >
                        <div className='position-absolute video-image-overlay-right' />
                        <Img src={nextMedia.img ? [
                          withProxy(nextMedia.img),
                          replaceHttps(nextMedia.img)
                        ] : 'https://via.placeholder.com/640x360?text=No+Image'} alt={nextMedia.name} />
                      </Link>
                    </div>
                  ) : null}

                  {containedPlayer}
                </div>
              </PlayerContainer>
              <h3>{mediaObj.name}</h3>
              <h5 className='d-flex flex-column flex-md-row flex-wrap'>
                <Badge
                  color='success'
                  tag={Link}
                  to={`/series/${mediaObj.series_id}#collection_${mediaObj.collection_id}`}
                  className='text-white mb-1 text-truncate mr-md-2'
                >
                  <FontAwesomeIcon icon='tv' />
                  {' '}
                  {mediaObj.collection_name || 'Loading...'}
                </Badge>
                {mediaObj.episode_number
                  ? <Badge color='secondary' className='mr-md-2 mb-1 badge-outline'>
                    <FontAwesomeIcon icon='list-ol' />
                    {' '}
                    Episode {mediaObj.episode_number}
                  </Badge>
                  : null}
                <Badge color='info' className='mr-md-2 mb-1 badge-outline'>
                  <FontAwesomeIcon icon='clock' />
                  {' '}
                  {formatTime(mediaObj.duration)}
                </Badge>
                <Badge color='secondary' className='mr-md-2 mb-1' tag='a' target='_blank' rel='noopener noreferrer' href={`
                      http://www.crunchyroll.com/media-${mediaObj.media_id}
                    `}>
                  <FontAwesomeIcon icon='search' />
                  {' '}
                  Open on Crunchyroll
                </Badge>
                {currentCollection
                  ? <Fragment>
                    <MALButton id={mediaObj.collection_id} media={mediaObj} className='mr-md-2 mb-1' />
                    <AniListButton id={mediaObj.media_id} media={mediaObj} className='mr-md-2 mb-1' />
                  </Fragment>
                  : null}
                <WatchedButton media={mediaObj} badge refreshQueue className='mr-md-2 mb-1' />
                <QueueButton id={mediaObj.series_id} badge className='mr-md-2 mb-1' />
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
                  perPage={4}
                  mediaPage />
                : null
              }
            </div>
          )
        }
      </div>
    )

    return (
      <Fragment>
        <Helmet defer={false}>
          <title>
            {loadedDetails ? `Episode ${mediaObj.episode_number}: ${mediaObj.name} - ${mediaObj.collection_name}` : 'Loading...'}
          </title>
        </Helmet>
        { error && <h1 className='col-sm-12 text-center text-danger'>{error}</h1> }
        { defaultView }
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    Auth: store.Auth,
    language: store.Options.language,
    autoplay: store.Options.autoplay,
    media: store.Data.media,
    collectionMedia: store.Data.collectionMedia,
    seriesCollections: store.Data.seriesCollections,
  }
})(Media)
