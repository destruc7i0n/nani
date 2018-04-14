import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

import MediaCard from './MediaCard'
import MediaCardLarge from './MediaCardLarge'
import Loading from './Loading'

class Collection extends Component {
  render () {
    let { title, titleTag: TitleTag = 'h3', showTitle = true, perPage = 4, mediaIds, media, loading = false, size = 'sm', ...attr } = this.props
    const width = 12 / perPage
    const Tag = size === 'sm' ? MediaCard : MediaCardLarge
    return (
      <Fragment>
        {showTitle && title && <TitleTag className='border-bottom pb-3 mb-4'>{title}</TitleTag>}
        {
          loading
            ? <Loading size='2x' />
            : <div className='row'>
              {mediaIds.map((mediaId) => <Tag width={width} media={media[mediaId]} key={`mediaCard-${mediaId}`} {...attr} />)}
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
