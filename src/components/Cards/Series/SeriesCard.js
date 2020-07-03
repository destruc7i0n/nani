import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import { Card, CardBody, CardImg, CardImgOverlay } from 'reactstrap'

import { Img } from 'react-image'

import QueueButton from '../../Buttons/QueueButton'
import ImageLoader from '../../Loading/ImageLoader'

import withProxy, { replaceHttps } from '../../../lib/withProxy'

class SeriesCard extends Component {
  render () {
    const { data } = this.props
    const imgFullURL = data && data.portrait_image && data.portrait_image.full_url
    return (
      <div className='col-6 col-sm-4 col-md-4 col-lg-2 d-flex pb-4'>
        <Card
          className='d-inline-block w-100 box-shadow'
          style={{ cursor: 'pointer' }}
        >
          <Link to={`/series/${data.series_id}`} style={{ textDecoration: 'none' }}>
            <CardImg
              tag={Img}
              top
              loader={<ImageLoader height={250} />}
              src={imgFullURL ? [
                withProxy(imgFullURL),
                replaceHttps(imgFullURL)
              ] : 'https://via.placeholder.com/640x960?text=No+Image'}
              alt={data.name} />
            <CardImgOverlay className='p-1'>
              <QueueButton inQueue={data.in_queue} id={data.series_id} badge colored />
            </CardImgOverlay>
            <CardBody className='p-2'>
              <span className='mb-1 d-block font-weight-bold text-dark text-truncate'>
                {data.name}
              </span>
              <small className='d-block text-truncate text-secondary'>{data.media_count || 0} Videos</small>
            </CardBody>
          </Link>
        </Card>
      </div>
    )
  }
}

export default SeriesCard
