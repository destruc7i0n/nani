import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { Badge, Card, CardBody, CardImg, CardImgOverlay, Progress } from 'reactstrap'

import Img from 'react-image'

import { format } from 'date-fns'

import Loading from '../../Loading/Loading'
import ImageLoader from '../../Loading/ImageLoader'

import withProxy from '../../../lib/withProxy'

import './MediaCard.css'

class MediaCard extends Component {
  render () {
    const { media, width, showTime = false, series } = this.props
    // grab the series for the media
    const mediaSeries = media && series[media.series_id] ? series[media.series_id] : {}
    const imgFullURL = media && media.screenshot_image && media.screenshot_image.full_url
    return (
      <div className={`col-12 col-sm-6 col-lg-${width} d-flex pb-4`}>
        <Card
          className='d-inline-block w-100 box-shadow'
          style={{ cursor: 'pointer' }}
        >
          {
            media !== undefined && media.available
              ? (
                <Link to={`/series/${media.series_id}/${media.media_id}`} style={{ textDecoration: 'none' }}>
                  <div className='row'>
                    <div className='col-12'>
                      <CardImg
                        tag={Img}
                        top
                        loader={<ImageLoader height={125} />}
                        src={imgFullURL ? [
                          withProxy(imgFullURL),
                          imgFullURL
                        ] : 'https://via.placeholder.com/640x360?text=No+Image'}
                        alt={media.name} />
                      <CardImgOverlay className='p-1 pl-4'>
                        {media.episode_number
                          ? <Badge color='primary mr-1' pill>
                            {`E${media.episode_number}`}
                          </Badge>
                          : null}
                        {media.duration ? <Badge color='secondary' pill>{Math.ceil(media.duration / 60)} min</Badge> : null}
                      </CardImgOverlay>
                    </div>
                    <div className='col-12'>
                      <CardBody className='p-2 media-card-body'>
                        <Progress className='media-card-progress' value={Math.min(100, (media.playhead / media.duration) * 100)} />
                        <span className='mb-1 d-block text-truncate font-weight-bold text-dark'>
                          {mediaSeries.name || `Episode ${media.episode_number}` }
                        </span>
                        <small className='d-block text-truncate font-italic text-secondary'>
                          {media.name || `Episode ${media.episode_number}`}
                        </small>
                        {
                          showTime
                            ? <Badge className='text-uppercase w-100' color='success'>
                              {format(new Date(media.available_time), '[Released at] h:mm aa')}
                            </Badge>
                            : null
                        }
                      </CardBody>
                    </div>
                  </div>
                </Link>
              )
              : <CardBody><Loading /></CardBody>
          }
        </Card>
      </div>
    )
  }
}

export default connect((store) => {
  return {
    series: store.Data.series
  }
})(MediaCard)
