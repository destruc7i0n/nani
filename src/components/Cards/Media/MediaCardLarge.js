import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { Card, CardBody, CardImg, CardImgOverlay, Badge, Progress, Button } from 'reactstrap'

import { Img } from 'react-image'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Loading from '../../Loading/Loading'
import QueueButton from '../../Buttons/QueueButton'
import WatchedButton from '../../Buttons/WatchedButton'
import ImageLoader from '../../Loading/ImageLoader'

import withProxy, { replaceHttps } from '../../../lib/withProxy'

import './MediaCardLarge.css'

class MediaCardLarge extends Component {
  render () {
    const { Auth, media, series } = this.props
    // grab the series for the media
    const mediaSeries = media && series[media.series_id] ? series[media.series_id] : {}
    const imgFullURL = media && media.screenshot_image && media.screenshot_image.full_url
    return (
      <div className={`col-12 col-sm-12 d-flex pb-4`}>
        <Card
          className='d-inline-block w-100 box-shadow'
          style={{ cursor: 'pointer' }}
        >
          {
            media !== undefined && media.available
              ? (
                <Link to={`/series/${media.series_id}/${media.media_id}`} style={{ textDecoration: 'none' }}>
                  <div className='row d-flex flex-row h-100'>
                    <div className='col-sm-5 col-md-4'>
                      <CardImg
                        tag={Img}
                        top
                        className='media-card-img rounded-top-left'
                        loader={<ImageLoader />}
                        src={imgFullURL ? [
                          withProxy(imgFullURL),
                          replaceHttps(imgFullURL)
                        ] : 'https://via.placeholder.com/640x360?text=No+Image'}
                        alt={media.name} />
                      <CardImgOverlay className='pl-4 pr-4 pb-3 p-2 d-flex flex-row flex-wrap align-items-start'>
                        {media.episode_number
                          ? <Badge color='primary mr-1' pill>
                            {`E${media.episode_number}`}
                          </Badge>
                          : null}
                        {media.duration ? <Badge color='secondary' pill>{Math.ceil(media.duration / 60)} min</Badge> : null}
                      </CardImgOverlay>
                      <Progress className='media-card-progress' value={Math.min(100, (media.playhead / media.duration) * 100)} />
                    </div>
                    <div className='col-sm-7 col-md-8 d-flex flex-column pl-sm-0'>
                      <CardBody className='p-2 d-flex flex-column'>
                        <span className='mb-1 d-block text-truncate font-weight-bold text-dark'>
                          {media.premium_only && !Auth.premium
                            ? <Fragment>
                              <FontAwesomeIcon icon='crown' className='text-warning' />{' '}
                            </Fragment>
                            : null}
                          {mediaSeries.name || `Episode ${media.episode_number}` }
                        </span>
                        <small className='d-block text-truncate font-italic text-secondary'>
                          {media.name || `Episode ${media.episode_number}`}
                        </small>
                        <p className='text-muted mt-2'>{media.description}</p>

                        <div className='mt-auto d-flex flex-row'>
                          <Button tag={Link} to={`/series/${media.series_id}`} size='sm' className='mr-1 text-truncate' color='primary'>
                            <FontAwesomeIcon icon='info' />
                            {' '}
                            Series Info
                          </Button>
                          <QueueButton id={media.series_id} size='sm' className='mr-1' />
                          <WatchedButton media={media} size='sm' refreshQueue />
                        </div>
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
    Auth: store.Auth,
    series: store.Data.series
  }
})(MediaCardLarge)
