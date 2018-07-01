import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getSeriesList } from '../actions'
import { Helmet } from 'react-helmet'

import SeriesCardCollection from '../components/Collections/SeriesCardCollection'

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
    const loaded = list && list[type]
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
        <SeriesCardCollection title={titles[type]} loading={!loaded} series={loaded && list[type].list} />
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    list: store.Data.list
  }
})(SeriesList)
