import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getMediaForCollection, getMediaInfo } from '../actions'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import { Badge } from 'reactstrap'

import Video from '../components/Video'
import Collection from '../components/Collection'

import api from '../lib/api'

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

  async componentWillMount () {
    const { match: { params } } = this.props
    await this.loadVideo(params.media)
  }

  async componentWillReceiveProps (nextProps) {
    const { match: { params } } = this.props
    const { match: { params: nextParams } } = nextProps
    if (nextParams.media !== params.media) {
      await this.loadVideo(nextParams.media)
    }
  }

  async loadVideo (mediaId) {
    const { dispatch, Auth } = this.props
    try {
      const media = await dispatch(getMediaInfo(mediaId))
      await dispatch(getMediaForCollection(media.collection_id))
      const video = await api({route: 'info', params: {session_id: Auth.session_id, media_id: mediaId, fields: 'media.stream_data'}})
      this.setState({
        streamData: video.data.data.stream_data
      })
    } catch (err) {
      this.setState({ error: err.data.message || true })
      console.error(err)
    }
  }

  render () {
    const { streamData, error } = this.state
    const { match: { params: { media: mediaId } }, media, collectionMedia } = this.props
    const loadedDetails = media[mediaId] && true
    const loadedVideo = Object.keys(streamData).length > 0
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
                  {!loadedVideo || !streamData.streams.length
                    ? <img className='img-fluid sort-of-center' src={mediaObj.screenshot_image.full_url} alt={mediaObj.name} />
                    : <Video
                      streamUrl={streamData.streams[0].url}
                      poster={mediaObj.screenshot_image.full_url}
                      key={mediaId}
                      seek={mediaObj.playhead}
                      id={mediaId}
                    />}
                </div>
                <h3>{mediaObj.name}</h3>
                <h5>
                  <Badge color='success'>
                    <Link to={`/series/${mediaObj.series_id}`} className='text-white'>{mediaObj.collection_name || 'Loading...'}</Link>
                  </Badge>
                  <Badge color='secondary' className='ml-2'>Episode #{mediaObj.episode_number}</Badge>
                  <Badge color='secondary' className='ml-2'>{Math.floor(mediaObj.duration / 60)} min</Badge>
                </h5>
                <p>{media[mediaId].description}</p>
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
                    perPage={3} />
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
