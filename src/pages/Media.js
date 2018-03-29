import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getMediaForCollection, getMediaInfo } from '../actions'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import { Badge } from 'reactstrap'

import Video from '../components/Video'
import Collection from '../components/Collection'
import MALButton from '../components/MALButton'

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
    const { match: { params: { media: mediaId } }, media, collectionMedia } = this.props
    const loadedDetails = media[mediaId] && !error
    const loadedVideo = Object.keys(streamData).length > 0 && streamData.media_id === mediaId
    const mediaObj = media[mediaId]
    const nextEpisodes = mediaObj && collectionMedia[mediaObj.collection_id]
      ? collectionMedia[mediaObj.collection_id].filter((collectionMediaId) => Number(collectionMediaId) > Number(mediaId))
      : false
    return (
      <Fragment>
        <Helmet>
          <title>
            {loadedDetails ? `Episode ${mediaObj.episode_number}: ${mediaObj.name} - ${mediaObj.collection_name}` : 'Loading...'}
            {' '}- nani
          </title>
        </Helmet>
        { <h1 className='col-sm-12 text-center text-danger'>{error}</h1> || null }
        <div className='row'>
          { !loadedDetails
            ? (
              <div className='col-sm-12 text-center'>
                <h1>Loading...</h1>
              </div>
            )
            : (
              <div className='col-sm-12'>
                <div className='row mb-4 bg-light player-background'>
                  {!loadedVideo || !streamData.stream_data.streams.length
                    ? <img className='img-fluid sort-of-center' src={mediaObj.screenshot_image && useProxy(mediaObj.screenshot_image.full_url)} alt={mediaObj.name} />
                    : <Video
                      streamUrl={streamData.stream_data.streams[0].url}
                      key={mediaId}
                      id={mediaId}
                    />}
                </div>
                <h3>{mediaObj.name}</h3>
                <h5>
                  <Badge color='success' tag={Link} to={`/series/${mediaObj.series_id}`} className='text-white'>
                    {mediaObj.collection_name || 'Loading...'}
                  </Badge>
                  {mediaObj.episode_number ? <Badge color='secondary' className='ml-2'>Episode #{mediaObj.episode_number}</Badge> : null}
                  <Badge color='info' className='ml-2'>{Math.ceil(mediaObj.duration / 60)} min</Badge>
                  <Badge color='warning' className='ml-2 text-white' tag='a' target='_blank' rel='noopener noreferrer' href={`
                      http://www.crunchyroll.com/search?q=${mediaObj.collection_name} Episode ${mediaObj.episode_number} ${mediaObj.name}
                    `}>
                    Find on Crunchyroll
                  </Badge>
                  <MALButton id={mediaId} media={mediaObj} />
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
    collectionMedia: store.Data.collectionMedia
  }
})(Media)
