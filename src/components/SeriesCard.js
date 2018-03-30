import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import { Card, CardBody, CardImg, CardImgOverlay } from 'reactstrap'

import QueueButton from './QueueButton'

import useProxy from '../lib/useProxy'

class SeriesCard extends Component {
  render () {
    const { data } = this.props
    return (
      <div className='col-sm-6 col-md-4 col-lg-2 d-flex pb-4'>
        <Card
          className='d-inline-block mw-100 box-shadow'
          style={{ cursor: 'pointer' }}
        >
          <Link to={`/series/${data.series_id}`} style={{ textDecoration: 'none' }}>
            <CardImg
              top
              src={data && data.portrait_image && useProxy(data.portrait_image.full_url)}
              alt={data.name} />
            <CardImgOverlay className='p-1'>
              <QueueButton inQueue={data.in_queue} id={data.series_id} badge />
            </CardImgOverlay>
            <CardBody className='p-2'>
              <span className='mb-1 d-block font-weight-bold text-dark text-truncate'>
                {data.name}
              </span>
              <small className='d-block text-truncate font-italic text-secondary'>{data.description}</small>
            </CardBody>
          </Link>
        </Card>
      </div>
    )
  }
}

export default SeriesCard
