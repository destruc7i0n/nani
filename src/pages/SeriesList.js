import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getSeriesList } from '../actions'
import { Helmet } from 'react-helmet'

import SeriesCard from '../components/Cards/Series/SeriesCard'
import LoadingSeriesCard from '../components/Loading/LoadingSeriesCard'

class SeriesList extends Component {
  async componentDidMount () {
    const { dispatch, type } = this.props
    try {
      dispatch(getSeriesList(type))
    } catch (e) {
      console.error(e)
    }
  }

  render () {
    const { list, type } = this.props
    const loaded = list && list.type === type
    const titles = {
      simulcast: 'Simulcasts',
      popular: 'Popular Anime',
      newest: 'Newest Anime'
    }
    return (
      <Fragment>
        <Helmet defer={false}>
          <title>{`${titles[type]} List`}</title>
        </Helmet>
        <h3 className='border-bottom pb-3 mb-4'>{titles[type]}</h3>
        <div className='row'>
          {
            loaded
              ? list.list.map((item, index) => <SeriesCard data={item} key={`seriesCard-${index}`} />)
              : [...Array(25).keys()].map((index) => <LoadingSeriesCard key={`loadingSeriesCard-${index}`} />)
          }
        </div>
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    list: store.Data.list
  }
})(SeriesList)
