import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getMediaForCollection } from '../actions'
import { Link } from 'react-router-dom'

class Collection extends Component {
  constructor (props) {
    super(props)
    this.load = this.load.bind(this)
  }

  async componentDidMount () {
    const { index } = this.props
    console.log(index)
    if (index === 0) {
      await this.load()
    }
  }

  async load () {
    const { dispatch, id } = this.props
    await dispatch(getMediaForCollection(id))
  }

  render () {
    const { collectionMedia, media, id, collectionId } = this.props
    return collectionMedia[id]
      ? collectionMedia[id].map((mediaId, index) => (
        <li key={`collection-${index}`}>
          {console.log(media[mediaId])}
          <Link to={`/series/${collectionId}/${mediaId}`}>
            {console.log(media[mediaId])}
            <img src={media[mediaId].screenshot_image.small_url} alt='thumbnail' />
            {media[mediaId].name}
          </Link>
        </li>
      ))
      : <li>
        <a style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }} onClick={this.load}>Load</a>
      </li>
  }
}

export default connect((store) => {
  return {
    media: store.Data.media,
    collectionMedia: store.Data.collectionMedia
  }
})(Collection)
