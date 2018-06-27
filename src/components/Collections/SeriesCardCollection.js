import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'

import { Button } from 'reactstrap'

import SeriesCard from '../Cards/Series/SeriesCard'
import LoadingSeriesCard from '../Loading/LoadingSeriesCard'

class SeriesCardCollection extends Component {
  render () {
    const {
      title = '',
      series = [],
      loading = false,
      link = false,
      loadingCardsCount = 25
    } = this.props
    return (
      <Fragment>
        <h3 className='border-bottom pb-3 mb-4'>
          <div className='d-flex justify-content-between'>
            {title}
            {link && <Button tag={Link} to={link} color='secondary' size='sm'>View All</Button>}
          </div>
        </h3>
        <div className='row'>
          {
            loading
              ? [...Array(loadingCardsCount).keys()].map((index) => <LoadingSeriesCard key={`loadingSeriesCard-${index}`} />)
              : series.map((item, index) => <SeriesCard data={item} key={`seriesCard-${index}`} />)
          }
        </div>
      </Fragment>
    )
  }
}

export default SeriesCardCollection
