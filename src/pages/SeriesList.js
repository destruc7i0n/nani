import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getSeriesList } from '../actions'
import { Helmet } from 'react-helmet'

import SeriesCard from '../components/SeriesCard'
import Loading from '../components/Loading'

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
      popular: 'Popular'
    }
    return (
      <Fragment>
        <Helmet>
          <title>{titles[type]} List - nani</title>
        </Helmet>
        <h3 className='border-bottom pb-3 mb-4'>{titles[type]}</h3>
        <div className='row'>
          {
            loaded
              ? list.list.map((item, index) => <SeriesCard data={item} key={`seriesCard-${index}`} />)
              : <Loading size='2x' />
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
