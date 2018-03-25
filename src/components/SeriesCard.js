import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import { Badge, Card, CardBody, CardImg, CardImgOverlay } from 'reactstrap'

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
              <Badge color={data.in_queue ? 'success' : 'danger'}>
                { data.in_queue
                  ? 'In Queue'
                  : 'Not in Queue'}
              </Badge>
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
