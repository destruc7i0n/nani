import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import { Card, CardBody, CardImg } from 'reactstrap'

import { Img } from 'react-image'

import ImageLoader from '../../Loading/ImageLoader'

class MangaSeriesCard extends Component {
  render () {
    if (!this.props.data || !this.props.data.locale) return null

    const { data: { locale: { enUS: mangaData } } = { locale: { enUS: {} } }, data } = this.props

    const imgFullURL = mangaData.full_image_url
    return (
      <div className='col-6 col-sm-4 col-md-4 col-lg-2 d-flex pb-4'>
        <Card
          className='d-inline-block w-100 box-shadow'
          style={{ cursor: 'pointer' }}
        >
          <Link to={`/manga/series/${data.series_id}`} style={{ textDecoration: 'none' }}>
            <CardImg
              tag={Img}
              top
              loader={<ImageLoader height={250} />}
              src={[imgFullURL, 'https://via.placeholder.com/640x960?text=No+Image']}
              alt={mangaData.name} />
            <CardBody className='p-2'>
              <span className='mb-1 d-block font-weight-bold text-dark text-truncate'>
                {mangaData.name}
              </span>
              <small className='d-block text-truncate text-secondary'>Publisher: {data.name}</small>
            </CardBody>
          </Link>
        </Card>
      </div>
    )
  }
}

export default MangaSeriesCard
