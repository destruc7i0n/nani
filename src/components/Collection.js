import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

import MediaCard from './MediaCard'
import Loading from './Loading'

class Collection extends Component {
  render () {
    let { title, titleTag: TitleTag = 'h3', showTitle = true, perPage = 4, mediaIds, media, loading = false } = this.props
    const width = 12 / perPage
    return (
      <Fragment>
        {showTitle ? <TitleTag className='border-bottom pb-3 mb-4'>{title}</TitleTag> : <hr className='mb-4' />}
        {
          loading
            ? <Loading size='2x' />
            : <div className='row'>
              {mediaIds.map((mediaId) => <MediaCard width={width} media={media[mediaId]} key={`mediaCard-${mediaId}`} />)}
            </div>
        }
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    media: store.Data.media
  }
})(Collection)
