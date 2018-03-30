import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { Card, CardBody, CardImg, CardImgOverlay, Badge, Progress } from 'reactstrap'

import { format } from 'date-fns'

import Loading from './Loading'
import QueueButton from './QueueButton'

import useProxy from '../lib/useProxy'

import './MediaCard.css'

class MediaCard extends Component {
  render () {
    const { media, width, showTime = false, series, showDescription = false, showQueueButton = false } = this.props
    // grab the series for the media
    const mediaSeries = media && series[media.series_id] ? series[media.series_id] : {}
    // regex check to ensure there is number
    const containsNumber = (str) => /\d/.test(str)
    return (
      <div className={`col-lg-${width} col-md-6 d-flex pb-4`}>
        <Card
          className='d-inline-block w-100 box-shadow'
          style={{ cursor: 'pointer' }}
        >
          {
            media !== undefined && media.available
              ? (
                <Link to={`/series/${media.series_id}/${media.media_id}`} style={{ textDecoration: 'none' }}>
                  <div className='row'>
                    <div className={width === 12 ? 'col-lg-4' : 'col-lg-12'}>
                      <CardImg
                        top
                        className='media-card-img'
                        src={(media && media.screenshot_image && useProxy(media.screenshot_image.full_url)) || 'https://via.placeholder.com/640x360?text=No+Image'}
                        alt={media.name} />
                      <CardImgOverlay className='pl-4 pr-4 p-1'>
                        {media.episode_number
                          ? <Badge color='primary mr-1' pill>
                            {containsNumber(media.episode_number) ? `#${media.episode_number}` : media.episode_number}
                          </Badge>
                          : null}
                        {media.duration ? <Badge color='secondary' pill>{Math.ceil(media.duration / 60)} min</Badge> : null}
                      </CardImgOverlay>
                      <Progress className='media-card-progress' value={Math.min(100, (media.playhead / media.duration) * 100)} />
                    </div>
                    <div className={width === 12 ? 'col-lg-8' : 'col-lg-12'}>
                      <CardBody className='p-2'>
                        <span className='mb-1 d-block text-truncate font-weight-bold text-dark'>
                          {mediaSeries.name || `Episode #${media.episode_number}` }
                        </span>
                        <small className='d-block text-truncate font-italic text-secondary'>
                          {media.name || `Episode #${media.episode_number}`}
                        </small>
                        {
                          showTime
                            ? <Badge className='text-uppercase w-100' color='success'>
                              {format(new Date(media.available_time), '[Released at] h:mm aa')}
                            </Badge>
                            : null
                        }
                        {
                          showDescription
                            ? <p className='text-muted mt-2'>
                              {media.description}
                            </p>
                            : null
                        }
                        {showQueueButton ? <QueueButton id={media.series_id} size='sm' block /> : null}
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
