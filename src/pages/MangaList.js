import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { getMangaSeries } from '../actions'
import { Helmet } from 'react-helmet'

import LoadingSeriesCard from '../components/Loading/LoadingSeriesCard'
import MangaSeriesCard from '../components/Cards/Manga/MangaSeriesCard'

import MangaDisclaimer from '../components/Manga/MangaDisclaimer'

class MangaSeriesList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true
    }
  }

  async componentDidMount () {
    const { dispatch } = this.props
    await dispatch(getMangaSeries())

    this.setState({ loading: false })
  }

  render () {
    const { loading } = this.state
    const { series, theme } = this.props

    return (
      <Fragment>
        <Helmet defer={false}>
          <title>{`Manga List`}</title>
        </Helmet>

        <MangaDisclaimer />

        <h3 className='border-bottom pb-3 mb-4'>
          <div className='d-flex justify-content-between'>
            Manga Series
          </div>
        </h3>
        <div className='row'>
          {
            loading
              ? [...Array(18).keys()].map((index) => <LoadingSeriesCard theme={theme} key={`loadingSeriesCard-${index}`} />)
              : Object.keys(series).map((id, index) => <MangaSeriesCard data={series[id]} key={`mangaSeriesCard-${index}`} />)
          }
        </div>
      </Fragment>
    )
  }
}

export default connect((store) => {
  return {
    series: store.Manga.series,
    theme: store.Options.theme
  }
})(MangaSeriesList)
