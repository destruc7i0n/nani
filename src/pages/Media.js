import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getMediaInfo } from '../actions'

import { Link } from 'react-router-dom'

import Video from '../components/Video'

import api from '../lib/api'

class Media extends Component {
  constructor (props) {
    super(props)
    this.state = {
      streamData: {}
    }
  }

  async componentWillMount () {
    const { match: { params: { media } }, dispatch, Auth } = this.props
    await dispatch(getMediaInfo(media))
    const video = await api({route: 'info', params: {session_id: Auth.session_id, media_id: media, fields: 'media.stream_data'}})
    this.setState({
      streamData: video.data.data.stream_data
    })
  }

  render () {
    const { streamData } = this.state
    const { match: { params: { media: mediaId } }, media } = this.props
    const loadedDetails = media[mediaId] && true
    const loadedVideo = Object.keys(streamData).length > 0
    return (
      <div>
        <Link to='/'>
          <button type='button'>
            Home
          </button>
        </Link>
        <br />
        { !loadedDetails ? 'Loading...' : (
          <div>
            <h1>{media[mediaId].name}</h1>
            <p>{media[mediaId].description}</p>
            {!loadedVideo ? 'Loading video...' : <Video streamUrl={streamData.streams[0].url} poster={media[mediaId].screenshot_image.full_url} />}
          </div>
        )}
      </div>
    )
  }
}

export default connect((store) => {
  return {
    Auth: store.Auth,
    media: store.Data.media
  }
})(Media)
