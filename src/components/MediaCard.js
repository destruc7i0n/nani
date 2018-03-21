import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import { Card, CardBody, CardImg, CardImgOverlay, Badge, Progress } from 'reactstrap'

import { format } from 'date-fns'

import Loading from './Loading'

import useProxy from '../lib/useProxy'

import './MediaCard.css'

class MediaCard extends Component {
  render () {
    const { media, width, showTime = false } = this.props
    // regex check to ensure there is number
    const containsNumber = (str) => /\d/.test(str)
    return (
      <div className={`col-lg-${width} col-md-6 d-flex pb-4`}>
        <Card
          className='d-inline-block mw-100 box-shadow'
          style={{ cursor: 'pointer' }}
        >
          {
            media !== undefined && media.available
              ? (
                <Link to={`/series/${media.series_id}/${media.media_id}`} style={{ textDecoration: 'none' }}>
                  <CardImg
                    top
                    src={(media && media.screenshot_image && useProxy(media.screenshot_image.full_url)) || 'https://via.placeholder.com/640x360?text=No+Image'}
                    alt={media.name} />
                  <CardImgOverlay className='p-1'>
                    {media.episode_number
                      ? <Badge color='primary mr-1' pill>
                        {containsNumber(media.episode_number) ? `#${media.episode_number}` : media.episode_number}
                      </Badge>
                      : null}
                    {media.duration ? <Badge color='secondary' pill>{Math.ceil(media.duration / 60)} min</Badge> : null}
                  </CardImgOverlay>
                  <CardBody className='p-2 media-card-body'>
                    <Progress value={Math.min(100, (media.playhead / media.duration) * 100)} />
                    <span className='mb-1 d-block text-truncate font-weight-bold text-dark'>
                      {media.collection_name || `Episode #${media.episode_number}` }
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

export default MediaCard
