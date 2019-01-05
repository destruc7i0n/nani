import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

import MediaCard from '../Cards/Media/MediaCard'
import MediaCardLarge from '../Cards/Media/MediaCardLarge'
import LoadingMediaCard from '../Loading/LoadingMediaCard'
import LoadingMediaCardLarge from '../Loading/LoadingMediaCardLarge'

class Collection extends Component {
  render () {
    let {
      title = '',
      titleTag: TitleTag = 'h3',
      showTitle = true,
      perPage = 4,
      mediaIds = [],
      media = {},
      loading = false,
      loadingCardsCount = 9,
      size = 'sm',
      order = 'old',
      theme = 'light',
      ...attr
    } = this.props
    const width = 12 / perPage
    const Tag = size === 'sm' ? MediaCard : MediaCardLarge
    const LoadingTag = size === 'sm'
      ? LoadingMediaCard
      // quickly check to show smaller version on mobile
      : window.matchMedia('(max-width: 576px)').matches
        ? LoadingMediaCard
        : LoadingMediaCardLarge
    // only allow available ones
    mediaIds = mediaIds.filter((mediaId) => media[mediaId] && media[mediaId].available)

    if (order === 'new') {
      mediaIds = mediaIds.reverse()
    }
    return (
      <Fragment>
        {showTitle && title && <TitleTag className='border-bottom pb-3 mb-4'>
          <div className='d-flex justify-content-between'>
            {title}
          </div>
        </TitleTag>}
        <div className='row'>
          {
            loading
              ? [...Array(loadingCardsCount).keys()].map((index) => <LoadingTag width={width} theme={theme} key={`loadingMediaCard-${index}`} />)
              : mediaIds.length !== 0
                ? mediaIds.map((mediaId) => <Tag width={width} media={media[mediaId]} key={`mediaCard-${mediaId}`} {...attr} />)
                : <div className='col-12 text-center'>
                  No items.
                </div>
          }
        </div>
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    media: store.Data.media,
    theme: store.Options.theme
  }
})(Collection)
