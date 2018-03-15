import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'

import { Card, CardBody, CardImg, CardImgOverlay, Badge, Progress } from 'reactstrap'

import Loading from './Loading'

import './MediaCard.css'

class MediaCard extends Component {
  render () {
    const { media, width, history } = this.props
    return (
      <div className={`col-sm-${width} d-flex pb-4`}>
        <Card
          className='d-inline-block mw-100 box-shadow'
          style={{ cursor: 'pointer' }}
          onClick={() => history.push(`/series/${media.series_id}/${media.media_id}`)}
        >
          {
            media !== undefined && media.available
              ? (
                <Link to={`/series/${media.series_id}/${media.media_id}`} style={{ textDecoration: 'none' }}>
                  <CardImg top width='100%' src={(media && media.screenshot_image && media.screenshot_image.full_url) || null} alt={media.name} />
                  <CardImgOverlay className='p-1'>
                    {media.episode_number ? <Badge color='primary mr-1' pill>#{media.episode_number}</Badge> : null}
                    {media.duration ? <Badge color='secondary' pill>{Math.floor(media.duration / 60)} min</Badge> : null}
                  </CardImgOverlay>
                  <CardBody className='p-2 media-card-body'>
                    <Progress value={Math.min(100, (media.playhead / media.duration) * 100)} />
                    <span className='mb-1 d-block text-truncate font-weight-bold text-dark'>
                      {media.collection_name || `Episode # ${media.episode_number}` }
                    </span>
                    <small className='d-block text-truncate font-italic text-secondary'>{media.name}</small>
                  </CardBody>
                </Link>
              )
              : <CardBody><Loading /></CardBody>
          }
        </Card>
      </div>
    )
  }
}

export default compose(
  withRouter,
  connect()
)(MediaCard)
